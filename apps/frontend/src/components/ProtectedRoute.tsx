/**
 * Componente para proteger rotas
 * Redireciona para login se não autenticado
 * 100% Frontend - não usa API
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { isAuthenticated, getAuthUser, getAuthToken, clearAuth } from '../lib/authLocal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { user: authUser, isAuthenticated: authState } = useAuth();

  // Verificar autenticação com validação rigorosa
  const user = getAuthUser();
  const token = getAuthToken();

  useEffect(() => {
    // Validar que ambos existem e não estão vazios
    if (!user || !token || token.trim() === '' || !user.email || !user.role) {
      console.warn("⚠️ [AUTH] Dados de autenticação inválidos - limpando e redirecionando");
      clearAuth(); // Limpar dados inválidos
      setLocation('/login');
      return;
    }
    
    // Validar formato básico do token
    // Token deve ter pelo menos 10 caracteres e conter algum caractere especial
    const isValidToken = token.length >= 10 && (token.includes('_') || token.includes('-') || token.startsWith('Bearer ') || token.startsWith('local_token_'));
    
    if (!isValidToken) {
      console.warn("⚠️ [AUTH] Token inválido - limpando e redirecionando");
      clearAuth();
      setLocation('/login');
      return;
    }
    
    // Se passou todas as validações, verificar se isAuthenticated retorna true
    if (!isAuthenticated()) {
      console.warn("⚠️ [AUTH] isAuthenticated() retornou false - redirecionando");
      setLocation('/login');
    }
  }, [authState, setLocation, user, token]);
  
  // Validar que ambos existem e não estão vazios
  if (!user || !token || token.trim() === '' || !user.email || !user.role) {
    clearAuth(); // Limpar dados inválidos
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }
  
  // Validar formato básico do token
  const isValidToken = token.length >= 10 && (token.includes('_') || token.includes('-') || token.startsWith('Bearer ') || token.startsWith('local_token_'));
  
  if (!isValidToken) {
    clearAuth();
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }
  
  // Verificar isAuthenticated uma última vez
  if (!isAuthenticated()) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  // Verificar role se necessário
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Acesso Negado</h1>
          <p className="text-slate-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => setLocation('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

