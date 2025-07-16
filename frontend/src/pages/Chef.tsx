import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ChefHat, Clock, Check, Utensils, Users, Bell } from "lucide-react";

interface Commande {
  id: number;
  nom: string;
  type_viande: string;
  legumes: string;
  sauces: string;
  taille: string;
  table_numero: number;
  created_at: string;
}

const notificationSoundUrl = "/ReelAudio-38527.mp3"; // Place ce fichier dans public/

const Chef = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [notification, setNotification] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const token = localStorage.getItem("access_token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  useEffect(() => {
    fetchCommandes();
    setLoading(false);
    ws.current = new WebSocket("ws://localhost:8000/ws/commandes");
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_commande") {
        setCommandes(prev => [data.commande, ...prev]);
        setNotification(true);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      }
    };
    ws.current.onclose = () => {};
    return () => {
      ws.current?.close();
    };
  }, []);

  const fetchCommandes = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/commandes", {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setCommandes(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const marquerCommandePrete = async (commandeId: number) => {
    setProcessingIds(prev => new Set(prev).add(commandeId));

    try {
      const res = await fetch(`http://localhost:8000/api/commandes/${commandeId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (res.ok) {
        setCommandes(prev => prev.filter(cmd => cmd.id !== commandeId));
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la commande:", error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(commandeId);
        return newSet;
      });
    }
  };

  const getTimeElapsed = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
    return diffInMinutes;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-snack-yellow/5 via-snack-orange/5 to-snack-red/5">
      <audio ref={audioRef} src={notificationSoundUrl} preload="auto" />
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 flex items-center gap-4">
          <span>Nouvelle commande reçue !</span>
          <button onClick={() => setNotification(false)} className="ml-4 underline">OK</button>
        </div>
      )}
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-snack-red to-snack-orange p-3 rounded-xl shadow-lg animate-glow">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-snack-red to-snack-orange bg-clip-text text-transparent">
                Chef Dashboard
              </h1>
              <p className="text-gray-600">Gestion des commandes en temps réel</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">Commandes en attente</h3>
              </div>
              <p className="text-3xl font-bold text-blue-700">{commandes.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Users className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Tables actives</h3>
              </div>
              <p className="text-3xl font-bold text-green-700">
                {new Set(commandes.map(cmd => cmd.table_numero)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des commandes */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-snack-orange" />
            <h2 className="text-2xl font-bold text-gray-800">Commandes à préparer</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : commandes.length === 0 ? (
            <Card className="text-center py-12 bg-white/80 backdrop-blur-sm border-dashed border-2">
              <CardContent>
                <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune commande en attente</h3>
                <p className="text-gray-500">Toutes les commandes ont été traitées !</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {commandes.map((commande, index) => {
                const timeElapsed = getTimeElapsed(commande.created_at);
                const isUrgent = timeElapsed > 15;
                const isProcessing = processingIds.has(commande.id);

                return (
                  <Card
                    key={commande.id}
                    className={`
                      bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl 
                      transition-all duration-300 transform hover:scale-105 
                      animate-bounce-in border-l-4 
                      ${isUrgent ? 'border-l-red-500 bg-red-50/50' : 'border-l-snack-orange'}
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <Utensils className="w-5 h-5 text-snack-orange" />
                          {commande.nom}
                        </CardTitle>
                        <Badge
                          variant={isUrgent ? "destructive" : "secondary"}
                          className={`${isUrgent ? 'animate-pulse' : ''}`}
                        >
                          Table {commande.table_numero}
                        </Badge>
                      </div>

                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Viande:</span>
                          <p className="text-gray-600 capitalize">{commande.type_viande}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Taille:</span>
                          <p className="text-gray-600 uppercase">{commande.taille}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">Légumes:</span>
                        <p className="text-gray-600 text-sm mt-1">{commande.legumes}</p>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">Sauces:</span>
                        <p className="text-gray-600 text-sm mt-1">{commande.sauces}</p>
                      </div>

                      <Button
                        onClick={() => marquerCommandePrete(commande.id)}
                        disabled={isProcessing}
                        className={`
                          w-full mt-4 transition-all duration-200 
                          ${isProcessing 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
                          }
                          text-white font-medium shadow-lg
                        `}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Traitement...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Commande prête
                          </div>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chef;