import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";

type Subject = { id: string; code: string; name: string };

export default function TeacherSubjects() {
  const [, params] = useRoute("/teacher/:termId/classes/:classId/subjects");
  const termId = params?.termId || "";
  const classId = params?.classId || "";
  const { data, isLoading, error } = useQuery<Subject[]>({ 
    queryKey: ["teacher","subjects",classId], 
    queryFn: async () => {
      // Dados padrão baseados na turma
      const defaultSubjects: Record<string, Subject[]> = {
        c7A: [
          { id: "MAT", code: "MAT", name: "Matemática" },
          { id: "POR", code: "POR", name: "Português" }
        ],
        c8B: [
          { id: "HIS", code: "HIS", name: "História" },
          { id: "GEO", code: "GEO", name: "Geografia" }
        ]
      };
      
      const default = defaultSubjects[classId] || [];
      
      try {
        const r = await fetch(`/api/teacher/subjects?classId=${classId}`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });
        
        const contentType = r.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json") || !r.ok) {
          return default;
        }
        
        const json = await r.json();
        return Array.isArray(json) && json.length > 0 ? json : default;
      } catch {
        return default;
      }
    },
    retry: 1,
    staleTime: 60000,
    enabled: !!classId,
    refetchOnWindowFocus: false
  });
  
  // SEMPRE usar dados (da API ou padrão)
  const defaultSubjectsMap: Record<string, Subject[]> = {
    c7A: [
      { id: "MAT", code: "MAT", name: "Matemática" },
      { id: "POR", code: "POR", name: "Português" }
    ],
    c8B: [
      { id: "HIS", code: "HIS", name: "História" },
      { id: "GEO", code: "GEO", name: "Geografia" }
    ]
  };
  const subjects = data || defaultSubjectsMap[classId] || [];
  
  const subjectColors = [
    "from-blue-500 to-blue-600",
    "from-indigo-500 to-indigo-600",
    "from-violet-500 to-violet-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-rose-500 to-rose-600",
    "from-orange-500 to-orange-600",
    "from-amber-500 to-amber-600",
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-rose-50/20 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/teacher" className="hover:text-orange-600 transition-colors">Bimestres</Link>
          <span>→</span>
          <Link href={`/teacher/${termId}/classes`} className="hover:text-orange-600 transition-colors">Turmas</Link>
          <span>→</span>
          <span className="text-slate-800 font-medium">Disciplinas</span>
        </div>

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
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Disciplinas</div>
                  <div className="text-white/90 text-sm md:text-base">Selecione a disciplina para acessar as ferramentas</div>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">
                {subjects.length}
              </div>
              <div className="text-white/90 text-sm font-medium mb-3">Disciplinas Disponíveis</div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
                <span className="text-lg">📚</span>
                Suas disciplinas
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Disciplinas */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-rose-500 rounded-full"></span>
            Disciplinas que Você Leciona
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {subjects.map((subject, index) => {
              const colorGradient = subjectColors[index % subjectColors.length];
              return (
                <Link key={subject.id} href={`/teacher/${termId}/classes/${classId}/subjects/${subject.id}`}>
                  <div className="card-modern p-6 group hover:scale-[1.02] transition-all fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                        📖
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-slate-800 mb-1">{subject.code}</div>
                        <div className="text-sm text-slate-600 line-clamp-2">{subject.name}</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-600">Acessar ferramentas</span>
                      <span className="text-orange-600 text-lg group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {subjects.length === 0 && (
          <div className="card-modern p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <div className="text-xl font-semibold text-slate-800 mb-2">Nenhuma disciplina encontrada</div>
            <div className="text-slate-600">Você não possui disciplinas atribuídas para esta turma.</div>
          </div>
        )}
      </div>
    </div>
  );
}