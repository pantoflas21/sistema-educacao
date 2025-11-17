import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type ClassItem = { 
  id: string; 
  name: string; 
  capacity: number; 
  shift: string;
  room?: string;
  currentStudents: number;
  subjects?: Array<{ id: string; name: string; teacherName?: string; hoursPerWeek: number }>;
};

type Subject = { id: string; name: string; code: string };
type Teacher = { id: string; name: string };

export default function SecretaryClasses() {
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const qc = useQueryClient();

  const classesQ = useQuery<ClassItem[]>({ 
    queryKey: ["sec","classes"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/classes"); 
      return r.json(); 
    } 
  });

  const subjectsQ = useQuery<Subject[]>({ 
    queryKey: ["sec","subjects"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/subjects"); 
      return r.json(); 
    },
    enabled: showSubjectModal
  });

  const teachersQ = useQuery<Teacher[]>({ 
    queryKey: ["sec","teachers"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/teachers"); 
      return r.json(); 
    },
    enabled: showSubjectModal
  });

  const createClass = useMutation({
    mutationFn: async (payload: Partial<ClassItem>) => {
      const r = await fetch("/api/secretary/classes", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      }); 
      return r.json(); 
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sec","classes"] });
      setShowClassModal(false);
      setEditingClass(null);
    }
  });

  const updateClass = useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const r = await fetch(`/api/secretary/classes/${id}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      }); 
      return r.json(); 
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sec","classes"] })
  });

  const addSubjectToClass = useMutation({
    mutationFn: async ({ classId, subjectId, teacherId, hoursPerWeek }: { classId: string; subjectId: string; teacherId: string; hoursPerWeek: number }) => {
      const r = await fetch(`/api/secretary/classes/${classId}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, teacherId, hoursPerWeek })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sec","classes"] });
      setShowSubjectModal(false);
      setSelectedClass(null);
    }
  });

  const getShiftLabel = (shift: string) => {
    switch (shift) {
      case "manha": return "Manhã";
      case "tarde": return "Tarde";
      case "noite": return "Noite";
      default: return shift;
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "manha": return "bg-yellow-100 text-yellow-700";
      case "tarde": return "bg-orange-100 text-orange-700";
      case "noite": return "bg-indigo-100 text-indigo-700";
      default: return "bg-slate-100 text-slate-700";
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Gestão de Turmas</div>
                  <div className="text-white/90 text-sm md:text-base">Crie e gerencie turmas da escola</div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setEditingClass(null); setShowClassModal(true); }}
                className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors"
              >
                + Nova Turma
              </button>
              <Link href="/secretary">
                <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer">
                  ← Voltar
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Grid de Turmas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(classesQ.data || []).map((classItem) => {
            const occupancyPercent = (classItem.currentStudents / classItem.capacity) * 100;
            const isFull = occupancyPercent >= 100;
            
            return (
              <div key={classItem.id} className="card-modern p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-xl font-bold text-slate-800 mb-2">{classItem.name}</div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShiftColor(classItem.shift)}`}>
                        {getShiftLabel(classItem.shift)}
                      </span>
                      {classItem.room && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          Sala {classItem.room}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Capacidade</span>
                        <span className="font-semibold text-slate-800">
                          {classItem.currentStudents} / {classItem.capacity}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isFull ? 'bg-rose-500' : occupancyPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {classItem.subjects?.length || 0} disciplinas vinculadas
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => { setSelectedClass(classItem); setShowSubjectModal(true); }}
                    className="btn-modern bg-blue-600 text-white hover:bg-blue-700 flex-1 text-sm"
                  >
                    Disciplinas
                  </button>
                  <button
                    onClick={() => { setEditingClass(classItem); setShowClassModal(true); }}
                    className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1 text-sm"
                  >
                    Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de Criar/Editar Turma */}
        {showClassModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {editingClass ? 'Editar Turma' : 'Nova Turma'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  const payload = {
                    name: String(fd.get("name") || ""),
                    capacity: Number(fd.get("capacity") || 0),
                    shift: String(fd.get("shift") || "manha"),
                    room: String(fd.get("room") || ""),
                  };
                  
                  if (editingClass) {
                    updateClass.mutate({ id: editingClass.id, ...payload });
                  } else {
                    createClass.mutate(payload);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Turma *</label>
                  <input
                    name="name"
                    defaultValue={editingClass?.name}
                    className="input-modern w-full"
                    placeholder="Ex: 7º A, 8º B"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Capacidade Máxima *</label>
                  <input
                    name="capacity"
                    type="number"
                    defaultValue={editingClass?.capacity}
                    className="input-modern w-full"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Turno *</label>
                  <select name="shift" defaultValue={editingClass?.shift || "manha"} className="input-modern w-full" required>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sala de Aula</label>
                  <input
                    name="room"
                    defaultValue={editingClass?.room}
                    className="input-modern w-full"
                    placeholder="Ex: 101, Lab 2"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1">
                    {editingClass ? 'Salvar' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowClassModal(false); setEditingClass(null); }}
                    className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Associar Disciplinas */}
        {showSubjectModal && selectedClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Disciplinas da Turma {selectedClass.name}
              </h3>
              
              {/* Lista de Disciplinas Vinculadas */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Disciplinas Vinculadas</h4>
                <div className="space-y-2">
                  {(selectedClass.subjects || []).map((subject) => (
                    <div key={subject.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800">{subject.name}</div>
                        <div className="text-sm text-slate-600">
                          {subject.teacherName || 'Sem professor'} • {subject.hoursPerWeek}h/semana
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selectedClass.subjects || selectedClass.subjects.length === 0) && (
                    <div className="text-center py-4 text-slate-500">
                      Nenhuma disciplina vinculada
                    </div>
                  )}
                </div>
              </div>

              {/* Formulário para Adicionar Disciplina */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  addSubjectToClass.mutate({
                    classId: selectedClass.id,
                    subjectId: String(fd.get("subjectId") || ""),
                    teacherId: String(fd.get("teacherId") || ""),
                    hoursPerWeek: Number(fd.get("hoursPerWeek") || 0)
                  });
                }}
                className="space-y-4 border-t border-slate-200 pt-4"
              >
                <h4 className="text-lg font-semibold text-slate-800">Adicionar Disciplina</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Disciplina *</label>
                  <select name="subjectId" className="input-modern w-full" required>
                    <option value="">Selecione...</option>
                    {(subjectsQ.data || []).map(s => (
                      <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Professor *</label>
                  <select name="teacherId" className="input-modern w-full" required>
                    <option value="">Selecione...</option>
                    {(teachersQ.data || []).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Carga Horária Semanal (horas) *</label>
                  <input
                    name="hoursPerWeek"
                    type="number"
                    min="1"
                    max="20"
                    className="input-modern w-full"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-blue-600 text-white hover:bg-blue-700 flex-1">
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSubjectModal(false); setSelectedClass(null); }}
                    className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1"
                  >
                    Fechar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
