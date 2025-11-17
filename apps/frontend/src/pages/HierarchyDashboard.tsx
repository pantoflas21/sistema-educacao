import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

function IconCrown() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white"><path d="M3 8l4 3 5-7 5 7 4-3v9H3V8z" fill="currentColor"/></svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white"><path d="M12 2l8 4v6c0 5-3.5 9.2-8 10-4.5-.8-8-5-8-10V6l8-4z" fill="currentColor"/></svg>
  );
}

function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white"><path d="M3 7a3 3 0 013-3h12a2 2 0 012 2v2h-5a3 3 0 000 6h5v3a2 2 0 01-2 2H6a3 3 0 01-3-3V7z" fill="currentColor"/></svg>
  );
}

function IconOffice() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white"><path d="M4 3h10v6h6v12H4V3zm2 2v14h12V11h-6V5H6z" fill="currentColor"/></svg>
  );
}

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white"><path d="M6 4h9a3 3 0 013 3v13H9a3 3 0 00-3-3H3V7a3 3 0 013-3zm0 12a1 1 0 011 1h9V7a1 1 0 00-1-1H6a1 1 0 00-1 1v9h1z" fill="currentColor"/></svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-9 9a9 9 0 0118 0H3z" fill="currentColor"/></svg>
  );
}

export default function HierarchyDashboard() {
  const [location] = useLocation();
  
  const adminQ = useQuery({ 
    queryKey: ["overview"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/statistics/overview", { signal }); 
      if (!r.ok) throw new Error("Erro ao carregar estatísticas");
      return r.json(); 
    },
    retry: 2,
    staleTime: 30000
  });
  const treasuryQ = useQuery({ 
    queryKey: ["treasury","overview"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/treasury/overview", { signal }); 
      if (!r.ok) throw new Error("Erro ao carregar tesouraria");
      return r.json(); 
    },
    retry: 2
  });
  const secStudentsQ = useQuery({ 
    queryKey: ["sec","students"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/secretary/students", { signal }); 
      if (!r.ok) throw new Error("Erro ao carregar alunos");
      return r.json(); 
    },
    retry: 2
  });
  const eduQ = useQuery({ 
    queryKey: ["education","dashboard"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/education-secretary/dashboard", { signal }); 
      if (!r.ok) throw new Error("Erro ao carregar educação");
      return r.json(); 
    },
    retry: 2
  });
  const studentMeQ = useQuery({ 
    queryKey: ["student","me"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/student/me", { signal }); 
      if (!r.ok) throw new Error("Erro ao carregar dados do aluno");
      return r.json(); 
    },
    retry: 2
  });
  const studentReportQ = useQuery({ 
    queryKey: ["student","report", studentMeQ.data?.classId, studentMeQ.data?.id], 
    enabled: !!studentMeQ.data?.classId && !!studentMeQ.data?.id, 
    queryFn: async ({ signal }) => { 
      const r = await fetch(`/api/student/report-card?classId=${studentMeQ.data!.classId}&studentId=${studentMeQ.data!.id}`, { signal }); 
      if (!r.ok) throw new Error("Erro ao carregar boletim");
      return r.json(); 
    },
    retry: 2
  });
  const teacherTermsQ = useQuery({ 
    queryKey: ["teacher","terms"], 
    queryFn: async ({ signal }) => { 
      try {
        const r = await fetch("/api/teacher/terms", { 
          signal,
          headers: {
            "Content-Type": "application/json",
          }
        }); 
        if (!r.ok) {
          const errorText = await r.text();
          console.error("❌ Erro ao buscar bimestres:", r.status, r.statusText, errorText);
          throw new Error(`Erro ${r.status}: ${errorText || r.statusText}`);
        }
        const json = await r.json();
        console.log("✅ Bimestres carregados:", json);
        return json;
      } catch (err) {
        console.error("❌ Erro na query de bimestres:", err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 30000
  });
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 flex">
      {/* Sidebar - Proporcional e Moderna */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-lg flex-shrink-0">
        {/* Header Sidebar */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md p-2">
              <img src="/aletheia-logo.svg" alt="Aletheia" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <div className="text-lg font-serif font-extrabold">
                <span className="text-aletheia-emerald">A</span>
                <span className="text-aletheia-blue">letheia</span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Sistema de Gestão</div>
            </div>
          </div>
        </div>

        {/* Painéis do Sistema */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">PAINÉIS DO SISTEMA</div>
          <div className="space-y-1">
            {panels.map((p) => {
              const Icon = p.icon as any;
              const isActive = location === p.href || location.startsWith(p.href + "/");
              return (
                <Link key={p.href} href={p.href}>
                  <div 
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm" 
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-slate-200"
                    }`}>
                      <Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{p.title}</div>
                      {p.tag && isActive && (
                        <div className="text-xs opacity-90 mt-0.5 font-medium">{p.tag}</div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-slate-200 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Sistema Seguro
          </div>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-soft"></span>
            <span className="text-sm font-semibold text-slate-700">Sistema Aletheia em funcionamento</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Online</span>
          </div>
          <div className="flex items-center gap-3">
            <input 
              placeholder="Buscar..." 
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64" 
            />
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors relative">
              <span className="text-lg">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg transition-shadow">
              JS
            </div>
          </div>
        </div>

        {/* Conteúdo do Dashboard */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {/* Banner Principal */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 mb-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-4xl font-extrabold mb-2">Painel Aletheia</div>
                  <div className="text-blue-100 text-lg mb-4">Acesso rápido aos módulos do sistema</div>
                  <Link href="/education-secretary">
                    <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                      Tutorial
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Cards de Estatísticas Rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600">Alunos</div>
                </div>
                <div className="text-3xl font-extrabold text-blue-600 mb-1">2</div>
                <div className="text-xs text-slate-500">Matrículas ativas</div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600">Documentos</div>
                </div>
                <div className="text-3xl font-extrabold text-purple-600 mb-1">0</div>
                <div className="text-xs text-slate-500">Pendências</div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600">Eventos</div>
                </div>
                <div className="text-3xl font-extrabold text-amber-600 mb-1">0</div>
                <div className="text-xs text-slate-500">Mês corrente</div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600">Mensalidades</div>
                </div>
                <div className="text-3xl font-extrabold text-emerald-600 mb-1">R$ 0</div>
                <div className="text-xs text-slate-500">Receita</div>
              </div>
            </div>

            {/* Cards de Ações Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {panels.map((p) => {
                const Icon = p.icon as any;
                return (
                  <Link key={p.href} href={p.href}>
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group border border-slate-200 hover:border-blue-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.accent} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon />
                        </div>
                        {p.tag && (
                          <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                            {p.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-xl font-bold text-slate-800 mb-1">{p.title}</div>
                      <div className="text-sm text-slate-600 mb-3">{p.subtitle}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{p.indicator}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.statusClass}`}>
                          {p.statusText}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
