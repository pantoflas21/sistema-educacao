import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

type Me = { id: string; name: string; matricula: string; classId: string; photoUrl: string|null };
type ReportRow = { subjectId: string; subjectName: string; n1: number; n2: number; n3: number; n4: number; average: number; status: string };
type AttendanceSummary = { totalPresences: number; totalAbsences: number; totalJustified: number; frequencyPercent: number };

export default function StudentDashboard() {
  const meQ = useQuery<Me>({ queryKey: ["student","me"], queryFn: async ({ signal }) => { const r = await fetch("/api/student/me", { signal }); return r.json(); } });
  const reportQ = useQuery<ReportRow[]>({ queryKey: ["student","report", meQ.data?.classId], enabled: !!meQ.data?.classId, queryFn: async ({ signal }) => { const r = await fetch(`/api/student/report-card?classId=${meQ.data!.classId}&studentId=${meQ.data!.id}`, { signal }); return r.json(); } });
  const attendanceQ = useQuery<AttendanceSummary>({ queryKey: ["student","attendance-summary"], enabled: !!meQ.data?.id, queryFn: async ({ signal }) => { const r = await fetch(`/api/student/attendance/summary?studentId=${meQ.data!.id}`, { signal }); return r.json(); } });
  
  const avg = (reportQ.data||[]).length ? Number(((reportQ.data||[]).reduce((s,r) => s + r.average, 0) / (reportQ.data||[]).length).toFixed(2)) : 0;
  const status = avg>=7?"Aprovado":avg>=5?"Recuperação":"Em risco";
  const statusColor = avg>=7?"emerald":avg>=5?"amber":"rose";
  const frequencyPercent = attendanceQ.data?.frequencyPercent ?? 0;
  const frequencyRisk = frequencyPercent < 75;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50/30 to-blue-50/30 text-slate-900">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header com perfil do aluno */}
        <div className="card-gradient from-sky-600 via-indigo-600 to-blue-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-3xl shadow-xl">
                {meQ.data?.photoUrl ? (
                  <img src={meQ.data.photoUrl} alt={meQ.data.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <span className="text-white">👤</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">{meQ.data?.name || "Aluno"}</div>
                <div className="flex flex-wrap items-center gap-3 text-white/90">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-sm font-medium">
                    <span className="text-lg">🏫</span>
                    Turma {meQ.data?.classId}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-sm font-medium">
                    <span className="text-lg">🎓</span>
                    Matrícula {meQ.data?.matricula}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">{avg}</div>
              <div className="text-white/90 text-sm font-medium mb-3">Média Geral</div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                statusColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-100' :
                statusColor === 'amber' ? 'bg-amber-500/20 text-amber-100' :
                'bg-rose-500/20 text-rose-100'
              }`}>
                <span className={`w-2 h-2 rounded-full pulse-soft ${
                  statusColor === 'emerald' ? 'bg-emerald-400' :
                  statusColor === 'amber' ? 'bg-amber-400' :
                  'bg-rose-400'
                }`}></span>
                {status}
              </div>
            </div>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="card-modern p-6 fade-in group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
                📚
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-indigo-600">{reportQ.data?.length ?? 0}</div>
                <div className="text-xs text-slate-500 mt-1">Disciplinas</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700">Disciplinas Ativas</div>
            <div className="text-xs text-slate-500 mt-1">Cursando no momento</div>
          </div>
          
          <div className="card-modern p-6 fade-in group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xl shadow-lg ${
                statusColor === 'emerald' ? 'from-emerald-500 to-emerald-600' :
                statusColor === 'amber' ? 'from-amber-500 to-amber-600' :
                'from-rose-500 to-rose-600'
              }`}>
                {statusColor === 'emerald' ? '✅' : statusColor === 'amber' ? '⚠️' : '❌'}
              </div>
              <div className="text-right">
                <div className={`text-2xl font-extrabold ${
                  statusColor === 'emerald' ? 'text-emerald-600' :
                  statusColor === 'amber' ? 'text-amber-600' :
                  'text-rose-600'
                }`}>{status}</div>
                <div className="text-xs text-slate-500 mt-1">Status</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700">Situação Acadêmica</div>
            <div className="text-xs text-slate-500 mt-1">Bimestre atual</div>
          </div>

          <div className="card-modern p-6 fade-in group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xl shadow-lg ${
                frequencyRisk ? 'from-rose-500 to-rose-600' : 'from-blue-500 to-blue-600'
              }`}>
                {frequencyRisk ? '⚠️' : '📅'}
              </div>
              <div className="text-right">
                <div className={`text-2xl font-extrabold ${
                  frequencyRisk ? 'text-rose-600' : 'text-blue-600'
                }`}>{frequencyPercent.toFixed(1)}%</div>
                <div className="text-xs text-slate-500 mt-1">Frequência</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700">Presença Total</div>
            <div className="text-xs text-slate-600 mt-1">
              {attendanceQ.data?.totalPresences ?? 0} presenças, {attendanceQ.data?.totalAbsences ?? 0} faltas
              {frequencyRisk && <span className="text-rose-600 font-medium ml-1">⚠️ Risco</span>}
            </div>
          </div>
          
          <div className="card-modern p-6 fade-in group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl shadow-lg">
                🪙
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-emerald-600">324</div>
                <div className="text-xs text-slate-500 mt-1">PedaCoins</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700">Saldo de Moedas</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">+12 esta semana</div>
          </div>
        </div>

        {/* Menu de ações rápidas */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-sky-600 to-indigo-600 rounded-full"></span>
            Acesso Rápido
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Link href="/student/report-card">
            <div className="card-modern p-6 cursor-pointer group h-full">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                📊
              </div>
              <div className="text-xl font-bold text-slate-800 mb-2">Boletim</div>
              <div className="text-slate-600 text-sm mb-4">Notas e médias por disciplina</div>
              <div className="btn-modern bg-indigo-600 text-white w-full hover:bg-indigo-700 text-center">
                Abrir
              </div>
            </div>
          </Link>
          
          <Link href="/student/attendance">
            <div className="card-modern p-6 cursor-pointer group h-full">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                📅
              </div>
              <div className="text-xl font-bold text-slate-800 mb-2">Frequência</div>
              <div className="text-slate-600 text-sm mb-4">Presenças e faltas registradas</div>
              <div className="btn-modern bg-blue-600 text-white w-full hover:bg-blue-700 text-center">
                Abrir
              </div>
            </div>
          </Link>
          
          <Link href="/student/assignments">
            <div className="card-modern p-6 cursor-pointer group h-full">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                📝
              </div>
              <div className="text-xl font-bold text-slate-800 mb-2">Atividades</div>
              <div className="text-slate-600 text-sm mb-4">Tarefas e prazos de entrega</div>
              <div className="btn-modern bg-violet-600 text-white w-full hover:bg-violet-700 text-center">
                Abrir
              </div>
            </div>
          </Link>
          
          <Link href="/student/pedacoins">
            <div className="card-modern p-6 cursor-pointer group h-full">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                🎮
              </div>
              <div className="text-xl font-bold text-slate-800 mb-2">PedaCoins</div>
              <div className="text-slate-600 text-sm mb-4">Gamificação e recompensas</div>
              <div className="btn-modern bg-emerald-600 text-white w-full hover:bg-emerald-700 text-center">
                Abrir
              </div>
            </div>
          </Link>

          <Link href="/student/chat">
            <div className="card-modern p-6 cursor-pointer group h-full">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                💬
              </div>
              <div className="text-xl font-bold text-slate-800 mb-2">Chat</div>
              <div className="text-slate-600 text-sm mb-4">Conversas e grupos de estudo</div>
              <div className="btn-modern bg-cyan-600 text-white w-full hover:bg-cyan-700 text-center">
                Abrir
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}