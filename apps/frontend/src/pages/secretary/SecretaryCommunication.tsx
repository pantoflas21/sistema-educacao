import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

type Announcement = {
  id: string;
  title: string;
  content: string;
  targetAudience: "all" | "students" | "parents" | "teachers";
  sentAt?: string;
  sentVia: ("email" | "sms")[];
  status: "draft" | "sent";
};

type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "parent_meeting" | "staff_meeting" | "other";
  attendees: Array<{ name: string; confirmed: boolean }>;
  minutes?: string;
  status: "scheduled" | "completed" | "cancelled";
};

export default function SecretaryCommunication() {
  const [activeTab, setActiveTab] = useState<"announcements" | "meetings">("announcements");
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const qc = useQueryClient();

  const announcementsQ = useQuery<Announcement[]>({ 
    queryKey: ["sec","announcements"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/communication/announcements"); 
      return r.json(); 
    } 
  });

  const meetingsQ = useQuery<Meeting[]>({ 
    queryKey: ["sec","meetings"], 
    queryFn: async () => { 
      const r = await fetch("/api/secretary/communication/meetings"); 
      return r.json(); 
    },
    enabled: activeTab === "meetings"
  });

  const createAnnouncement = useMutation({
    mutationFn: async (payload: Partial<Announcement>) => {
      const r = await fetch("/api/secretary/communication/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sec","announcements"] });
      setShowAnnouncementModal(false);
    }
  });

  const sendAnnouncement = useMutation({
    mutationFn: async (announcementId: string) => {
      const r = await fetch(`/api/secretary/communication/announcements/${announcementId}/send`, {
        method: "POST"
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sec","announcements"] });
    }
  });

  const createMeeting = useMutation({
    mutationFn: async (payload: Partial<Meeting>) => {
      const r = await fetch("/api/secretary/communication/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sec","meetings"] });
      setShowMeetingModal(false);
    }
  });

  const getTargetAudienceLabel = (target: Announcement["targetAudience"]) => {
    switch (target) {
      case "all": return "Todos";
      case "students": return "Alunos";
      case "parents": return "Pais/Responsáveis";
      case "teachers": return "Professores";
    }
  };

  const getMeetingTypeLabel = (type: Meeting["type"]) => {
    switch (type) {
      case "parent_meeting": return "Reunião de Pais";
      case "staff_meeting": return "Reunião de Equipe";
      case "other": return "Outro";
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Comunicação</div>
                  <div className="text-white/90 text-sm md:text-base">Avisos, circulares e reuniões</div>
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
            onClick={() => setActiveTab("announcements")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "announcements"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            📢 Avisos e Circulares
          </button>
          <button
            onClick={() => setActiveTab("meetings")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "meetings"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            📅 Agenda de Reuniões
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="fade-in">
          {/* AVISOS E CIRCULARES */}
          {activeTab === "announcements" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                  Avisos e Circulares
                </h2>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  + Novo Comunicado
                </button>
              </div>

              <div className="grid gap-4">
                {(announcementsQ.data || []).map((announcement) => (
                  <div key={announcement.id} className="card-modern p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-800">{announcement.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            announcement.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {announcement.status === "sent" ? "Enviado" : "Rascunho"}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {getTargetAudienceLabel(announcement.targetAudience)}
                          </span>
                        </div>
                        <div className="text-slate-700 mb-3">{announcement.content}</div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          {announcement.sentAt && (
                            <span>Enviado em: {new Date(announcement.sentAt).toLocaleString('pt-BR')}</span>
                          )}
                          <span>Via: {announcement.sentVia.join(", ").toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    {announcement.status === "draft" && (
                      <button
                        onClick={() => sendAnnouncement.mutate(announcement.id)}
                        className="btn-modern bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Enviar Agora
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AGENDA DE REUNIÕES */}
          {activeTab === "meetings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></span>
                  Agenda de Reuniões
                </h2>
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  + Agendar Reunião
                </button>
              </div>

              <div className="grid gap-4">
                {(meetingsQ.data || []).map((meeting) => (
                  <div key={meeting.id} className="card-modern p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-800">{meeting.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            meeting.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                            meeting.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                            "bg-rose-100 text-rose-700"
                          }`}>
                            {meeting.status === "scheduled" ? "Agendada" :
                             meeting.status === "completed" ? "Realizada" : "Cancelada"}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                            {getMeetingTypeLabel(meeting.type)}
                          </span>
                        </div>
                        <div className="text-slate-700 mb-3">
                          <div className="flex items-center gap-4 text-sm">
                            <span>📅 {new Date(meeting.date).toLocaleDateString('pt-BR')}</span>
                            <span>🕐 {meeting.time}</span>
                          </div>
                        </div>
                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium text-slate-700 mb-2">Participantes:</div>
                            <div className="flex flex-wrap gap-2">
                              {meeting.attendees.map((attendee, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    attendee.confirmed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {attendee.name} {attendee.confirmed ? "✓" : "?"}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {meeting.minutes && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <div className="text-sm font-medium text-slate-700 mb-1">Ata da Reunião:</div>
                            <div className="text-sm text-slate-600">{meeting.minutes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Comunicado */}
        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Novo Comunicado</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  const sentVia: ("email" | "sms")[] = [];
                  if (fd.get("via_email") === "on") sentVia.push("email");
                  if (fd.get("via_sms") === "on") sentVia.push("sms");
                  
                  createAnnouncement.mutate({
                    title: String(fd.get("title") || ""),
                    content: String(fd.get("content") || ""),
                    targetAudience: String(fd.get("targetAudience") || "all") as Announcement["targetAudience"],
                    sentVia,
                    status: "draft"
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                  <input name="title" className="input-modern w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo *</label>
                  <textarea name="content" className="input-modern w-full h-32" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Público-Alvo *</label>
                  <select name="targetAudience" className="input-modern w-full" required>
                    <option value="all">Todos</option>
                    <option value="students">Alunos</option>
                    <option value="parents">Pais/Responsáveis</option>
                    <option value="teachers">Professores</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Enviar via:</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="via_email" defaultChecked className="w-4 h-4" />
                      <span className="text-sm text-slate-700">📧 Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="via_sms" className="w-4 h-4" />
                      <span className="text-sm text-slate-700">💬 SMS</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1">
                    Salvar Rascunho
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementModal(false)}
                    className="btn-modern bg-slate-200 text-slate-700 hover:bg-slate-300 flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Reunião */}
        {showMeetingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-modern p-6 max-w-2xl w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Agendar Reunião</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as any);
                  createMeeting.mutate({
                    title: String(fd.get("title") || ""),
                    date: String(fd.get("date") || ""),
                    time: String(fd.get("time") || ""),
                    type: String(fd.get("type") || "parent_meeting") as Meeting["type"],
                    status: "scheduled"
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                  <input name="title" className="input-modern w-full" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data *</label>
                    <input name="date" type="date" className="input-modern w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Horário *</label>
                    <input name="time" type="time" className="input-modern w-full" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select name="type" className="input-modern w-full" required>
                    <option value="parent_meeting">Reunião de Pais</option>
                    <option value="staff_meeting">Reunião de Equipe</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-modern bg-indigo-600 text-white hover:bg-indigo-700 flex-1">
                    Agendar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMeetingModal(false)}
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









