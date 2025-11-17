/**
 * Arquivo de teste para verificar se a conexão com Supabase está funcionando
 * Execute este arquivo no console do navegador ou importe em um componente temporário
 */

import { supabase } from './supabaseClient';
import { cadastrarPessoa } from './pessoas';

/**
 * Testa a conexão com o Supabase
 */
export async function testarConexaoSupabase() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Teste 1: Verificar se o cliente foi criado
    if (!supabase) {
      throw new Error('Cliente Supabase não foi inicializado');
    }
    console.log('✅ Cliente Supabase inicializado');

    // Teste 2: Verificar se as variáveis de ambiente estão configuradas
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || url.trim() === '') {
      throw new Error('VITE_SUPABASE_URL não está configurada no .env');
    }
    console.log('✅ VITE_SUPABASE_URL configurada:', url.substring(0, 30) + '...');

    if (!key || key.trim() === '') {
      throw new Error('VITE_SUPABASE_ANON_KEY não está configurada no .env');
    }
    console.log('✅ VITE_SUPABASE_ANON_KEY configurada');

    // Teste 3: Tentar fazer uma query simples na tabela pessoas
    const { data, error } = await supabase
      .from('pessoas')
      .select('count')
      .limit(1);

    if (error) {
      // Se o erro for de tabela não encontrada, informar
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        throw new Error('❌ Tabela "pessoas" não encontrada no Supabase. Execute o SQL de criação da tabela.');
      }
      throw error;
    }
    console.log('✅ Conexão com Supabase funcionando!');
    console.log('✅ Tabela "pessoas" existe e está acessível');

    return {
      success: true,
      message: 'Conexão com Supabase está funcionando corretamente!'
    };

  } catch (error: any) {
    console.error('❌ Erro ao testar conexão:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido',
      message: 'Erro ao conectar com Supabase'
    };
  }
}

/**
 * Testa a função cadastrarPessoa com dados de exemplo
 */
export async function testarCadastroPessoa() {
  try {
    console.log('🔍 Testando função cadastrarPessoa...');
    
    // Dados de teste
    const nomeTeste = 'Teste ' + Date.now();
    const emailTeste = `teste${Date.now()}@example.com`;
    const dataNascimentoTeste = '1990-01-01';

    const resultado = await cadastrarPessoa(nomeTeste, emailTeste, dataNascimentoTeste);

    if (resultado.success) {
      console.log('✅ Função cadastrarPessoa funcionando!');
      console.log('✅ Dados inseridos:', resultado.data);
      return {
        success: true,
        message: 'Função cadastrarPessoa está funcionando corretamente!',
        data: resultado.data
      };
    } else {
      console.error('❌ Erro ao cadastrar:', resultado.error);
      return {
        success: false,
        error: resultado.error,
        message: 'Erro ao cadastrar pessoa'
      };
    }

  } catch (error: any) {
    console.error('❌ Erro inesperado:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido',
      message: 'Erro ao testar cadastro'
    };
  }
}

/**
 * Executa todos os testes
 */
export async function executarTodosTestes() {
  console.log('🚀 Iniciando testes do Supabase...\n');
  
  const testeConexao = await testarConexaoSupabase();
  console.log('\n');
  
  if (testeConexao.success) {
    const testeCadastro = await testarCadastroPessoa();
    console.log('\n');
    
    if (testeCadastro.success) {
      console.log('🎉 TODOS OS TESTES PASSARAM!');
      return {
        success: true,
        message: 'Tudo está funcionando corretamente!'
      };
    } else {
      console.log('⚠️ Conexão OK, mas cadastro falhou');
      return testeCadastro;
    }
  } else {
    console.log('⚠️ Teste de conexão falhou');
    return testeConexao;
  }
}

