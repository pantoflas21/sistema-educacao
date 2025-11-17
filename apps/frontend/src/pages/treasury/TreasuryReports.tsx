import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type FinancialReport = {
  period: string;
  receita: number;
  despesa: number;
  saldo: number;
  detalhes: {
    receitas: Array<{ categoria: string; valor: number }>;
    despesas: Array<{ categoria: string; valor: number }>;
  };
};

type DRE = {
  periodo: string;
  receitaOperacional: number;
  despesaOperacional: number;
  resultadoOperacional: number;
  receitaNaoOperacional: number;
  despesaNaoOperacional: number;
  resultadoLiquido: number;
};

export default function TreasuryReports() {
  const [reportType, setReportType] = useState<"dre" | "balancete" | "cashflow" | "comparative">("dre");
  const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7));

  const dreQ = useQuery<DRE>({ 
    queryKey: ["treasury","dre", period], 
    queryFn: async () => { 
      const r = await fetch(`/api/treasury/reports/dre?period=${period}`); 
      return r.json(); 
    },
    enabled: reportType === "dre"
  });

  const balanceteQ = useQuery<FinancialReport>({ 
    queryKey: ["treasury","balancete", period], 
    queryFn: async () => { 
      const r = await fetch(`/api/treasury/reports/balancete?period=${period}`); 
      return r.json(); 
    },
    enabled: reportType === "balancete"
  });

  const cashflowQ = useQuery<FinancialReport>({ 
    queryKey: ["treasury","cashflow-report", period], 
    queryFn: async () => { 
      const r = await fetch(`/api/treasury/reports/cashflow?period=${period}`); 
      return r.json(); 
    },
    enabled: reportType === "cashflow"
  });

  const exportReport = useMutation({
    mutationFn: async ({ type, format }: { type: string; format: "pdf" | "excel" }) => {
      const r = await fetch(`/api/treasury/reports/export?type=${type}&format=${format}&period=${period}`, {
        method: "GET"
      });
      const blob = await r.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_${type}_${period}.${format === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
    }
  });

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Relatórios Contábeis</div>
                  <div className="text-white/90 text-sm md:text-base">Demonstrativos financeiros e análises</div>
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

        {/* Seleção de Relatório */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setReportType("dre")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                reportType === "dre"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              📊 DRE
            </button>
            <button
              onClick={() => setReportType("balancete")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                reportType === "balancete"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              📋 Balancete
            </button>
            <button
              onClick={() => setReportType("cashflow")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                reportType === "cashflow"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              💰 Fluxo de Caixa
            </button>
            <button
              onClick={() => setReportType("comparative")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                reportType === "comparative"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              📈 Comparativo
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Período:</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input-modern"
            />
            <button
              onClick={() => exportReport.mutate({ type: reportType, format: "pdf" })}
              className="btn-modern bg-rose-600 text-white hover:bg-rose-700"
            >
              📄 Exportar PDF
            </button>
            <button
              onClick={() => exportReport.mutate({ type: reportType, format: "excel" })}
              className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700"
            >
              📊 Exportar Excel
            </button>
          </div>
        </div>

        {/* DRE */}
        {reportType === "dre" && dreQ.data && (
          <div className="card-modern p-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              DRE - Demonstração do Resultado do Exercício
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-1">Receita Operacional</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    R$ {dreQ.data.receitaOperacional.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-1">Despesa Operacional</div>
                  <div className="text-2xl font-bold text-rose-600">
                    R$ {dreQ.data.despesaOperacional.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Resultado Operacional</div>
                <div className="text-2xl font-bold text-blue-700">
                  R$ {dreQ.data.resultadoOperacional.toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-1">Receita Não Operacional</div>
                  <div className="text-xl font-semibold text-slate-800">
                    R$ {dreQ.data.receitaNaoOperacional.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-1">Despesa Não Operacional</div>
                  <div className="text-xl font-semibold text-slate-800">
                    R$ {dreQ.data.despesaNaoOperacional.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg">
                <div className="text-sm text-white/90 mb-1">Resultado Líquido</div>
                <div className="text-3xl font-bold">
                  R$ {dreQ.data.resultadoLiquido.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Balancete */}
        {reportType === "balancete" && balanceteQ.data && (
          <div className="card-modern p-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Balancete Mensal</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-1">Total Receitas</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    R$ {balanceteQ.data.receita.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="p-4 bg-rose-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-1">Total Despesas</div>
                  <div className="text-2xl font-bold text-rose-600">
                    R$ {balanceteQ.data.despesa.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="p-4 bg-teal-50 rounded-lg">
                  <div className="text-sm text-slate-600 mb-1">Saldo</div>
                  <div className={`text-2xl font-bold ${
                    balanceteQ.data.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    R$ {balanceteQ.data.saldo.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-slate-800 mb-3">Receitas por Categoria</h4>
                  <div className="space-y-2">
                    {balanceteQ.data.detalhes.receitas.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-700">{item.categoria}</span>
                        <span className="font-semibold text-emerald-600">
                          R$ {item.valor.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-3">Despesas por Categoria</h4>
                  <div className="space-y-2">
                    {balanceteQ.data.detalhes.despesas.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-700">{item.categoria}</span>
                        <span className="font-semibold text-rose-600">
                          R$ {item.valor.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fluxo de Caixa */}
        {reportType === "cashflow" && cashflowQ.data && (
          <div className="card-modern p-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Fluxo de Caixa</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Saldo Inicial</div>
                <div className="text-xl font-bold text-slate-800">
                  R$ {(cashflowQ.data.receita - cashflowQ.data.despesa).toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Entradas</div>
                <div className="text-2xl font-bold text-emerald-600">
                  R$ {cashflowQ.data.receita.toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="p-4 bg-rose-50 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Saídas</div>
                <div className="text-2xl font-bold text-rose-600">
                  R$ {cashflowQ.data.despesa.toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg">
                <div className="text-sm text-white/90 mb-1">Saldo Final</div>
                <div className="text-3xl font-bold">
                  R$ {cashflowQ.data.saldo.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparativo Anual */}
        {reportType === "comparative" && (
          <div className="card-modern p-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Comparativo Anual</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map((month) => (
                <div key={month} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1 mb-2">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t"
                      style={{ height: `${Math.random() * 60 + 20}%` }}
                    ></div>
                    <div 
                      className="w-full bg-gradient-to-t from-rose-500 to-pink-500 rounded-t"
                      style={{ height: `${Math.random() * 40 + 10}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-600">{month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                <span className="text-sm text-slate-700">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-rose-500 rounded"></div>
                <span className="text-sm text-slate-700">Despesas</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
