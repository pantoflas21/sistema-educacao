# 🚀 Integração do Supabase - Sistema Aletheia

## ✅ O que foi implementado:

### 1. **Dependência Instalada** ✅
- `@supabase/supabase-js` instalado no frontend

### 2. **Arquivo de Conexão** ✅
- Criado: `apps/frontend/src/lib/supabaseClient.ts`
- Configurado para usar variáveis de ambiente do Vite (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`)
- Inclui validação das variáveis de ambiente

### 3. **Função de Cadastro** ✅
- Criado: `apps/frontend/src/lib/pessoas.ts`
- Função `cadastrarPessoa(nome, email, data_nascimento)` implementada
- Inclui:
  - ✅ Validação de dados de entrada
  - ✅ Validação de email
  - ✅ Validação de formato de data
  - ✅ Tratamento de erros completo
  - ✅ Retorno estruturado com sucesso/erro

## 📋 Como usar:

### 1. **Configurar Variáveis de Ambiente:**

Crie um arquivo `.env` na pasta `apps/frontend/` com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Onde encontrar essas credenciais:**
1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** → **API**
3. Copie a **URL** e a **anon/public key**

### 2. **Criar a Tabela no Supabase:**

No SQL Editor do Supabase, execute:

```sql
CREATE TABLE pessoas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  data_nascimento DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por email
CREATE INDEX idx_pessoas_email ON pessoas(email);
```

### 3. **Usar a Função em um Componente:**

```typescript
import { cadastrarPessoa } from '../lib/pessoas';

// Exemplo de uso
const handleCadastro = async () => {
  const resultado = await cadastrarPessoa(
    'João Silva',
    'joao@example.com',
    '1990-05-15'
  );

  if (resultado.success) {
    console.log('Pessoa cadastrada com sucesso!', resultado.data);
  } else {
    console.error('Erro ao cadastrar:', resultado.error);
  }
};
```

## 📁 Estrutura de Arquivos:

```
apps/frontend/
├── src/
│   └── lib/
│       ├── supabaseClient.ts    # Cliente Supabase
│       └── pessoas.ts           # Função de cadastro
├── .env                          # Variáveis de ambiente (não commitado)
└── .env.example                  # Exemplo de variáveis
```

## 🔒 Segurança:

- ✅ Usa a chave **anon** (pública) do Supabase
- ✅ Validações no frontend antes de enviar
- ⚠️ **IMPORTANTE:** Configure Row Level Security (RLS) no Supabase para proteger os dados

### Configurar RLS no Supabase:

```sql
-- Habilitar RLS na tabela
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção (ajuste conforme necessário)
CREATE POLICY "Permitir inserção de pessoas"
ON pessoas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para permitir leitura (ajuste conforme necessário)
CREATE POLICY "Permitir leitura de pessoas"
ON pessoas
FOR SELECT
TO authenticated
USING (true);
```

## 🧪 Teste Rápido:

1. Configure as variáveis de ambiente
2. Crie a tabela no Supabase
3. Importe e use a função em um componente:

```typescript
import { cadastrarPessoa } from './lib/pessoas';

// Teste
cadastrarPessoa('Teste', 'teste@example.com', '2000-01-01')
  .then(result => console.log(result));
```

## ⚠️ Notas Importantes:

1. **Vite vs Next.js:** Este projeto usa Vite, então as variáveis devem começar com `VITE_` (não `NEXT_PUBLIC_`)
2. **TypeScript:** Os arquivos foram criados em TypeScript (`.ts`) com tipagem completa
3. **Validação:** A função valida todos os campos antes de enviar ao Supabase
4. **Erros:** Todos os erros são capturados e retornados de forma estruturada

## 🎯 Próximos Passos (Opcional):

- [ ] Adicionar mais validações (ex: idade mínima)
- [ ] Criar função para listar pessoas
- [ ] Criar função para atualizar pessoa
- [ ] Criar função para deletar pessoa
- [ ] Adicionar paginação para listagem
- [ ] Implementar autenticação com Supabase Auth

