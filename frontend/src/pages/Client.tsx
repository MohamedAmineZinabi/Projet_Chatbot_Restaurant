
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Send, ChefHat, Plus, MessageCircle, Clock, Mic, MicOff } from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Conversation {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const Client = () => {
  // ... keep existing code (state declarations and functions)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const token = localStorage.getItem("access_token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/conversations", {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des conversations");
      const data = await res.json();

      const convs: Conversation[] = data.map((c: any) => ({
        id: c.id,
        title: c.title || "Nouvelle commande",
        lastMessage: c.last_message || "",
        timestamp: new Date(c.created_at),
      }));

      setConversations(convs);

      if (convs.length > 0 && currentConvId === null) {
        handleSelectConversation(convs[0].id);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations", error);
      setConversations([]);
    }
  };

  const fetchMessages = async (convId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/messages/${convId}`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des messages");
      const data = await res.json();

      const msgs: Message[] = data.map((m: any) => ({
        id: m.id,
        text: m.text,
        isUser: m.is_user === 1 || m.is_user === true,
        timestamp: new Date(m.timestamp),
      }));

      setMessages(msgs);
    } catch (error) {
      console.error("Erreur lors du chargement des messages", error);
      setMessages([]);
    }
  };

  const handleSelectConversation = (convId: number) => {
    setCurrentConvId(convId);
    fetchMessages(convId);
    setInputMessage("");
  };

  const handleNewConversation = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/conversations", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: "Nouvelle commande",
        }),
      });
      if (!res.ok) throw new Error("Erreur création conversation");
      const data = await res.json();

      const newConv: Conversation = {
        id: data.id,
        title: data.title,
        lastMessage: "",
        timestamp: new Date(),
      };

      setConversations((prev) => [newConv, ...prev]);
      setCurrentConvId(data.id);
      setMessages([
        {
          id: 1,
          text: "Bonjour ! Je suis l'assistant SnackZinabi. Comment puis-je vous aider à composer votre commande aujourd'hui ?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setInputMessage("");
    } catch (error) {
      console.error("Erreur lors de la création de la conversation", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || currentConvId === null) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputMessage("");

    try {
      const res = await fetch("http://localhost:8000/api/chat-rag", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          message: newMessage.text,
          conversation_id: currentConvId,
        }),
      });

      if (!res.ok) throw new Error("Erreur chat-rag");
      const data = await res.json();

      const botMessage: Message = {
        id: newMessage.id + 1,
        text: data.response || "Désolé, une erreur est survenue.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages([...updatedMessages, botMessage]);

      setConversations((prev) => {
        const others = prev.filter((c) => c.id !== currentConvId);
        const updatedConv = {
          id: currentConvId,
          title: updatedMessages[1]?.text.slice(0, 25) || "Nouvelle commande",
          lastMessage: botMessage.text,
          timestamp: new Date(),
        };
        return [updatedConv, ...others];
      });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: newMessage.id + 1,
          text: "Erreur de connexion avec le serveur.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const toggleRecording = async () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);

        let localChunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          localChunks.push(e.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(localChunks, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");

          try {
            const res = await fetch("http://localhost:8000/api/transcribe", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              console.error("Erreur API transcription :", await res.text());
              return;
            }

            const data = await res.json();
            if (data.text) {
              setInputMessage(data.text);
            }
          } catch (err) {
            console.error("Erreur transcription :", err);
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error("Erreur micro :", err);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar avec défilement indépendant */}
      <div className="w-80 bg-card border-r border-border flex flex-col h-full">
        <div className="p-4 border-b border-border flex-shrink-0">
          <Button
            onClick={handleNewConversation}
            className="w-full justify-start gap-2 bg-snack-red hover:bg-snack-red/90 text-white"
            size="lg"
          >
            <Plus className="w-4 h-4" />
            Nouvelle commande
          </Button>
        </div>

        {/* Zone de défilement pour les conversations */}
        <ScrollArea className="flex-1 h-0">
          <div className="p-2 space-y-1">
            {[...conversations]
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((conv) => (
                <Button
                  key={conv.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 hover:bg-accent/50 group"
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <MessageCircle className="w-4 h-4 mt-1 text-muted-foreground group-hover:text-snack-orange flex-shrink-0" />
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="font-medium text-sm truncate text-foreground">
                        {conv.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {conv.lastMessage}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTime(conv.timestamp)}
                    </div>
                  </div>
                </Button>
              ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border flex-shrink-0">
          <Link
            to="/mode-selection"
            className="text-sm text-muted-foreground hover:text-snack-orange transition-colors"
          >
            ← Changer de mode
          </Link>
        </div>
      </div>

      {/* Zone de chat avec défilement indépendant */}
      <div className="flex-1 flex flex-col h-full">
        <header className="bg-card border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-snack-red to-snack-orange p-2 rounded-full">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Assistant SnackZinabi</h1>
              <p className="text-sm text-muted-foreground">
                Votre assistant culinaire personnel
              </p>
            </div>
          </div>
        </header>

        {/* Zone de défilement pour les messages */}
        <ScrollArea className="flex-1 h-0">
          <div className="p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-start gap-3 max-w-[80%]">
                    {!message.isUser && (
                      <div className="bg-gradient-to-r from-snack-red to-snack-orange p-2 rounded-full flex-shrink-0">
                        <ChefHat className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.isUser ? "bg-snack-red text-white" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.isUser ? "text-red-100" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.isUser && (
                      <div className="w-8 h-8 bg-snack-orange rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">U</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Zone de saisie fixe en bas */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <Card className="p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="min-h-[44px] resize-none border-0 shadow-none focus-visible:ring-0 text-base"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRecording}
                    className={`h-11 w-11 ${
                      isRecording ? "bg-red-100 text-red-600 hover:bg-red-200" : "hover:bg-accent"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="h-11 px-4 bg-snack-red hover:bg-snack-red/90 text-white disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Client;