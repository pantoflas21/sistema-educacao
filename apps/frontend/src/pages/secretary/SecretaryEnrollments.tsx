import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Student = { id: string; name: string; classId?: string };
type ClassItem = { id: string; name: string };
type Enrollment = { id: string; studentId: string; classId: string; subjectId: string; enrollmentDate: string };

export default function SecretaryEnrollments() {
  const qc = useQueryClient();
  const studentsQ = useQuery<Student[]>({ queryKey: ["sec","students"], queryFn: async () => { const r = await fetch("/api/secretary/students"); return r.json(); } });
  const classesQ = useQuery<ClassItem[]>({ queryKey: ["sec","classes"], queryFn: async () => { const r = await fetch("/api/secretary/classes"); return r.json(); } });
  const enrollM = useMutation({ mutationFn: async (payload: { studentId: string; classId: string }) => { const r = await fetch("/api/secretary/enrollments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, enrollmentDate: new Date().toISOString().slice(0,10) }) }); return r.json(); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["sec","enrollments"] }) });
  const enrollmentsQ = useQuery<Enrollment[]>({ queryKey: ["sec","enrollments"], queryFn: async () => { const r = await fetch("/api/secretary/enrollments"); return r.json(); } });
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Matrículas</h1>
        <form className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget as any); enrollM.mutate({ studentId: String(fd.get('studentId')||''), classId: String(fd.get('classId')||'') }); }}>
          <select name="studentId" className="px-3 py-2 rounded text-black" required>
            <option value="">Selecione aluno</option>
            {(studentsQ.data||[]).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select name="classId" className="px-3 py-2 rounded text-black" required>
            <option value="">Selecione turma</option>
            {(classesQ.data||[]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="px-4 py-2 bg-primary text-white rounded">Matricular</button>
        </form>
        <div className="mt-8 overflow-auto">
          <table className="min-w-full text-left">
            <thead><tr className="text-white/80"><th className="p-2">Aluno</th><th className="p-2">Turma</th><th className="p-2">Disciplina</th><th className="p-2">Data</th></tr></thead>
            <tbody>
              {(enrollmentsQ.data||[]).map(e => (
                <tr key={e.id}><td className="p-2">{e.studentId}</td><td className="p-2">{e.classId}</td><td className="p-2">{e.subjectId}</td><td className="p-2">{e.enrollmentDate}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}