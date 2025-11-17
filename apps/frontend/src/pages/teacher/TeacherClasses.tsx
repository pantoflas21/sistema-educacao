import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";

type ClassItem = { id: string; name: string; studentsCount: number; termId: string };

export default function TeacherClasses() {
  const [, params] = useRoute("/teacher/:termId/classes");
  const termId = params?.termId || "";
  const { data, isLoading, error } = useQuery<ClassItem[]>({ 
    queryKey: ["teacher","classes",termId], 
    queryFn: async ({ signal }) => { 
      const r = await fetch(`/api/teacher/classes?termId=${termId}`, { signal }); 
      if (!r.ok) throw new Error("Erro ao carregar turmas");
      return r.json(); 
    },
    retry: 2,
    staleTime: 30000,
    enabled: !!termId
  });
  const totalStudents = (data||[]).reduce((sum, c) => sum + c.studentsCount, 0);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-rose-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <div className="text-slate-600">Carregando turmas...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-rose-50/20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-bold text-slate-800 mb-2">Erro ao carregar turmas</div>
          <div className="text-slate-600 mb-6">Tente recarregar a página.</div>
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
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/teacher" className="hover:text-orange-600 transition-colors">Bimestres</Link>
          <span>→</span>
          <span className="text-slate-800 font-medium">Turmas</span>
        </div>

        {/* Header */}
        <div className="card-gradient from-orange-500 via-rose-500 to-pink-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Turmas do Professor</div>
                  <div className="text-white/90 text-sm md:text-base">Selecione a turma para continuar</div>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">
                {(data||[]).length}
              </div>
              <div className="text-white/90 text-sm font-medium mb-3">Turmas Disponíveis</div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
                <span className="text-lg">👥</span>
                {totalStudents} alunos no total
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Turmas */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-rose-500 rounded-full"></span>
            Suas Turmas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(data||[]).map((classItem, index) => (
              <Link key={classItem.id} href={`/teacher/${termId}/classes/${classItem.id}/subjects`}>
                <div className="card-modern p-6 group hover:scale-[1.02] transition-all fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                      🏫
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl font-bold text-slate-800 mb-1 truncate">{classItem.name}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-lg">👥</span>
                        <span className="font-semibold">{classItem.studentsCount}</span>
                        <span>alunos</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-600">Ver disciplinas</span>
                    <span className="text-orange-600 text-lg group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {(!data || data.length === 0) && (
          <div className="card-modern p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <div className="text-xl font-semibold text-slate-800 mb-2">Nenhuma turma encontrada</div>
            <div className="text-slate-600">Você não possui turmas atribuídas neste bimestre.</div>
          </div>
        )}
      </div>
    </div>
  );
}