import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type RankingData = {
  school: string;
  aprovacao: number;
  frequencia: number;
  ideb?: number;
  mediaGeral?: number;
};

type ComparativeReport = {
  year: string | number;
  ranking: RankingData[];
  evolution?: Array<{ year: number; metric: string; value: number }>;
  goals?: Array<{ metric: string; target: number; current: number }>;
};

type MECReport = {
  type: "censo" | "saeb" | "prova_brasil" | "ideb";
  period: string;
  data: any;
};

export default function EdSecretaryReports() {
  const [reportType, setReportType] = useState<"municipal" | "mec">("municipal");
  const [mecReportType, setMecReportType] = useState<MECReport["type"]>("censo");
  const year = new Date().getFullYear();

  const rankingQ = useQuery<ComparativeReport>({ 
    queryKey: ["eduSec","ranking", year], 
    queryFn: async () => { 
      const r = await fetch(`/api/education-secretary/reports/ranking?year=${year}`); 
      return r.json(); 
    },
    enabled: reportType === "municipal"
  });

  const mecReportQ = useQuery<MECReport>({ 
    queryKey: ["eduSec","mec-report", mecReportType], 
    queryFn: async () => { 
      const r = await fetch(`/api/education-secretary/reports/mec?type=${mecReportType}`); 
      return r.json(); 
    },
    enabled: reportType === "mec"
  });

  const sortedRanking = [...(rankingQ.data?.ranking || [])].sort((a, b) => 
    (b.aprovacao + b.frequencia) - (a.aprovacao + a.frequencia)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-indigo-600 via-blue-600 to-sky-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Relatórios Municipais</div>
                  <div className="text-white/90 text-sm md:text-base">Estatísticas educacionais e relatórios para o MEC</div>
                </div>
              </div>
            </div>
            <Link href="/education-secretary">
              <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-colors cursor-pointer">
                ← Voltar
              </div>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setReportType("municipal")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              reportType === "municipal"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            📊 Relatórios Municipais
          </button>
          <button
            onClick={() => setReportType("mec")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              reportType === "mec"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            🏛️ Relatórios MEC
          </button>
        </div>

        {/* Relatórios Municipais */}
        {reportType === "municipal" && (
          <div className="space-y-6">
            {/* Performance Comparativa */}
            <div className="card-modern p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Ranking de Escolas - {year}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Posição</th>
                      <th className="px-4 py-3 text-left font-semibold">Escola</th>
                      <th className="px-4 py-3 text-center font-semibold">Taxa de Aprovação</th>
                      <th className="px-4 py-3 text-center font-semibold">Índice de Frequência</th>
                      <th className="px-4 py-3 text-center font-semibold">IDEB</th>
                      <th className="px-4 py-3 text-center font-semibold">Média Geral</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedRanking.map((school, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-slate-100 text-slate-700' :
                            index === 2 ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{school.school}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            school.aprovacao >= 0.9 ? 'bg-emerald-100 text-emerald-700' :
                            school.aprovacao >= 0.7 ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {Math.round(school.aprovacao * 100)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            school.frequencia >= 0.9 ? 'bg-emerald-100 text-emerald-700' :
                            school.frequencia >= 0.7 ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {Math.round(school.frequencia * 100)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {school.ideb ? (
                            <span className="font-semibold text-indigo-600">{school.ideb.toFixed(1)}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {school.mediaGeral ? (
                            <span className="font-semibold text-slate-800">{school.mediaGeral.toFixed(1)}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evolução Histórica */}
            <div className="card-modern p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Evolução Histórica da Rede</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {[2019, 2020, 2021, 2022, 2023, 2024, 2025].map((y) => (
                  <div key={y} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-500 to-blue-500 rounded-t-lg mb-2"
                      style={{ height: `${Math.random() * 60 + 30}%` }}
                    ></div>
                    <span className="text-xs text-slate-600">{y}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-slate-600">
                Evolução da média geral da rede ao longo dos anos
              </div>
            </div>

            {/* Metas Municipais */}
            <div className="card-modern p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Metas Municipais vs Realizações</h3>
              <div className="space-y-4">
                {[
                  { metric: "Taxa de Aprovação", target: 95, current: 87, unit: "%" },
                  { metric: "Índice de Frequência", target: 90, current: 85, unit: "%" },
                  { metric: "IDEB Municipal", target: 6.0, current: 5.2, unit: "" },
                  { metric: "Redução de Evasão", target: 5, current: 8, unit: "%" },
                ].map((goal, i) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={i} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-800">{goal.metric}</span>
                        <span className="text-sm text-slate-600">
                          {goal.current}{goal.unit} / {goal.target}{goal.unit}
                        </span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            progress >= 90 ? 'bg-emerald-500' :
                            progress >= 70 ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {progress >= 100 ? 'Meta atingida!' : `${(goal.target - goal.current).toFixed(1)}${goal.unit} para atingir a meta`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Relatórios MEC */}
        {reportType === "mec" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm font-medium text-slate-700">Tipo de Relatório:</label>
              <select
                value={mecReportType}
                onChange={(e) => setMecReportType(e.target.value as MECReport["type"])}
                className="input-modern"
              >
                <option value="censo">Censo Escolar</option>
                <option value="saeb">SAEB</option>
                <option value="prova_brasil">Prova Brasil</option>
                <option value="ideb">IDEB Municipal</option>
              </select>
            </div>

            <div className="card-modern p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {mecReportType === "censo" && "Censo Escolar"}
                {mecReportType === "saeb" && "SAEB - Sistema de Avaliação da Educação Básica"}
                {mecReportType === "prova_brasil" && "Prova Brasil"}
                {mecReportType === "ideb" && "IDEB Municipal"}
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800 mb-2">
                    <strong>Período:</strong> {mecReportQ.data?.period || year}
                  </div>
                  <div className="text-sm text-blue-800">
                    <strong>Status:</strong> {mecReportQ.data ? "Gerado" : "Pendente"}
                  </div>
                </div>
                {mecReportQ.data && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <pre className="text-xs text-slate-700 overflow-x-auto">
                      {JSON.stringify(mecReportQ.data.data, null, 2)}
                    </pre>
                  </div>
                )}
                <div className="flex gap-3">
                  <button className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700">
                    📄 Gerar Relatório
                  </button>
                  <button className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300">
                    📥 Exportar PDF
                  </button>
                  <button className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300">
                    📊 Exportar Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
