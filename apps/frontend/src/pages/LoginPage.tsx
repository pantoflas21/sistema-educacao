import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { loginLocal, saveAuth, isAuthenticated, getAuthUser, clearAuth } from "../lib/authLocal";

type LoginConfig = {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  schoolName?: string;
  welcomeMessage?: string;
};

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  
  // Verificar se já está autenticado - se sim, redirecionar
  useEffect(() => {
    if (isAuthenticated()) {
      const authUser = getAuthUser();
      if (authUser) {
        // Redirecionar baseado no role
        const roleRoutes: Record<string, string> = {
          Admin: '/admin',
          Teacher: '/teacher',
          Student: '/student',
          Secretary: '/secretary',
          Treasury: '/treasury',
          EducationSecretary: '/education-secretary',
        };
        const redirectTo = roleRoutes[authUser.role] || '/';
        setLocation(redirectTo);
      }
    }
  }, [setLocation]);

  // Carregar configuração da escola
  const { data: config } = useQuery<LoginConfig>({
    queryKey: ["login-config"],
    queryFn: async () => {
      try {
        const saved = localStorage.getItem("school-login-config");
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch {
            return {};
          }
        }
        
        // Configuração agora é apenas local (sem API)
        // Pode ser expandido para carregar de um arquivo JSON ou outro serviço externo
        
        return {};
      } catch {
        return {};
      }
    },
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false
  });

  // Upload de logo
  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      // Converter para base64 para simular upload (em produção, usar FormData com multer)
      return new Promise<{ url: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Salvar como data URL no localStorage
          const newConfig = { ...config, logoUrl: base64 };
          localStorage.setItem("school-login-config", JSON.stringify(newConfig));
          resolve({ url: base64 });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    onSuccess: (data) => {
      setPreviewLogo(data.url);
      setShowLogoUpload(false);
      setLogoFile(null);
      alert("Logo salva com sucesso!");
    }
  });

  // Salvar configuração (apenas local, sem API)
  const saveConfig = useMutation({
    mutationFn: async (newConfig: LoginConfig) => {
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 300));
      return newConfig;
    },
    onSuccess: (data) => {
      localStorage.setItem("school-login-config", JSON.stringify(data));
      alert("Configuração salva com sucesso!");
    }
  });

  useEffect(() => {
    // Limpar autenticação antiga ao entrar na página de login
    clearAuth();
    console.log("🧹 [LOGIN] Autenticação antiga limpa");
  }, []);

  useEffect(() => {
    if (logoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(logoFile);
    }
  }, [logoFile]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Usar função de login do hook (100% local, sem API)
      await login(email, password);
      // O hook já faz o redirecionamento automaticamente
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  const primaryColor = config?.primaryColor || "#4f46e5";
  const secondaryColor = config?.secondaryColor || "#6366f1";
  const schoolName = config?.schoolName || "Aletheia";
  const welcomeMessage = config?.welcomeMessage || "Bem-vindo ao Sistema de Gestão Educacional";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header com Logo */}
          <div 
            className="p-6 md:p-8 text-center"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
            }}
          >
            {config?.logoUrl || previewLogo ? (
              <div className="mb-4 flex justify-center">
                <img 
                  src={previewLogo || config?.logoUrl} 
                  alt="Logo da Escola" 
                  className="h-20 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <img 
                    src="/aletheia-logo.svg" 
                    alt="Aletheia" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>
            )}
            <h1 className="text-xl md:text-2xl font-extrabold text-white mb-2">{schoolName}</h1>
            <p className="text-white/90 text-xs md:text-sm">{welcomeMessage}</p>
          </div>

          {/* Formulário de Login */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
                }}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            {/* Link para Configuração (Admin) */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowLogoUpload(!showLogoUpload)}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                ⚙️ Personalizar Login
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Personalização */}
        {showLogoUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">Personalizar Tela de Login</h2>
                  <button
                    onClick={() => {
                      setShowLogoUpload(false);
                      setLogoFile(null);
                      setPreviewLogo(null);
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Upload de Logo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Logo da Escola
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    {previewLogo || config?.logoUrl ? (
                      <div className="space-y-3">
                        <img 
                          src={previewLogo || config?.logoUrl} 
                          alt="Preview" 
                          className="h-24 mx-auto object-contain"
                        />
                        <button
                          onClick={() => {
                            setLogoFile(null);
                            setPreviewLogo(null);
                          }}
                          className="text-sm text-rose-600 hover:text-rose-700"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setLogoFile(file);
                          }}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer text-slate-600 hover:text-slate-700"
                        >
                          <div className="text-4xl mb-2">📷</div>
                          <div className="text-sm">Clique para fazer upload</div>
                          <div className="text-xs text-slate-500 mt-1">PNG, JPG ou SVG (máx. 5MB)</div>
                        </label>
                      </div>
                    )}
                  </div>
                  {logoFile && (
                    <button
                      onClick={() => uploadLogo.mutate(logoFile)}
                      className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {uploadLogo.isLoading ? "Enviando..." : "Fazer Upload"}
                    </button>
                  )}
                </div>

                {/* Nome da Escola */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nome da Escola
                  </label>
                  <input
                    type="text"
                    defaultValue={config?.schoolName || ""}
                    onChange={(e) => {
                      const newConfig = { ...config, schoolName: e.target.value };
                      localStorage.setItem("school-login-config", JSON.stringify(newConfig));
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nome da Escola"
                  />
                </div>

                {/* Mensagem de Boas-vindas */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mensagem de Boas-vindas
                  </label>
                  <input
                    type="text"
                    defaultValue={config?.welcomeMessage || ""}
                    onChange={(e) => {
                      const newConfig = { ...config, welcomeMessage: e.target.value };
                      localStorage.setItem("school-login-config", JSON.stringify(newConfig));
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Bem-vindo ao Sistema"
                  />
                </div>

                {/* Cores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Cor Primária
                    </label>
                    <input
                      type="color"
                      defaultValue={config?.primaryColor || "#4f46e5"}
                      onChange={(e) => {
                        const newConfig = { ...config, primaryColor: e.target.value };
                        localStorage.setItem("school-login-config", JSON.stringify(newConfig));
                        window.location.reload();
                      }}
                      className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Cor Secundária
                    </label>
                    <input
                      type="color"
                      defaultValue={config?.secondaryColor || "#6366f1"}
                      onChange={(e) => {
                        const newConfig = { ...config, secondaryColor: e.target.value };
                        localStorage.setItem("school-login-config", JSON.stringify(newConfig));
                        window.location.reload();
                      }}
                      className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      const newConfig = {
                        logoUrl: previewLogo || config?.logoUrl,
                        primaryColor: config?.primaryColor || "#4f46e5",
                        secondaryColor: config?.secondaryColor || "#6366f1",
                        schoolName: config?.schoolName || "Aletheia",
                        welcomeMessage: config?.welcomeMessage || "Bem-vindo ao Sistema"
                      };
                      saveConfig.mutate(newConfig);
                    }}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Salvar Configuração
                  </button>
                  <button
                    onClick={() => {
                      setShowLogoUpload(false);
                      setLogoFile(null);
                      setPreviewLogo(null);
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informações de Demo */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">🔑 Credenciais de Teste (Modo Demo)</h3>
          <div className="space-y-2 text-xs text-blue-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <strong>👨‍💼 Administrador:</strong>
                <p className="text-blue-700">admin@escola.com</p>
                <p className="text-blue-600">(ou qualquer email)</p>
              </div>
              <div>
                <strong>👨‍🏫 Professor:</strong>
                <p className="text-blue-700">prof@escola.com</p>
                <p className="text-blue-600">(email com "prof")</p>
              </div>
              <div>
                <strong>📋 Secretário:</strong>
                <p className="text-blue-700">secretario@escola.com</p>
                <p className="text-blue-600">(email com "secretario")</p>
              </div>
              <div>
                <strong>💰 Tesouraria:</strong>
                <p className="text-blue-700">tesouraria@escola.com</p>
                <p className="text-blue-600">(email com "tesouraria")</p>
              </div>
              <div>
                <strong>🏛️ Secretaria de Educação:</strong>
                <p className="text-blue-700">educacao@escola.com</p>
                <p className="text-blue-600">(email com "educacao")</p>
              </div>
              <div>
                <strong>👨‍🎓 Aluno:</strong>
                <p className="text-blue-700">aluno@escola.com</p>
                <p className="text-blue-600">(email com "aluno")</p>
              </div>
            </div>
            <p className="mt-3 pt-3 border-t border-blue-200 text-blue-700">
              <strong>Senha:</strong> Qualquer valor (não é validada no modo demo)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

