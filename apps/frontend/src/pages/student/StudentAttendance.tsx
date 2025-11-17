import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type Mark = { studentId: string; status: "P"|"F"|"J"; date: string; classId: string; subjectId: string; subjectName?: string };
type AttendanceSummary = { totalPresences: number; totalAbsences: number; totalJustified: number; frequencyPercent: number };
type JustificationRequest = { id: string; date: string; reason: string; status: "pending" | "approved" | "rejected"; attachmentUrl?: string };

export default function StudentAttendance() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0,7));
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const qc = useQueryClient();

  const { data: marks } = useQuery<Mark[]>({ 
    queryKey: ["student","attendance",selectedMonth], 
    queryFn: async () => { 
      const r = await fetch(`/api/student/attendance/calendar?month=${selectedMonth}`); 
      return r.json(); 
    } 
  });

  const summaryQ = useQuery<AttendanceSummary>({ 
    queryKey: ["student","attendance-summary"], 
    queryFn: async () => { 
      const r = await fetch(`/api/student/attendance/summary`); 
      return r.json(); 
    } 
  });

  const justificationsQ = useQuery<JustificationRequest[]>({ 
    queryKey: ["student","justifications"], 
    queryFn: async () => { 
      const r = await fetch(`/api/student/justifications`); 
      return r.json(); 
    } 
  });

  const createJustification = useMutation({
    mutationFn: async (payload: { date: string; reason: string; file?: File }) => {
      const formData = new FormData();
      formData.append("date", payload.date);
      formData.append("reason", payload.reason);
      if (payload.file) {
        formData.append("attachment", payload.file);
      }
      const r = await fetch("/api/student/justifications", {
        method: "POST",
        body: formData
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student","justifications"] });
      setShowJustificationModal(false);
      setSelectedFile(null);
    }
  });

  const totalP = (marks||[]).filter(m => m.status === 'P').length;
  const totalF = (marks||[]).filter(m => m.status === 'F').length;
  const totalJ = (marks||[]).filter(m => m.status === 'J').length;
  const freq = summaryQ.data?.frequencyPercent ?? ((totalP + totalJ) / Math.max(1, (marks||[]).length) * 100);
  const frequencyRisk = freq < 75;

  // Gerar calendário do mês
  const year = parseInt(selectedMonth.split('-')[0]);
  const month = parseInt(selectedMonth.split('-')[1]) - 1;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const getStatusForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return marks?.find(m => m.date === dateStr)?.status;
  };

  const getStatusColor = (status?: string) => {
    if (status === 'P') return 'bg-emerald-500';
    if (status === 'F') return 'bg-rose-500';
    if (status === 'J') return 'bg-amber-500';
    return 'bg-slate-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50/30 to-blue-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-sky-600 via-indigo-600 to-blue-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 12h14M5 17h14" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Frequência</div>
                  <div className="text-white/90 text-sm md:text-base">Controle de presença e justificativas</div>
                </div>
              </div>
            </div>
            <Link href="/student">
              <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer">
                ← Voltar
              </div>
            </Link>
          </div>
        </div>

        {/* Resumo de Frequência */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="card-modern p-6">
            <div className="text-sm text-slate-600 mb-2">Presenças</div>
            <div className="text-3xl font-extrabold text-emerald-600">{totalP}</div>
          </div>
          <div className="card-modern p-6">
            <div className="text-sm text-slate-600 mb-2">Faltas</div>
            <div className="text-3xl font-extrabold text-rose-600">{totalF}</div>
          </div>
          <div className="card-modern p-6">
            <div className="text-sm text-slate-600 mb-2">Justificadas</div>
            <div className="text-3xl font-extrabold text-amber-600">{totalJ}</div>
          </div>
          <div className={`card-modern p-6 ${frequencyRisk ? 'border-2 border-rose-300 bg-rose-50' : ''}`}>
            <div className="text-sm text-slate-600 mb-2">Frequência</div>
            <div className={`text-3xl font-extrabold ${frequencyRisk ? 'text-rose-600' : 'text-blue-600'}`}>
              {freq.toFixed(1)}%
            </div>
            {frequencyRisk && (
              <div className="text-xs text-rose-600 font-medium mt-1">⚠️ Abaixo de 75%</div>
            )}
          </div>
        </div>

        {/* Seletor de Mês */}
        <div className="mb-6">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-modern"
          />
        </div>

        {/* Calendário Visual */}
        <div className="card-modern p-6 mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Calendário de Frequência</h3>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`}></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const status = getStatusForDate(day);
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold cursor-pointer hover:scale-110 transition-transform ${getStatusColor(status)} ${
                    status === 'P' ? 'text-white' : 
                    status === 'F' ? 'text-white' : 
                    status === 'J' ? 'text-white' : 
                    'text-slate-600'
                  }`}
                  onClick={() => {
                    if (status === 'F') {
                      setSelectedDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                      setShowJustificationModal(true);
                    }
                  }}
                  title={status === 'P' ? 'Presente' : status === 'F' ? 'Falta - Clique para justificar' : status === 'J' ? 'Justificada' : 'Sem registro'}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500"></div>
              <span>Presente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-rose-500"></div>
              <span>Falta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span>Justificada</span>
            </div>
          </div>
        </div>

        {/* Percentual por Disciplina */}
        <div className="card-modern p-6 mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Frequência por Disciplina</h3>
          <div className="space-y-4">
            {Array.from(new Set((marks || []).map(m => m.subjectName || m.subjectId))).map(subject => {
              const subjectMarks = marks?.filter(m => (m.subjectName || m.subjectId) === subject) || [];
              const subjectP = subjectMarks.filter(m => m.status === 'P').length;
              const subjectF = subjectMarks.filter(m => m.status === 'F').length;
              const subjectJ = subjectMarks.filter(m => m.status === 'J').length;
              const subjectFreq = ((subjectP + subjectJ) / Math.max(1, subjectMarks.length)) * 100;
              const subjectRisk = subjectFreq < 75;
              
              return (
                <div key={subject}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">{subject}</span>
                    <span className={`font-bold ${subjectRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {subjectFreq.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${subjectRisk ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${subjectFreq}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>P: {subjectP}</span>
                    <span>F: {subjectF}</span>
                    <span>J: {subjectJ}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Justificativas */}
        <div className="card-modern p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Justificativas de Faltas</h3>
            <button
              onClick={() => setShowJustificationModal(true)}
              className="btn-modern bg-amber-600 text-white hover:bg-amber-700"
            >
              + Solicitar Justificativa
            </button>
          </div>
          <div className="space-y-3">
            {(justificationsQ.data || []).map((just) => (
              <div key={just.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800">{new Date(just.date).toLocaleDateString('pt-BR')}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    just.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    just.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {just.status === 'approved' ? 'Aprovada' : just.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                  </span>
                </div>
                <div className="text-sm text-slate-600">{just.reason}</div>
                {just.attachmentUrl && (
                  <a href={just.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                    📎 Ver anexo
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Justificativa */}
        {showJustificationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Solicitar Justificativa</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  createJustification.mutate({
                    date: selectedDate || String(fd.get("date") || ""),
                    reason: String(fd.get("reason") || ""),
                    file: selectedFile || undefined
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data da Falta *</label>
                  <input
                    name="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-modern w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Motivo *</label>
                  <textarea
                    name="reason"
                    className="input-modern w-full h-24"
                    placeholder="Descreva o motivo da falta..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Anexar Atestado (opcional)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="input-modern w-full"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-amber-600 text-white hover:bg-amber-700 flex-1">
                    Enviar Solicitação
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowJustificationModal(false); setSelectedFile(null); }}
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
