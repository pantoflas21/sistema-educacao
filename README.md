# 🎓 Aletheia - Sistema de Gestão Educacional Integrada

![Aletheia Logo](./apps/frontend/public/aletheia-logo.svg)

Sistema completo de gestão educacional desenvolvido para gerenciar escolas, alunos, professores, secretaria, tesouraria e secretaria de educação municipal.

## 🌟 Características

- ✅ **Gestão Completa**: 6 painéis especializados (Administração, Secretaria, Tesouraria, Professores, Alunos e Secretaria de Educação)
- ✅ **Interface Moderna**: Design responsivo, intuitivo e acessível
- ✅ **Multi-plataforma**: Funciona perfeitamente em desktop, tablet e mobile
- ✅ **Segurança Robusta**: JWT, validação de entrada, CORS configurado, rate limiting
- ✅ **Persistência de Dados**: Banco de dados PostgreSQL com Drizzle ORM
- ✅ **Deploy Automático**: Pronto para produção na Vercel
- ✅ **Pronto para Comercialização**: Sistema completo e testado

## 📋 Hierarquia do Sistema

### Escolas Públicas:
- **Secretário de Educação** → Gestão municipal da rede (múltiplas escolas)
- **Administrador** → Gestão da escola individual
- **Tesouraria/Secretaria/Professor/Aluno** → Operações diárias

### Escolas Privadas:
- **Administrador** → Dono/diretor da escola
- **Tesouraria/Secretaria/Professor/Aluno** → Operações diárias

