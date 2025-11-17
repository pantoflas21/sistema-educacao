# Guia de Deploy - SISTEMA TRAE

## ✅ Checklist Pré-Deploy

### 1. Verificações de Código
- [x] Todos os componentes são responsivos
- [x] Assistente de Educação Especial implementado
- [x] Criador de Provas com interface tipo Word
- [x] Todas as rotas configuradas
- [x] Sem erros de lint
- [x] README.md criado

### 2. Build e Testes
```bash
# Instalar dependências
npm install

# Verificar erros de TypeScript
npm run type-check  # Se disponível

# Build de produção
npm run build

# Testar build localmente
npm run preview
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env.production` se necessário:
```
VITE_API_URL=https://api.seudominio.com
VITE_APP_NAME=SISTEMA TRAE
```

## 🚀 Deploy no GitHub

### Opção 1: GitHub Pages

1. **Configurar repositório:**
```bash
git init
git add .
git commit -m "Initial commit - SISTEMA TRAE"
git branch -M main
git remote add origin https://github.com/seu-usuario/sistema-trae.git
git push -u origin main
```

2. **Configurar GitHub Pages:**
   - Vá em Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (crie esta branch)
   - Folder: `/root`

3. **Script de deploy automático:**
Crie `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Opção 2: Vercel

1. **Instalar Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Configurações no dashboard:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Opção 3: Netlify

1. **Instalar Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Deploy:**
```bash
netlify deploy --prod
```

3. **Configurações:**
   - Build command: `npm run build`
   - Publish directory: `dist`

## 📱 Testes Pós-Deploy

### Desktop
- [ ] Testar todos os painéis
- [ ] Verificar navegação hierárquica do professor
- [ ] Testar criador de provas
- [ ] Verificar assistente de educação especial
- [ ] Testar responsividade em diferentes resoluções

### Mobile
- [ ] Testar em dispositivos móveis reais
- [ ] Verificar touch events
- [ ] Testar formulários em mobile
- [ ] Verificar scroll e navegação
- [ ] Testar editor de provas em mobile

## 🔧 Troubleshooting

### Problema: Build falha
```bash
# Limpar cache e node_modules
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Rotas não funcionam
- Configure o servidor para redirecionar todas as rotas para `index.html`
- No Vercel: adicione `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Problema: Assets não carregam
- Verifique o `base` no `vite.config.ts`
- Para GitHub Pages: `base: '/sistema-trae/'`
- Para domínio próprio: `base: '/'`

## 📊 Monitoramento

Após o deploy, monitore:
- Performance (Lighthouse)
- Erros no console
- Acessos e uso
- Feedback dos usuários

## 🔄 Atualizações

Para atualizar o sistema:
```bash
git add .
git commit -m "Descrição da atualização"
git push origin main
# O deploy automático irá atualizar
```
