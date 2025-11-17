import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

function IconCrown() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white"><path d="M3 8l4 3 5-7 5 7 4-3v9H3V8z" fill="currentColor"/></svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white"><path d="M12 2l8 4v6c0 5-3.5 9.2-8 10-4.5-.8-8-5-8-10V6l8-4z" fill="currentColor"/></svg>
  );
}

function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white"><path d="M3 7a3 3 0 013-3h12a2 2 0 012 2v2h-5a3 3 0 000 6h5v3a2 2 0 01-2 2H6a3 3 0 01-3-3V7z" fill="currentColor"/></svg>
  );
}

function IconOffice() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white"><path d="M4 3h10v6h6v12H4V3zm2 2v14h12V11h-6V5H6z" fill="currentColor"/></svg>
  );
}

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white"><path d="M6 4h9a3 3 0 013 3v13H9a3 3 0 00-3-3H3V7a3 3 0 013-3zm0 12a1 1 0 011 1h9V7a1 1 0 00-1-1H6a1 1 0 00-1 1v9h1z" fill="currentColor"/></svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-9 9a9 9 0 0118 0H3z" fill="currentColor"/></svg>
  );
}

export default function HierarchyDashboard() {
  const adminQ = useQuery({ queryKey: ["overview"], queryFn: async ({ signal }) => { const r = await fetch("/api/statistics/overview", { signal }); return r.json(); } });
  const treasuryQ = useQuery({ queryKey: ["treasury","overview"], queryFn: async ({ signal }) => { const r = await fetch("/api/treasury/overview", { signal }); return r.json(); } });
  const secStudentsQ = useQuery({ queryKey: ["sec","students"], queryFn: async ({ signal }) => { const r = await fetch("/api/secretary/students", { signal }); return r.json(); } });
  const eduQ = useQuery({ queryKey: ["education","dashboard"], queryFn: async ({ signal }) => { const r = await fetch("/api/education-secretary/dashboard", { signal }); return r.json(); } });
  const studentMeQ = useQuery({ queryKey: ["student","me"], queryFn: async ({ signal }) => { const r = await fetch("/api/student/me", { signal }); return r.json(); } });
  const studentReportQ = useQuery({ queryKey: ["student","report", studentMeQ.data?.classId, studentMeQ.data?.id], enabled: !!studentMeQ.data?.classId && !!studentMeQ.data?.id, queryFn: async ({ signal }) => { const r = await fetch(`/api/student/report-card?classId=${studentMeQ.data!.classId}&studentId=${studentMeQ.data!.id}`, { signal }); return r.json(); } });
  const teacherTermsQ = useQuery({ queryKey: ["teacher","terms"], queryFn: async ({ signal }) => { const r = await fetch("/api/teacher/terms", { signal }); return r.json(); } });
  const avg = (studentReportQ.data||[]).length ? Number(((studentReportQ.data||[]).reduce((s:any,r:any) => s + r.average, 0) / (studentReportQ.data||[]).length).toFixed(2)) : 0;
  const studentStatus = avg>=7?"Aprovado":avg>=5?"Recuperação":"Em risco";
  const studentStatusClass = avg>=7?"bg-emerald-600 text-white":avg>=5?"bg-amber-500 text-white":"bg-rose-600 text-white";
  const adminStatus = (adminQ.data?.errorsLastHour||0)>2?"Incidentes":"Estável";
  const adminStatusClass = (adminQ.data?.errorsLastHour||0)>2?"bg-amber-500 text-white":"bg-emerald-600 text-white";
  const treasuryStatus = (treasuryQ.data?.overdue||0)>0?"Pendências":"Estável";
  const treasuryStatusClass = (treasuryQ.data?.overdue||0)>0?"bg-amber-500 text-white":"bg-emerald-600 text-white";
  const eduStatus = (eduQ.data?.taxaAprovacao||0)>=0.8&& (eduQ.data?.indiceFrequencia||0)>=0.9?"Estável":"Atenção";
  const eduStatusClass = eduStatus==="Estável"?"bg-emerald-600 text-white":"bg-amber-500 text-white";
  const teacherActive = (teacherTermsQ.data||[]).find((t:any)=>t.status==="active");
  const panels = [
    { href: "/education-secretary", title: "Sec. de Educação", subtitle: "Gestão municipal da rede", accent: "from-violet-600 to-indigo-600", icon: IconCrown, tag: "PRINCIPAL", indicator: `${eduQ.data?.totalEscolas ?? 0} escolas`, statusText: eduStatus, statusClass: eduStatusClass },
    { href: "/admin", title: "Administrador", subtitle: "Configurações e usuários", accent: "from-slate-600 to-violet-600", icon: IconShield, indicator: `Saúde ${(adminQ.data?.systemHealth ?? 0)}%`, statusText: adminStatus, statusClass: adminStatusClass },
    { href: "/treasury", title: "Tesouraria", subtitle: "Financeiro e mensalidades", accent: "from-emerald-600 to-teal-600", icon: IconWallet, indicator: `R$ ${treasuryQ.data?.receita ?? 0}`, statusText: treasuryStatus, statusClass: treasuryStatusClass },
    { href: "/secretary", title: "Secretaria", subtitle: "Matrículas e documentos", accent: "from-cyan-600 to-teal-600", icon: IconOffice, indicator: `${(secStudentsQ.data||[]).length} alunos`, statusText: "Ativa", statusClass: "bg-cyan-600 text-white" },
    { href: "/teacher", title: "Professor", subtitle: "Turmas, aulas e presença", accent: "from-teal-600 to-emerald-600", icon: IconBook, indicator: teacherActive?`Bimestre ${teacherActive.number} aberto`:"Sem bimestre", statusText: "Em curso", statusClass: "bg-teal-600 text-white" },
    { href: "/student", title: "Aluno", subtitle: "Boletim e frequência", accent: "from-indigo-600 to-violet-600", icon: IconUser, indicator: `Média ${avg}`, statusText: studentStatus, statusClass: studentStatusClass }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/20 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* Header melhorado */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-aletheia-orange to-orange-600 grid place-items-center shadow-lg hover:shadow-xl transition-shadow">
              <img src="/aletheia-logo.svg" alt="Aletheia" className="w-8 h-8" />
            </div>
            <div>
              <div className="text-3xl font-serif font-extrabold">
                <span className="text-aletheia-emerald">A</span>
                <span className="text-aletheia-blue">letheia</span>
              </div>
              <div className="text-slate-600 text-sm font-medium">Gestão Educacional Integrada</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input 
              placeholder="Buscar..." 
              className="input-modern w-48 focus:w-56 transition-all" 
            />
            <Link href="/review">
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm cursor-pointer">
                🎨 Review
              </div>
            </Link>
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 grid place-items-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
              <span className="text-lg">🔔</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 grid place-items-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
              <span className="text-lg">⚙️</span>
            </div>
          </div>
        </div>

        {/* Painel principal com gradiente animado */}
        <div className="card-gradient from-violet-600 via-indigo-600 to-fuchsia-600 p-8 sm:p-12 mb-8 fade-in gradient-animated">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-white/90 mb-6">
            <div className="text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-soft"></span>
              Sistema Aletheia em funcionamento
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">Online</span>
              <Link href="/education-secretary">
                <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm cursor-pointer hover:bg-white/30 transition-colors font-medium">Tutorial</div>
              </Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-8">
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">Painel Aletheia</div>
              <div className="text-white/90 text-base">Acesso rápido aos módulos do sistema</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-5xl sm:text-6xl font-extrabold text-white drop-shadow-lg mb-2">Online</div>
              <div className="text-white/90 text-sm font-medium">Sistema operacional</div>
            </div>
          </div>
          
          {/* Lista de painéis melhorada */}
          <div className="space-y-3 sm:space-y-4">
            {panels.map((p, index) => {
              const Icon = p.icon as any;
              return (
                <Link key={p.href} href={p.href}>
                  <div className="flex items-center justify-between rounded-2xl glass hover:bg-white/20 transition-all duration-300 cursor-pointer group hover:scale-[1.01] hover:shadow-xl fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 flex-1">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl grid place-items-center bg-gradient-to-br ${p.accent} shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <div className="text-lg sm:text-xl font-bold text-white">{p.title}</div>
                          {p.tag && (
                            <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
                              {p.tag}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <div className="text-white/90 text-sm">{p.subtitle}</div>
                          <span className="text-white/80 text-xs px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm font-medium">
                            {p.indicator}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${p.statusClass}`}>
                            {p.statusText}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 text-white/80 font-medium group-hover:text-white group-hover:translate-x-1 transition-all">
                      →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Cards de estatísticas rápidas */}
        <div className="mt-8 sm:mt-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full"></span>
            Visão Geral
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="card-modern p-5 sm:p-6 fade-in group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg shadow-lg">
                  👥
                </div>
                <div className="text-sm font-medium text-slate-600">Alunos</div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-2">2</div>
              <div className="text-slate-500 text-xs sm:text-sm mb-3">Matrículas ativas</div>
              <svg viewBox="0 0 100 24" className="w-full h-6 opacity-60">
                <path d="M0 18 L15 12 L30 14 L45 8 L60 10 L75 6 L90 12 L100 9" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            
            <div className="card-modern p-5 sm:p-6 fade-in group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-lg shadow-lg">
                  📄
                </div>
                <div className="text-sm font-medium text-slate-600">Documentos</div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-violet-600 mb-2">0</div>
              <div className="text-slate-500 text-xs sm:text-sm mb-3">Pendências</div>
              <svg viewBox="0 0 100 24" className="w-full h-6 opacity-60">
                <path d="M0 16 L20 16 L40 15 L60 14 L80 14 L100 13" stroke="#8B5CF6" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            
            <div className="card-modern p-5 sm:p-6 fade-in group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-lg shadow-lg">
                  📅
                </div>
                <div className="text-sm font-medium text-slate-600">Eventos</div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 mb-2">0</div>
              <div className="text-slate-500 text-xs sm:text-sm mb-3">Mês corrente</div>
              <svg viewBox="0 0 100 24" className="w-full h-6 opacity-60">
                <path d="M0 12 L25 12 L50 12 L75 12 L100 12" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            
            <div className="card-modern p-5 sm:p-6 fade-in group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-lg shadow-lg">
                  💳
                </div>
                <div className="text-sm font-medium text-slate-600">Mensalidades</div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mb-2">R$ 0</div>
              <div className="text-slate-500 text-xs sm:text-sm mb-3">Receita</div>
              <svg viewBox="0 0 100 24" className="w-full h-6 opacity-60">
                <path d="M0 14 L20 13 L40 12 L60 11 L80 10 L100 9" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}