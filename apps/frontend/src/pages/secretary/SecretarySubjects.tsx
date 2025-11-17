import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Subject = { id: string; code: string; name: string; workload: number };
type ClassItem = { id: string; name: string };

export default function SecretarySubjects() {
  const qc = useQueryClient();
  const subjectsQ = useQuery<Subject[]>({ queryKey: ["sec","subjects"], queryFn: async () => { const r = await fetch("/api/secretary/subjects"); return r.json(); } });
  const classesQ = useQuery<ClassItem[]>({ queryKey: ["sec","classes"], queryFn: async () => { const r = await fetch("/api/secretary/classes"); return r.json(); } });
  const assocQ = useQuery<string[]>({ queryKey: ["sec","classSubjects", (classesQ.data||[])[0]?.id], enabled: !!(classesQ.data||[])[0], queryFn: async () => { const c = (classesQ.data||[])[0]!.id; const r = await fetch(`/api/secretary/class-subjects?classId=${c}`); return r.json(); } });
  const createM = useMutation({ mutationFn: async (payload: Partial<Subject>) => { const r = await fetch("/api/secretary/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); return r.json(); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["sec","subjects"] }) });
  const assocM = useMutation({ mutationFn: async ({ classId, subjectId }: any) => { const r = await fetch("/api/secretary/class-subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId, subjectId }) }); return r.json(); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["sec","classSubjects"] }) });

  const defaultClass = (classesQ.data||[])[0]?.id;
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Gestão de Disciplinas</h1>
        <form className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget as any); createM.mutate({ code: String(fd.get('code')||''), name: String(fd.get('name')||''), workload: Number(fd.get('workload')||'0') }); (e.currentTarget as any).reset(); }}>
          <input name="code" placeholder="Código" className="px-3 py-2 rounded text-black" required />
          <input name="name" placeholder="Nome" className="px-3 py-2 rounded text-black" required />
          <input name="workload" type="number" placeholder="Carga horária" className="px-3 py-2 rounded text-black" />
          <button className="px-4 py-2 bg-primary text-white rounded">Criar</button>
        </form>
        <div className="mt-6 grid gap-3">
          {(subjectsQ.data||[]).map(s => (
            <div key={s.id} className="rounded p-4 bg-white/5 border border-white/10">
              <div className="font-semibold">{s.code} • {s.name}</div>
              <div className="text-white/80 text-sm">Carga {s.workload}</div>
              {defaultClass && (
                <button className="mt-2 px-3 py-1 bg-secondary rounded" onClick={() => assocM.mutate({ classId: defaultClass, subjectId: s.id })}>Vincular à turma {defaultClass}</button>
              )}
            </div>
          ))}
        </div>
        {defaultClass && (
          <div className="mt-8">
            <div className="text-white/80">Vinculadas à turma {defaultClass}:</div>
            <div className="mt-2 text-white">{(assocQ.data||[]).join(", ") || "Nenhuma"}</div>
          </div>
        )}
      </div>
    </div>
  );
}