**Nota Importante:** Planos de aula são recebidos e avaliados pela **Secretaria da Escola**, não pelo Secretário de Educação.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ instalado: [https://nodejs.org](https://nodejs.org)
- Git instalado: [https://git-scm.com](https://git-scm.com)

### Instalação

1. **Clone o repositório** (ou baixe e extraia)
   ```bash
   git clone https://github.com/SEU_USUARIO/aletheia.git
   cd aletheia
   ```

2. **Instale as dependências**
   ```bash
   # Instalar dependências do projeto principal
   npm install
   
   # Instalar dependências do backend
   cd apps/backend
   npm install
   
   # Instalar dependências do frontend
   cd ../frontend
   npm install
   ```

3. **Execute em desenvolvimento**
   ```bash
   # Na pasta raiz do projeto
   npm run dev
   ```

   O sistema estará disponível em:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## 📁 Estrutura do Projeto

```
aletheia/
├── apps/
│   ├── backend/          # API Backend (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts  # Servidor principal (desenvolvimento)
│   │   │   └── api.ts    # Rotas da API (produção)
│   │   └── package.json
│   │
│   └── frontend/         # Frontend React (Vite + TypeScript)
│       ├── src/
│       │   ├── pages/    # Páginas do sistema
│       │   └── App.tsx
│       └── package.json
│
├── api/                  # Serverless Functions (Vercel)
│   └── [...path].ts
│
├── vercel.json          # Configuração Vercel
└── package.json         # Dependências principais
```

## 🌐 Deploy na Vercel

### Deploy Automático via GitHub

1. **Faça push do código para o GitHub**
   ```bash
   git add .
   git commit -m "Deploy do Aletheia"
   git push
   ```

2. **Conecte na Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Import Project"
   - Selecione seu repositório do GitHub
   - A Vercel detectará automaticamente a configuração

3. **Configure Variáveis de Ambiente (OBRIGATÓRIAS)**
   
   **CRÍTICO PARA PRODUÇÃO:**
   - `JWT_SECRET` - String segura com mínimo de 32 caracteres (OBRIGATÓRIO)
   - `CORS_ORIGIN` - URLs permitidas separadas por vírgula (ex: `https://seu-dominio.vercel.app`)
   - `DATABASE_URL` - URL do PostgreSQL (obrigatório para persistência de dados)
   - `NODE_ENV=production` - Ambiente de produção
   
   **OPCIONAL:**
   - `AUTH_DEMO=true` - Apenas para desenvolvimento/testes (NÃO usar em produção)
   - `JWT_EXPIRES_IN=7d` - Tempo de expiração do token (padrão: 7 dias)

4. **Deploy!**
   - Clique em "Deploy"
   - Aguarde alguns minutos
   - Seu site estará online! 🎉

### Configuração Manual

Veja o arquivo `GUIA_COMPLETO_INSTALACAO_E_DEPLOY.md` para instruções detalhadas passo a passo.

## 🎨 Identidade Visual

O Aletheia utiliza uma paleta de cores moderna:
- **Laranja Vibrante**: `#FF6B35` - Cor principal da logo
- **Verde Esmeralda**: `#10B981` - Destaque no "A" de Aletheia
- **Azul Médio**: `#3B82F6` - Cor secundária

## 📚 Módulos do Sistema

### 👨‍💼 Administração
- Gestão de usuários
- Estatísticas do sistema
- Configurações gerais

### 📋 Secretaria
- Cadastro de alunos
- Gestão de turmas
- Matrículas e transferências
- Calendário escolar
- Geração de documentos
- **Receber e avaliar planos de aula dos professores**

### 💰 Tesouraria
- Planos de mensalidade
- Geração de boletos
- Controle de pagamentos
- Fluxo de caixa
- Relatórios financeiros

### 👨‍🏫 Professores
- Gestão de turmas e disciplinas
- Controle de frequência
- Lançamento de notas
- Criação de provas
- Assistente de educação especial

### 👨‍🎓 Alunos
- Visualização de boletim
- Controle de frequência
- Atividades e tarefas
- Sistema PedaCoins
- Chat com professores

### 🏛️ Secretaria de Educação (Apenas Escolas Públicas)
- Gestão municipal de escolas (múltiplas escolas)
- Relatórios e métricas consolidados
- Planejamento educacional municipal
- Rankings e indicadores
- **NÃO recebe planos de aula** (função da Secretaria da Escola)

## 🔐 Segurança

### Configuração de Produção

**⚠️ IMPORTANTE:** Para produção, configure as seguintes variáveis de ambiente:

1. **JWT_SECRET** (OBRIGATÓRIO)
   - Mínimo de 32 caracteres
   - Use uma string aleatória e segura
   - Exemplo: `openssl rand -base64 32`

2. **CORS_ORIGIN** (OBRIGATÓRIO)
   - Lista de origens permitidas separadas por vírgula
   - Exemplo: `https://seu-dominio.vercel.app,https://www.seu-dominio.com`

3. **DATABASE_URL** (OBRIGATÓRIO para persistência)
   - URL completa do PostgreSQL
   - Exemplo: `postgresql://user:password@host:5432/database`

4. **NODE_ENV=production**
   - Define ambiente de produção
   - Desabilita modo demo automaticamente

### Modo Demo (Apenas Desenvolvimento)

Para testes rápidos, o sistema tem modo demo ativado com `AUTH_DEMO=true`:

- Email com `tesouraria` → Perfil Tesouraria
- Email com `prof` → Perfil Professor
- Email com `secretario` → Perfil Secretário
- Email com `educacao` → Perfil Secretaria de Educação
- Outros emails → Perfil Admin

Senha: qualquer valor (não é validada no modo demo)

**⚠️ NUNCA use `AUTH_DEMO=true` em produção!**

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento (roda frontend e backend)
npm run dev

# Build do backend
npm run build:backend

# Build do frontend
npm run build:frontend

# Build completo
npm run build

# Rodar apenas backend
npm run dev:backend

# Rodar apenas frontend
npm run dev:frontend
```

## 🗄️ Banco de Dados

### Migrations

O sistema usa Drizzle ORM para gerenciar o banco de dados. As migrations estão em `apps/backend/drizzle/migrations/`.

Para executar migrations:
```bash
cd apps/backend
npm run drizzle-kit migrate
```

### Tabelas Principais

- `users` - Usuários do sistema
- `schools` - Escolas
- `classes` - Turmas
- `subjects` - Disciplinas
- `enrollments` - Matrículas
- `invoices` - Faturas/Mensalidades
- `lessons` - Aulas criadas pelos professores
- `attendance` - Presenças dos alunos
- `grades` - Notas dos alunos

## 🔒 Melhorias de Segurança Implementadas

- ✅ JWT Secret obrigatório e validado
- ✅ CORS configurado com origens específicas
- ✅ Validação de entrada com Zod em todos os endpoints
- ✅ Rate limiting implementado
- ✅ Sanitização de dados de entrada
- ✅ Headers de segurança (Helmet)
- ✅ Proteção contra enumeração de usuários

## 📖 Documentação Adicional

- `GUIA_COMPLETO_INSTALACAO_E_DEPLOY.md` - Guia passo a passo completo
- `DEPLOY_VERCEL_FIX.md` - Correções de deploy
- `DEPLOY_VERCEL.md` - Guia de deploy na Vercel
- `RESUMO_MELHORIAS_IMPLEMENTADAS.md` - Resumo das melhorias recentes

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e de uso interno.

## 👨‍💻 Autor

Desenvolvido para gestão educacional integrada.

---

**Aletheia** - *Verdade e conhecimento em gestão educacional* 🎓
