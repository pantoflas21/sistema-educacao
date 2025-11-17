/**
 * EXEMPLO DE USO DA FUNÇÃO cadastrarPessoa
 * 
 * Este arquivo é apenas um exemplo. Você pode deletá-lo após entender como usar.
 */

import { useState } from 'react';
import { cadastrarPessoa } from './pessoas';

export function ExemploCadastroPessoa() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);

    try {
      const resultado = await cadastrarPessoa(nome, email, dataNascimento);

      if (resultado.success) {
        setMensagem({
          tipo: 'sucesso',
          texto: 'Pessoa cadastrada com sucesso!'
        });
        // Limpar formulário
        setNome('');
        setEmail('');
        setDataNascimento('');
      } else {
        setMensagem({
          tipo: 'erro',
          texto: resultado.error || 'Erro ao cadastrar pessoa'
        });
      }
    } catch (error: any) {
      setMensagem({
        tipo: 'erro',
        texto: error.message || 'Erro inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Cadastrar Pessoa</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
          <input
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Formato: YYYY-MM-DD</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      {mensagem && (
        <div
          className={`mt-4 p-3 rounded-md ${
            mensagem.tipo === 'sucesso'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {mensagem.texto}
        </div>
      )}
    </div>
  );
}

