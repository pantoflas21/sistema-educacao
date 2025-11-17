import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type Me = { id: string; classId: string };
type ReportRow = { 
  subjectId: string; 
  subjectName: string; 
  n1: number; 
  n2: number; 
  n3: number; 
  n4: number; 
  average: number; 
  status: string;
  termId: string;
  termNumber: number;
};
type Term = { id: string; number: number; startDate: string; endDate: string };

export default function StudentReportCard() {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const meQ = useQuery<Me>({ queryKey: ["student","me"], queryFn: async () => { const r = await fetch("/api/student/me"); return r.json(); } });
  const termsQ = useQuery<Term[]>({ queryKey: ["student","terms"], enabled: !!meQ.data?.classId, queryFn: async () => { const r = await fetch(`/api/student/terms?classId=${meQ.data!.classId}`); return r.json(); } });
  const rowsQ = useQuery<ReportRow[]>({ 
    queryKey: ["student","report", meQ.data?.classId, selectedTerm], 
    enabled: !!meQ.data?.classId, 
    queryFn: async () => { 
      const url = selectedTerm 
        ? `/api/student/report-card?classId=${meQ.data!.classId}&studentId=${meQ.data!.id}&termId=${selectedTerm}`
        : `/api/student/report-card?classId=${meQ.data!.classId}&studentId=${meQ.data!.id}`;
      const r = await fetch(url); 
      return r.json(); 
    } 
  });

  const getGradeColor = (grade: number) => {
    if (grade < 7) return "text-rose-600 bg-rose-50";
    if (grade < 8) return "text-amber-600 bg-amber-50";
    return "text-emerald-600 bg-emerald-50";
  };

  const getStatusColor = (status: string) => {
    if (status.includes("Aprovado")) return "bg-emerald-100 text-emerald-700";
    if (status.includes("Recuperação")) return "bg-amber-100 text-amber-700";
    return "bg-rose-100 text-rose-700";
  };

  // Agrupar por bimestre
  const groupedByTerm = (rowsQ.data || []).reduce((acc, row) => {
    const termId = row.termId || "all";
    if (!acc[termId]) {
      acc[termId] = { termNumber: row.termNumber || 0, rows: [] };
    }
    acc[termId].rows.push(row);
    return acc;
  }, {} as Record<string, { termNumber: number; rows: ReportRow[] }>);

  const allAverages = (rowsQ.data || []).map(r => r.average);
  const maxGrade = Math.max(...allAverages, 10);
  const minGrade = Math.min(...allAverages, 0);

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Boletim Digital</div>
                  <div className="text-white/90 text-sm md:text-base">Visualize suas notas e desempenho acadêmico</div>
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

        {/* Filtro de Bimestre */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={() => setSelectedTerm(null)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                selectedTerm === null
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              Todos os Bimestres
            </button>
            {(termsQ.data || []).map((term) => (
              <button
                key={term.id}
                onClick={() => setSelectedTerm(term.id)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  selectedTerm === term.id
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {term.number}º Bimestre
              </button>
            ))}
          </div>
        </div>

        {/* Gráfico de Performance */}
        <div className="card-modern p-6 mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Evolução das Notas</h3>
          <div className="space-y-4">
            {(rowsQ.data || []).map((row) => {
              const avg = row.average;
              const percentage = ((avg - minGrade) / (maxGrade - minGrade || 1)) * 100;
              return (
                <div key={row.subjectId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{row.subjectName}</span>
                    <span className={`px-3 py-1 rounded-lg font-bold ${getGradeColor(avg)}`}>
                      {avg.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        avg < 7 ? 'bg-rose-500' : avg < 8 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>N1: {row.n1}</span>
                    <span>N2: {row.n2}</span>
                    <span>N3: {row.n3}</span>
                    <span>N4: {row.n4}</span>
                  </div>
                </div>
              );
            })}
            {/* Linha de meta (7.0) */}
            <div className="relative mt-6 pt-4 border-t border-slate-200">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 opacity-50" style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
              <div className="text-xs text-blue-600 font-medium text-center">Meta de Aprovação: 7.0</div>
            </div>
          </div>
        </div>

        {/* Tabela de Notas */}
        <div className="card-modern overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Notas por Disciplina</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Disciplina</th>
                  <th className="px-4 py-3 text-center font-semibold">N1</th>
                  <th className="px-4 py-3 text-center font-semibold">N2</th>
                  <th className="px-4 py-3 text-center font-semibold">N3</th>
                  <th className="px-4 py-3 text-center font-semibold">N4</th>
                  <th className="px-4 py-3 text-center font-semibold">Média</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(rowsQ.data || []).map((row) => (
                  <tr key={row.subjectId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{row.subjectName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-lg font-semibold ${getGradeColor(row.n1)}`}>
                        {row.n1.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-lg font-semibold ${getGradeColor(row.n2)}`}>
                        {row.n2.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-lg font-semibold ${getGradeColor(row.n3)}`}>
                        {row.n3.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-lg font-semibold ${getGradeColor(row.n4)}`}>
                        {row.n4.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-lg font-bold ${getGradeColor(row.average)}`}>
                        {row.average.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparação entre Disciplinas */}
        <div className="card-modern p-6 mt-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Comparação entre Disciplinas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(rowsQ.data || []).map((row) => {
              const avg = row.average;
              return (
                <div key={row.subjectId} className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 mb-2">{row.subjectName}</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600">Média</span>
                    <span className={`text-lg font-bold ${avg < 7 ? 'text-rose-600' : avg < 8 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {avg.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        avg < 7 ? 'bg-rose-500' : avg < 8 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(avg / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
