import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";

type Conversation = {
  id: string;
  name: string;
  type: "teacher" | "group" | "support";
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  avatarUrl?: string;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: { url: string; name: string }[];
};

export default function StudentChat() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const conversationsQ = useQuery<Conversation[]>({ 
    queryKey: ["student","conversations"], 
    queryFn: async () => { 
      const r = await fetch("/api/student/chat/conversations"); 
      return r.json(); 
    } 
  });

  const messagesQ = useQuery<Message[]>({ 
    queryKey: ["student","messages", selectedConversation], 
    enabled: !!selectedConversation,
    queryFn: async () => { 
      const r = await fetch(`/api/student/chat/messages?conversationId=${selectedConversation}`); 
      return r.json(); 
    },
    refetchInterval: 2000 // Polling para simular WebSocket
  });

  const sendMessage = useMutation({
    mutationFn: async (payload: { conversationId: string; content: string; files?: File[] }) => {
      const formData = new FormData();
      formData.append("conversationId", payload.conversationId);
      formData.append("content", payload.content);
      if (payload.files) {
        payload.files.forEach((file, index) => {
          formData.append(`file_${index}`, file);
        });
      }
      const r = await fetch("/api/student/chat/send", {
        method: "POST",
        body: formData
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student","messages", selectedConversation] });
      qc.invalidateQueries({ queryKey: ["student","conversations"] });
      setMessageText("");
      setSelectedFiles([]);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQ.data]);

  const selectedConv = conversationsQ.data?.find(c => c.id === selectedConversation);

  const getConversationIcon = (type: Conversation["type"]) => {
    switch (type) {
      case "teacher": return "👨‍🏫";
      case "group": return "👥";
      case "support": return "🆘";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50/30 to-blue-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="card-gradient from-cyan-600 via-blue-600 to-indigo-600 p-8 mb-8 fade-in gradient-animated">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-4xl">💬</span>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">Chat Integrado</div>
                  <div className="text-white/90 text-sm md:text-base">Conversas com professores e grupos de estudo</div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
          {/* Lista de Conversas */}
          <div className="lg:col-span-1">
            <div className="card-modern p-4 h-full flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Conversas</h3>
              <div className="flex-1 overflow-y-auto space-y-2">
                {(conversationsQ.data || []).map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conv.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getConversationIcon(conv.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold ${selectedConversation === conv.id ? 'text-white' : 'text-slate-800'}`}>
                          {conv.name}
                        </div>
                        {conv.lastMessage && (
                          <div className={`text-sm truncate ${selectedConversation === conv.id ? 'text-white/90' : 'text-slate-600'}`}>
                            {conv.lastMessage}
                          </div>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="card-modern h-full flex flex-col">
                {/* Header da Conversa */}
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{selectedConv && getConversationIcon(selectedConv.type)}</div>
                    <div>
                      <div className="font-bold text-slate-800">{selectedConv?.name}</div>
                      <div className="text-xs text-slate-600">
                        {selectedConv?.type === "teacher" && "Professor"}
                        {selectedConv?.type === "group" && "Grupo de Estudo"}
                        {selectedConv?.type === "support" && "Suporte Escolar"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {(messagesQ.data || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] ${msg.senderId === "me" ? "order-2" : "order-1"}`}>
                        {msg.senderId !== "me" && (
                          <div className="text-xs text-slate-600 mb-1">{msg.senderName}</div>
                        )}
                        <div className={`p-3 rounded-2xl ${
                          msg.senderId === "me"
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                            : "bg-slate-100 text-slate-800"
                        }`}>
                          <div>{msg.content}</div>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((att, i) => (
                                <a
                                  key={i}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-sm underline"
                                >
                                  📎 {att.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={`text-xs mt-1 ${msg.senderId === "me" ? "text-right" : "text-left"} text-slate-500`}>
                          {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input de Mensagem */}
                <div className="p-4 border-t border-slate-200">
                  {selectedFiles.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700">
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (messageText.trim() || selectedFiles.length > 0) {
                        sendMessage.mutate({
                          conversationId: selectedConversation!,
                          content: messageText,
                          files: selectedFiles
                        });
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="hidden"
                      id="file-input"
                    />
                    <label
                      htmlFor="file-input"
                      className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 cursor-pointer flex items-center"
                    >
                      📎
                    </label>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="input-modern flex-1"
                    />
                    <button
                      type="submit"
                      className="btn-modern bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="card-modern h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <div className="text-xl font-semibold text-slate-800 mb-2">Selecione uma conversa</div>
                  <div className="text-slate-600">Escolha uma conversa da lista para começar a conversar</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}






