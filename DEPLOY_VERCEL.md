# Guia de Deploy na Vercel

## Configuração para Deploy

### Opção 1: Deploy do Frontend apenas (Recomendado para começar)

1. **Conecte o repositório na Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Importe o repositório do GitHub

2. **Configurações do Projeto**
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Variáveis de Ambiente** (se necessário)
   - `VITE_API_URL`: URL da API (se backend estiver em outro lugar)

### Opção 2: Deploy Full-Stack (Frontend + Backend)

Para deploy completo, você precisará:

1. **Criar um projeto separado para o Backend**
   - Root Directory: `apps/backend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Start Command: `npm start`

2. **Configurar o Frontend para apontar para o Backend**
   - Adicione variável de ambiente: `VITE_API_URL`

### Configuração de Rotas (SPA)

O arquivo `vercel.json` já está configurado para:
- Redirecionar todas as rotas para `index.html` (evita erro 404)
- Manter rotas `/api/*` funcionando

### Testes Locais

```bash
# Instalar dependências
npm run install:all

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Notas Importantes

- ✅ O sistema está configurado para evitar erro 404 em rotas do SPA
- ✅ Todas as rotas do frontend redirecionam para `index.html`
- ✅ O backend serve arquivos estáticos do frontend quando buildado
- ⚠️ Para produção, considere usar um banco de dados real (PostgreSQL)
- ⚠️ Configure variáveis de ambiente na Vercel (DATABASE_URL, JWT_SECRET, etc.)







