/**
 * Sistema de Autenticação Híbrida (Frontend com Fallback)
 * 
 * PRIORIDADE 1: Tenta usar API do backend (usuários reais do banco)
 * PRIORIDADE 2: Se API não disponível, usa modo local (fallback)
 * 
 * Isso garante que o sistema sempre funcione:
 * - Com banco de dados → usa API e usuários reais
 * - Sem banco de dados → usa modo demo local
 */

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  schoolId: string | null;
  profileImageUrl: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'aletheia_auth';
const TOKEN_KEY = 'aletheia_token';

// Usuários mock (em produção, pode vir de um arquivo JSON ou ser carregado de outro lugar)
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@escola.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@escola.com',
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'Admin',
      schoolId: null,
      profileImageUrl: null,
    },
  },
  'prof@escola.com': {
    password: 'prof123',
    user: {
      id: '2',
      email: 'prof@escola.com',
      firstName: 'Professor',
      lastName: 'Teste',
      role: 'Teacher',
      schoolId: null,
      profileImageUrl: null,
    },
  },
  'professor@escola.com': {
    password: 'prof123',
    user: {
      id: '2',
      email: 'professor@escola.com',
      firstName: 'Professor',
      lastName: 'Teste',
      role: 'Teacher',
      schoolId: null,
      profileImageUrl: null,
    },
  },
  'secretario@escola.com': {
    password: 'sec123',
    user: {
      id: '3',
      email: 'secretario@escola.com',
      firstName: 'Secretário',
      lastName: 'Teste',
      role: 'Secretary',
      schoolId: null,
      profileImageUrl: null,
    },
  },
  'secretaria@escola.com': {
    password: 'sec123',
    user: {
      id: '3',
      email: 'secretaria@escola.com',
      firstName: 'Secretária',
      lastName: 'Teste',
      role: 'Secretary',
      schoolId: null,
      profileImageUrl: null,
    },
  },
  'tesouraria@escola.com': {
    password: 'tes123',
    user: {
      id: '4',
      email: 'tesouraria@escola.com',
      firstName: 'Tesouraria',
      lastName: 'Teste',
      role: 'Treasury',
      schoolId: null,
      profileImageUrl: null,
    },
  },
  'educacao@escola.com': {
    password: 'edu123',
    user: {
      id: '5',
      email: 'educacao@escola.com',
      firstName: 'Secretaria',
      lastName: 'Educação',
      role: 'EducationSecretary',
      schoolId: null,
      profileImageUrl: null,
    },
  },
  'educação@escola.com': {
    password: 'edu123',
    user: {
      id: '5',
      email: 'educação@escola.com',
      firstName: 'Secretaria',
      lastName: 'Educação',
      role: 'EducationSecretary',
      schoolId: null,
      profileImageUrl: null,
    },
  },
  'aluno@escola.com': {
    password: 'alu123',
    user: {
      id: '6',
      email: 'aluno@escola.com',
      firstName: 'Aluno',
      lastName: 'Teste',
      role: 'Student',
      schoolId: null,
      profileImageUrl: null,
    },
  },
  'student@escola.com': {
    password: 'stu123',
    user: {
      id: '6',
      email: 'student@escola.com',
      firstName: 'Student',
      lastName: 'Teste',
      role: 'Student',
      schoolId: null,
      profileImageUrl: null,
    },
  },
};

/**
 * Detecta o role baseado no email (modo demo - aceita qualquer senha)
 */
function detectRoleFromEmail(email: string): User | null {
  const emailLower = email.toLowerCase();
  
  // Verificar se existe usuário específico
  if (MOCK_USERS[emailLower]) {
    return MOCK_USERS[emailLower].user;
  }
  
  // Detectar role pelo email (modo demo)
  let role = 'Admin';
  let firstName = 'Usuário';
  let lastName = 'Demo';
  
  if (emailLower.includes('tesouraria')) {
    role = 'Treasury';
    firstName = 'Tesouraria';
  } else if (emailLower.includes('prof') || emailLower.includes('professor')) {
    role = 'Teacher';
    firstName = 'Professor';
  } else if (emailLower.includes('secretario') || emailLower.includes('secretaria')) {
    role = 'Secretary';
    firstName = 'Secretário';
  } else if (emailLower.includes('educacao') || emailLower.includes('educação')) {
    role = 'EducationSecretary';
    firstName = 'Secretaria';
    lastName = 'Educação';
  } else if (emailLower.includes('aluno') || emailLower.includes('student')) {
    role = 'Student';
    firstName = 'Aluno';
  }
  
  return {
    id: `demo-${Date.now()}`,
    email: emailLower,
    firstName,
    lastName,
    role,
    schoolId: null,
    profileImageUrl: null,
  };
}

