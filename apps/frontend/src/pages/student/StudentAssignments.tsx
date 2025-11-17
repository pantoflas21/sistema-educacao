import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type Me = { id: string; classId: string };
type Assignment = { 
  id: string; 
  classId: string; 
  subjectId: string; 
  subjectName?: string;
  title: string; 
  description: string; 
  dueDate: string; 
  status: "not_started" | "in_progress" | "submitted" | "graded";
  submittedAt?: string;
  grade?: number;
  feedback?: string;
  attachments?: { url: string; name: string }[];
};

export default function StudentAssignments() {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const qc = useQueryClient();

  const meQ = useQuery<Me>({ 
    queryKey: ["student","me"], 
    queryFn: async () => { 
      const r = await fetch("/api/student/me"); 
      return r.json(); 
    } 
  });
  
  const listQ = useQuery<Assignment[]>({ 
    queryKey: ["student","assignments", meQ.data?.classId], 
    enabled: !!meQ.data?.classId, 
    queryFn: async () => { 
      const r = await fetch(`/api/student/assignments?classId=${meQ.data!.classId}`); 
      return r.json(); 
    } 
  });

  const submitAssignment = useMutation({
    mutationFn: async (payload: { assignmentId: string; files: File[] }) => {
      const formData = new FormData();
      formData.append("assignmentId", payload.assignmentId);
      payload.files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      const r = await fetch("/api/student/assignments/submit", {
        method: "POST",
        body: formData
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student","assignments", meQ.data?.classId] });
      setShowSubmitModal(false);
      setSelectedFiles([]);
      setSelectedAssignment(null);
    }
  });

  const getStatusConfig = (status: Assignment["status"]) => {
    switch (status) {
      case "not_started":
        return { label: "Não Iniciado", color: "bg-slate-100 text-slate-700", icon: "⏸️" };
      case "in_progress":
        return { label: "Em Andamento", color: "bg-blue-100 text-blue-700", icon: "🔄" };
      case "submitted":
        return { label: "Entregue", color: "bg-emerald-100 text-emerald-700", icon: "✅" };
      case "graded":
        return { label: "Avaliado", color: "bg-violet-100 text-violet-700", icon: "📊" };
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !["submitted", "graded"].includes(
      listQ.data?.find(a => a.dueDate === dueDate)?.status || ""
    );
  };

  const pendingAssignments = (listQ.data || []).filter(a => a.status !== "graded");
  const completedAssignments = (listQ.data || []).filter(a => a.status === "graded");

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50/30 to-blue-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-sky-600 via-indigo-600 to-blue-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Atividades e Trabalhos</div>
                  <div className="text-white/90 text-sm md:text-base">Gerencie suas tarefas e entregas</div>
                </div>
              </div>
            </div>
            <Link href="/student">
              <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer">
                ← Voltar
              </div>
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="card-modern p-6">
            <div className="text-sm text-slate-600 mb-2">Pendentes</div>
            <div className="text-3xl font-extrabold text-amber-600">{pendingAssignments.length}</div>
          </div>
          <div className="card-modern p-6">
            <div className="text-sm text-slate-600 mb-2">Entregues</div>
            <div className="text-3xl font-extrabold text-emerald-600">
              {(listQ.data || []).filter(a => a.status === "submitted" || a.status === "graded").length}
            </div>
          </div>
          <div className="card-modern p-6">
            <div className="text-sm text-slate-600 mb-2">Avaliados</div>
            <div className="text-3xl font-extrabold text-violet-600">{completedAssignments.length}</div>
          </div>
        </div>

        {/* Trabalhos Pendentes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-sky-600 to-indigo-600 rounded-full"></span>
            Trabalhos Pendentes
          </h2>
          <div className="grid gap-4">
            {pendingAssignments.map((assignment) => {
              const statusConfig = getStatusConfig(assignment.status);
              const overdue = isOverdue(assignment.dueDate);
              
              return (
                <div key={assignment.id} className={`card-modern p-6 ${overdue ? 'border-2 border-rose-300' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-800">{assignment.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                          {statusConfig.icon} {statusConfig.label}
                        </span>
                        {overdue && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                            ⚠️ Atrasado
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        {assignment.subjectName || assignment.subjectId}
                      </div>
                      <div className="text-slate-700 mb-3">{assignment.description}</div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-600">
                          📅 Entrega: <span className={`font-semibold ${overdue ? 'text-rose-600' : ''}`}>
                            {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        </span>
                        {assignment.submittedAt && (
                          <span className="text-slate-600">
                            ✅ Entregue em: {new Date(assignment.submittedAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    {assignment.status !== "submitted" && assignment.status !== "graded" && (
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowSubmitModal(true);
                        }}
                        className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        {assignment.status === "not_started" ? "Iniciar Trabalho" : "Enviar Trabalho"}
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trabalhos Avaliados */}
        {completedAssignments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-sky-600 to-indigo-600 rounded-full"></span>
              Trabalhos Avaliados
            </h2>
            <div className="grid gap-4">
              {completedAssignments.map((assignment) => {
                const statusConfig = getStatusConfig(assignment.status);
                
                return (
                  <div key={assignment.id} className="card-modern p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-800">{assignment.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                          {assignment.grade !== undefined && (
                            <span className={`px-3 py-1 rounded-lg font-bold ${
                              assignment.grade >= 8 ? 'bg-emerald-100 text-emerald-700' :
                              assignment.grade >= 7 ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              Nota: {assignment.grade.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 mb-2">
                          {assignment.subjectName || assignment.subjectId}
                        </div>
                        {assignment.feedback && (
                          <div className="p-4 bg-slate-50 rounded-lg mt-3">
                            <div className="text-sm font-semibold text-slate-700 mb-1">Feedback do Professor:</div>
                            <div className="text-slate-600">{assignment.feedback}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    {assignment.attachments && assignment.attachments.length > 0 && (
                      <div className="pt-4 border-t border-slate-200">
                        <div className="text-sm font-semibold text-slate-700 mb-2">Arquivos Entregues:</div>
                        <div className="flex flex-wrap gap-2">
                          {assignment.attachments.map((att, i) => (
                            <a
                              key={i}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-slate-100 rounded-lg text-sm text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              📎 {att.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal de Envio */}
        {showSubmitModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Enviar Trabalho: {selectedAssignment.title}</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitAssignment.mutate({
                    assignmentId: selectedAssignment.id,
                    files: selectedFiles
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload de Arquivos (PDF, DOC, imagens) *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    className="input-modern w-full"
                    required
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="text-xs text-slate-600 flex items-center justify-between p-2 bg-slate-50 rounded">
                          <span>{file.name}</span>
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1">
                    📤 Enviar Trabalho
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitModal(false);
                      setSelectedFiles([]);
                      setSelectedAssignment(null);
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
