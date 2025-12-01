import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
// Usa variáveis de ambiente do Vite (VITE_ em vez de NEXT_PUBLIC_)
// NOTA: Supabase é OPCIONAL - o sistema funciona sem ele usando o backend Express
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se Supabase está configurado
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
                              supabaseUrl !== 'https://placeholder.supabase.co' &&
                              supabaseAnonKey !== 'placeholder-key';

// Criar e exportar o cliente Supabase
// Se as variáveis não estiverem configuradas, cria cliente com valores placeholder
// O aviso só será mostrado quando tentar usar funcionalidades do Supabase
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Exportar flag para verificar se está configurado
export const isSupabaseAvailable = isSupabaseConfigured;

