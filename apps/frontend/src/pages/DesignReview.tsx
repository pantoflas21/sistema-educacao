import { Link } from "wouter";

export default function DesignReview() {
  const dashboards = [
    {
      title: "Painel Hierárquico",
      description: "Tela principal com acesso a todos os módulos",
      href: "/",
      gradient: "from-violet-600 via-indigo-600 to-fuchsia-600",
      icon: "🏠",
      features: ["Gradiente animado", "Glassmorphism", "Cards interativos", "Animações suaves"]
    },
    {
      title: "Painel Administrativo",
      description: "Métricas e monitoramento do sistema",
      href: "/admin",
      gradient: "from-indigo-600 via-blue-600 to-violet-600",
      icon: "🛡️",
      features: ["Cards com barras de progresso", "Indicadores de saúde", "Ações rápidas", "Estatísticas em tempo real"]
    },
    {
      title: "Painel do Aluno",
      description: "Dashboard estudantil com notas e frequência",
      href: "/student",
      gradient: "from-sky-600 via-indigo-600 to-blue-600",
      icon: "👤",
      features: ["Perfil do aluno", "Status acadêmico", "Acesso rápido", "Cards informativos"]
    },
    {
      title: "Secretaria Escolar",
      description: "Gestão administrativa completa",
      href: "/secretary",
      gradient: "from-indigo-600 via-blue-600 to-violet-600",
      icon: "📋",
      features: ["Estatísticas principais", "Módulos organizados", "Ações rápidas", "Badges coloridos"]
    }
  ];

  const improvements = [
    {
      category: "Animações e Transições",
      items: [
        "Fade-in suave em todos os elementos",
        "Hover effects interativos",
        "Gradientes animados",
        "Transições de 200-300ms",
        "Pulse suave em indicadores"
      ]
    },
    {
      category: "Componentes Modernos",
      items: [
        "Cards com sombras e bordas suaves",
        "Glassmorphism em elementos selecionados",
        "Botões com scale on hover",
        "Inputs com focus states",
        "Badges com cores dinâmicas"
      ]
    },
    {
      category: "Layout e Espaçamento",
      items: [
        "Grid responsivo (mobile-first)",
        "Espaçamento consistente",
        "Tipografia melhorada",
        "Gradientes de fundo sutis",
        "Max-width para legibilidade"
      ]
    },
    {
      category: "Cores e Visual",
      items: [
        "Paleta de cores harmoniosa",
        "Gradientes modernos",
        "Cores dinâmicas baseadas em status",
        "Contraste otimizado",
        "Ícones e emojis informativos"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/20">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-indigo-600 via-violet-600 to-fuchsia-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                🎨 Review de Design
              </div>
              <div className="text-white/90 text-lg">
                Visualize todas as melhorias implementadas no sistema Aletheia
              </div>
            </div>
            <Link href="/">
              <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer">
                Voltar ao Início
              </div>
            </Link>
          </div>
        </div>

        {/* Dashboards Disponíveis */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
            Dashboards Disponíveis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboards.map((dashboard, index) => (
              <Link key={dashboard.href} href={dashboard.href}>
                <div className="card-modern p-6 cursor-pointer group h-full fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${dashboard.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {dashboard.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-slate-800 mb-2">{dashboard.title}</div>
                      <div className="text-slate-600 text-sm mb-4">{dashboard.description}</div>
                      <div className="flex flex-wrap gap-2">
                        {dashboard.features.map((feature, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                    <span className="text-sm text-slate-600">Clique para visualizar</span>
                    <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Melhorias Implementadas */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
            Melhorias Implementadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {improvements.map((improvement, index) => (
              <div key={index} className="card-modern p-6 fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
                    ✨
                  </div>
                  <div className="text-xl font-bold text-slate-800">{improvement.category}</div>
                </div>
                <ul className="space-y-2">
                  {improvement.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="text-indigo-600 mt-1">•</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Classes CSS Disponíveis */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
            Classes CSS Utilitárias
          </h2>
          <div className="card-modern p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="font-mono text-sm font-semibold text-indigo-600 mb-2">.card-modern</div>
                <div className="text-xs text-slate-600">Card com hover effect e sombra</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="font-mono text-sm font-semibold text-indigo-600 mb-2">.card-gradient</div>
                <div className="text-xs text-slate-600">Card com gradiente animado</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="font-mono text-sm font-semibold text-indigo-600 mb-2">.btn-modern</div>
                <div className="text-xs text-slate-600">Botão com animação de scale</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="font-mono text-sm font-semibold text-indigo-600 mb-2">.input-modern</div>
                <div className="text-xs text-slate-600">Input com focus states</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="font-mono text-sm font-semibold text-indigo-600 mb-2">.fade-in</div>
                <div className="text-xs text-slate-600">Animação de entrada suave</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="font-mono text-sm font-semibold text-indigo-600 mb-2">.glass</div>
                <div className="text-xs text-slate-600">Efeito glassmorphism</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="font-mono text-sm font-semibold text-indigo-600 mb-2">.gradient-animated</div>
                <div className="text-xs text-slate-600">Gradiente com animação</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="font-mono text-sm font-semibold text-indigo-600 mb-2">.pulse-soft</div>
                <div className="text-xs text-slate-600">Pulso suave para indicadores</div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo de Componentes */}
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
            Demonstração de Componentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Moderno */}
            <div className="card-modern p-6">
              <div className="text-lg font-bold text-slate-800 mb-2">Card Moderno</div>
              <div className="text-sm text-slate-600 mb-4">Hover para ver o efeito</div>
              <div className="btn-modern bg-indigo-600 text-white w-full hover:bg-indigo-700 text-center">
                Botão Moderno
              </div>
            </div>

            {/* Card com Gradiente */}
            <div className="card-gradient from-blue-500 to-indigo-600 p-6">
              <div className="text-lg font-bold text-white mb-2">Card com Gradiente</div>
              <div className="text-sm text-white/90 mb-4">Gradiente animado</div>
              <div className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm font-medium inline-block">
                Badge
              </div>
            </div>

            {/* Input Moderno */}
            <div className="card-modern p-6">
              <div className="text-lg font-bold text-slate-800 mb-4">Input Moderno</div>
              <input 
                type="text" 
                placeholder="Digite algo..." 
                className="input-modern w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}










