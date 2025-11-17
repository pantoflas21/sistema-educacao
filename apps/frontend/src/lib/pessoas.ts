import { supabase } from './supabaseClient';

/**
 * Interface para os dados de uma pessoa
 */
export interface PessoaData {
  nome: string;
  email: string;
  data_nascimento: string;
}

/**
 * Interface para a resposta do cadastro
 */
export interface CadastroResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Função para cadastrar uma pessoa no Supabase
 * 
 * @param nome - Nome completo da pessoa
 * @param email - Email da pessoa
 * @param data_nascimento - Data de nascimento no formato YYYY-MM-DD
 * @returns Promise com os dados inseridos ou erro
 */
export async function cadastrarPessoa(
  nome: string,
  email: string,
  data_nascimento: string
): Promise<CadastroResponse> {
  try {
    // Validação dos dados de entrada
    if (!nome || nome.trim() === '') {
      return {
        success: false,
        error: 'Nome é obrigatório'
      };
    }

    if (!email || email.trim() === '') {
      return {
        success: false,
        error: 'Email é obrigatório'
      };
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Email inválido'
      };
    }

    if (!data_nascimento || data_nascimento.trim() === '') {
      return {
        success: false,
        error: 'Data de nascimento é obrigatória'
      };
    }

    // Validação do formato da data (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data_nascimento)) {
      return {
        success: false,
        error: 'Data de nascimento deve estar no formato YYYY-MM-DD'
      };
    }

    // Inserir dados na tabela 'pessoas'
    const { data, error } = await supabase
      .from('pessoas')
      .insert([
        {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          data_nascimento: data_nascimento
        }
      ])
      .select();

    // Tratamento de erro
    if (error) {
      console.error('Erro ao cadastrar pessoa:', error);
      return {
        success: false,
        error: error.message || 'Erro ao cadastrar pessoa no banco de dados'
      };
    }

    // Retornar sucesso com os dados inseridos
    return {
      success: true,
      data: data && data.length > 0 ? data[0] : null
    };

  } catch (error: any) {
    // Tratamento de erros inesperados
    console.error('Erro inesperado ao cadastrar pessoa:', error);
    return {
      success: false,
      error: error?.message || 'Erro inesperado ao cadastrar pessoa'
    };
  }
}

