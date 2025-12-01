/**
 * Hook de autenticação HÍBRIDA
 * Tenta API primeiro (usuários reais), depois fallback local (modo demo)
 * Funciona com ou sem backend - mantém compatibilidade total
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  loginLocal, 
  saveAuth, 
  clearAuth, 
  getAuthUser, 
  getAuthToken,
  isAuthenticated,
  type User 
} from '../lib/authLocal';

export function useAuth() {
  const [, setLocation] = useLocation();
  
  // Estado local
  const [user, setUser] = useState<User | null>(() => getAuthUser());
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<Error | null>(null);

  // Carregar auth do localStorage ao montar
  useEffect(() => {
    const storedUser = getAuthUser();
    const storedToken = getAuthToken();
    
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  // Função de login LOCAL (sem API)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const result = await loginLocal(email, password);
      
      // Salvar no localStorage
      saveAuth(result.user, result.token);
      
      // Atualizar estado
      setUser(result.user);
      setToken(result.token);
      
      // Redirecionar baseado no role
      const roleRoutes: Record<string, string> = {
        Admin: '/admin',
        Teacher: '/teacher',
        Student: '/student',
        Secretary: '/secretary',
        Treasury: '/treasury',
        EducationSecretary: '/education-secretary',
      };

      const redirectTo = roleRoutes[result.user.role] || '/admin';
      setLocation(redirectTo);
    } catch (error: any) {
      setLoginError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
    setLocation('/login');
  };

  return {
    user,
    token,
    isAuthenticated: isAuthenticated(),
    isLoading,
    login,
    logout,
    isLoggingIn: isLoading,
    loginError,
  };
}

