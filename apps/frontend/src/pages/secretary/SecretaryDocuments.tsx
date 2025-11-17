import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type Student = { id: string; name: string; matricula: string; classId?: string };
type DocumentTemplate = {
  id: string;
  name: string;
  type: "declaracao_matricula" | "boletim_oficial" | "historico" | "certificado_conclusao";
  description: string;
};

export default function SecretaryDocuments() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const studentsQ = useQuery<Student[]>({ 
    queryKey: ["sec","students"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/students"); 
      return r.json(); 
    } 
  });

  const templatesQ = useQuery<DocumentTemplate[]>({ 
    queryKey: ["sec","document-templates"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/documents/templates"); 
      return r.json(); 
    } 
  });

  const generateM = useMutation({ 
    mutationFn: async (payload: any) => { 
      const r = await fetch("/api/secretary/documents/generate", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      }); 
      return r.json(); 
    } 
  });

  const getDocumentIcon = (type: DocumentTemplate["type"]) => {
    switch (type) {
      case "declaracao_matricula": return "📋";
      case "boletim_oficial": return "📊";
      case "historico": return "📚";
      case "certificado_conclusao": return "🎓";
    }
  };

  const getDocumentLabel = (type: DocumentTemplate["type"]) => {
    switch (type) {
      case "declaracao_matricula": return "Declaração de Matrícula";
      case "boletim_oficial": return "Boletim Oficial";
      case "historico": return "Histórico Escolar";
      case "certificado_conclusao": return "Certificado de Conclusão";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-indigo-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-indigo-600 via-blue-600 to-violet-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Documentos e Certificados</div>
                  <div className="text-white/90 text-sm md:text-base">Geração automática de documentos oficiais</div>
                </div>
              </div>
            </div>
            <Link href="/secretary">
              <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer">
                ← Voltar
              </div>
            </Link>
          </div>
        </div>

        {/* Templates de Documentos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
            Modelos de Documentos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(templatesQ.data || [
              { id: "1", type: "declaracao_matricula", name: "Declaração de Matrícula", description: "Documento oficial de matrícula" },
              { id: "2", type: "boletim_oficial", name: "Boletim Oficial", description: "Boletim com notas e frequência" },
              { id: "3", type: "historico", name: "Histórico Escolar", description: "Histórico completo do aluno" },
              { id: "4", type: "certificado_conclusao", name: "Certificado de Conclusão", description: "Certificado de conclusão de curso" },
            ]).map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.type)}
                className={`card-modern p-6 cursor-pointer transition-all ${
                  selectedTemplate === template.type ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                }`}
              >
                <div className="text-4xl mb-3">{getDocumentIcon(template.type)}</div>
                <div className="text-lg font-bold text-slate-800 mb-2">{template.name}</div>
                <div className="text-sm text-slate-600">{template.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário de Geração */}
        {selectedTemplate && (
          <div className="card-modern p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Gerar {getDocumentLabel(selectedTemplate as DocumentTemplate["type"])}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target as any);
                generateM.mutate({
                  type: selectedTemplate,
                  studentId: String(fd.get("studentId") || ""),
                  includeSignature: fd.get("includeSignature") === "on",
                  includeVerificationCode: fd.get("includeVerificationCode") === "on"
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar Aluno *</label>
                <select
                  name="studentId"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="input-modern w-full"
                  required
                >
                  <option value="">Selecione um aluno...</option>
                  {(studentsQ.data || []).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - Matrícula: {s.matricula || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="includeSignature" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-slate-700">Incluir assinatura digital</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="includeVerificationCode" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-slate-700">Incluir código de verificação</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1">
                  📄 Gerar Documento
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  👁️ Visualizar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resultado da Geração */}
        {generateM.data && (
          <div className="card-modern p-6 bg-emerald-50 border-emerald-200">
            <div className="flex items-start gap-4">
              <div className="text-4xl">✅</div>
              <div className="flex-1">
                <div className="font-bold text-emerald-800 mb-2">Documento gerado com sucesso!</div>
                <div className="space-y-2 text-sm text-emerald-700">
                  <div><strong>Tipo:</strong> {getDocumentLabel(generateM.data.type)}</div>
                  {generateM.data.verificationCode && (
                    <div><strong>Código de Verificação:</strong> {generateM.data.verificationCode}</div>
                  )}
                  {generateM.data.fileUrl && (
                    <div>
                      <a
                        href={generateM.data.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        📥 Baixar Documento (PDF)
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configurações de Modelo */}
        <div className="card-modern p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Personalização de Modelos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cabeçalho da Escola</label>
              <textarea
                className="input-modern w-full h-24"
                placeholder="Digite o cabeçalho personalizado..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rodapé</label>
              <textarea
                className="input-modern w-full h-24"
                placeholder="Digite o rodapé personalizado..."
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload de Logo da Escola</label>
            <input type="file" accept="image/*" className="input-modern w-full" />
          </div>
          <button className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 mt-4">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
