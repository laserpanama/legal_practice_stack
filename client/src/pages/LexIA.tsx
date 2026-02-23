import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mic, MicOff, Send, Copy, Volume2, VolumeX, Upload, FileText, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { LegalDashboardLayout } from "@/components/LegalDashboardLayout";
import { trpc } from "@/lib/trpc";

interface ConsultationMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  documentAnalyzed?: string;
}

interface ConsultationSession {
  id: string;
  caseId?: number;
  title: string;
  messages: ConsultationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export default function LexIA() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [sessions, setSessions] = useState<ConsultationSession[]>([
    {
      id: "1",
      title: "Consulta sobre Contrato Laboral",
      messages: [
        {
          id: "m1",
          type: "user",
          content: "¿Cuáles son los requisitos para un contrato laboral en Panamá?",
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: "m2",
          type: "assistant",
          content:
            "Según la Ley 93 de 1973 (Código Laboral de Panamá), un contrato laboral debe incluir: 1) Identificación de las partes, 2) Descripción del trabajo, 3) Salario y forma de pago, 4) Duración del contrato, 5) Condiciones de trabajo. El contrato puede ser escrito u oral, pero se recomienda por escrito para evitar disputas.",
          timestamp: new Date(Date.now() - 3500000),
        },
      ],
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3500000),
    },
  ]);

  const [activeSession, setActiveSession] = useState<ConsultationSession | null>(sessions[0] || null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "es-PA";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentQuery(transcript);
        setIsRecording(false);
        handleSendQuery(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        toast.error(`Error de reconocimiento: ${event.error}`);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleStartRecording = () => {
    if (recognitionRef.current && !isRecording) {
      recognitionRef.current.start();
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const handleSendQuery = async (query: string = currentQuery) => {
    if (!query.trim()) {
      toast.error("Por favor ingrese una consulta");
      return;
    }

    if (!activeSession) {
      toast.error("Por favor seleccione una sesión");
      return;
    }

    setIsLoading(true);

    try {
      // Add user message
      const userMessage: ConsultationMessage = {
        id: Date.now().toString(),
        type: "user",
        content: query,
        timestamp: new Date(),
      };

      // Simulate AI response (in production, this would call the backend LLM)
      const aiResponse: ConsultationMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Basándome en la legislación panameña y específicamente en la Ley 93 de 1973 (Código Laboral), puedo informarle que: ${query}. 

Para obtener una respuesta más específica, le recomiendo que proporcione más detalles sobre su situación particular. Recuerde que esta es una consulta informativa y no constituye asesoría legal vinculante. Para asuntos legales importantes, consulte con un abogado certificado.`,
        timestamp: new Date(),
      };

      // Update session with new messages
      const updatedSession = {
        ...activeSession,
        messages: [...activeSession.messages, userMessage, aiResponse],
        updatedAt: new Date(),
      };

      setActiveSession(updatedSession);
      setSessions(sessions.map((s) => (s.id === activeSession.id ? updatedSession : s)));

      // Speak response
      speak(aiResponse.content);

      setCurrentQuery("");
    } catch (error) {
      toast.error("Error al procesar la consulta");
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-MX";
      utterance.rate = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const copyResponse = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const query = `Analiza este documento legal bajo el marco legal panameño: ${file.name}`;
        handleSendQuery(query);
      };
      reader.readAsDataURL(file);
    }
  };

  const createNewSession = () => {
    const newSession: ConsultationSession = {
      id: Date.now().toString(),
      title: `Nueva Consulta - ${new Date().toLocaleDateString("es-PA")}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions([...sessions, newSession]);
    setActiveSession(newSession);
  };

  return (
    <LegalDashboardLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">LexIA Panamá</h1>
            </div>
            <p className="text-muted-foreground">Asesor jurídico AI con reconocimiento de voz y análisis de documentos</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sessions Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sesiones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={createNewSession} className="w-full" variant="outline" size="sm">
                    + Nueva Sesión
                  </Button>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => setActiveSession(session)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                          activeSession?.id === session.id ? "bg-blue-100 text-blue-900" : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        <p className="font-medium truncate">{session.title}</p>
                        <p className="text-xs opacity-70">{session.messages.length} mensajes</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3 space-y-6">
              {activeSession ? (
                <>
                  {/* Messages Display */}
                  <Card className="h-96 overflow-y-auto">
                    <CardContent className="p-4 space-y-4">
                      {activeSession.messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                          <div>
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Inicie una consulta usando voz, texto o cargando un documento</p>
                          </div>
                        </div>
                      ) : (
                        activeSession.messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.type === "user" ? "bg-blue-600 text-white" : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">{msg.timestamp.toLocaleTimeString("es-PA")}</p>
                              {msg.type === "assistant" && (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => speak(msg.content)}
                                    className="text-xs hover:opacity-70"
                                    title="Escuchar"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => copyResponse(msg.content)}
                                    className="text-xs hover:opacity-70"
                                    title="Copiar"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted px-4 py-2 rounded-lg flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">LexIA está pensando...</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Input Area */}
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex gap-2">
                        <Textarea
                          value={currentQuery}
                          onChange={(e) => setCurrentQuery(e.target.value)}
                          placeholder="Escriba su consulta legal..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={isRecording ? handleStopRecording : handleStartRecording}
                          variant={isRecording ? "destructive" : "default"}
                          className="gap-2"
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="w-4 h-4" />
                              Detener Grabación
                            </>
                          ) : (
                            <>
                              <Mic className="w-4 h-4" />
                              Grabar Voz
                            </>
                          )}
                        </Button>

                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
                          <Upload className="w-4 h-4" />
                          Cargar Documento
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />

                        <Button
                          onClick={() => handleSendQuery()}
                          disabled={isLoading || !currentQuery.trim()}
                          className="gap-2 ml-auto"
                        >
                          <Send className="w-4 h-4" />
                          Enviar
                        </Button>
                      </div>

                      {isSpeaking && (
                        <Button onClick={stopSpeaking} variant="outline" className="w-full gap-2">
                          <VolumeX className="w-4 h-4" />
                          Detener Audio
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Compliance Notice */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-sm">Aviso de Cumplimiento</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-900">
                      LexIA Panamá proporciona información basada en la legislación panameña (Ley 93 de 1973 y otras normas vigentes). Esta consulta no constituye asesoría legal vinculante. Para asuntos legales importantes, consulte con un abogado certificado. Todos los datos se procesan bajo cumplimiento de Ley 81 de 2019.
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Seleccione una sesión o cree una nueva</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </LegalDashboardLayout>
  );
}
