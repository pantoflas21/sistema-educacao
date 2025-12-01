/**
 * Sistema de Autenticação Local (100% Frontend)
 * Funciona sem backend, usando localStorage
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
 * Faz login local (sem API)
 */
export function loginLocal(email: string, password: string): Promise<{ user: User; token: string }> {
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
  return !!getAuthUser() && !!getAuthToken();
}

