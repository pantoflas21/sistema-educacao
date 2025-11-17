import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

type Overview = { 
  totalInvoices: number; 
  overdue: number; 
  paid: number; 
  receita: number;
  receitaAnual?: number;
  inadimplencia?: number;
  previsaoRecebimentos?: number;
};

export default function TreasuryDashboard() {
  const { data } = useQuery<Overview>({ 
    queryKey: ["treasury","overview"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/treasury/overview", { signal }); 
      return r.json(); 
    } 
  });

  const inadimplenciaPercent = data?.inadimplencia 
    ? ((data.overdue / Math.max(1, data.totalInvoices)) * 100).toFixed(1)
    : "0";

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
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Tesouraria</div>
                  <div className="text-white/90 text-sm md:text-base">Gestão financeira completa</div>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">
                R$ {(data?.receita ?? 0).toLocaleString('pt-BR')}
              </div>
              <div className="text-white/90 text-sm font-medium mb-3">Receita Mensal</div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-white pulse-soft"></span>
                {data?.receitaAnual ? `Anual: R$ ${data.receitaAnual.toLocaleString('pt-BR')}` : 'Sistema ativo'}
              </div>
            </div>
          </div>
        </div>

        {/* Cards de métricas principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="card-modern p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
                📄
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-indigo-600">{data?.totalInvoices ?? 0}</div>
                <div className="text-xs text-slate-500 mt-1">Faturas</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Faturas Emitidas</div>
            <div className="text-xs text-slate-500">Total de cobranças</div>
          </div>

          <div className="card-modern p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white text-xl shadow-lg">
                ⚠️
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-rose-600">{data?.overdue ?? 0}</div>
                <div className="text-xs text-slate-500 mt-1">Atrasadas</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Inadimplência</div>
            <div className="text-xs text-rose-600 font-medium">{inadimplenciaPercent}% do total</div>
          </div>

          <div className="card-modern p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl shadow-lg">
                ✅
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-emerald-600">{data?.paid ?? 0}</div>
                <div className="text-xs text-slate-500 mt-1">Pagas</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Faturas Pagas</div>
            <div className="text-xs text-emerald-600 font-medium">
              {data?.totalInvoices ? ((data.paid / data.totalInvoices) * 100).toFixed(1) : 0}% de quitação
            </div>
          </div>

          <div className="card-modern p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xl shadow-lg">
                💰
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-teal-600">
                  R$ {(data?.receita ?? 0).toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-slate-500 mt-1">Receita</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Receita Mensal</div>
            <div className="text-xs text-slate-500">Mês atual</div>
          </div>
        </div>

        {/* Gráfico de Evolução */}
        <div className="card-modern p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Evolução de Receitas</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[1,2,3,4,5,6].map((month) => (
              <div key={month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t-lg mb-2"
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                ></div>
                <span className="text-xs text-slate-600">Mês {month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ações rápidas */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></span>
            Módulos Financeiros
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Link href="/treasury/tuition">
              <div className="card-modern p-6 cursor-pointer group h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  💳
                </div>
                <div className="text-xl font-bold text-slate-800 mb-2">Mensalidades</div>
                <div className="text-slate-600 text-sm mb-4">Controle de pagamentos e descontos</div>
                <div className="btn-modern bg-emerald-600 text-white w-full hover:bg-emerald-700 text-center">
                  Abrir
                </div>
              </div>
            </Link>

            <Link href="/treasury/invoices">
              <div className="card-modern p-6 cursor-pointer group h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  📋
                </div>
                <div className="text-xl font-bold text-slate-800 mb-2">Faturas</div>
                <div className="text-slate-600 text-sm mb-4">Emissão e histórico de boletos</div>
                <div className="btn-modern bg-teal-600 text-white w-full hover:bg-teal-700 text-center">
                  Abrir
                </div>
              </div>
            </Link>

            <Link href="/treasury/cashflow">
              <div className="card-modern p-6 cursor-pointer group h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <div className="text-xl font-bold text-slate-800 mb-2">Fluxo de Caixa</div>
                <div className="text-slate-600 text-sm mb-4">Entradas e saídas detalhadas</div>
                <div className="btn-modern bg-cyan-600 text-white w-full hover:bg-cyan-700 text-center">
                  Abrir
                </div>
              </div>
            </Link>

            <Link href="/treasury/reports">
              <div className="card-modern p-6 cursor-pointer group h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  📈
                </div>
                <div className="text-xl font-bold text-slate-800 mb-2">Relatórios</div>
                <div className="text-slate-600 text-sm mb-4">Financeiros e contábeis</div>
                <div className="btn-modern bg-indigo-600 text-white w-full hover:bg-indigo-700 text-center">
                  Abrir
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}