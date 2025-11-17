# 🧪 Como Testar se o Supabase Está Funcionando

## ✅ Verificação Completa

Criei uma página de teste para você verificar se tudo está funcionando corretamente!

## 🚀 Como Testar:

### 1. **Inicie o servidor de desenvolvimento:**

```powershell
cd apps\frontend
npm run dev
```

### 2. **Acesse a página de teste:**

Abra no navegador:
```
http://localhost:5173/test-supabase
```

### 3. **Execute os testes:**

Na página, você verá 3 botões:

- **🚀 Executar Todos os Testes** - Testa tudo de uma vez
- **🔌 Testar Conexão** - Apenas verifica se consegue conectar ao Supabase
- **✏️ Testar Cadastro** - Testa se consegue cadastrar uma pessoa

## ✅ O que os testes verificam:

1. ✅ Se o cliente Supabase foi inicializado
2. ✅ Se as variáveis de ambiente estão configuradas no `.env`
3. ✅ Se consegue conectar ao Supabase
4. ✅ Se a tabela `pessoas` existe
5. ✅ Se a função `cadastrarPessoa` funciona

## 📋 Resultados Esperados:

### ✅ **Se tudo estiver OK:**
- Verá mensagens de sucesso em verde
- O teste de cadastro vai inserir uma pessoa de teste no banco
- Todos os testes passarão

### ❌ **Se houver problemas:**

**Erro: "Variáveis de ambiente não configuradas"**
- Verifique se o arquivo `.env` existe em `apps/frontend/`
- Verifique se as variáveis estão preenchidas

**Erro: "Tabela pessoas não encontrada"**
- Execute o SQL de criação da tabela no Supabase
- SQL está em `INTEGRACAO_SUPABASE.md`

**Erro: "Erro ao conectar"**
- Verifique se a URL e a chave estão corretas
- Verifique se o projeto Supabase está ativo

## 🔍 Verificação Manual (Alternativa):

Se preferir verificar manualmente, abra o **Console do Navegador** (F12) e execute:

```javascript
// Importar e testar
import { testarConexaoSupabase, testarCadastroPessoa } from './lib/test-supabase';

// Testar conexão
await testarConexaoSupabase();

// Testar cadastro
await testarCadastroPessoa();
```

## 📝 Checklist Final:

- [ ] Arquivo `.env` criado e preenchido
- [ ] Tabela `pessoas` criada no Supabase
- [ ] Servidor de desenvolvimento rodando (`npm run dev`)
- [ ] Página de teste acessada (`/test-supabase`)
- [ ] Todos os testes passaram ✅

## 🎯 Próximos Passos:

Após confirmar que tudo está funcionando:

1. Você pode remover a página de teste (`TestSupabase.tsx`) se quiser
2. Ou mantê-la para testes futuros
3. Começar a usar `cadastrarPessoa` nos seus componentes!

