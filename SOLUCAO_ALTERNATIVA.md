# 🔧 Solução Alternativa: Se o Script Node.js Não Funcionar

## Se o `build.js` ainda der erro, use esta configuração:

### Opção 1: Configurar Root Directory na Vercel (Interface Web)

1. Acesse [vercel.com](https://vercel.com)
2. Vá no projeto → **Settings** → **General**
3. Em **Root Directory**, digite: `apps/frontend`
4. Salve
5. Faça um novo deploy

Isso faz a Vercel trabalhar diretamente na pasta do frontend, sem precisar de `cd`.

### Opção 2: Simplificar o vercel.json

Se a Opção 1 não funcionar, use este `vercel.json` simplificado:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

E configure na interface da Vercel:
- **Root Directory**: `apps/frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

**Tente primeiro o build.js. Se não funcionar, use a Opção 1! 🎯**


