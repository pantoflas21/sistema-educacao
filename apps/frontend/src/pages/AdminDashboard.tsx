import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type Overview = {
  systemHealth: number;
  activeUsers: number;
  connectedSchools: number;
  responseTimeMsP95: number;
  resourcesUsage: { cpu: number; memory: number };
  engagement: { dailyActive: number; weeklyActive: number };
  errorsLastHour: number;
};

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  active: boolean;
  schoolId?: string;
  lastLogin?: string;
};

type School = {
  id: string;
  name: string;
  logoUrl?: string;
  maxStudents: number;
  currentStudents: number;
  evaluationType: "notas" | "conceitos";
  active: boolean;
};

function StatCard({ title, value, color, subtitle, icon }: { title: string; value: string | number; color: string; subtitle?: string; icon?: string }) {
  return (
    <div className="card-modern p-5 fade-in group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-600 mb-1">{title}</div>
          <div className={`text-3xl font-extrabold mb-2`} style={{ color }}>{value}</div>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl opacity-60 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${color}15` }}>
            {icon}
          </div>
        )}
      </div>
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: typeof value === 'number' ? `${Math.min(value, 100)}%` : '0%', backgroundColor: color }}></div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<"overview" | "users" | "analytics" | "finance" | "schools" | "security" | "reports">("overview");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const qc = useQueryClient();

  const { data } = useQuery<Overview>({ 
    queryKey: ["overview"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/statistics/overview", { signal }); 
      return r.json(); 
    } 
  });

  const usersQ = useQuery<User[]>({ 
    queryKey: ["admin", "users"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/admin/users", { signal }); 
      return r.json(); 
    },
    enabled: activeSection === "users"
  });

  const schoolsQ = useQuery<School[]>({ 
    queryKey: ["admin", "schools"], 
    queryFn: async ({ signal }) => { 
      const r = await fetch("/api/admin/schools", { signal }); 
      return r.json(); 
    },
    enabled: activeSection === "schools"
  });

  const createUser = useMutation({
    mutationFn: async (payload: Partial<User> & { password?: string }) => {
      const r = await fetch("/api/admin/users", {
        method: editingUser ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser ? { ...payload, id: editingUser.id } : payload)
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setShowUserModal(false);
      setEditingUser(null);
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const r = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    }
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      const r = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    }
  });

  const resetPassword = useMutation({
    mutationFn: async (userId: string) => {
      const r = await fetch(`/api/admin/users/${userId}/reset-password`, { method: "POST" });
      return r.json();
    }
  });

  const healthColor = (data?.systemHealth ?? 0) >= 90 ? "text-emerald-500" : (data?.systemHealth ?? 0) >= 70 ? "text-amber-500" : "text-rose-500";

  const sections = [
    { id: "overview", label: "Visão Geral", icon: "📊" },
    { id: "users", label: "Usuários", icon: "👥" },
    { id: "analytics", label: "Analytics Pro", icon: "📈" },
    { id: "finance", label: "Centro Financeiro", icon: "💰" },
    { id: "schools", label: "Escolas", icon: "🏫" },
    { id: "security", label: "Sistema & Segurança", icon: "🔒" },
    { id: "reports", label: "Relatórios", icon: "📄" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header com gradiente animado */}
        <div className="card-gradient from-indigo-600 via-blue-600 to-violet-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white">Painel Administrativo</div>
                  <div className="mt-1 text-white/90 text-sm md:text-base">Gestão completa do sistema Aletheia</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-5xl md:text-6xl font-extrabold ${healthColor} drop-shadow-lg`}>
                {(data?.systemHealth ?? 0)}%
              </div>
              <div className="text-white/90 text-sm font-medium mt-1">Saúde do Sistema</div>
              <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                (data?.systemHealth ?? 0) >= 90 ? 'bg-emerald-500/20 text-emerald-100' : 
                (data?.systemHealth ?? 0) >= 70 ? 'bg-amber-500/20 text-amber-100' : 
                'bg-rose-500/20 text-rose-100'
              }`}>
                <span className={`w-2 h-2 rounded-full pulse-soft ${
                  (data?.systemHealth ?? 0) >= 90 ? 'bg-emerald-400' : 
                  (data?.systemHealth ?? 0) >= 70 ? 'bg-amber-400' : 
                  'bg-rose-400'
                }`}></span>
                {(data?.systemHealth ?? 0) >= 90 ? 'Ótimo' : (data?.systemHealth ?? 0) >= 70 ? 'Bom' : 'Atenção'}
              </div>
            </div>
          </div>
        </div>

        {/* Navegação por seções */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeSection === section.id
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das seções */}
        <div className="fade-in">
          {/* VISÃO GERAL */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Cards de métricas principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <StatCard 
                  title="Usuários Ativos" 
                  value={data?.activeUsers ?? 0} 
                  color="#10B981" 
                  subtitle="Estável"
                  icon="👥"
                />
                <StatCard 
                  title="Escolas Conectadas" 
                  value={data?.connectedSchools ?? 0} 
                  color="#6366F1" 
                  subtitle="Ambiente multi-escola"
                  icon="🏫"
                />
                <StatCard 
                  title="Erros (última hora)" 
                  value={data?.errorsLastHour ?? 0} 
                  color={data?.errorsLastHour && data.errorsLastHour > 2 ? "#EF4444" : "#10B981"} 
                  subtitle="Monitorado"
                  icon="⚠️"
                />
              </div>

              {/* Cards de desempenho */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <StatCard 
                  title="p95 Resposta" 
                  value={`${data?.responseTimeMsP95 ?? 0} ms`} 
                  color="#3B82F6" 
                  subtitle="Desempenho"
                  icon="⚡"
                />
                <StatCard 
                  title="Uso de CPU" 
                  value={`${data?.resourcesUsage?.cpu ?? 0}%`} 
                  color={data?.resourcesUsage?.cpu && data.resourcesUsage.cpu > 80 ? "#F59E0B" : "#3B82F6"} 
                  subtitle="Carga do sistema"
                  icon="💻"
                />
                <StatCard 
                  title="Usuários Semana" 
                  value={data?.engagement?.weeklyActive ?? 0} 
                  color="#8B5CF6" 
                  subtitle="Engajamento"
                  icon="📊"
                />
              </div>

              {/* Ações rápidas */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                  Ações Rápidas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="card-modern p-6 group cursor-pointer" onClick={() => setActiveSection("users")}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                        👤
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-slate-800 mb-1">Gerenciar Usuários</div>
                        <div className="text-slate-600 text-sm">Crie contas e defina papéis de acesso</div>
                      </div>
                    </div>
                    <button className="btn-modern bg-indigo-600 text-white w-full hover:bg-indigo-700">
                      Abrir
                    </button>
                  </div>
                  
                  <div className="card-modern p-6 group cursor-pointer" onClick={() => setActiveSection("analytics")}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                        📈
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-slate-800 mb-1">Analytics Pro</div>
                        <div className="text-slate-600 text-sm">Métricas avançadas e gráficos</div>
                      </div>
                    </div>
                    <button className="btn-modern bg-blue-600 text-white w-full hover:bg-blue-700">
                      Abrir
                    </button>
                  </div>
                  
                  <div className="card-modern p-6 group cursor-pointer" onClick={() => setActiveSection("finance")}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                        💰
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-slate-800 mb-1">Centro Financeiro</div>
                        <div className="text-slate-600 text-sm">Visão consolidada financeira</div>
                      </div>
                    </div>
                    <button className="btn-modern bg-emerald-600 text-white w-full hover:bg-emerald-700">
                      Abrir
                    </button>
                  </div>

                  <div className="card-modern p-6 group cursor-pointer" onClick={() => setActiveSection("schools")}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                        🏫
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-slate-800 mb-1">Gestão de Escolas</div>
                        <div className="text-slate-600 text-sm">Configure e gerencie escolas</div>
                      </div>
                    </div>
                    <button className="btn-modern bg-violet-600 text-white w-full hover:bg-violet-700">
                      Abrir
                    </button>
                  </div>

                  <div className="card-modern p-6 group cursor-pointer" onClick={() => setActiveSection("security")}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                        🔒
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-slate-800 mb-1">Sistema & Segurança</div>
                        <div className="text-slate-600 text-sm">Logs, backup e monitoramento</div>
                      </div>
                    </div>
                    <button className="btn-modern bg-rose-600 text-white w-full hover:bg-rose-700">
                      Abrir
                    </button>
                  </div>

                  <div className="card-modern p-6 group cursor-pointer" onClick={() => setActiveSection("reports")}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                        📄
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-slate-800 mb-1">Relatórios Avançados</div>
                        <div className="text-slate-600 text-sm">Exportação e análises</div>
                      </div>
                    </div>
                    <button className="btn-modern bg-amber-600 text-white w-full hover:bg-amber-700">
                      Abrir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GESTÃO DE USUÁRIOS */}
          {activeSection === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                  Gestão de Usuários
                </h2>
                <button
                  onClick={() => { setEditingUser(null); setShowUserModal(true); }}
                  className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  + Novo Usuário
                </button>
              </div>

              <div className="card-modern overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Nome</th>
                        <th className="px-4 py-3 text-left font-semibold">Email</th>
                        <th className="px-4 py-3 text-left font-semibold">Papel</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Último Acesso</th>
                        <th className="px-4 py-3 text-center font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(usersQ.data || []).map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => { setEditingUser(user); setShowUserModal(true); }}
                                className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => toggleUserStatus.mutate({ userId: user.id, active: !user.active })}
                                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                  user.active 
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                }`}
                              >
                                {user.active ? 'Desativar' : 'Ativar'}
                              </button>
                              <button
                                onClick={() => resetPassword.mutate(user.id)}
                                className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium"
                              >
                                Resetar Senha
                              </button>
                              <button
                                onClick={() => deleteUser.mutate(user.id)}
                                className="px-3 py-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 text-sm font-medium"
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal de Criar/Editar Usuário */}
              {showUserModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="card-modern p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">
                      {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                    </h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.target as any);
                        createUser.mutate({
                          email: String(fd.get("email") || ""),
                          password: String(fd.get("password") || ""),
                          firstName: String(fd.get("firstName") || ""),
                          lastName: String(fd.get("lastName") || ""),
                          role: String(fd.get("role") || ""),
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                        <input
                          name="email"
                          type="email"
                          defaultValue={editingUser?.email}
                          className="input-modern w-full"
                          required
                        />
                      </div>
                      {!editingUser && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Senha *</label>
                          <input
                            name="password"
                            type="password"
                            className="input-modern w-full"
                            required={!editingUser}
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                          <input
                            name="firstName"
                            defaultValue={editingUser?.firstName}
                            className="input-modern w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Sobrenome</label>
                          <input
                            name="lastName"
                            defaultValue={editingUser?.lastName}
                            className="input-modern w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Papel *</label>
                        <select name="role" defaultValue={editingUser?.role} className="input-modern w-full" required>
                          <option value="">Selecione...</option>
                          <option value="Admin">Administrador</option>
                          <option value="Teacher">Professor</option>
                          <option value="Student">Aluno</option>
                          <option value="Secretary">Secretário</option>
                          <option value="Treasury">Tesoureiro</option>
                          <option value="EducationSecretary">Secretário de Educação</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1">
                          {editingUser ? 'Salvar' : 'Criar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowUserModal(false); setEditingUser(null); }}
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
          )}

          {/* ANALYTICS PRO */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                Analytics Pro
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-modern p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Performance do Sistema</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Tempo de Resposta (p95)</span>
                        <span className="font-semibold">{data?.responseTimeMsP95 ?? 0} ms</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${Math.min((data?.responseTimeMsP95 || 0) / 10, 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Uso de CPU</span>
                        <span className="font-semibold">{data?.resourcesUsage?.cpu ?? 0}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${
                          (data?.resourcesUsage?.cpu || 0) > 80 ? 'bg-rose-500' : 
                          (data?.resourcesUsage?.cpu || 0) > 60 ? 'bg-amber-500' : 
                          'bg-emerald-500'
                        }`} style={{ width: `${data?.resourcesUsage?.cpu || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Uso de Memória</span>
                        <span className="font-semibold">{data?.resourcesUsage?.memory ?? 0}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${
                          (data?.resourcesUsage?.memory || 0) > 80 ? 'bg-rose-500' : 
                          (data?.resourcesUsage?.memory || 0) > 60 ? 'bg-amber-500' : 
                          'bg-emerald-500'
                        }`} style={{ width: `${data?.resourcesUsage?.memory || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-modern p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Engajamento</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="text-sm text-slate-600">Usuários Ativos Diários</div>
                        <div className="text-2xl font-bold text-blue-600">{data?.engagement?.dailyActive ?? 0}</div>
                      </div>
                      <div className="text-3xl">📊</div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                      <div>
                        <div className="text-sm text-slate-600">Usuários Ativos Semanais</div>
                        <div className="text-2xl font-bold text-indigo-600">{data?.engagement?.weeklyActive ?? 0}</div>
                      </div>
                      <div className="text-3xl">📈</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-modern p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Uso por Painel</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl mb-2">👤</div>
                    <div className="text-sm text-slate-600">Alunos</div>
                    <div className="text-xl font-bold text-slate-800">45%</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl mb-2">👨‍🏫</div>
                    <div className="text-sm text-slate-600">Professores</div>
                    <div className="text-xl font-bold text-slate-800">25%</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl mb-2">📋</div>
                    <div className="text-sm text-slate-600">Secretaria</div>
                    <div className="text-xl font-bold text-slate-800">20%</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="text-sm text-slate-600">Tesouraria</div>
                    <div className="text-xl font-bold text-slate-800">10%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CENTRO FINANCEIRO */}
          {activeSection === "finance" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                Centro Financeiro
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-modern p-6">
                  <div className="text-sm text-slate-600 mb-2">Receita Total</div>
                  <div className="text-3xl font-bold text-emerald-600">R$ 125.450,00</div>
                  <div className="text-xs text-emerald-600 mt-1">+12% este mês</div>
                </div>
                <div className="card-modern p-6">
                  <div className="text-sm text-slate-600 mb-2">Inadimplência</div>
                  <div className="text-3xl font-bold text-rose-600">8.5%</div>
                  <div className="text-xs text-rose-600 mt-1">-2% este mês</div>
                </div>
                <div className="card-modern p-6">
                  <div className="text-sm text-slate-600 mb-2">Mensalidades Pagas</div>
                  <div className="text-3xl font-bold text-blue-600">1.234</div>
                  <div className="text-xs text-blue-600 mt-1">91% do total</div>
                </div>
              </div>

              <div className="card-modern p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Receita por Escola</h3>
                <div className="space-y-3">
                  {[
                    { name: "Escola Municipal Centro", value: 45000, percentage: 36 },
                    { name: "Escola Estadual Norte", value: 38000, percentage: 30 },
                    { name: "Escola Municipal Sul", value: 42450, percentage: 34 },
                  ].map((school, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{school.name}</span>
                        <span className="font-semibold">R$ {school.value.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${school.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GESTÃO DE ESCOLAS */}
          {activeSection === "schools" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                  Gestão de Escolas
                </h2>
                <button
                  onClick={() => { setEditingSchool(null); setShowSchoolModal(true); }}
                  className="btn-modern bg-violet-600 text-white hover:bg-violet-700"
                >
                  + Nova Escola
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(schoolsQ.data || []).map((school) => (
                  <div key={school.id} className="card-modern p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {school.logoUrl ? (
                        <img src={school.logoUrl} alt={school.name} className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-2xl">
                          🏫
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">{school.name}</div>
                        <div className="text-xs text-slate-600 mt-1">
                          {school.currentStudents} / {school.maxStudents} alunos
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Sistema de Avaliação:</span>
                        <span className="font-medium">{school.evaluationType === "notas" ? "Notas" : "Conceitos"}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          school.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {school.active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button className="btn-modern bg-blue-600 text-white hover:bg-blue-700 flex-1 text-sm">
                        Editar
                      </button>
                      <button className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1 text-sm">
                        Configurar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SISTEMA & SEGURANÇA */}
          {activeSection === "security" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                Sistema & Segurança
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-modern p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Logs do Sistema</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {[
                      { time: "10:23:45", level: "INFO", message: "Backup automático concluído" },
                      { time: "10:20:12", level: "WARN", message: "Alta utilização de CPU detectada" },
                      { time: "10:15:30", level: "INFO", message: "Novo usuário criado: admin@escola.com" },
                      { time: "10:10:05", level: "ERROR", message: "Falha na conexão com banco de dados" },
                    ].map((log, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded text-xs">
                        <span className="text-slate-500">{log.time}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded ${
                          log.level === "ERROR" ? "bg-rose-100 text-rose-700" :
                          log.level === "WARN" ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {log.level}
                        </span>
                        <span className="ml-2 text-slate-700">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-modern p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Ações do Sistema</h3>
                  <div className="space-y-3">
                    <button className="btn-modern bg-blue-600 text-white w-full hover:bg-blue-700">
                      💾 Executar Backup
                    </button>
                    <button className="btn-modern bg-emerald-600 text-white w-full hover:bg-emerald-700">
                      🔄 Restaurar Backup
                    </button>
                    <button className="btn-modern bg-amber-600 text-white w-full hover:bg-amber-700">
                      ⚙️ Configurações de Segurança
                    </button>
                    <button className="btn-modern bg-slate-600 text-white w-full hover:bg-slate-700">
                      📊 Monitoramento de Performance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RELATÓRIOS AVANÇADOS */}
          {activeSection === "reports" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                Relatórios Avançados
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-modern p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Relatórios Disponíveis</h3>
                  <div className="space-y-2">
                    {[
                      "Relatório Consolidado de Todas as Escolas",
                      "Análise Comparativa de Performance",
                      "Relatório de Usuários e Acessos",
                      "Relatório Financeiro Mensal",
                      "Relatório Financeiro Anual",
                      "Relatório de Engajamento",
                    ].map((report, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-700">{report}</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium">
                            PDF
                          </button>
                          <button className="px-3 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs font-medium">
                            Excel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-modern p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Relatórios Automatizados</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800">Relatório Diário</span>
                        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Ativo</span>
                      </div>
                      <div className="text-sm text-slate-600">Enviado diariamente às 08:00</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800">Relatório Semanal</span>
                        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Ativo</span>
                      </div>
                      <div className="text-sm text-slate-600">Enviado toda segunda-feira às 09:00</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800">Relatório Mensal</span>
                        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Ativo</span>
                      </div>
                      <div className="text-sm text-slate-600">Enviado no dia 1 de cada mês às 10:00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}