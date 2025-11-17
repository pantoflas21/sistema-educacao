# Dados de Teste - SISTEMA TRAE

Este arquivo contém informações sobre os dados de teste e usuários disponíveis no sistema.

## 👥 Usuários de Teste

### Administrador
- **Email**: `admin@trae.com`
- **Senha**: `admin123`
- **Role**: `Admin`
- **Acesso**: Painel Administrativo completo

### Professor
- **Email**: `professor@trae.com` ou qualquer email contendo `prof`
- **Senha**: `prof123`
- **Role**: `Teacher`
- **Acesso**: Painel do Professor (Bimestres → Turmas → Disciplinas → Ferramentas)

### Aluno
- **Email**: `aluno@trae.com`
- **Senha**: `aluno123`
- **Role**: `Student`
- **Acesso**: Painel do Aluno (Dashboard, Boletim, Frequência, Atividades, PedaCoins, Chat)

### Secretário
- **Email**: `secretario@trae.com` ou qualquer email contendo `secretario`
- **Senha**: `secret123`
- **Role**: `Secretary`
- **Acesso**: Painel da Secretaria (Alunos, Turmas, Calendário, Documentos, Comunicação)

### Tesoureiro
- **Email**: `tesouraria@trae.com` ou qualquer email contendo `tesouraria`
- **Senha**: `tesouro123`
- **Role**: `Treasury`
- **Acesso**: Painel da Tesouraria (Mensalidades, Faturas, Fluxo de Caixa, Relatórios)

### Secretário de Educação
- **Email**: `educacao@trae.com` ou qualquer email contendo `educacao`
- **Senha**: `educ123`
- **Role**: `EducationSecretary`
- **Acesso**: Painel do Secretário de Educação (Dashboard, Rede Escolar, Relatórios, Planejamento)

## 📊 Dados de Exemplo

### Bimestres
- **Bimestre 1**: Ativo (Janeiro - Março)
- **Bimestre 2**: Bloqueado (Abril - Junho)
- **Bimestre 3**: Bloqueado (Julho - Setembro)
- **Bimestre 4**: Bloqueado (Outubro - Dezembro)

### Turmas
- 7º A (Manhã) - 30 alunos
- 7º B (Tarde) - 28 alunos
- 8º A (Manhã) - 32 alunos
- 8º B (Tarde) - 29 alunos
- 9º A (Manhã) - 31 alunos

### Disciplinas
- **MAT** - Matemática
- **POR** - Português
- **HIS** - História
- **GEO** - Geografia
- **CIE** - Ciências

### Escolas (Rede Municipal)
- 49 escolas municipais cadastradas
- Status: Operacional, Manutenção, Paralisada
- Capacidade e ocupação variadas

## 🔐 Modo Demo

O sistema possui um modo demo ativado quando `AUTH_DEMO=true` no backend. Neste modo:
- Qualquer email pode ser usado para login
- O role é determinado pelo conteúdo do email:
  - `prof` → Teacher
  - `tesouraria` → Treasury
  - `secretario` → Secretary
  - `educacao` → EducationSecretary
  - Outros → Admin

## 🧪 Testando o Sistema

1. **Inicie o backend**:
   ```bash
   cd apps/backend
   npm install
   npm run dev
   ```

2. **Inicie o frontend**:
   ```bash
   cd apps/frontend
   npm install
   npm run dev
   ```

3. **Acesse**: `http://localhost:5173`

4. **Faça login** com qualquer um dos usuários acima

## 📱 Teste de Responsividade

O sistema foi desenvolvido com responsividade total:
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

Teste em diferentes dispositivos ou use as ferramentas de desenvolvedor do navegador.

## 🚀 Deploy

O sistema está pronto para deploy. Certifique-se de:
1. Configurar variáveis de ambiente
2. Configurar banco de dados
3. Executar migrations
4. Build do frontend: `npm run build`
5. Build do backend: `npm run build`

