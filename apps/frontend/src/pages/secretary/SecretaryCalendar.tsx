import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type Term = { 
  id: string;
  number: number; 
  startDate: string; 
  endDate: string; 
  status: "open"|"locked"|"closed" 
};

type Holiday = {
  id: string;
  date: string;
  name: string;
  type: "holiday" | "recess" | "event" | "parent_meeting";
};

type Schedule = {
  classId: string;
  className: string;
  schedule: Array<{
    dayOfWeek: number;
    timeSlot: string;
    subject: string;
    teacher: string;
    room?: string;
  }>;
};

export default function SecretaryCalendar() {
  const [activeTab, setActiveTab] = useState<"terms" | "holidays" | "schedules">("terms");
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const qc = useQueryClient();

  const termsQ = useQuery<Term[]>({ 
    queryKey: ["sec","terms"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/calendar/terms"); 
      return r.json(); 
    } 
  });

  const holidaysQ = useQuery<Holiday[]>({ 
    queryKey: ["sec","holidays"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/calendar/holidays"); 
      return r.json(); 
    } 
  });

  const schedulesQ = useQuery<Schedule[]>({ 
    queryKey: ["sec","schedules"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/calendar/schedules"); 
      return r.json(); 
    },
    enabled: activeTab === "schedules"
  });

  const updateTerms = useMutation({
    mutationFn: async (terms: Term[]) => { 
      const r = await fetch("/api/secretary/calendar/terms", { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ terms }) 
      }); 
      return r.json(); 
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sec","terms"] })
  });

  const createHoliday = useMutation({
    mutationFn: async (payload: Partial<Holiday>) => {
      const r = await fetch("/api/secretary/calendar/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sec","holidays"] });
      setShowHolidayModal(false);
    }
  });

  const getHolidayTypeLabel = (type: Holiday["type"]) => {
    switch (type) {
      case "holiday": return "Feriado";
      case "recess": return "Recesso";
      case "event": return "Evento Escolar";
      case "parent_meeting": return "Reunião de Pais";
    }
  };

  const getHolidayTypeColor = (type: Holiday["type"]) => {
    switch (type) {
      case "holiday": return "bg-red-100 text-red-700";
      case "recess": return "bg-blue-100 text-blue-700";
      case "event": return "bg-purple-100 text-purple-700";
      case "parent_meeting": return "bg-green-100 text-green-700";
    }
  };

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 12h14M5 17h14" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Calendário Escolar</div>
                  <div className="text-white/90 text-sm md:text-base">Gerencie bimestres, feriados e horários</div>
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

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "terms"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            📅 Bimestres
          </button>
          <button
            onClick={() => setActiveTab("holidays")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "holidays"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            🎉 Feriados e Eventos
          </button>
          <button
            onClick={() => setActiveTab("schedules")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "schedules"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            ⏰ Horários
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="fade-in">
          {/* BIMESTRES */}
          {activeTab === "terms" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                  Datas dos Bimestres
                </h2>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  const terms: Term[] = [1,2,3,4].map(n => ({
                    id: termsQ.data?.[n-1]?.id || `term-${n}`,
                    number: n,
                    startDate: String(fd.get(`s${n}`) || ""),
                    endDate: String(fd.get(`e${n}`) || ""),
                    status: n === 1 ? "open" : "locked"
                  }));
                  updateTerms.mutate(terms);
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {[1,2,3,4].map(n => (
                  <div key={n} className="card-modern p-6">
                    <div className="text-xl font-bold text-slate-800 mb-4">Bimestre {n}</div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início</label>
                        <input
                          name={`s${n}`}
                          type="date"
                          className="input-modern w-full"
                          defaultValue={termsQ.data?.[n-1]?.startDate}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data de Término</label>
                        <input
                          name={`e${n}`}
                          type="date"
                          className="input-modern w-full"
                          defaultValue={termsQ.data?.[n-1]?.endDate}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="md:col-span-2 lg:col-span-4">
                  <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 w-full">
                    Salvar Datas dos Bimestres
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FERIADOS E EVENTOS */}
          {activeTab === "holidays" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                  Feriados e Eventos
                </h2>
                <button
                  onClick={() => setShowHolidayModal(true)}
                  className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  + Adicionar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(holidaysQ.data || []).map((holiday) => (
                  <div key={holiday.id} className="card-modern p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">{holiday.name}</div>
                        <div className="text-sm text-slate-600">
                          {new Date(holiday.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHolidayTypeColor(holiday.type)}`}>
                        {getHolidayTypeLabel(holiday.type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HORÁRIOS */}
          {activeTab === "schedules" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                Grade Horária
              </h2>
              <div className="space-y-6">
                {(schedulesQ.data || []).map((schedule) => (
                  <div key={schedule.classId} className="card-modern p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{schedule.className}</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-sm font-semibold text-slate-700">Horário</th>
                            {daysOfWeek.map(day => (
                              <th key={day} className="px-3 py-2 text-center text-sm font-semibold text-slate-700">
                                {day}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {Array.from(new Set(schedule.schedule.map(s => s.timeSlot))).map(timeSlot => (
                            <tr key={timeSlot}>
                              <td className="px-3 py-2 font-medium text-slate-800">{timeSlot}</td>
                              {[0,1,2,3,4,5,6].map(day => {
                                const classItem = schedule.schedule.find(s => s.dayOfWeek === day && s.timeSlot === timeSlot);
                                return (
                                  <td key={day} className="px-3 py-2 text-center">
                                    {classItem ? (
                                      <div className="p-2 bg-blue-50 rounded">
                                        <div className="text-xs font-medium text-blue-800">{classItem.subject}</div>
                                        <div className="text-xs text-blue-600">{classItem.teacher}</div>
                                        {classItem.room && (
                                          <div className="text-xs text-blue-500">Sala {classItem.room}</div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Feriado/Evento */}
        {showHolidayModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Adicionar Feriado/Evento</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  createHoliday.mutate({
                    date: String(fd.get("date") || ""),
                    name: String(fd.get("name") || ""),
                    type: String(fd.get("type") || "holiday") as Holiday["type"]
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data *</label>
                  <input name="date" type="date" className="input-modern w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                  <input name="name" className="input-modern w-full" placeholder="Ex: Dia da Independência" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select name="type" className="input-modern w-full" required>
                    <option value="holiday">Feriado</option>
                    <option value="recess">Recesso</option>
                    <option value="event">Evento Escolar</option>
                    <option value="parent_meeting">Reunião de Pais</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1">
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHolidayModal(false)}
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
