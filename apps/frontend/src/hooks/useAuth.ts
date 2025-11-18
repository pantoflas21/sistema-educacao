/**
 * Hook de autenticação
 * Gerencia estado de autenticação, token e usuário
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  schoolId: string | null;
  profileImageUrl: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const TOKEN_KEY = 'auth_token';

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Estado local do token
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  });

  // Query para buscar dados do usuário
  const { data: user, isLoading: isLoadingUser, error } = useQuery<User>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/auth/user', {
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido, limpar
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          throw new Error('Não autenticado');
        }
        throw new Error('Erro ao buscar usuário');
      }

      return response.json();
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Erro ao fazer login');
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidar query de usuário para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      
      // Redirecionar baseado no role
      const roleRoutes: Record<string, string> = {
        Admin: '/admin',
        Teacher: '/teacher',
        Student: '/student',
        Secretary: '/secretary',
        Treasury: '/treasury',
        EducationSecretary: '/education-secretary',
      };

      const redirectTo = roleRoutes[data.role] || '/admin';
      setLocation(redirectTo);
    },
  });

  // Função de logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    queryClient.clear();
    setLocation('/login');
  };

  // Verificar se token expirou
  useEffect(() => {
    if (token && error) {
      // Token inválido, fazer logout
      logout();
    }
  }, [token, error]);

  return {
    user: user || null,
    token,
    isAuthenticated: !!user && !!token,
    isLoading: isLoadingUser || loginMutation.isPending,
    login: loginMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}

