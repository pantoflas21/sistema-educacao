import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

type Wallet = { 
  balance: number; 
  ledger: { 
    amount: number; 
    type: "award"|"spend"; 
    description: string; 
    date: string;
    source?: string;
  }[] 
};

type Reward = {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "material" | "benefit" | "activity";
  imageUrl?: string;
  available: boolean;
};

export default function StudentPedacoins() {
  const qc = useQueryClient();
  
  const walletQ = useQuery<Wallet>({ 
    queryKey: ["student","pedacoins"], 
    queryFn: async () => { 
      const r = await fetch(`/api/student/pedacoins/wallet`); 
      return r.json(); 
    } 
  });

  const rewardsQ = useQuery<Reward[]>({ 
    queryKey: ["student","rewards"], 
    queryFn: async () => { 
      const r = await fetch(`/api/student/pedacoins/rewards`); 
      return r.json(); 
    } 
  });

  const purchaseReward = useMutation({
    mutationFn: async (rewardId: string) => {
      const r = await fetch("/api/student/pedacoins/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student","pedacoins"] });
      qc.invalidateQueries({ queryKey: ["student","rewards"] });
    }
  });

  const getCategoryIcon = (category: Reward["category"]) => {
    switch (category) {
      case "material": return "📚";
      case "benefit": return "⭐";
      case "activity": return "🎮";
    }
  };

  const getCategoryLabel = (category: Reward["category"]) => {
    switch (category) {
      case "material": return "Material Escolar";
      case "benefit": return "Benefícios Especiais";
      case "activity": return "Atividades Recreativas";
    }
  };

  const waysToEarn = [
    { action: "Participação em aula", coins: 10, icon: "✋" },
    { action: "Notas acima de 8.0", coins: 20, icon: "⭐" },
    { action: "Frequência 100% no mês", coins: 50, icon: "📅" },
    { action: "Trabalhos entregues no prazo", coins: 15, icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50/30 to-blue-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-emerald-600 via-teal-600 to-cyan-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-4xl">🪙</span>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Sistema PedaCoins</div>
                  <div className="text-white/90 text-sm md:text-base">Moeda virtual educacional</div>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">
                {walletQ.data?.balance ?? 0}
              </div>
              <div className="text-white/90 text-sm font-medium mb-3">PedaCoins Disponíveis</div>
            </div>
            <Link href="/student">
              <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer">
                ← Voltar
              </div>
            </Link>
          </div>
        </div>

        {/* Formas de Ganhar */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></span>
            Como Ganhar PedaCoins
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {waysToEarn.map((way, i) => (
              <div key={i} className="card-modern p-6 fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-4xl mb-3">{way.icon}</div>
                <div className="text-lg font-bold text-slate-800 mb-2">{way.action}</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-emerald-600">+{way.coins}</span>
                  <span className="text-sm text-slate-600">PedaCoins</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loja de Recompensas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></span>
            Loja de Recompensas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(rewardsQ.data || []).map((reward) => {
              const canAfford = (walletQ.data?.balance ?? 0) >= reward.cost;
              const categoryIcon = getCategoryIcon(reward.category);
              
              return (
                <div key={reward.id} className={`card-modern p-6 ${!reward.available ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">{categoryIcon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">{reward.name}</div>
                      <div className="text-xs text-slate-500">{getCategoryLabel(reward.category)}</div>
                    </div>
                  </div>
                  {reward.imageUrl && (
                    <div className="w-full h-32 bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                      <img src={reward.imageUrl} alt={reward.name} className="w-full h-full object-cover rounded-lg" />
                    </div>
                  )}
                  <div className="text-sm text-slate-600 mb-4">{reward.description}</div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🪙</span>
                      <span className="text-xl font-bold text-emerald-600">{reward.cost}</span>
                    </div>
                    <button
                      onClick={() => purchaseReward.mutate(reward.id)}
                      disabled={!canAfford || !reward.available}
                      className={`btn-modern ${
                        canAfford && reward.available
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {!reward.available ? 'Indisponível' : canAfford ? 'Comprar' : 'Insuficiente'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Histórico */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></span>
            Histórico de Transações
          </h2>
          <div className="card-modern p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(walletQ.data?.ledger || []).map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      entry.type === 'award' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {entry.type === 'award' ? '➕' : '➖'}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{entry.description}</div>
                      {entry.source && (
                        <div className="text-xs text-slate-500">Fonte: {entry.source}</div>
                      )}
                      <div className="text-xs text-slate-500">
                        {new Date(entry.date).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${
                    entry.type === 'award' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {entry.type === 'award' ? '+' : '-'}{entry.amount}
                  </div>
                </div>
              ))}
              {(!walletQ.data?.ledger || walletQ.data.ledger.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  Nenhuma transação ainda
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