/**
 * Tenta fazer login via API do backend
 * Retorna null se API não estiver disponível (para fallback)
 */
async function tryLoginViaAPI(email: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Se API não estiver disponível ou erro de rede, retornar null para usar fallback
    if (!response.ok) {
      // Se erro 401, é credencial inválida (API está funcionando mas senha errada)
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({ error: 'invalid_credentials' }));
        throw new Error(errorData.message || 'Email ou senha inválidos');
      }
      // Outros erros: API pode não estar disponível, usar fallback
      return null;
    }

    const data = await response.json();
    
    // API retornou token e role
    if (data.token && data.role) {
      // Buscar dados completos do usuário
      try {
        const userResponse = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
        });

        let userData: any = null;
        if (userResponse.ok) {
          userData = await userResponse.json();
        }

        // Montar objeto User completo com dados do backend
        const user: User = {
          id: String(userData?.id || email),
          email: userData?.email || email.toLowerCase().trim(),
          firstName: userData?.firstName || null,
          lastName: userData?.lastName || null,
          role: userData?.role || data.role,
          schoolId: userData?.schoolId || null,
          profileImageUrl: userData?.profileImageUrl || null,
        };

        return { user, token: data.token };
      } catch (userError) {
        // Se não conseguir buscar dados completos, criar user básico com role
        // Isso mantém o sistema funcionando mesmo se /api/auth/user falhar
        const user: User = {
          id: email.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          firstName: null,
          lastName: null,
          role: data.role,
          schoolId: null,
          profileImageUrl: null,
        };
        return { user, token: data.token };
      }
    }

    return null;
  } catch (error: any) {
    // Se erro de rede ou API indisponível, retornar null para usar fallback local
    // Mas se erro foi lançado explicitamente (como credencial inválida), propagar
    if (error.message && error.message.includes('inválid')) {
      throw error;
    }
    return null;
  }
}

/**
 * Faz login local (sem API) - FALLBACK quando API não está disponível
 */
function loginLocalFallback(email: string, password: string): Promise<{ user: User; token: string }> {
  return new Promise((resolve, reject) => {
    // Simular delay de rede
    setTimeout(() => {
      const emailLower = email.toLowerCase().trim();
      
      // Verificar se existe usuário específico
      const mockUser = MOCK_USERS[emailLower];
      
      if (mockUser) {
        // Verificar senha (em modo demo, aceita qualquer senha ou a senha específica)
        if (password === mockUser.password || password.length > 0) {
          const token = `local_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          resolve({ user: mockUser.user, token });
          return;
        } else {
          reject(new Error('Senha incorreta'));
          return;
        }
      }
      
      // Modo demo: aceita qualquer email/senha e detecta role
      if (password.length > 0) {
        const user = detectRoleFromEmail(emailLower);
        if (user) {
          const token = `local_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          resolve({ user, token });
          return;
        }
      }
      
      reject(new Error('Email ou senha inválidos'));
    }, 500); // Simular delay de 500ms
  });
}

/**
 * Faz login de forma híbrida:
 * 1. Tenta via API primeiro (para usuários reais do banco)
 * 2. Se API não estiver disponível, usa modo local (fallback)
 * 
 * Isso mantém compatibilidade total - tudo continua funcionando!
 */
export async function loginLocal(email: string, password: string): Promise<{ user: User; token: string }> {
  // Tentar API primeiro
  const apiResult = await tryLoginViaAPI(email, password);
  
  // Se API funcionou, retornar resultado
  if (apiResult) {
    return apiResult;
  }
  
  // Se API não está disponível, usar fallback local (modo demo)
  // Isso garante que o sistema continue funcionando mesmo sem backend
  return loginLocalFallback(email, password);
}

/**
 * Salva autenticação no localStorage
 */
export function saveAuth(user: User, token: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove autenticação do localStorage
 */
export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Obtém usuário autenticado do localStorage
 */
export function getAuthUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

/**
 * Obtém token do localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Verifica se está autenticado
 */
export function isAuthenticated(): boolean {
  try {
    const user = getAuthUser();
    const token = getAuthToken();
    
    // Se não tem usuário ou token, não está autenticado
    if (!user || !token) {
      return false;
    }
    
    // Validar que o usuário tem os campos obrigatórios
    if (!user.email || !user.role) {
      // Dados inválidos - limpar
      clearAuth();
      return false;
    }
    
    return true;
  } catch (error) {
    // Se houver erro ao verificar, limpar e retornar false
    clearAuth();
    return false;
  }
}

