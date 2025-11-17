/**
 * Página de teste para verificar se o Supabase está funcionando
 * Acesse esta página no navegador para testar
 */

import { useState } from 'react';
import { executarTodosTestes, testarConexaoSupabase, testarCadastroPessoa } from '../lib/test-supabase';

export default function TestSupabase() {
  const [testando, setTestando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const executarTeste = async (tipo: 'todos' | 'conexao' | 'cadastro') => {
    setTestando(true);
    setResultado(null);

    try {
      let resultadoTeste;
      if (tipo === 'todos') {
        resultadoTeste = await executarTodosTestes();
      } else if (tipo === 'conexao') {
        resultadoTeste = await testarConexaoSupabase();
      } else {
        resultadoTeste = await testarCadastroPessoa();
      }

      setResultado(resultadoTeste);
    } catch (error: any) {
      setResultado({
        success: false,
        error: error.message || 'Erro desconhecido'
      });
    } finally {
      setTestando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            🧪 Teste de Integração Supabase
          </h1>
          <p className="text-slate-600 mb-6">
            Verifique se a conexão com Supabase está funcionando corretamente
          </p>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => executarTeste('todos')}
              disabled={testando}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {testando ? '⏳ Testando...' : '🚀 Executar Todos os Testes'}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => executarTeste('conexao')}
                disabled={testando}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                🔌 Testar Conexão
              </button>

              <button
                onClick={() => executarTeste('cadastro')}
                disabled={testando}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ✏️ Testar Cadastro
              </button>
            </div>
          </div>

          {resultado && (
            <div
              className={`p-4 rounded-lg border-2 ${
                resultado.success
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {resultado.success ? '✅' : '❌'}
                </span>
                <div className="flex-1">
                  <div className="font-bold mb-1">
                    {resultado.success ? 'Sucesso!' : 'Erro'}
                  </div>
                  <div className="text-sm mb-2">{resultado.message}</div>
                  {resultado.error && (
                    <div className="text-xs bg-white/50 p-2 rounded font-mono">
                      {resultado.error}
                    </div>
                  )}
                  {resultado.data && (
                    <div className="text-xs bg-white/50 p-2 rounded mt-2">
                      <div className="font-semibold mb-1">Dados inseridos:</div>
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(resultado.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="text-sm font-semibold text-slate-700 mb-2">
              📋 Checklist:
            </div>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>✅ Arquivo .env configurado com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY</li>
              <li>✅ Tabela "pessoas" criada no Supabase</li>
              <li>✅ Função cadastrarPessoa implementada</li>
              <li>✅ Cliente Supabase inicializado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

