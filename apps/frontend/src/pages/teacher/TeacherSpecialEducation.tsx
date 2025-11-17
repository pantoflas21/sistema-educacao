import { useState } from "react";
import { useRoute } from "wouter";

type Disorder = "tea" | "dislexia" | "tdah" | "todos";
type Subject = "matematica" | "portugues" | "historia" | "geografia" | "ciencias" | "todos";

const disorderInfo = {
  tea: {
    name: "TEA - Transtorno do Espectro Autista",
    icon: "🧩",
    symptoms: [
      "Dificuldade na interação social",
      "Comportamentos repetitivos",
      "Interesses restritos e intensos",
      "Dificuldade na comunicação verbal e não verbal",
      "Sensibilidade sensorial (luz, som, toque)"
    ],
    identification: [
      "Evita contato visual",
      "Não responde quando chamado pelo nome",
      "Dificuldade em entender expressões faciais",
      "Repete palavras ou frases (ecolalia)",
      "Fixa-se em objetos ou temas específicos",
      "Resistência a mudanças na rotina"
    ]
  },
  dislexia: {
    name: "Dislexia",
    icon: "📖",
    symptoms: [
      "Dificuldade na leitura e escrita",
      "Troca de letras ou sílabas",
      "Leitura lenta e com erros",
      "Dificuldade em soletrar",
      "Problemas de compreensão de texto"
    ],
    identification: [
      "Lê devagar e com muitos erros",
      "Troca letras (b/d, p/q)",
      "Inverte sílabas ou palavras",
      "Dificuldade em copiar do quadro",
      "Evita atividades de leitura",
      "Histórico familiar de dislexia"
    ]
  },
  tdah: {
    name: "TDAH - Transtorno de Déficit de Atenção e Hiperatividade",
    icon: "⚡",
    symptoms: [
      "Dificuldade de concentração",
      "Hiperatividade ou impulsividade",
      "Desorganização",
      "Esquecimento frequente",
      "Dificuldade em seguir instruções"
    ],
    identification: [
      "Não consegue manter atenção por muito tempo",
      "Se distrai facilmente",
      "Agitação constante (mexe pés, mãos)",
      "Interrompe conversas",
      "Dificuldade em organizar tarefas",
      "Perde materiais escolares frequentemente"
    ]
  }
};

const subjectTips: Record<Subject, Record<Disorder, string[]>> = {
  matematica: {
    tea: [
      "Use objetos concretos e manipulativos",
      "Crie rotinas visuais para resolução de problemas",
      "Forneça exemplos passo a passo",
      "Use cores para destacar operações diferentes",
      "Evite sobrecarga sensorial (ruídos, luzes)"
    ],
    dislexia: [
      "Permita uso de calculadora",
      "Use problemas com contexto visual",
      "Evite leitura extensa de enunciados",
      "Destaque palavras-chave dos problemas",
      "Use gráficos e tabelas ao invés de texto"
    ],
    tdah: [
      "Divida problemas em etapas menores",
      "Use timer para manter foco",
      "Permita movimento durante resolução",
      "Dê feedback imediato",
      "Use cores e destaques visuais"
    ],
    todos: []
  },
  portugues: {
    tea: [
      "Use histórias sociais e visuais",
      "Crie rotinas de leitura previsíveis",
      "Use tecnologia assistiva (texto para voz)",
      "Permita comunicação alternativa",
      "Use materiais com imagens claras"
    ],
    dislexia: [
      "Use fonte maior e espaçamento adequado",
      "Permita leitura em voz alta",
      "Use áudio-livros",
      "Evite cópias extensas do quadro",
      "Destaque sílabas e sons"
    ],
    tdah: [
      "Divida textos em parágrafos menores",
      "Use marcadores e destaques",
      "Permita leitura em movimento",
      "Use perguntas guiadas",
      "Dê pausas frequentes"
    ],
    todos: []
  },
  historia: {
    tea: [
      "Use linha do tempo visual",
      "Crie mapas mentais coloridos",
      "Use vídeos e imagens",
      "Estabeleça conexões com interesses do aluno",
      "Evite mudanças bruscas de tema"
    ],
    dislexia: [
      "Use áudio e vídeo ao invés de texto",
      "Permita apresentações orais",
      "Use mapas e infográficos",
      "Destaque datas e nomes importantes",
      "Evite leitura longa de documentos"
    ],
    tdah: [
      "Use jogos e atividades interativas",
      "Crie debates e discussões",
      "Use vídeos curtos e dinâmicos",
      "Permita movimento durante aula",
      "Use quizzes rápidos"
    ],
    todos: []
  },
  geografia: {
    tea: [
      "Use mapas físicos e globos",
      "Crie rotas visuais",
      "Use realidade aumentada quando possível",
      "Conecte com lugares conhecidos",
      "Use cores consistentes nos mapas"
    ],
    dislexia: [
      "Use mapas interativos",
      "Permita apresentações orais",
      "Use vídeos e documentários",
      "Evite leitura de textos longos",
      "Destaque informações-chave"
    ],
    tdah: [
      "Use atividades práticas com mapas",
      "Crie jogos de localização",
      "Permita movimento e exploração",
      "Use tecnologia interativa",
      "Divida conteúdo em partes menores"
    ],
    todos: []
  },
  ciencias: {
    tea: [
      "Use experimentos práticos e visuais",
      "Crie sequências visuais de procedimentos",
      "Use materiais concretos",
      "Estabeleça rotinas de laboratório",
      "Evite estímulos sensoriais intensos"
    ],
    dislexia: [
      "Use vídeos de experimentos",
      "Permita explicações orais",
      "Use diagramas e esquemas",
      "Evite leitura técnica extensa",
      "Destaque termos científicos"
    ],
    tdah: [
      "Use experimentos práticos e interativos",
      "Permita movimento durante atividades",
      "Use laboratórios e saídas de campo",
      "Dê feedback imediato",
      "Use atividades em grupo"
    ],
    todos: []
  },
  todos: {
    tea: [],
    dislexia: [],
    tdah: [],
    todos: []
  }
};

