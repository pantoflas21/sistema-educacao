import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

type Term = { id: string; number: number; status: "active"|"locked"|"completed"; startDate: string; endDate: string };

const getStatusConfig = (status: Term["status"]) => {
  switch (status) {
    case "active":
      return {
        gradient: "from-blue-500 to-blue-600",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: "⏱",
        label: "Ativo",
        iconBg: "bg-blue-100"
      };
    case "completed":
      return {
        gradient: "from-emerald-500 to-emerald-600",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: "✔",
        label: "Concluído",
        iconBg: "bg-emerald-100"
      };
    default:
      return {
        gradient: "from-slate-400 to-slate-500",
        bg: "bg-slate-50",
        text: "text-slate-600",
        border: "border-slate-200",
        icon: "🔒",
        label: "Bloqueado",
        iconBg: "bg-slate-100"
      };
  }
};

export default function TeacherTerms() {
  const { data, isLoading, error } = useQuery<Term[]>({ 
    queryKey: ["teacher","terms"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/teacher/terms", { signal }); 
      if (!r.ok) throw new Error("Erro ao carregar bimestres");
      return r.json(); 
    },
    retry: 2,
    staleTime: 30000
  });
  
  const activeCount = (data||[]).filter(t => t.status === "active").length;
  
  // Mostrar mensagem se não houver dados ou erro
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-rose-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <div className="text-slate-600">Carregando bimestres...</div>
        </div>
      </div>
    );
  }
  
  if (error || !data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-rose-50/20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-bold text-slate-800 mb-2">Nenhum bimestre encontrado</div>
          <div className="text-slate-600 mb-6">Verifique se o ano letivo foi configurado corretamente.</div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-modern bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600"
          >
            🔄 Recarregar
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-rose-50/20 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-orange-500 via-rose-500 to-pink-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Painel do Professor</div>
                  <div className="text-white/90 text-sm md:text-base">Selecione o bimestre para continuar</div>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">
                {activeCount}
              </div>
              <div className="text-white/90 text-sm font-medium mb-3">Bimestres Ativos</div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-white pulse-soft"></span>
                Total: {(data||[]).length} bimestres
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Bimestres */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-rose-500 rounded-full"></span>
            Bimestres do Ano Letivo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {(data||[]).map((term, index) => {
              const config = getStatusConfig(term.status);
              const isLocked = term.status === "locked";
              
              return (
                <div
                  key={term.id}
                  className={`fade-in ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {isLocked ? (
                    <div className="card-modern p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-slate-100 rounded-bl-full flex items-start justify-end p-2">
                        <span className="text-2xl">{config.icon}</span>
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center text-2xl`}>
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <div className="text-xl font-bold text-slate-800">Bimestre {term.number}</div>
                            <div className={`text-xs font-semibold ${config.text} mt-1`}>{config.label}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-slate-500">Início</div>
                          <div className="text-sm font-medium text-slate-700">{term.startDate}</div>
                          <div className="text-xs text-slate-500 mt-3">Término</div>
                          <div className="text-sm font-medium text-slate-700">{term.endDate}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link href={`/teacher/${term.id}/classes`}>
                      <div className={`card-modern p-6 group hover:scale-[1.02] transition-all ${config.bg} ${config.border} border-2`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <div className="text-xl font-bold text-slate-800">Bimestre {term.number}</div>
                            <div className={`text-xs font-semibold ${config.text} mt-1`}>{config.label}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">Início</span>
                            <span className="text-sm font-semibold text-slate-800">{term.startDate}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">Término</span>
                            <span className="text-sm font-semibold text-slate-800">{term.endDate}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-xs text-slate-600">Clique para continuar</span>
                          <span className={`text-lg ${config.text} group-hover:translate-x-1 transition-transform`}>
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="card-modern p-6 bg-gradient-to-r from-orange-50 to-rose-50 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
              ℹ️
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-800 mb-2">Sistema de Desbloqueio Progressivo</div>
              <div className="text-sm text-slate-600">
                Os bimestres são desbloqueados automaticamente conforme o calendário escolar. 
                Bimestres bloqueados não podem ser acessados até sua data de início.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}