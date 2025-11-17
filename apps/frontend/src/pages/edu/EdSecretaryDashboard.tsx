import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type Exec = { 
  totalEscolas: number; 
  totalAlunos: number; 
  totalProfessores: number; 
  mediaGeral: number; 
  taxaAprovacao: number; 
  indiceFrequencia: number; 
  evasaoPercent: number; 
  idebScore: number;
};

type School = {
  id: string;
  name: string;
  city: string;
  state: string;
  status: "operacional" | "manutencao" | "paralisada";
  capacidade: number;
  ocupacao: number;
  solicitacoesPendentes: number;
  staff?: {
    diretor?: string;
    professores: number;
    vigilantes: number;
    servicosGerais: number;
    agentesAdm: number;
  };
  performance?: {
    aprovacao: number;
    frequencia: number;
    ideb: number;
  };
};

export default function EdSecretaryDashboard() {
  const qc = useQueryClient();
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    city: "", 
    state: "", 
    diretor: "", 
    professores: 0, 
    vigilantes: 0, 
    servicosGerais: 0, 
    agentesAdm: 0, 
    capacidade: 0 
  });

  const { data } = useQuery<Exec>({ 
    queryKey: ["eduSec","dashboard"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/education-secretary/dashboard", { signal }); 
      return r.json(); 
    } 
  });

  const schoolsQ = useQuery<School[]>({ 
    queryKey: ["eduSec","schools"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/education-secretary/schools", { signal }); 
      return r.json(); 
    } 
  });

  const createSchool = useMutation({ 
    mutationFn: async (payload: any) => { 
      const r = await fetch("/api/education-secretary/schools", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      }); 
      if (!r.ok) throw new Error("failed"); 
      return r.json(); 
    }, 
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["eduSec","schools"] }); 
      setShowSchoolModal(false);
      setForm({ name: "", city: "", state: "", diretor: "", professores: 0, vigilantes: 0, servicosGerais: 0, agentesAdm: 0, capacidade: 0 });
    } 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-indigo-600 via-blue-600 to-sky-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Secretário de Educação</div>
                  <div className="text-white/90 text-sm md:text-base">Visão consolidada da rede municipal</div>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">
                {data?.idebScore ?? 0}
              </div>
              <div className="text-white/90 text-sm font-medium mb-3">IDEB Municipal</div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-white pulse-soft"></span>
                Rede Ativa
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="card-modern p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
                🏫
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-indigo-600">{data?.totalEscolas ?? 0}</div>
                <div className="text-xs text-slate-500 mt-1">Escolas</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Total de Escolas</div>
            <div className="text-xs text-slate-500">Rede Municipal</div>
          </div>

          <div className="card-modern p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg">
                👥
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-blue-600">{(data?.totalAlunos ?? 0).toLocaleString('pt-BR')}</div>
                <div className="text-xs text-slate-500 mt-1">Alunos</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Alunos Matriculados</div>
            <div className="text-xs text-slate-500">Rede completa</div>
          </div>

          <div className="card-modern p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-xl shadow-lg">
                👨‍🏫
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-violet-600">{data?.totalProfessores ?? 0}</div>
                <div className="text-xs text-slate-500 mt-1">Professores</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Professores Ativos</div>
            <div className="text-xs text-slate-500">Corpo docente</div>
          </div>

          <div className="card-modern p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl shadow-lg">
                📊
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-emerald-600">{data?.mediaGeral?.toFixed(1) ?? 0}</div>
                <div className="text-xs text-slate-500 mt-1">Média</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Média Geral da Rede</div>
            <div className="text-xs text-slate-500">Performance acadêmica</div>
          </div>
        </div>

        {/* Indicadores de Qualidade */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></span>
            Indicadores de Qualidade
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="card-modern p-6">
              <div className="text-sm text-slate-600 mb-2">Taxa de Aprovação</div>
              <div className="text-3xl font-extrabold text-emerald-600">
                {Math.round((data?.taxaAprovacao || 0) * 100)}%
              </div>
              <div className="text-xs text-emerald-600 mt-1 font-medium">Meta: 95%</div>
              <div className="h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  style={{ width: `${Math.min((data?.taxaAprovacao || 0) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="card-modern p-6">
              <div className="text-sm text-slate-600 mb-2">Índice de Frequência</div>
              <div className="text-3xl font-extrabold text-blue-600">
                {Math.round((data?.indiceFrequencia || 0) * 100)}%
              </div>
              <div className="text-xs text-blue-600 mt-1 font-medium">Meta: 90%</div>
              <div className="h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  style={{ width: `${Math.min((data?.indiceFrequencia || 0) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="card-modern p-6">
              <div className="text-sm text-slate-600 mb-2">Evasão Escolar</div>
              <div className="text-3xl font-extrabold text-rose-600">
                {Math.round((data?.evasaoPercent || 0) * 100)}%
              </div>
              <div className="text-xs text-rose-600 mt-1 font-medium">Meta: < 5%</div>
              <div className="h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                  style={{ width: `${Math.min((data?.evasaoPercent || 0) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="card-modern p-6">
              <div className="text-sm text-slate-600 mb-2">IDEB</div>
              <div className="text-3xl font-extrabold text-indigo-600">
                {data?.idebScore ?? 0}
              </div>
              <div className="text-xs text-indigo-600 mt-1 font-medium">Índice Nacional</div>
              <div className="h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                  style={{ width: `${Math.min(((data?.idebScore || 0) / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></span>
            Módulos Disponíveis
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Link href="/education-secretary/schools">
              <div className="card-modern p-6 cursor-pointer group h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  🏫
                </div>
                <div className="text-xl font-bold text-slate-800 mb-2">Gestão da Rede</div>
                <div className="text-slate-600 text-sm mb-4">Supervisão de escolas</div>
                <div className="btn-modern bg-indigo-600 text-white w-full hover:bg-indigo-700 text-center">
                  Abrir
                </div>
              </div>
            </Link>

            <Link href="/education-secretary/reports">
              <div className="card-modern p-6 cursor-pointer group h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <div className="text-xl font-bold text-slate-800 mb-2">Relatórios</div>
                <div className="text-slate-600 text-sm mb-4">Municipais e MEC</div>
                <div className="btn-modern bg-blue-600 text-white w-full hover:bg-blue-700 text-center">
                  Abrir
                </div>
              </div>
            </Link>

            <Link href="/education-secretary/planning">
              <div className="card-modern p-6 cursor-pointer group h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <div className="text-xl font-bold text-slate-800 mb-2">Planejamento</div>
                <div className="text-slate-600 text-sm mb-4">Estratégico e metas</div>
                <div className="btn-modern bg-violet-600 text-white w-full hover:bg-violet-700 text-center">
                  Abrir
                </div>
              </div>
            </Link>

            <div className="card-modern p-6 cursor-pointer group h-full" onClick={() => setShowSchoolModal(true)}>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                ➕
              </div>
              <div className="text-xl font-bold text-slate-800 mb-2">Nova Escola</div>
              <div className="text-slate-600 text-sm mb-4">Cadastrar na rede</div>
              <div className="btn-modern bg-emerald-600 text-white w-full hover:bg-emerald-700 text-center">
                Cadastrar
              </div>
            </div>
          </div>
        </div>

        {/* Rede Escolar - Preview */}
        <div className="card-modern p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Rede Escolar - Visão Geral</h2>
            <Link href="/education-secretary/schools">
              <button className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700">
                Ver Todas
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(schoolsQ.data || []).slice(0, 6).map((school) => {
              const ocup = school.capacidade ? Math.round((school.ocupacao / school.capacidade) * 100) : 0;
              const statusConfig = {
                operacional: { label: "Operacional", color: "bg-emerald-100 text-emerald-700" },
                manutencao: { label: "Manutenção", color: "bg-amber-100 text-amber-700" },
                paralisada: { label: "Paralisada", color: "bg-rose-100 text-rose-700" }
              }[school.status] || { label: school.status, color: "bg-slate-100 text-slate-700" };

              return (
                <div key={school.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-slate-800">{school.name}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mb-3">{school.city} • {school.state}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Ocupação:</span>
                      <span className="font-semibold">{school.ocupacao}/{school.capacidade} ({ocup}%)</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          ocup >= 90 ? 'bg-rose-500' : ocup >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${ocup}%` }}
                      ></div>
                    </div>
                    {school.solicitacoesPendentes > 0 && (
                      <div className="text-xs text-amber-600 font-medium">
                        ⚠️ {school.solicitacoesPendentes} solicitações pendentes
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de Cadastro de Escola */}
        {showSchoolModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="card-modern p-6 max-w-2xl w-full my-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Cadastrar Nova Escola</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createSchool.mutate(form);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Escola *</label>
                    <input
                      className="input-modern w-full"
                      placeholder="Nome da Escola"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cidade *</label>
                    <input
                      className="input-modern w-full"
                      placeholder="Cidade"
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado *</label>
                    <input
                      className="input-modern w-full"
                      placeholder="Estado"
                      value={form.state}
                      onChange={e => setForm({ ...form, state: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Diretor</label>
                    <input
                      className="input-modern w-full"
                      placeholder="Nome do Diretor"
                      value={form.diretor}
                      onChange={e => setForm({ ...form, diretor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Capacidade *</label>
                    <input
                      type="number"
                      className="input-modern w-full"
                      placeholder="Capacidade"
                      value={form.capacidade}
                      onChange={e => setForm({ ...form, capacidade: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Professores</label>
                    <input
                      type="number"
                      className="input-modern w-full"
                      placeholder="Número de Professores"
                      value={form.professores}
                      onChange={e => setForm({ ...form, professores: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vigilantes</label>
                    <input
                      type="number"
                      className="input-modern w-full"
                      placeholder="Número de Vigilantes"
                      value={form.vigilantes}
                      onChange={e => setForm({ ...form, vigilantes: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Serviços Gerais</label>
                    <input
                      type="number"
                      className="input-modern w-full"
                      placeholder="Serviços Gerais"
                      value={form.servicosGerais}
                      onChange={e => setForm({ ...form, servicosGerais: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Agentes Administrativos</label>
                    <input
                      type="number"
                      className="input-modern w-full"
                      placeholder="Agentes Administrativos"
                      value={form.agentesAdm}
                      onChange={e => setForm({ ...form, agentesAdm: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1"
                  >
                    Cadastrar Escola
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSchoolModal(false);
                      setForm({ name: "", city: "", state: "", diretor: "", professores: 0, vigilantes: 0, servicosGerais: 0, agentesAdm: 0, capacidade: 0 });
                    }}
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
