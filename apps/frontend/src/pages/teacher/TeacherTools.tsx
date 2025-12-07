import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useState } from "react";
import TeacherSpecialEducation from "./TeacherSpecialEducation";
import TeacherTestCreator from "./TeacherTestCreator";

type Student = { id: string; name: string; matricula: string; photoUrl?: string | null };
type Lesson = { 
  id: string; 
  classId: string; 
  subjectId: string; 
  title: string; 
  content: string; 
  lessonDate: string;
  startTime?: string;
  endTime?: string;
  objectives?: string;
  methodology?: string;
  resources?: string;
};
type GradeRow = { studentId: string; name: string; n1: number; n2: number; n3: number; n4: number; average: number };
type AttendanceRecord = { studentId: string; status: "P" | "F" | "J"; date: string };

export default function TeacherTools() {
  const [, params] = useRoute("/teacher/:termId/classes/:classId/subjects/:subjectId");
  const termId = params?.termId || "";
  const classId = params?.classId || "";
  const subjectId = params?.subjectId || "";
  const [tab, setTab] = useState<"aulas" | "chamada" | "notas" | "provas" | "educacao-especial">("aulas");
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const qc = useQueryClient();

  const studentsQ = useQuery<Student[]>({ 
    queryKey: ["teacher", "students", classId], 
    queryFn: async ({ signal }) => { 
      const r = await fetch(`/api/teacher/students?classId=${classId}`, { signal }); 
      if (!r.ok) throw new Error("Erro ao carregar alunos");
      return r.json(); 
    },
    retry: 2,
    enabled: !!classId
  });
  
  const lessonsQ = useQuery<Lesson[]>({ 
    queryKey: ["teacher", "lessons", classId, subjectId], 
    queryFn: async ({ signal }) => {
      try {
        const r = await fetch(`/api/teacher/lessons?classId=${classId}&subjectId=${subjectId}`, { 
          signal,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        }); 
        
        const contentType = r.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("⚠️ Resposta não é JSON, retornando array vazio");
          return [];
        }
        
        if (!r.ok) {
          const errorText = await r.text();
          console.error("❌ Erro ao carregar aulas:", r.status, errorText);
          return []; // Retornar array vazio em vez de lançar erro
        }
        
        const json = await r.json();
        return Array.isArray(json) ? json : [];
      } catch (err) {
        console.warn("⚠️ Erro ao buscar aulas, retornando array vazio:", err);
        return []; // Sempre retornar array, nunca lançar erro
      }
    },
    retry: 1,
    staleTime: 60000,
    enabled: !!classId && !!subjectId,
    refetchOnWindowFocus: false
  });
  
  const gradesQ = useQuery<GradeRow[]>({ 
    queryKey: ["teacher", "grades", classId, subjectId], 
    queryFn: async ({ signal }) => { 
      try {
        const r = await fetch(`/api/teacher/grades/grid?classId=${classId}&subjectId=${subjectId}`, { 
          signal,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        }); 
        if (!r.ok) {
          console.warn("⚠️ Erro ao carregar notas, retornando array vazio");
          return [];
        }
        const json = await r.json();
        return Array.isArray(json) ? json : [];
      } catch {
        return [];
      }
    },
    retry: 1,
    staleTime: 60000,
    enabled: !!classId && !!subjectId,
    refetchOnWindowFocus: false
  });

  const createLesson = useMutation({ 
    mutationFn: async (payload: Partial<Lesson>) => {
      try {
        const r = await fetch("/api/teacher/lessons", { 
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            ...payload,
            classId,
            subjectId,
            startTime: payload.startTime || undefined,
            endTime: payload.endTime || undefined,
            objectives: payload.objectives || undefined,
            methodology: payload.methodology || undefined,
            resources: payload.resources || undefined,
          })
        });
        
        if (!r.ok) {
          const errorText = await r.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || `Erro ${r.status}` };
          }
          throw new Error(errorData.message || errorData.error || `Erro ${r.status}: ${r.statusText}`);
        }
        
        return await r.json();
      } catch (error: any) {
        console.error("❌ Erro ao criar aula:", error);
        throw error;
      }
    }, 
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["teacher", "lessons", classId, subjectId] }); 
      setShowLessonForm(false);
      alert("Aula criada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao criar aula:", error);
      alert(`Erro ao criar aula: ${error.message || "Erro desconhecido"}`);
    }
  });
  
  const markAttendance = useMutation({ 
    mutationFn: async (payload: { studentId: string; status: "P" | "F" | "J"; date: string }) => { 
      const r = await fetch("/api/teacher/attendance", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ ...payload, classId, subjectId }) 
      }); 
      return r.json(); 
    } 
  });
  
  const markAllPresent = () => {
    studentsQ.data?.forEach(student => {
      markAttendance.mutate({ studentId: student.id, status: 'P', date: attendanceDate });
    });
  };
  
  const saveGrades = useMutation({ 
    mutationFn: async (payload: { studentId: string; n1: number; n2: number; n3: number; n4: number }) => { 
      const r = await fetch("/api/teacher/grades", { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ ...payload, classId, subjectId }) 
      }); 
      return r.json(); 
    }, 
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["teacher", "grades", classId, subjectId] }); 
    } 
  });

  const getGradeColor = (grade: number) => {
    if (grade < 7) return "text-rose-600 bg-rose-50";
    if (grade < 8) return "text-amber-600 bg-amber-50";
    return "text-emerald-600 bg-emerald-50";
  };

  const tabs = [
    { id: "aulas", label: "Lançar Aulas", icon: "📝" },
    { id: "chamada", label: "Fazer Chamada", icon: "📋" },
    { id: "notas", label: "Lançar Notas", icon: "📊" },
    { id: "provas", label: "Criar Provas", icon: "📄" },
    { id: "educacao-especial", label: "Educação Especial", icon: "🤝" },
  ];

  // Verificar se há dados necessários
  if (!termId || !classId || !subjectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-blue-50/20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-bold text-slate-800 mb-2">Informações incompletas</div>
          <div className="text-slate-600 mb-6">Bimestre, turma ou disciplina não selecionados.</div>
          <Link href="/teacher">
            <button className="btn-modern bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
              ← Voltar para Bimestres
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-blue-50/20 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/teacher" className="hover:text-orange-600 transition-colors">Bimestres</Link>
          <span>→</span>
          <Link href={`/teacher/${termId}/classes`} className="hover:text-orange-600 transition-colors">Turmas</Link>
          <span>→</span>
          <Link href={`/teacher/${termId}/classes/${classId}/subjects`} className="hover:text-orange-600 transition-colors">Disciplinas</Link>
          <span>→</span>
          <span className="text-slate-800 font-medium">Ferramentas</span>
        </div>

        {/* Header */}
        <div className="card-gradient from-blue-500 via-blue-600 to-indigo-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Ferramentas do Professor</div>
                  <div className="text-white/90 text-sm md:text-base">Gerencie aulas, chamadas, notas e provas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-3 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all ${
                tab === t.id
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <span className="mr-1 md:mr-2">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="fade-in">
          {/* LANÇAR AULAS */}
          {tab === "aulas" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></span>
                  Lançar Aulas
                </h2>
                <button
                  onClick={() => setShowLessonForm(!showLessonForm)}
                  className="btn-modern bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                >
                  {showLessonForm ? "✕ Cancelar" : "+ Nova Aula"}
                </button>
              </div>

              {showLessonForm && (
                <div className="card-modern p-6 mb-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget as any);
                      createLesson.mutate({
                        title: String(fd.get("title") || ""),
                        content: String(fd.get("content") || ""),
                        lessonDate: String(fd.get("lessonDate") || ""),
                        startTime: String(fd.get("startTime") || ""),
                        endTime: String(fd.get("endTime") || ""),
                        objectives: String(fd.get("objectives") || ""),
                        methodology: String(fd.get("methodology") || ""),
                        resources: String(fd.get("resources") || ""),
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tema/Título da Aula *</label>
                        <input name="title" className="input-modern w-full" placeholder="Ex: Introdução à História do Brasil" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data da Aula *</label>
                        <input name="lessonDate" type="date" className="input-modern w-full" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Horário de Início</label>
                        <input name="startTime" type="time" className="input-modern w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Horário de Término</label>
                        <input name="endTime" type="time" className="input-modern w-full" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo Programático</label>
                      <textarea name="content" className="input-modern w-full h-24" placeholder="Descreva o conteúdo abordado na aula..." />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Objetivos de Aprendizagem</label>
                      <textarea name="objectives" className="input-modern w-full h-20" placeholder="Quais são os objetivos desta aula?" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Metodologia Utilizada</label>
                      <textarea name="methodology" className="input-modern w-full h-20" placeholder="Descreva a metodologia de ensino..." />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Recursos Didáticos</label>
                      <textarea name="resources" className="input-modern w-full h-20" placeholder="Liste os recursos utilizados (quadro, projetor, materiais, etc.)" />
                    </div>

                    {/* Upload de arquivos será implementado em versão futura */}

                    <div className="flex gap-3">
                      <button type="submit" className="btn-modern bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
                        💾 Salvar Aula
                      </button>
                      <button type="button" onClick={() => setShowLessonForm(false)} className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300">
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Histórico de Aulas */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Histórico de Aulas</h3>
                {lessonsQ.isLoading && (
                  <div className="card-modern p-8 text-center">
                    <div className="text-4xl mb-4 animate-spin">⏳</div>
                    <div className="text-slate-600">Carregando aulas...</div>
                  </div>
                )}
                {lessonsQ.error && (
                  <div className="card-modern p-6 bg-rose-50 border-rose-200">
                    <div className="text-rose-800 font-semibold mb-2">⚠️ Erro ao carregar aulas</div>
                    <div className="text-rose-600 text-sm">Tente recarregar a página.</div>
                  </div>
                )}
                <div className="grid gap-4">
                  {(lessonsQ.data || []).map((lesson) => (
                    <div key={lesson.id} className="card-modern p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-xl font-bold text-slate-800 mb-2">{lesson.title}</div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
                            <span className="flex items-center gap-1">
                              <span>📅</span>
                              {lesson.lessonDate}
                            </span>
                            {lesson.startTime && lesson.endTime && (
                              <span className="flex items-center gap-1">
                                <span>🕐</span>
                                {lesson.startTime} - {lesson.endTime}
                              </span>
                            )}
                          </div>
                          {lesson.content && (
                            <div className="text-slate-700 mb-2">
                              <strong>Conteúdo:</strong> {lesson.content}
                            </div>
                          )}
                          {lesson.objectives && (
                            <div className="text-slate-700 mb-2">
                              <strong>Objetivos:</strong> {lesson.objectives}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!lessonsQ.isLoading && !lessonsQ.error && (!lessonsQ.data || lessonsQ.data.length === 0) && (
                    <div className="card-modern p-8 text-center">
                      <div className="text-4xl mb-3">📝</div>
                      <div className="text-slate-600 font-medium">Nenhuma aula cadastrada ainda.</div>
                      <div className="text-sm text-slate-500 mt-2">Use o botão acima para criar sua primeira aula.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FAZER CHAMADA */}
          {tab === "chamada" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></span>
                  Fazer Chamada
                </h2>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="input-modern"
                  />
                  <button
                    onClick={markAllPresent}
                    className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    ✓ Marcar Todos Presentes
                  </button>
                </div>
              </div>

              {studentsQ.isLoading && (
                <div className="card-modern p-8 text-center">
                  <div className="text-4xl mb-4 animate-spin">⏳</div>
                  <div className="text-slate-600">Carregando alunos...</div>
                </div>
              )}
              {studentsQ.error && (
                <div className="card-modern p-6 bg-rose-50 border-rose-200 mb-6">
                  <div className="text-rose-800 font-semibold mb-2">⚠️ Erro ao carregar alunos</div>
                  <div className="text-rose-600 text-sm">Tente recarregar a página.</div>
                </div>
              )}
              {!studentsQ.isLoading && !studentsQ.error && (!studentsQ.data || studentsQ.data.length === 0) && (
                <div className="card-modern p-8 text-center">
                  <div className="text-4xl mb-3">👥</div>
                  <div className="text-slate-600 font-medium">Nenhum aluno encontrado nesta turma.</div>
                </div>
              )}
              <div className="grid gap-3">
                {(studentsQ.data || []).map((student) => (
                  <div key={student.id} className="card-modern p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt={student.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            student.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{student.name}</div>
                          <div className="text-sm text-slate-600">Matrícula: {student.matricula}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => markAttendance.mutate({ studentId: student.id, status: "P", date: attendanceDate })}
                          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          P
                        </button>
                        <button
                          onClick={() => markAttendance.mutate({ studentId: student.id, status: "F", date: attendanceDate })}
                          className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
                        >
                          F
                        </button>
                        <button
                          onClick={() => markAttendance.mutate({ studentId: student.id, status: "J", date: attendanceDate })}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
                        >
                          J
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LANÇAR NOTAS */}
          {tab === "notas" && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></span>
                  Lançar Notas
                </h2>
                <div className="card-modern p-4 bg-blue-50 border-blue-200">
                  <div className="text-sm text-slate-700">
                    <strong>Sistema de 4 Notas:</strong> N1 (20%) - Participação/Atividades | N2 (30%) - Trabalhos/Projetos | N3 (25%) - Avaliações Parciais | N4 (25%) - Avaliação Final
                  </div>
                </div>
              </div>

              {gradesQ.isLoading && (
                <div className="card-modern p-8 text-center">
                  <div className="text-4xl mb-4 animate-spin">⏳</div>
                  <div className="text-slate-600">Carregando notas...</div>
                </div>
              )}
              {gradesQ.error && (
                <div className="card-modern p-6 bg-rose-50 border-rose-200 mb-6">
                  <div className="text-rose-800 font-semibold mb-2">⚠️ Erro ao carregar notas</div>
                  <div className="text-rose-600 text-sm">Tente recarregar a página.</div>
                </div>
              )}
              <div className="card-modern overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Aluno</th>
                        <th className="px-4 py-3 text-center font-semibold">N1 (20%)</th>
                        <th className="px-4 py-3 text-center font-semibold">N2 (30%)</th>
                        <th className="px-4 py-3 text-center font-semibold">N3 (25%)</th>
                        <th className="px-4 py-3 text-center font-semibold">N4 (25%)</th>
                        <th className="px-4 py-3 text-center font-semibold">Média</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(gradesQ.data || []).map((row) => {
                        const avg = (row.n1 * 0.2 + row.n2 * 0.3 + row.n3 * 0.25 + row.n4 * 0.25).toFixed(2);
                        return (
                          <tr key={row.studentId} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                            {(["n1", "n2", "n3", "n4"] as const).map((k) => (
                              <td key={k} className="px-4 py-3">
                                <input
                                  defaultValue={row[k] || 0}
                                  type="number"
                                  min={0}
                                  max={10}
                                  step={0.1}
                                  className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 text-center font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  onBlur={(e) => {
                                    const n = Math.max(0, Math.min(10, Number(e.target.value) || 0));
                                    const current = { n1: row.n1 || 0, n2: row.n2 || 0, n3: row.n3 || 0, n4: row.n4 || 0 };
                                    current[k] = n;
                                    saveGrades.mutate({ studentId: row.studentId, ...current });
                                  }}
                                />
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center">
                              <span className={`px-3 py-1.5 rounded-lg font-bold ${getGradeColor(Number(avg))}`}>
                                {avg}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {!gradesQ.isLoading && !gradesQ.error && (!gradesQ.data || gradesQ.data.length === 0) && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                            <div className="text-4xl mb-2">📊</div>
                            <div className="font-medium">Nenhuma nota cadastrada ainda.</div>
                            <div className="text-sm text-slate-500 mt-1">Comece a lançar notas nos campos acima.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CRIAR PROVAS */}
          {tab === "provas" && <TeacherTestCreator />}

          {/* EDUCAÇÃO ESPECIAL */}
          {tab === "educacao-especial" && <TeacherSpecialEducation />}
        </div>
      </div>
    </div>
  );
}