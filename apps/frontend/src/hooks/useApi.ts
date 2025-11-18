/**
 * Hook para chamadas API padronizadas
 * Centraliza lógica de fetch, headers, tratamento de erros
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useAuth } from './useAuth';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: HeadersInit;
  requireAuth?: boolean;
}

/**
 * Função auxiliar para fazer requisições API
 */
async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers: customHeaders = {},
    requireAuth = true,
  } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Adicionar token de autenticação se necessário
  if (requireAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, config);

  // Verificar se resposta é JSON
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    const errorData = isJson ? await response.json().catch(() => ({})) : {};
    
    // Se não autorizado, limpar token
    if (response.status === 401 && requireAuth) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    throw new Error(
      errorData.message || 
      errorData.error || 
      `Erro ${response.status}: ${response.statusText}`
    );
  }

  // Retornar JSON ou texto
  if (isJson) {
    return response.json();
  }
  
  return response.text() as any;
}

/**
 * Hook para queries (GET)
 */
export function useApiQuery<T>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> & {
    requireAuth?: boolean;
  }
) {
  const { requireAuth = true, ...queryOptions } = options || {};

  return useQuery<T>({
    queryKey,
    queryFn: () => apiRequest<T>(endpoint, { requireAuth }),
    ...queryOptions,
  });
}

/**
 * Hook para mutations (POST, PUT, PATCH, DELETE)
 */
export function useApiMutation<TData = any, TVariables = any>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> & {
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    requireAuth?: boolean;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();
  const {
    method = 'POST',
    requireAuth = true,
    invalidateQueries = [],
    ...mutationOptions
  } = options || {};

  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables: TVariables) =>
      apiRequest<TData>(endpoint, {
        method,
        body: variables,
        requireAuth,
      }),
    onSuccess: (data, variables, context) => {
      // Invalidar queries relacionadas
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Chamar onSuccess customizado se fornecido
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
    ...mutationOptions,
  });
}

/**
 * Exportar função de API para uso direto (fora de hooks)
 */
export { apiRequest };

