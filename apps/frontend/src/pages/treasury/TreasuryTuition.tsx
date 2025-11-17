import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type Plan = { 
  id: string; 
  classId?: string; 
  className?: string;
  valorMensal: number; 
  dueDay: number; 
  multaPercent: number; 
  jurosDiaPercent: number; 
  descontoAntecipadoPercent: number;
};

type StudentPayment = {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  status: "paid" | "pending" | "overdue" | "scholarship";
  amount: number;
  discount?: number;
  scholarship?: number;
  installments?: number;
  lastPayment?: string;
};

type ClassItem = { id: string; name: string };

export default function TreasuryTuition() {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentPayment | null>(null);
  const qc = useQueryClient();

  const plansQ = useQuery<Plan[]>({ 
    queryKey: ["treasury","plans"], 
    queryFn: async () => { 
      const r = await fetch("/api/treasury/tuition-plans"); 
      return r.json(); 
    } 
  });

  const studentsQ = useQuery<StudentPayment[]>({ 
    queryKey: ["treasury","students-payments"], 
    queryFn: async () => { 
      const r = await fetch("/api/treasury/students-payments"); 
      return r.json(); 
    } 
  });

  const classesQ = useQuery<ClassItem[]>({ 
    queryKey: ["sec","classes"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/classes"); 
      return r.json(); 
    } 
  });

  const createPlan = useMutation({
    mutationFn: async (payload: Partial<Plan>) => { 
      const r = await fetch("/api/treasury/tuition-plans", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      }); 
      return r.json(); 
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["treasury","plans"] })
  });

  const generateInvoices = useMutation({
    mutationFn: async (period: string) => { 
      const r = await fetch(`/api/treasury/invoices/generate?period=${period}`, { method: "POST" }); 
      return r.json(); 
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treasury","invoices"] });
      qc.invalidateQueries({ queryKey: ["treasury","students-payments"] });
    }
  });

  const applyDiscount = useMutation({
    mutationFn: async ({ studentId, discount, reason }: { studentId: string; discount: number; reason: string }) => {
      const r = await fetch(`/api/treasury/students/${studentId}/discount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discount, reason })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treasury","students-payments"] });
      setShowDiscountModal(false);
      setSelectedStudent(null);
    }
  });

  const getStatusConfig = (status: StudentPayment["status"]) => {
    switch (status) {
      case "paid":
        return { label: "Pago", color: "bg-emerald-100 text-emerald-700", icon: "✅" };
      case "pending":
        return { label: "Pendente", color: "bg-blue-100 text-blue-700", icon: "⏳" };
      case "overdue":
        return { label: "Atrasado", color: "bg-rose-100 text-rose-700", icon: "⚠️" };
      case "scholarship":
        return { label: "Bolsa", color: "bg-purple-100 text-purple-700", icon: "🎓" };
    }
  };

  const totalRevenue = (studentsQ.data || []).filter(s => s.status === "paid").reduce((sum, s) => sum + s.amount, 0);
  const totalPending = (studentsQ.data || []).filter(s => s.status === "pending" || s.status === "overdue").reduce((sum, s) => sum + s.amount, 0);
  const overdueCount = (studentsQ.data || []).filter(s => s.status === "overdue").length;

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Controle de Mensalidades</div>
                  <div className="text-white/90 text-sm md:text-base">Gestão de pagamentos e descontos</div>
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
            <div className="text-sm text-slate-600 mb-2">Receita Recebida</div>
            <div className="text-3xl font-extrabold text-emerald-600">R$ {totalRevenue.toLocaleString('pt-BR')}</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">Pagamentos confirmados</div>
          </div>
          <div className="card-modern p-6">
            <div className="text-sm text-slate-600 mb-2">Pendências</div>
            <div className="text-3xl font-extrabold text-amber-600">R$ {totalPending.toLocaleString('pt-BR')}</div>
            <div className="text-xs text-amber-600 mt-1 font-medium">Aguardando pagamento</div>
          </div>
          <div className="card-modern p-6">
            <div className="text-sm text-slate-600 mb-2">Atrasadas</div>
            <div className="text-3xl font-extrabold text-rose-600">{overdueCount}</div>
            <div className="text-xs text-rose-600 mt-1 font-medium">Requerem atenção</div>
          </div>
        </div>

        {/* Planos de Mensalidade */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></span>
              Planos de Mensalidade
            </h2>
            <button
              onClick={() => setShowPlanModal(true)}
              className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700"
            >
              + Novo Plano
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(plansQ.data || []).map((plan) => (
              <div key={plan.id} className="card-modern p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold text-slate-800">
                      {plan.className || `Turma ${plan.classId}`}
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-600 mt-2">
                      R$ {plan.valorMensal.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Vencimento:</span>
                    <span className="font-medium">Dia {plan.dueDay}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Multa:</span>
                    <span className="font-medium">{plan.multaPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Juros/dia:</span>
                    <span className="font-medium">{plan.jurosDiaPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Desc. antecipado:</span>
                    <span className="font-medium text-emerald-600">{plan.descontoAntecipadoPercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de Alunos com Status de Pagamento */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></span>
            Status de Pagamento por Aluno
          </h2>
          <div className="card-modern overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Aluno</th>
                    <th className="px-4 py-3 text-left font-semibold">Turma</th>
                    <th className="px-4 py-3 text-center font-semibold">Valor</th>
                    <th className="px-4 py-3 text-center font-semibold">Desconto</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-center font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(studentsQ.data || []).map((student) => {
                    const statusConfig = getStatusConfig(student.status);
                    return (
                      <tr key={student.studentId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{student.studentName}</td>
                        <td className="px-4 py-3 text-slate-600">{student.className || student.classId}</td>
                        <td className="px-4 py-3 text-center font-semibold">
                          R$ {student.amount.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {student.discount ? (
                            <span className="text-emerald-600 font-medium">-{student.discount}%</span>
                          ) : student.scholarship ? (
                            <span className="text-purple-600 font-medium">Bolsa {student.scholarship}%</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setSelectedStudent(student); setShowDiscountModal(true); }}
                              className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium"
                            >
                              Desconto
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Geração de Faturas */}
        <div className="card-modern p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Gerar Faturas do Período</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target as any);
              generateInvoices.mutate(String(fd.get('period') || ''));
            }}
            className="flex gap-3"
          >
            <input
              name="period"
              type="month"
              defaultValue={new Date().toISOString().slice(0,7)}
              className="input-modern flex-1"
              required
            />
            <button type="submit" className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700">
              📄 Gerar Faturas
            </button>
          </form>
        </div>

        {/* Modal de Criar Plano */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Novo Plano de Mensalidade</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  createPlan.mutate({
                    classId: String(fd.get('classId') || ''),
                    valorMensal: Number(fd.get('valorMensal') || 0),
                    dueDay: Number(fd.get('dueDay') || 10),
                    multaPercent: Number(fd.get('multaPercent') || 0),
                    jurosDiaPercent: Number(fd.get('jurosDiaPercent') || 0),
                    descontoAntecipadoPercent: Number(fd.get('descontoAntecipadoPercent') || 0)
                  });
                  setShowPlanModal(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Turma</label>
                  <select name="classId" className="input-modern w-full">
                    <option value="">Selecione...</option>
                    {(classesQ.data || []).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Mensal (R$) *</label>
                  <input name="valorMensal" type="number" step="0.01" className="input-modern w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dia de Vencimento *</label>
                  <input name="dueDay" type="number" min="1" max="31" defaultValue="10" className="input-modern w-full" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Multa (%)</label>
                    <input name="multaPercent" type="number" step="0.01" defaultValue="2" className="input-modern w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Juros/dia (%)</label>
                    <input name="jurosDiaPercent" type="number" step="0.01" defaultValue="0.033" className="input-modern w-full" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Desconto Antecipado (%)</label>
                  <input name="descontoAntecipadoPercent" type="number" step="0.01" defaultValue="5" className="input-modern w-full" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700 flex-1">
                    Salvar Plano
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPlanModal(false)}
                    className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Desconto */}
        {showDiscountModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Aplicar Desconto</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  applyDiscount.mutate({
                    studentId: selectedStudent.studentId,
                    discount: Number(fd.get('discount') || 0),
                    reason: String(fd.get('reason') || '')
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aluno</label>
                  <input value={selectedStudent.studentName} className="input-modern w-full" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Percentual de Desconto (%) *</label>
                  <input name="discount" type="number" min="0" max="100" step="0.01" className="input-modern w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Motivo *</label>
                  <textarea name="reason" className="input-modern w-full h-24" required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700 flex-1">
                    Aplicar Desconto
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowDiscountModal(false); setSelectedStudent(null); }}
                    className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
