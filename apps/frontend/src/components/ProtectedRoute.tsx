/**
 * Componente para proteger rotas
 * Redireciona para login se não autenticado
 * 100% Frontend - não usa API
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { isAuthenticated } from '../lib/authLocal';

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
  const { user, isAuthenticated: authState } = useAuth();

  useEffect(() => {
    // Verificar autenticação do localStorage diretamente
    if (!isAuthenticated()) {
      setLocation('/login');
    }
  }, [authState, setLocation]);

  // Não autenticado - redirecionar (o useEffect já faz isso)
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

