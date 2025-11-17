import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type LessonPlan = {
  id: string;
  teacherId: string;
  teacherName: string;
  schoolId: string;
  schoolName: string;
  category: "educacao-infantil" | "fundamental-1" | "fundamental-2" | "ensino-medio";
  subject: string;
  classId: string;
  className: string;
  title: string;
  content: string;
  objectives: string;
  methodology: string;
  resources: string;
  evaluation: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "revision";
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
};

type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byCategory: {
    "educacao-infantil": number;
    "fundamental-1": number;
    "fundamental-2": number;
    "ensino-medio": number;
  };
};

const categoryLabels = {
  "educacao-infantil": "Educação Infantil",
  "fundamental-1": "Fundamental 1",
  "fundamental-2": "Fundamental 2",
  "ensino-medio": "Ensino Médio"
};

export default function SecretaryLessonPlans() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected" | "revision">("approved");
  const qc = useQueryClient();

  const { data: stats } = useQuery<Stats>({
    queryKey: ["sec", "lesson-plans", "stats"],
    queryFn: async () => {
      const r = await fetch("/api/secretary/lesson-plans/stats");
      return r.json();
    }
  });

  const { data: plans } = useQuery<LessonPlan[]>({
    queryKey: ["sec", "lesson-plans", selectedCategory, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      const r = await fetch(`/api/secretary/lesson-plans?${params}`);
      return r.json();
    }
  });

  const reviewPlan = useMutation({
    mutationFn: async ({ planId, status, feedback }: { planId: string; status: string; feedback: string }) => {
      const r = await fetch(`/api/secretary/lesson-plans/${planId}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback, reviewedBy: "Secretário Escolar" })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sec", "lesson-plans"] });
      qc.invalidateQueries({ queryKey: ["sec", "lesson-plans", "stats"] });
      setSelectedPlan(null);
      setReviewFeedback("");
    }
  });

  const filteredPlans = plans || [];

  const getStatusColor = (status: LessonPlan["status"]) => {
    switch (status) {
      case "approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected": return "bg-rose-100 text-rose-700 border-rose-200";
      case "revision": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getStatusLabel = (status: LessonPlan["status"]) => {
    switch (status) {
      case "approved": return "Aprovado";
      case "rejected": return "Rejeitado";
      case "revision": return "Revisão";
      default: return "Pendente";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-indigo-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-indigo-600 via-blue-600 to-violet-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-4xl">📚</span>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Planos de Aula</div>
                  <div className="text-white/90 text-sm md:text-base">Receber e avaliar planos dos professores</div>
                </div>
              </div>
            </div>
            <Link href="/secretary">
              <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer">
                ← Voltar
              </div>
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-modern p-5">
            <div className="text-sm text-slate-600 mb-1">Total</div>
            <div className="text-3xl font-extrabold text-indigo-600">{stats?.total || 0}</div>
          </div>
          <div className="card-modern p-5">
            <div className="text-sm text-slate-600 mb-1">Pendentes</div>
            <div className="text-3xl font-extrabold text-blue-600">{stats?.pending || 0}</div>
          </div>
          <div className="card-modern p-5">
            <div className="text-sm text-slate-600 mb-1">Aprovados</div>
            <div className="text-3xl font-extrabold text-emerald-600">{stats?.approved || 0}</div>
          </div>
          <div className="card-modern p-5">
            <div className="text-sm text-slate-600 mb-1">Rejeitados</div>
            <div className="text-3xl font-extrabold text-rose-600">{stats?.rejected || 0}</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card-modern p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Categoria</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todas</option>
                <option value="educacao-infantil">Educação Infantil</option>
                <option value="fundamental-1">Fundamental 1</option>
                <option value="fundamental-2">Fundamental 2</option>
                <option value="ensino-medio">Ensino Médio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
                <option value="revision">Revisão</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Planos */}
        <div className="space-y-4">
          {filteredPlans.length === 0 ? (
            <div className="card-modern p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <div className="text-xl font-semibold text-slate-800 mb-2">Nenhum plano encontrado</div>
              <div className="text-slate-600">Os planos de aula enviados pelos professores aparecerão aqui.</div>
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <div key={plan.id} className="card-modern p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-800">{plan.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(plan.status)}`}>
                        {getStatusLabel(plan.status)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div><strong>Professor:</strong> {plan.teacherName}</div>
                      <div><strong>Categoria:</strong> {categoryLabels[plan.category]}</div>
                      <div><strong>Disciplina:</strong> {plan.subject || "N/A"}</div>
                      <div><strong>Turma:</strong> {plan.className || "N/A"}</div>
                      <div><strong>Enviado em:</strong> {new Date(plan.submittedAt).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Avaliação */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800">Avaliar Plano de Aula</h2>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">{selectedPlan.title}</h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div><strong>Professor:</strong> {selectedPlan.teacherName}</div>
                    <div><strong>Categoria:</strong> {categoryLabels[selectedPlan.category]}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Conteúdo</h4>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPlan.content || "N/A"}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Objetivos</h4>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPlan.objectives || "N/A"}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Metodologia</h4>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPlan.methodology || "N/A"}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Recursos</h4>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPlan.resources || "N/A"}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Avaliação</h4>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPlan.evaluation || "N/A"}</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Avaliação</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                  >
                    <option value="approved">Aprovar</option>
                    <option value="revision">Solicitar Revisão</option>
                    <option value="rejected">Rejeitar</option>
                  </select>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Feedback</label>
                  <textarea
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Digite seu feedback sobre o plano de aula..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      reviewPlan.mutate({
                        planId: selectedPlan.id,
                        status: reviewStatus,
                        feedback: reviewFeedback
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Salvar Avaliação
                  </button>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

