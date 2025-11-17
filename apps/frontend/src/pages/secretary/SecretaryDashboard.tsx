import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

type Student = { id: string };
type ClassItem = { id: string };

export default function SecretaryDashboard() {
  const studentsQ = useQuery<Student[]>({ queryKey: ["sec","students"], queryFn: async ({ signal }) => { const r = await fetch("/api/secretary/students", { signal }); return r.json(); } });
  const classesQ = useQuery<ClassItem[]>({ queryKey: ["sec","classes"], queryFn: async ({ signal }) => { const r = await fetch("/api/secretary/classes", { signal }); return r.json(); } });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-indigo-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header melhorado */}
        <div className="card-gradient from-indigo-600 via-blue-600 to-violet-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Secretaria Escolar</div>
                  <div className="text-white/90 text-sm md:text-base">Gestão Administrativa Completa</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/90 mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-sm font-medium">
                  <span className="text-lg">📚</span>
                  {classesQ.data?.length ?? 0} Turmas
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-sm font-medium">
                  <span className="text-lg">📅</span>
                  Ano Letivo 2025
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">98%</div>
              <div className="text-white/90 text-sm font-medium mb-3">Taxa de Matrícula</div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-soft"></span>
                Excelente
              </div>
            </div>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="card-modern p-6 fade-in group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
                👥
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-indigo-600">{studentsQ.data?.length ?? 0}</div>
                <div className="text-xs text-slate-500 mt-1">Alunos</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Alunos Matriculados</div>
            <div className="text-xs text-emerald-600 font-medium">+12 este mês</div>
          </div>
          
          <div className="card-modern p-6 fade-in group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg">
                🏫
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-blue-600">{classesQ.data?.length ?? 0}</div>
                <div className="text-xs text-slate-500 mt-1">Turmas</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Turmas Ativas</div>
            <div className="text-xs text-slate-500">Ensino Fundamental e Médio</div>
          </div>
          
          <div className="card-modern p-6 fade-in group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-xl shadow-lg">
                📄
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-violet-600">234</div>
                <div className="text-xs text-slate-500 mt-1">Documentos</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Documentos Gerados</div>
            <div className="text-xs text-slate-500">Este bimestre</div>
          </div>
          
          <div className="card-modern p-6 fade-in group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-xl shadow-lg">
                📢
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-cyan-600">45</div>
                <div className="text-xs text-slate-500 mt-1">Comunicados</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Comunicados</div>
            <div className="text-xs text-slate-500">Enviados este mês</div>
          </div>
        </div>

        {/* Menu de categorias */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
            Módulos Disponíveis
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">Gestão de Alunos</div>
            <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">Turmas</div>
            <div className="px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium">Acadêmico</div>
            <div className="px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium">Documentos</div>
            <div className="px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium">Comunicação</div>
            <div className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">Planos de Aula</div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Link href="/secretary/students">
            <div className="card-modern p-6 cursor-pointer group h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  👤
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-slate-800 mb-1">Gestão de Alunos</div>
                  <div className="text-slate-600 text-sm">Cadastro completo e matrículas</div>
                </div>
              </div>
              <button className="btn-modern bg-indigo-600 text-white w-full hover:bg-indigo-700">
                Novo Aluno
              </button>
            </div>
          </Link>
          
          <Link href="/secretary/classes">
            <div className="card-modern p-6 cursor-pointer group h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  🏫
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-slate-800 mb-1">Turmas</div>
                  <div className="text-slate-600 text-sm">Organize capacidade e turnos</div>
                </div>
              </div>
              <button className="btn-modern bg-blue-600 text-white w-full hover:bg-blue-700">
                Criar Turma
              </button>
            </div>
          </Link>
          
          <Link href="/secretary/subjects">
            <div className="card-modern p-6 cursor-pointer group h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  📚
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-slate-800 mb-1">Disciplinas</div>
                  <div className="text-slate-600 text-sm">Cadastre e vincule às turmas</div>
                </div>
              </div>
              <button className="btn-modern bg-violet-600 text-white w-full hover:bg-violet-700">
                Nova Disciplina
              </button>
            </div>
          </Link>

          <Link href="/secretary/calendar">
            <div className="card-modern p-6 cursor-pointer group h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  📅
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-slate-800 mb-1">Calendário Escolar</div>
                  <div className="text-slate-600 text-sm">Bimestres, feriados e horários</div>
                </div>
              </div>
              <button className="btn-modern bg-amber-600 text-white w-full hover:bg-amber-700">
                Gerenciar
              </button>
            </div>
          </Link>

          <Link href="/secretary/documents">
            <div className="card-modern p-6 cursor-pointer group h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  📄
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-slate-800 mb-1">Documentos</div>
                  <div className="text-slate-600 text-sm">Gere certificados e declarações</div>
                </div>
              </div>
              <button className="btn-modern bg-cyan-600 text-white w-full hover:bg-cyan-700">
                Gerar Documento
              </button>
            </div>
          </Link>

          <Link href="/secretary/communication">
            <div className="card-modern p-6 cursor-pointer group h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  📢
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-slate-800 mb-1">Comunicação</div>
                  <div className="text-slate-600 text-sm">Avisos e reuniões</div>
                </div>
              </div>
              <button className="btn-modern bg-teal-600 text-white w-full hover:bg-teal-700">
                Novo Comunicado
              </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}