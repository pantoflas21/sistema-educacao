import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
// Usa variáveis de ambiente do Vite (VITE_ em vez de NEXT_PUBLIC_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação das variáveis de ambiente (apenas aviso, não quebra o app)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não configuradas. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
}

// Criar e exportar o cliente Supabase
// Se as variáveis não estiverem configuradas, usa valores vazios (vai dar erro ao tentar usar)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

