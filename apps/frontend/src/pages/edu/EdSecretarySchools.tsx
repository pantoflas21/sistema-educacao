import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type School = {
  id: string;
  name: string;
  city: string;
  state: string;
  status: "operacional" | "manutencao" | "paralisada";
  capacidade: number;
  ocupacao: number;
  solicitacoesPendentes: number;
  infrastructureNeeds?: string[];
  budget?: number;
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

type ResourceRequest = {
  id: string;
  schoolId: string;
  schoolName: string;
  type: "teacher" | "student" | "material" | "budget";
  description: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
};

export default function EdSecretarySchools() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const qc = useQueryClient();

  const schoolsQ = useQuery<School[]>({ 
    queryKey: ["eduSec","schools"], 
    queryFn: async () => { 
      const r = await fetch("/api/education-secretary/schools"); 
      return r.json(); 
    } 
  });

  const requestsQ = useQuery<ResourceRequest[]>({ 
    queryKey: ["eduSec","resource-requests"], 
    queryFn: async () => { 
      const r = await fetch("/api/education-secretary/resource-requests"); 
      return r.json(); 
    } 
  });

  const transferTeacher = useMutation({
    mutationFn: async ({ fromSchoolId, toSchoolId, teacherId }: { fromSchoolId: string; toSchoolId: string; teacherId: string }) => {
      const r = await fetch("/api/education-secretary/transfer-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromSchoolId, toSchoolId, teacherId })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eduSec","schools"] });
      setShowResourceModal(false);
    }
  });

  const reallocateStudent = useMutation({
    mutationFn: async ({ studentId, fromSchoolId, toSchoolId }: { studentId: string; fromSchoolId: string; toSchoolId: string }) => {
      const r = await fetch("/api/education-secretary/reallocate-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, fromSchoolId, toSchoolId })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eduSec","schools"] });
      setShowResourceModal(false);
    }
  });

  const approveRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const r = await fetch(`/api/education-secretary/resource-requests/${requestId}/approve`, {
        method: "POST"
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eduSec","resource-requests"] });
    }
  });

  const getStatusConfig = (status: School["status"]) => {
    switch (status) {
      case "operacional":
        return { label: "Operacional", color: "bg-emerald-100 text-emerald-700", icon: "✅" };
      case "manutencao":
        return { label: "Manutenção", color: "bg-amber-100 text-amber-700", icon: "🔧" };
      case "paralisada":
        return { label: "Paralisada", color: "bg-rose-100 text-rose-700", icon: "⛔" };
    }
  };

  const filtered = schoolsQ.data?.filter(s => 
    filterStatus === "all" || s.status === filterStatus
  ) || [];

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
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Gestão da Rede Escolar</div>
                  <div className="text-white/90 text-sm md:text-base">Supervisão e redistribuição de recursos</div>
                </div>
              </div>
            </div>
            <Link href="/education-secretary">
              <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer">
                ← Voltar
              </div>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-700">Filtrar por status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-modern"
          >
            <option value="all">Todas</option>
            <option value="operacional">Operacional</option>
            <option value="manutencao">Manutenção</option>
            <option value="paralisada">Paralisada</option>
          </select>
        </div>

        {/* Grid de Escolas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filtered.map((school) => {
            const ocupPercent = school.capacidade ? Math.round((school.ocupacao / school.capacidade) * 100) : 0;
            const statusConfig = getStatusConfig(school.status);
            
            return (
              <div key={school.id} className="card-modern p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-lg font-bold text-slate-800 mb-2">{school.name}</div>
                    <div className="text-sm text-slate-600 mb-3">{school.city} • {school.state}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">Capacidade vs Ocupação</span>
                      <span className="font-semibold">{school.ocupacao}/{school.capacidade} ({ocupPercent}%)</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          ocupPercent >= 90 ? 'bg-rose-500' : ocupPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${ocupPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {school.staff && (
                    <div className="text-sm text-slate-600">
                      <div>👨‍🏫 Professores: {school.staff.professores}</div>
                      {school.staff.diretor && <div>👤 Diretor: {school.staff.diretor}</div>}
                    </div>
                  )}
                  
                  {school.budget && (
                    <div className="text-sm">
                      <span className="text-slate-600">Orçamento: </span>
                      <span className="font-semibold text-indigo-600">R$ {school.budget.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                  
                  {school.infrastructureNeeds && school.infrastructureNeeds.length > 0 && (
                    <div className="text-xs text-amber-600">
                      ⚠️ {school.infrastructureNeeds.length} necessidade(s) de infraestrutura
                    </div>
                  )}
                  
                  {school.solicitacoesPendentes > 0 && (
                    <div className="text-xs text-rose-600 font-medium">
                      📋 {school.solicitacoesPendentes} solicitação(ões) pendente(s)
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => { setSelectedSchool(school); setShowResourceModal(true); }}
                  className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 w-full text-sm"
                >
                  Gerenciar Recursos
                </button>
              </div>
            );
          })}
        </div>

        {/* Solicitações Pendentes */}
        <div className="card-modern p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Solicitações Pendentes</h3>
          <div className="space-y-3">
            {(requestsQ.data || []).filter(r => r.status === "pending").map((request) => (
              <div key={request.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 mb-1">{request.schoolName}</div>
                    <div className="text-sm text-slate-600 mb-2">{request.description}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Tipo: {request.type === "teacher" ? "Professor" : request.type === "student" ? "Aluno" : request.type === "material" ? "Material" : "Orçamento"}</span>
                      <span>•</span>
                      <span>{new Date(request.requestedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => approveRequest.mutate(request.id)}
                    className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
                  >
                    Aprovar
                  </button>
                </div>
              </div>
            ))}
            {(!requestsQ.data || requestsQ.data.filter(r => r.status === "pending").length === 0) && (
              <div className="text-center py-8 text-slate-500">
                Nenhuma solicitação pendente
              </div>
            )}
          </div>
        </div>

        {/* Modal de Gerenciamento de Recursos */}
        {showResourceModal && selectedSchool && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Gerenciar Recursos - {selectedSchool.name}</h3>
              
              <div className="space-y-6">
                {/* Transferência de Professores */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-3">Transferir Professor</h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.target as any);
                      transferTeacher.mutate({
                        fromSchoolId: selectedSchool.id,
                        toSchoolId: String(fd.get("toSchoolId") || ""),
                        teacherId: String(fd.get("teacherId") || "")
                      });
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Professor</label>
                      <input name="teacherId" className="input-modern w-full" placeholder="ID do professor" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Escola de Destino</label>
                      <select name="toSchoolId" className="input-modern w-full" required>
                        <option value="">Selecione...</option>
                        {(schoolsQ.data || []).filter(s => s.id !== selectedSchool.id).map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn-modern bg-blue-600 text-white hover:bg-blue-700 w-full">
                      Transferir
                    </button>
                  </form>
                </div>

                {/* Realocação de Alunos */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-3">Realocar Aluno</h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.target as any);
                      reallocateStudent.mutate({
                        studentId: String(fd.get("studentId") || ""),
                        fromSchoolId: selectedSchool.id,
                        toSchoolId: String(fd.get("toSchoolId") || "")
                      });
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Aluno</label>
                      <input name="studentId" className="input-modern w-full" placeholder="ID do aluno" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Escola de Destino</label>
                      <select name="toSchoolId" className="input-modern w-full" required>
                        <option value="">Selecione...</option>
                        {(schoolsQ.data || []).filter(s => s.id !== selectedSchool.id).map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 w-full">
                      Realocar
                    </button>
                  </form>
                </div>

                {/* Distribuição de Orçamento */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-3">Definir Orçamento</h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.target as any);
                      // Implementar mutation para atualizar orçamento
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Orçamento Anual (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={selectedSchool.budget}
                        className="input-modern w-full"
                        required
                      />
                    </div>
                    <button type="submit" className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700 w-full">
                      Atualizar Orçamento
                    </button>
                  </form>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200">
                <button
                  onClick={() => { setShowResourceModal(false); setSelectedSchool(null); }}
                  className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
