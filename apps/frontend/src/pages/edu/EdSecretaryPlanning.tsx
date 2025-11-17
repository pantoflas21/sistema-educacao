import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type Goal = {
  id: string;
  schoolId?: string;
  schoolName?: string;
  metric: string;
  target: number;
  current: number;
  deadline: string;
  status: "on_track" | "at_risk" | "achieved" | "delayed";
  progress: number;
};

type Project = {
  id: string;
  name: string;
  type: "inclusao" | "tecnologia" | "formacao" | "merenda";
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: "planning" | "in_progress" | "completed" | "cancelled";
  schools: string[];
};

export default function EdSecretaryPlanning() {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const qc = useQueryClient();

  const goalsQ = useQuery<Goal[]>({ 
    queryKey: ["eduSec","goals"], 
    queryFn: async () => { 
      const r = await fetch("/api/education-secretary/goals"); 
      return r.json(); 
    } 
  });

  const projectsQ = useQuery<Project[]>({ 
    queryKey: ["eduSec","projects"], 
    queryFn: async () => { 
      const r = await fetch("/api/education-secretary/projects"); 
      return r.json(); 
    } 
  });

  const schoolsQ = useQuery<Array<{ id: string; name: string }>>({ 
    queryKey: ["eduSec","schools"], 
    queryFn: async () => { 
      const r = await fetch("/api/education-secretary/schools"); 
      return r.json(); 
    } 
  });

  const createGoal = useMutation({
    mutationFn: async (payload: Partial<Goal>) => {
      const r = await fetch("/api/education-secretary/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eduSec","goals"] });
      setShowGoalModal(false);
    }
  });

  const createProject = useMutation({
    mutationFn: async (payload: Partial<Project>) => {
      const r = await fetch("/api/education-secretary/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eduSec","projects"] });
      setShowProjectModal(false);
    }
  });

  const getStatusConfig = (status: Goal["status"] | Project["status"]) => {
    switch (status) {
      case "on_track":
      case "in_progress":
        return { label: "Em Andamento", color: "bg-blue-100 text-blue-700", icon: "🔄" };
      case "at_risk":
        return { label: "Em Risco", color: "bg-amber-100 text-amber-700", icon: "⚠️" };
      case "achieved":
      case "completed":
        return { label: "Concluído", color: "bg-emerald-100 text-emerald-700", icon: "✅" };
      case "delayed":
      case "cancelled":
        return { label: "Cancelado", color: "bg-rose-100 text-rose-700", icon: "❌" };
      case "planning":
        return { label: "Planejamento", color: "bg-slate-100 text-slate-700", icon: "📋" };
      default:
        return { label: String(status), color: "bg-slate-100 text-slate-700", icon: "📌" };
    }
  };

  const getProjectTypeLabel = (type: Project["type"]) => {
    switch (type) {
      case "inclusao": return "Programa de Inclusão";
      case "tecnologia": return "Tecnologia Educacional";
      case "formacao": return "Formação Continuada";
      case "merenda": return "Merenda Escolar";
    }
  };

  const filteredProjects = projectsQ.data?.filter(p => 
    filterType === "all" || p.type === filterType
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-indigo-600 via-blue-600 to-sky-600 p-6 md:p-8 mb-6 md:mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 md:gap-4 mb-3">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-1">Planejamento Estratégico</div>
                  <div className="text-white/90 text-xs md:text-sm lg:text-base">Metas educacionais e projetos especiais</div>
                </div>
              </div>
            </div>
            <Link href="/education-secretary">
              <div className="px-4 md:px-6 py-2 md:py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer text-sm md:text-base">
                ← Voltar
              </div>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all ${
              filterType === "all"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            🎯 Metas Educacionais
          </button>
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all ${
              filterType !== "all"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            🚀 Projetos Especiais
          </button>
        </div>

        {/* Metas Educacionais */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></span>
              Metas Educacionais
            </h2>
            <button
              onClick={() => setShowGoalModal(true)}
              className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700"
            >
              + Nova Meta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(goalsQ.data || []).map((goal) => {
              const statusConfig = getStatusConfig(goal.status);
              const progressPercent = (goal.current / goal.target) * 100;
              
              return (
                <div key={goal.id} className="card-modern p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-lg font-bold text-slate-800 mb-1">{goal.metric}</div>
                      {goal.schoolName && (
                        <div className="text-sm text-slate-600 mb-2">{goal.schoolName}</div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progresso:</span>
                      <span className="font-semibold text-slate-800">
                        {goal.current.toFixed(1)} / {goal.target.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          progressPercent >= 90 ? 'bg-emerald-500' :
                          progressPercent >= 70 ? 'bg-blue-500' :
                          progressPercent >= 50 ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projetos Especiais */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></span>
              Projetos Especiais
            </h2>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-modern"
              >
                <option value="all">Todos</option>
                <option value="inclusao">Inclusão</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="formacao">Formação</option>
                <option value="merenda">Merenda</option>
              </select>
              <button
                onClick={() => setShowProjectModal(true)}
                className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700"
              >
                + Novo Projeto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {filteredProjects.map((project) => {
              const statusConfig = getStatusConfig(project.status);
              
              return (
                <div key={project.id} className="card-modern p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-xl font-bold text-slate-800 mb-2">{project.name}</div>
                      <div className="text-sm text-slate-600 mb-2">{getProjectTypeLabel(project.type)}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-700 mb-4">{project.description}</div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Orçamento:</span>
                      <span className="font-semibold text-indigo-600">
                        R$ {project.budget.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Período:</span>
                      <span className="text-slate-800">
                        {new Date(project.startDate).toLocaleDateString('pt-BR')} - {new Date(project.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {project.schools && project.schools.length > 0 && (
                      <div className="text-xs text-slate-500">
                        {project.schools.length} escola(s) envolvida(s)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de Nova Meta */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="card-modern p-4 md:p-6 max-w-md w-full">
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">Nova Meta Educacional</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  createGoal.mutate({
                    schoolId: String(fd.get("schoolId") || ""),
                    metric: String(fd.get("metric") || ""),
                    target: Number(fd.get("target") || 0),
                    current: Number(fd.get("current") || 0),
                    deadline: String(fd.get("deadline") || ""),
                    status: "on_track"
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Escola (opcional)</label>
                  <select name="schoolId" className="input-modern w-full">
                    <option value="">Todas as escolas</option>
                    {(schoolsQ.data || []).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Métrica *</label>
                  <input name="metric" className="input-modern w-full" placeholder="Ex: Taxa de Aprovação" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta *</label>
                    <input name="target" type="number" step="0.1" className="input-modern w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Atual *</label>
                    <input name="current" type="number" step="0.1" className="input-modern w-full" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prazo *</label>
                  <input name="deadline" type="date" className="input-modern w-full" required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1">
                    Criar Meta
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Novo Projeto */}
        {showProjectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="card-modern p-4 md:p-6 max-w-2xl w-full">
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">Novo Projeto Especial</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  createProject.mutate({
                    name: String(fd.get("name") || ""),
                    type: String(fd.get("type") || "inclusao") as Project["type"],
                    description: String(fd.get("description") || ""),
                    budget: Number(fd.get("budget") || 0),
                    startDate: String(fd.get("startDate") || ""),
                    endDate: String(fd.get("endDate") || ""),
                    status: "planning",
                    schools: []
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Projeto *</label>
                  <input name="name" className="input-modern w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select name="type" className="input-modern w-full" required>
                    <option value="inclusao">Programa de Inclusão</option>
                    <option value="tecnologia">Tecnologia Educacional</option>
                    <option value="formacao">Formação Continuada</option>
                    <option value="merenda">Merenda Escolar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
                  <textarea name="description" className="input-modern w-full h-24" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Orçamento (R$) *</label>
                  <input name="budget" type="number" step="0.01" className="input-modern w-full" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início *</label>
                    <input name="startDate" type="date" className="input-modern w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Término *</label>
                    <input name="endDate" type="date" className="input-modern w-full" required />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1">
                    Criar Projeto
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
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
