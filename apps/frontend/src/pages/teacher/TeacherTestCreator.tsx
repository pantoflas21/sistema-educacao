import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";

type Test = {
  id: string;
  title: string;
  subjectId: string;
  classId: string;
  content: string;
  createdAt: string;
  savedAt?: string;
};

export default function TeacherTestCreator() {
  const [, params] = useRoute("/teacher/:termId/classes/:classId/subjects/:subjectId");
  const classId = params?.classId || "";
  const subjectId = params?.subjectId || "";
  const editorRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [testTitle, setTestTitle] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const testsQ = useQuery<Test[]>({
    queryKey: ["teacher", "tests", classId, subjectId],
    queryFn: async () => {
      const r = await fetch(`/api/teacher/tests?classId=${classId}&subjectId=${subjectId}`);
      return r.json();
    }
  });

  const templatesQ = useQuery<Test[]>({
    queryKey: ["teacher", "test-templates", subjectId],
    queryFn: async () => {
      const r = await fetch(`/api/teacher/test-templates?subjectId=${subjectId}`);
      return r.json();
    },
    enabled: showTemplates
  });

  const saveTest = useMutation({
    mutationFn: async (payload: Partial<Test>) => {
      const r = await fetch("/api/teacher/tests", {
        method: currentTest ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          id: currentTest?.id,
          classId,
          subjectId,
          content: editorRef.current?.innerHTML || ""
        })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "tests", classId, subjectId] });
      setCurrentTest(null);
      setTestTitle("");
      if (editorRef.current) editorRef.current.innerHTML = "<p>Comece a digitar sua prova aqui...</p>";
    }
  });

  const loadTemplate = (template: Test) => {
    setTestTitle(template.title);
    if (editorRef.current) {
      editorRef.current.innerHTML = template.content || "<p>Comece a digitar sua prova aqui...</p>";
    }
    setShowTemplates(false);
  };

  const loadTest = (test: Test) => {
    setCurrentTest(test);
    setTestTitle(test.title);
    if (editorRef.current) {
      editorRef.current.innerHTML = test.content || "<p>Comece a digitar sua prova aqui...</p>";
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertQuestion = (type: "multiple_choice" | "essay" | "true_false") => {
    const editor = editorRef.current;
    if (!editor) return;

    let html = "";
    switch (type) {
      case "multiple_choice":
        html = `
          <div class="question-block p-3 md:p-4 my-3 md:my-4 border-l-4 border-blue-500 bg-blue-50 rounded">
            <div class="font-semibold mb-2 text-sm md:text-base">Questão (Múltipla Escolha)</div>
            <div class="mb-3 text-sm md:text-base">[Digite a pergunta aqui]</div>
            <div class="space-y-2 ml-2 md:ml-4 text-sm md:text-base">
              <div>A) [Alternativa A]</div>
              <div>B) [Alternativa B]</div>
              <div>C) [Alternativa C]</div>
              <div>D) [Alternativa D]</div>
              <div>E) [Alternativa E]</div>
            </div>
          </div>
        `;
        break;
      case "essay":
        html = `
          <div class="question-block p-3 md:p-4 my-3 md:my-4 border-l-4 border-green-500 bg-green-50 rounded">
            <div class="font-semibold mb-2 text-sm md:text-base">Questão (Dissertativa)</div>
            <div class="mb-3 text-sm md:text-base">[Digite a pergunta aqui]</div>
            <div class="border-t border-green-300 pt-3 mt-3">
              <div class="text-xs md:text-sm text-slate-600">Espaço para resposta:</div>
              <div class="min-h-[80px] md:min-h-[100px] border border-green-300 rounded p-2 bg-white mt-2"></div>
            </div>
          </div>
        `;
        break;
      case "true_false":
        html = `
          <div class="question-block p-3 md:p-4 my-3 md:my-4 border-l-4 border-purple-500 bg-purple-50 rounded">
            <div class="font-semibold mb-2 text-sm md:text-base">Questão (Verdadeiro/Falso)</div>
            <div class="mb-3 text-sm md:text-base">[Digite a afirmação aqui]</div>
            <div class="space-y-2 ml-2 md:ml-4 text-sm md:text-base">
              <div>( ) Verdadeiro</div>
              <div>( ) Falso</div>
            </div>
          </div>
        `;
        break;
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const div = document.createElement("div");
      div.innerHTML = html;
      range.insertNode(div);
    } else {
      editor.innerHTML += html;
    }
    editor.focus();
  };

  const exportPDF = () => {
    const content = editorRef.current?.innerHTML || "";
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${testTitle || "Prova"}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none; }
              }
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1 { text-align: center; margin-bottom: 30px; }
              .question-block { margin: 20px 0; padding: 15px; border-left: 4px solid #3b82f6; background: #f0f9ff; page-break-inside: avoid; }
            </style>
          </head>
          <body>
            <h1>${testTitle || "Prova"}</h1>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6 xl:p-8">
        {/* Header */}
        <div className="card-gradient from-blue-600 via-indigo-600 to-purple-600 p-4 md:p-6 lg:p-8 mb-4 md:mb-6 lg:mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 lg:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 md:gap-3 lg:gap-4 mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-xl md:text-2xl lg:text-3xl">📝</span>
                </div>
                <div>
                  <div className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white mb-1">
                    Criador de Provas
                  </div>
                  <div className="text-white/90 text-xs md:text-sm lg:text-base">
                    Editor de provas com interface tipo Word
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {/* Sidebar - Mobile First */}
          <div className={`lg:col-span-1 space-y-3 md:space-y-4 ${isMobile ? 'order-2' : 'order-1'}`}>
            {/* Salvar Prova */}
            <div className="card-modern p-3 md:p-4">
              <h3 className="font-bold text-slate-800 mb-2 md:mb-3 text-sm md:text-base">Nova Prova</h3>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Título da prova"
                className="input-modern w-full mb-2 md:mb-3 text-xs md:text-sm"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => saveTest.mutate({ title: testTitle })}
                  className="btn-modern bg-blue-600 text-white hover:bg-blue-700 flex-1 text-xs md:text-sm"
                >
                  💾 Salvar
                </button>
                <button
                  onClick={() => {
                    setCurrentTest(null);
                    setTestTitle("");
                    if (editorRef.current) editorRef.current.innerHTML = "<p>Comece a digitar sua prova aqui...</p>";
                  }}
                  className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs md:text-sm"
                >
                  Novo
                </button>
              </div>
            </div>

            {/* Provas Salvas */}
            <div className="card-modern p-3 md:p-4">
              <h3 className="font-bold text-slate-800 mb-2 md:mb-3 text-sm md:text-base">Provas Salvas</h3>
              <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto scrollbar-thin">
                {(testsQ.data || []).map((test) => (
                  <div
                    key={test.id}
                    onClick={() => loadTest(test)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors text-xs md:text-sm ${
                      currentTest?.id === test.id
                        ? "bg-blue-100 border border-blue-300"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-medium text-slate-800 truncate">{test.title}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(test.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                ))}
                {(!testsQ.data || testsQ.data.length === 0) && (
                  <div className="text-xs text-slate-500 text-center py-4">Nenhuma prova salva</div>
                )}
              </div>
            </div>

            {/* Templates */}
            <div className="card-modern p-3 md:p-4">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="btn-modern bg-purple-600 text-white hover:bg-purple-700 w-full text-xs md:text-sm"
              >
                📋 {showTemplates ? "Ocultar" : "Ver"} Templates
              </button>
              {showTemplates && (
                <div className="mt-2 md:mt-3 space-y-2 max-h-40 md:max-h-48 overflow-y-auto scrollbar-thin">
                  {(templatesQ.data || []).map((template) => (
                    <div
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className="p-2 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors text-xs md:text-sm"
                    >
                      <div className="font-medium text-slate-800 truncate">{template.title}</div>
                    </div>
                  ))}
                  {(!templatesQ.data || templatesQ.data.length === 0) && (
                    <div className="text-xs text-slate-500 text-center py-2">Nenhum template disponível</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Editor - Mobile First */}
          <div className={`lg:col-span-3 ${isMobile ? 'order-1' : 'order-2'}`}>
            <div className="card-modern p-0 overflow-hidden">
              {/* Toolbar - Responsivo */}
              <div className="bg-slate-100 p-2 md:p-3 border-b border-slate-200 flex flex-wrap gap-1 md:gap-2 overflow-x-auto scrollbar-thin">
                <div className="flex items-center gap-1 border-r border-slate-300 pr-1 md:pr-2">
                  <button
                    onClick={() => formatText("bold")}
                    className="px-2 py-1 rounded hover:bg-slate-200 text-xs md:text-sm font-bold"
                    title="Negrito"
                  >
                    B
                  </button>
                  <button
                    onClick={() => formatText("italic")}
                    className="px-2 py-1 rounded hover:bg-slate-200 text-xs md:text-sm italic"
                    title="Itálico"
                  >
                    I
                  </button>
                  <button
                    onClick={() => formatText("underline")}
                    className="px-2 py-1 rounded hover:bg-slate-200 text-xs md:text-sm underline"
                    title="Sublinhado"
                  >
                    U
                  </button>
                </div>
                <div className="flex items-center gap-1 border-r border-slate-300 pr-1 md:pr-2">
                  <select
                    onChange={(e) => formatText("fontSize", e.target.value)}
                    className="px-1 md:px-2 py-1 rounded border border-slate-300 text-xs md:text-sm"
                  >
                    <option value="3">P</option>
                    <option value="4">N</option>
                    <option value="5">G</option>
                    <option value="6">M</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 border-r border-slate-300 pr-1 md:pr-2">
                  <button
                    onClick={() => formatText("justifyLeft")}
                    className="px-2 py-1 rounded hover:bg-slate-200 text-xs md:text-sm"
                    title="Alinhar à esquerda"
                  >
                    ⬅
                  </button>
                  <button
                    onClick={() => formatText("justifyCenter")}
                    className="px-2 py-1 rounded hover:bg-slate-200 text-xs md:text-sm"
                    title="Centralizar"
                  >
                    ⬌
                  </button>
                  <button
                    onClick={() => formatText("justifyRight")}
                    className="px-2 py-1 rounded hover:bg-slate-200 text-xs md:text-sm"
                    title="Alinhar à direita"
                  >
                    ➡
                  </button>
                </div>
                <div className="flex items-center gap-1 border-r border-slate-300 pr-1 md:pr-2">
                  <button
                    onClick={() => insertQuestion("multiple_choice")}
                    className="px-1 md:px-2 py-1 rounded hover:bg-slate-200 text-xs"
                    title="Questão Múltipla Escolha"
                  >
                    A-B-C
                  </button>
                  <button
                    onClick={() => insertQuestion("essay")}
                    className="px-1 md:px-2 py-1 rounded hover:bg-slate-200 text-xs"
                    title="Questão Dissertativa"
                  >
                    📝
                  </button>
                  <button
                    onClick={() => insertQuestion("true_false")}
                    className="px-1 md:px-2 py-1 rounded hover:bg-slate-200 text-xs"
                    title="Verdadeiro/Falso"
                  >
                    ✓✗
                  </button>
                </div>
                <button
                  onClick={exportPDF}
                  className="px-2 md:px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs md:text-sm ml-auto"
                >
                  📄 PDF
                </button>
              </div>

              {/* Editor Area - Responsivo - Estilo Word */}
              <div
                ref={editorRef}
                contentEditable
                className="min-h-[300px] md:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px] p-3 md:p-4 lg:p-6 xl:p-8 focus:outline-none prose max-w-none overflow-x-auto bg-white"
                style={{
                  fontFamily: "'Times New Roman', 'Liberation Serif', serif",
                  fontSize: isMobile ? "14px" : "16px",
                  lineHeight: "1.5",
                  wordBreak: "break-word",
                  boxShadow: "inset 0 0 0 1px #e5e7eb",
                  background: "#fff",
                  color: "#000"
                }}
                onInput={() => {
                  // Auto-save pode ser implementado aqui
                }}
              >
                <p style={{ margin: "0 0 12px 0", textAlign: "justify" }}>Comece a digitar sua prova aqui...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
