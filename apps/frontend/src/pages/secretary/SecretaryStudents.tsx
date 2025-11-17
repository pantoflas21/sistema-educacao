import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type Student = { 
  id: string; 
  name: string; 
  cpf: string; 
  rg?: string; 
  birthDate?: string; 
  classId?: string;
  matricula?: string;
  photoUrl?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  guardians?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    profession?: string;
  }>;
  medicalInfo?: {
    allergies?: string;
    medications?: string;
    specialNeeds?: string;
  };
};

type ClassItem = { id: string; name: string; capacity: number; currentStudents: number };

export default function SecretaryStudents() {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedStudentForTransfer, setSelectedStudentForTransfer] = useState<Student | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const qc = useQueryClient();

  const studentsQ = useQuery<Student[]>({ 
    queryKey: ["sec","students"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/students"); 
      return r.json(); 
    } 
  });

  const classesQ = useQuery<ClassItem[]>({ 
    queryKey: ["sec","classes"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/classes"); 
      return r.json(); 
    } 
  });

  const createStudent = useMutation({
    mutationFn: async (payload: Partial<Student> & { photo?: File }) => {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'photo' && value instanceof File) {
          formData.append('photo', value);
        } else if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      const r = await fetch("/api/secretary/students", { 
        method: "POST", 
        body: formData 
      }); 
      return r.json(); 
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sec","students"] });
      setShowStudentModal(false);
      setEditingStudent(null);
      setSelectedPhoto(null);
    }
  });

  const enrollStudent = useMutation({
    mutationFn: async ({ studentId, classId }: { studentId: string; classId: string }) => {
      const r = await fetch(`/api/secretary/students/${studentId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sec","students"] });
      qc.invalidateQueries({ queryKey: ["sec","classes"] });
    }
  });

  const transferStudent = useMutation({
    mutationFn: async ({ studentId, targetSchoolId, reason }: { studentId: string; targetSchoolId: string; reason: string }) => {
      const r = await fetch(`/api/secretary/students/${studentId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetSchoolId, reason })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sec","students"] });
      setShowTransferModal(false);
      setSelectedStudentForTransfer(null);
    }
  });

  const deleteStudent = useMutation({
    mutationFn: async (id: string) => { 
      const r = await fetch(`/api/secretary/students/${id}`, { method: "DELETE" }); 
      return r.json(); 
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sec","students"] })
  });

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Gestão de Alunos</div>
                  <div className="text-white/90 text-sm md:text-base">Cadastro completo e matrículas</div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setEditingStudent(null); setShowStudentModal(true); }}
                className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors"
              >
                + Novo Aluno
              </button>
              <Link href="/secretary">
                <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer">
                  ← Voltar
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Lista de Alunos */}
        <div className="card-modern overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Alunos Cadastrados</h2>
              <div className="text-sm text-slate-600">
                Total: {studentsQ.data?.length ?? 0} alunos
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Foto</th>
                  <th className="px-4 py-3 text-left font-semibold">Nome</th>
                  <th className="px-4 py-3 text-left font-semibold">CPF</th>
                  <th className="px-4 py-3 text-left font-semibold">Matrícula</th>
                  <th className="px-4 py-3 text-left font-semibold">Turma</th>
                  <th className="px-4 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(studentsQ.data || []).map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white font-bold">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          student.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                    <td className="px-4 py-3 text-slate-600">{student.cpf}</td>
                    <td className="px-4 py-3 text-slate-600">{student.matricula || '-'}</td>
                    <td className="px-4 py-3">
                      {student.classId ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {classesQ.data?.find(c => c.id === student.classId)?.name || student.classId}
                        </span>
                      ) : (
                        <span className="text-slate-400">Sem turma</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => { setEditingStudent(student); setShowStudentModal(true); }}
                          className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => { setSelectedStudentForTransfer(student); setShowTransferModal(true); }}
                          className="px-3 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 text-sm font-medium"
                        >
                          Transferir
                        </button>
                        <button
                          onClick={() => deleteStudent.mutate(student.id)}
                          className="px-3 py-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 text-sm font-medium"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Cadastro/Edição */}
        {showStudentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="card-modern p-4 md:p-6 max-w-4xl w-full my-4 md:my-8 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">
                {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  
                  const payload: any = {
                    name: String(fd.get("name") || ""),
                    cpf: String(fd.get("cpf") || ""),
                    rg: String(fd.get("rg") || ""),
                    birthDate: String(fd.get("birthDate") || ""),
                    classId: String(fd.get("classId") || ""),
                    address: {
                      street: String(fd.get("address.street") || ""),
                      number: String(fd.get("address.number") || ""),
                      complement: String(fd.get("address.complement") || ""),
                      neighborhood: String(fd.get("address.neighborhood") || ""),
                      city: String(fd.get("address.city") || ""),
                      state: String(fd.get("address.state") || ""),
                      zipCode: String(fd.get("address.zipCode") || ""),
                    },
                    guardians: [
                      {
                        name: String(fd.get("guardian1.name") || ""),
                        relationship: String(fd.get("guardian1.relationship") || ""),
                        phone: String(fd.get("guardian1.phone") || ""),
                        email: String(fd.get("guardian1.email") || ""),
                        profession: String(fd.get("guardian1.profession") || ""),
                      }
                    ].filter(g => g.name),
                    medicalInfo: {
                      allergies: String(fd.get("medical.allergies") || ""),
                      medications: String(fd.get("medical.medications") || ""),
                      specialNeeds: String(fd.get("medical.specialNeeds") || ""),
                    }
                  };

                  if (selectedPhoto) {
                    payload.photo = selectedPhoto;
                  }

                  createStudent.mutate(payload);
                }}
                className="space-y-6"
              >
                {/* Dados Pessoais */}
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4">Dados Pessoais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                      <input name="name" defaultValue={editingStudent?.name} className="input-modern w-full" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CPF *</label>
                      <input name="cpf" defaultValue={editingStudent?.cpf} className="input-modern w-full" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">RG</label>
                      <input name="rg" defaultValue={editingStudent?.rg} className="input-modern w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento *</label>
                      <input name="birthDate" type="date" defaultValue={editingStudent?.birthDate} className="input-modern w-full" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Foto 3x4</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedPhoto(e.target.files?.[0] || null)}
                        className="input-modern w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4">Endereço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Rua</label>
                      <input name="address.street" defaultValue={editingStudent?.address?.street} className="input-modern w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                      <input name="address.number" defaultValue={editingStudent?.address?.number} className="input-modern w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Complemento</label>
                      <input name="address.complement" defaultValue={editingStudent?.address?.complement} className="input-modern w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                      <input name="address.neighborhood" defaultValue={editingStudent?.address?.neighborhood} className="input-modern w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                      <input name="address.city" defaultValue={editingStudent?.address?.city} className="input-modern w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                      <input name="address.state" defaultValue={editingStudent?.address?.state} className="input-modern w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                      <input name="address.zipCode" defaultValue={editingStudent?.address?.zipCode} className="input-modern w-full" />
                    </div>
                  </div>
                </div>

                {/* Responsáveis */}
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4">Responsáveis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                      <input name="guardian1.name" defaultValue={editingStudent?.guardians?.[0]?.name} className="input-modern w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Parentesco</label>
                      <select name="guardian1.relationship" defaultValue={editingStudent?.guardians?.[0]?.relationship} className="input-modern w-full">
                        <option value="">Selecione...</option>
                        <option value="pai">Pai</option>
                        <option value="mae">Mãe</option>
                        <option value="responsavel">Responsável</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                      <input name="guardian1.phone" defaultValue={editingStudent?.guardians?.[0]?.phone} className="input-modern w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input name="guardian1.email" type="email" defaultValue={editingStudent?.guardians?.[0]?.email} className="input-modern w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Profissão</label>
                      <input name="guardian1.profession" defaultValue={editingStudent?.guardians?.[0]?.profession} className="input-modern w-full" />
                    </div>
                  </div>
                </div>

                {/* Informações Médicas */}
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4">Informações Médicas</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Alergias</label>
                      <textarea name="medical.allergies" defaultValue={editingStudent?.medicalInfo?.allergies} className="input-modern w-full h-20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Medicamentos</label>
                      <textarea name="medical.medications" defaultValue={editingStudent?.medicalInfo?.medications} className="input-modern w-full h-20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Necessidades Especiais</label>
                      <textarea name="medical.specialNeeds" defaultValue={editingStudent?.medicalInfo?.specialNeeds} className="input-modern w-full h-20" />
                    </div>
                  </div>
                </div>

                {/* Matrícula */}
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4">Matrícula</h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Turma</label>
                    <select name="classId" defaultValue={editingStudent?.classId} className="input-modern w-full">
                      <option value="">Selecione uma turma...</option>
                      {(classesQ.data || []).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.currentStudents}/{c.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1">
                    {editingStudent ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowStudentModal(false); setEditingStudent(null); setSelectedPhoto(null); }}
                    className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Transferência */}
        {showTransferModal && selectedStudentForTransfer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="card-modern p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Solicitar Transferência</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  transferStudent.mutate({
                    studentId: selectedStudentForTransfer.id,
                    targetSchoolId: String(fd.get("targetSchoolId") || ""),
                    reason: String(fd.get("reason") || "")
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aluno</label>
                  <input value={selectedStudentForTransfer.name} className="input-modern w-full" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Escola de Destino *</label>
                  <input name="targetSchoolId" className="input-modern w-full" placeholder="ID ou nome da escola" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Motivo *</label>
                  <textarea name="reason" className="input-modern w-full h-24" placeholder="Descreva o motivo da transferência..." required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-amber-600 text-white hover:bg-amber-700 flex-1">
                    Solicitar Transferência
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowTransferModal(false); setSelectedStudentForTransfer(null); }}
                    className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1"
                  >
                    Cancelar
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