export default function TeacherSpecialEducation() {
  const [, params] = useRoute("/teacher/:termId/classes/:classId/subjects/:subjectId");
  const [selectedDisorder, setSelectedDisorder] = useState<Disorder>("todos");
  const [selectedSubject, setSelectedSubject] = useState<Subject>("todos");
  const [activeTab, setActiveTab] = useState<"identificar" | "estrategias">("identificar");

  const currentSubject = params?.subjectId || "todos";
  const subjectMap: Record<string, Subject> = {
    "mat": "matematica",
    "por": "portugues",
    "his": "historia",
    "geo": "geografia",
    "cie": "ciencias"
  };
  const mappedSubject = subjectMap[currentSubject] || "todos";

  const tips = selectedSubject === "todos" 
    ? (subjectTips[mappedSubject]?.[selectedDisorder] || [])
    : (subjectTips[selectedSubject]?.[selectedDisorder] || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-purple-600 via-indigo-600 to-blue-600 p-6 md:p-8 mb-6 md:mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 md:gap-4 mb-3">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-2xl md:text-3xl">🤝</span>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-1">
                    Assistente de Educação Especial
                  </div>
                  <div className="text-white/90 text-xs md:text-sm lg:text-base">
                    Dicas e estratégias para inclusão educacional
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("identificar")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all ${
              activeTab === "identificar"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            🔍 Como Identificar
          </button>
          <button
            onClick={() => setActiveTab("estrategias")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all ${
              activeTab === "estrategias"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            💡 Estratégias de Ensino
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Transtorno</label>
            <select
              value={selectedDisorder}
              onChange={(e) => setSelectedDisorder(e.target.value as Disorder)}
              className="input-modern w-full"
            >
              <option value="todos">Todos os Transtornos</option>
              <option value="tea">TEA - Transtorno do Espectro Autista</option>
              <option value="dislexia">Dislexia</option>
              <option value="tdah">TDAH</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Disciplina</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as Subject)}
              className="input-modern w-full"
            >
              <option value="todos">Todas as Disciplinas</option>
              <option value="matematica">Matemática</option>
              <option value="portugues">Português</option>
              <option value="historia">História</option>
              <option value="geografia">Geografia</option>
              <option value="ciencias">Ciências</option>
            </select>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="fade-in">
          {/* Como Identificar */}
          {activeTab === "identificar" && (
            <div className="space-y-6">
              {selectedDisorder === "todos" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {Object.entries(disorderInfo).map(([key, info]) => (
                    <div key={key} className="card-modern p-6">
                      <div className="text-4xl mb-3">{info.icon}</div>
                      <h3 className="text-xl font-bold text-slate-800 mb-4">{info.name}</h3>
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-slate-700 mb-2">Sinais de Alerta:</div>
                        {info.identification.slice(0, 3).map((item, i) => (
                          <div key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setSelectedDisorder(key as Disorder)}
                        className="btn-modern bg-purple-600 text-white hover:bg-purple-700 w-full mt-4 text-sm"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-modern p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl">{disorderInfo[selectedDisorder].icon}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">
                        {disorderInfo[selectedDisorder].name}
                      </h3>
                      <p className="text-slate-600 mt-1">Informações para identificação</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-3">Sintomas Principais</h4>
                      <div className="space-y-2">
                        {disorderInfo[selectedDisorder].symptoms.map((symptom, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-lg">
                            <div className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-purple-600 mt-1">•</span>
                              <span>{symptom}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-3">Como Identificar na Sala de Aula</h4>
                      <div className="space-y-2">
                        {disorderInfo[selectedDisorder].identification.map((item, i) => (
                          <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-blue-600 font-bold mt-1">✓</span>
                              <span>{item}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Estratégias de Ensino */}
          {activeTab === "estrategias" && (
            <div className="space-y-6">
              {tips.length > 0 ? (
                <div className="card-modern p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Estratégias para {selectedSubject !== "todos" ? selectedSubject : mappedSubject}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tips.map((tip, i) => (
                      <div key={i} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                        <div className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-purple-600 font-bold mt-1">{i + 1}.</span>
                          <span>{tip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card-modern p-8 text-center">
                  <div className="text-4xl mb-4">💡</div>
                  <div className="text-slate-600 mb-4">
                    Selecione um transtorno e uma disciplina para ver estratégias específicas
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDisorder("tea");
                      setSelectedSubject(mappedSubject !== "todos" ? mappedSubject : "matematica");
                    }}
                    className="btn-modern bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Ver Estratégias Sugeridas
                  </button>
                </div>
              )}

              {/* Dicas Gerais */}
              <div className="card-modern p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span>🌟</span>
                  Dicas Gerais para Inclusão
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Crie um ambiente acolhedor e previsível",
                    "Use comunicação clara e objetiva",
                    "Dê tempo adequado para processamento",
                    "Valorize pequenos progressos",
                    "Adapte materiais quando necessário",
                    "Mantenha comunicação com a família"
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span className="text-sm text-slate-700">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

