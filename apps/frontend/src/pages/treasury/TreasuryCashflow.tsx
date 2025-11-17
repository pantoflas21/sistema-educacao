import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type CashEntry = {
  id: string;
  date: string;
  categoria: "receita" | "despesa";
  subcategoria: string;
  valor: number;
  origem: string;
  description?: string;
};

type CashOverview = {
  receita: number;
  despesa: number;
  saldo: number;
  entries: CashEntry[];
  receitasByCategory?: Record<string, number>;
  despesasByCategory?: Record<string, number>;
};

const receitaCategories = [
  "Mensalidades",
  "Taxas Extras",
  "Eventos Escolares",
  "Outros Ingressos"
];

const despesaCategories = [
  "Salários de Funcionários",
  "Manutenção Predial",
  "Material Didático",
  "Serviços Terceirizados",
  "Outros"
];

export default function TreasuryCashflow() {
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const qc = useQueryClient();

  const overviewQ = useQuery<CashOverview>({ 
    queryKey: ["treasury","cash"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/treasury/cash/overview", { signal }); 
      return r.json(); 
    } 
  });

  const addEntry = useMutation({
    mutationFn: async (payload: Partial<CashEntry>) => { 
      const r = await fetch("/api/treasury/cash/entries", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      }); 
      return r.json(); 
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treasury","cash"] });
      setShowEntryModal(false);
    }
  });

  const filtered = overviewQ.data?.entries?.filter(e => 
    filterCategory === "all" || e.categoria === filterCategory
  ) || [];

  const receitasByMonth = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    const monthKey = month.toISOString().slice(0, 7);
    return {
      month: monthKey,
      value: Math.random() * 50000 + 20000 // Simulado
    };
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Fluxo de Caixa</div>
                  <div className="text-white/90 text-sm md:text-base">Controle de receitas e despesas</div>
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

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl shadow-lg">
                📈
              </div>
            </div>
            <div className="text-sm text-slate-600 mb-2">Total de Receitas</div>
            <div className="text-3xl font-extrabold text-emerald-600">
              R$ {(overviewQ.data?.receita ?? 0).toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white text-xl shadow-lg">
                📉
              </div>
            </div>
            <div className="text-sm text-slate-600 mb-2">Total de Despesas</div>
            <div className="text-3xl font-extrabold text-rose-600">
              R$ {(overviewQ.data?.despesa ?? 0).toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xl shadow-lg">
                💰
              </div>
            </div>
            <div className="text-sm text-slate-600 mb-2">Saldo Atual</div>
            <div className={`text-3xl font-extrabold ${
              (overviewQ.data?.saldo ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              R$ {(overviewQ.data?.saldo ?? 0).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Gráfico de Evolução */}
        <div className="card-modern p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Evolução do Saldo (Últimos 6 Meses)</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {receitasByMonth.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t-lg mb-2"
                  style={{ height: `${(item.value / 70000) * 100}%` }}
                ></div>
                <span className="text-xs text-slate-600">{new Date(item.month).toLocaleDateString('pt-BR', { month: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros e Ações */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Filtrar:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-modern"
            >
              <option value="all">Todas</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>
          <button
            onClick={() => setShowEntryModal(true)}
            className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700"
          >
            + Nova Entrada
          </button>
        </div>

        {/* Lista de Entradas */}
        <div className="card-modern overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Movimentações</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Data</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Categoria</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Subcategoria</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Origem</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.categoria === "receita" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {entry.categoria === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{entry.subcategoria}</td>
                    <td className="px-4 py-3 text-slate-600">{entry.origem}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      entry.categoria === "receita" ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {entry.categoria === "receita" ? "+" : "-"}R$ {entry.valor.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Nova Entrada */}
        {showEntryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Nova Entrada</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  addEntry.mutate({
                    categoria: String(fd.get('categoria') || 'receita') as "receita" | "despesa",
                    subcategoria: String(fd.get('subcategoria') || ''),
                    valor: Number(fd.get('valor') || 0),
                    origem: String(fd.get('origem') || 'manual'),
                    description: String(fd.get('description') || ''),
                    date: String(fd.get('date') || new Date().toISOString().split('T')[0])
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select name="categoria" className="input-modern w-full" required>
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subcategoria *</label>
                  <select name="subcategoria" className="input-modern w-full" required>
                    <option value="">Selecione...</option>
                    <optgroup label="Receitas">
                      {receitaCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Despesas">
                      {despesaCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data *</label>
                  <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="input-modern w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$) *</label>
                  <input name="valor" type="number" step="0.01" className="input-modern w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origem</label>
                  <input name="origem" className="input-modern w-full" placeholder="Ex: Manual, Sistema, etc." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                  <textarea name="description" className="input-modern w-full h-20" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700 flex-1">
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEntryModal(false)}
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
