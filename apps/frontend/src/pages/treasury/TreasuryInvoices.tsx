import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type Invoice = { 
  id: string; 
  studentId: string;
  studentName?: string;
  classId: string;
  className?: string;
  period: string; 
  dueDate: string; 
  total: number;
  baseAmount: number;
  lateFee?: number;
  discount?: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  boleto?: { 
    linhaDigitavel: string; 
    codigoBarras: string;
    nossoNumero: string;
  };
  paymentDate?: string;
};

export default function TreasuryInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showBoletoModal, setShowBoletoModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const qc = useQueryClient();

  const invoicesQ = useQuery<Invoice[]>({ 
    queryKey: ["treasury","invoices"], 
    queryFn: async () => { 
      const r = await fetch("/api/treasury/invoices"); 
      return r.json(); 
    } 
  });

  const issueBoleto = useMutation({
    mutationFn: async (id: string) => { 
      const r = await fetch(`/api/treasury/invoices/${id}/issue-boleto`, { method: "POST" }); 
      return r.json(); 
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treasury","invoices"] });
      setShowBoletoModal(true);
    }
  });

  const markAsPaid = useMutation({
    mutationFn: async (id: string) => { 
      const r = await fetch(`/api/treasury/payments/webhook`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ invoiceId: id }) 
      }); 
      return r.json(); 
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["treasury","invoices"] })
  });

  const sendNotification = useMutation({
    mutationFn: async ({ invoiceId, type }: { invoiceId: string; type: "reminder" | "overdue" }) => {
      const r = await fetch(`/api/treasury/invoices/${invoiceId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treasury","invoices"] });
    }
  });

  const getStatusConfig = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return { label: "Pago", color: "bg-emerald-100 text-emerald-700", icon: "✅" };
      case "pending":
        return { label: "Pendente", color: "bg-blue-100 text-blue-700", icon: "⏳" };
      case "overdue":
        return { label: "Atrasado", color: "bg-rose-100 text-rose-700", icon: "⚠️" };
      case "cancelled":
        return { label: "Cancelado", color: "bg-slate-100 text-slate-700", icon: "❌" };
    }
  };

  const filtered = invoicesQ.data?.filter(i => 
    filterStatus === "all" || i.status === filterStatus
  ) || [];

  const totalPending = filtered.filter(i => i.status === "pending" || i.status === "overdue")
    .reduce((sum, i) => sum + i.total, 0);
  const totalPaid = filtered.filter(i => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-emerald-600 via-teal-600 to-cyan-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Sistema de Cobrança</div>
                  <div className="text-white/90 text-sm md:text-base">Geração de boletos e notificações</div>
                </div>
              </div>
            </div>
            <Link href="/treasury">
              <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer">
                ← Voltar
              </div>
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="card-modern p-6">
            <div className="text-sm text-slate-600 mb-2">Total Pendente</div>
            <div className="text-3xl font-extrabold text-amber-600">
              R$ {totalPending.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="card-modern p-6">
            <div className="text-sm text-slate-600 mb-2">Total Recebido</div>
            <div className="text-3xl font-extrabold text-emerald-600">
              R$ {totalPaid.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="card-modern p-6">
            <div className="text-sm text-slate-600 mb-2">Faturas</div>
            <div className="text-3xl font-extrabold text-slate-800">
              {invoicesQ.data?.length ?? 0}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-700">Filtrar por status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-modern"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagas</option>
            <option value="overdue">Atrasadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        {/* Lista de Faturas */}
        <div className="card-modern overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Aluno</th>
                  <th className="px-4 py-3 text-left font-semibold">Turma</th>
                  <th className="px-4 py-3 text-center font-semibold">Período</th>
                  <th className="px-4 py-3 text-center font-semibold">Vencimento</th>
                  <th className="px-4 py-3 text-right font-semibold">Valor</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((invoice) => {
                  const statusConfig = getStatusConfig(invoice.status);
                  const isOverdue = invoice.status === "overdue" || 
                    (invoice.status === "pending" && new Date(invoice.dueDate) < new Date());
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {invoice.studentName || invoice.studentId}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {invoice.className || invoice.classId}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{invoice.period}</td>
                      <td className={`px-4 py-3 text-center ${
                        isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'
                      }`}>
                        {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        R$ {invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        {invoice.discount && (
                          <div className="text-xs text-emerald-600">
                            Desconto: -R$ {invoice.discount.toLocaleString('pt-BR')}
                          </div>
                        )}
                        {invoice.lateFee && (
                          <div className="text-xs text-rose-600">
                            Multa: +R$ {invoice.lateFee.toLocaleString('pt-BR')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                          {statusConfig.icon} {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {!invoice.boleto && invoice.status !== "paid" && (
                            <button
                              onClick={() => { setSelectedInvoice(invoice); issueBoleto.mutate(invoice.id); }}
                              className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium"
                            >
                              Emitir Boleto
                            </button>
                          )}
                          {invoice.boleto && (
                            <button
                              onClick={() => { setSelectedInvoice(invoice); setShowBoletoModal(true); }}
                              className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm font-medium"
                            >
                              Ver Boleto
                            </button>
                          )}
                          {invoice.status === "pending" && (
                            <button
                              onClick={() => sendNotification.mutate({ invoiceId: invoice.id, type: "reminder" })}
                              className="px-3 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 text-sm font-medium"
                            >
                              Lembrete
                            </button>
                          )}
                          {isOverdue && (
                            <button
                              onClick={() => sendNotification.mutate({ invoiceId: invoice.id, type: "overdue" })}
                              className="px-3 py-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 text-sm font-medium"
                            >
                              Cobrar
                            </button>
                          )}
                          {invoice.status !== "paid" && (
                            <button
                              onClick={() => markAsPaid.mutate(invoice.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm font-medium"
                            >
                              Marcar Pago
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Boleto */}
        {showBoletoModal && selectedInvoice?.boleto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-2xl w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Boleto Bancário</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-2">Linha Digitável</div>
                  <div className="text-lg font-mono font-bold text-slate-800">
                    {selectedInvoice.boleto.linhaDigitavel}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-2">Código de Barras</div>
                  <div className="text-sm font-mono text-slate-800 break-all">
                    {selectedInvoice.boleto.codigoBarras}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-2">Nosso Número</div>
                  <div className="text-sm font-mono text-slate-800">
                    {selectedInvoice.boleto.nossoNumero}
                  </div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-sm text-amber-800">
                    <strong>Valor:</strong> R$ {selectedInvoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-amber-800">
                    <strong>Vencimento:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      // Simular download do boleto
                      window.print();
                    }}
                    className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1"
                  >
                    📄 Imprimir Boleto
                  </button>
                  <button
                    onClick={() => { setShowBoletoModal(false); setSelectedInvoice(null); }}
                    className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
