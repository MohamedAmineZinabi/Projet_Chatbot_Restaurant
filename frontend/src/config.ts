// src/config.ts

function getApiBaseUrl() {
  // Emulateur Android Studio ou réseau local fixe
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // Si émulateur Android Studio (10.0.2.2) ou téléphone réel sur réseau local,
    // on force l'IP 192.168.1.190
    if (hostname === "10.0.2.2" || hostname.startsWith("192.168.")) {
      return "http://192.168.1.74:8000/api";
    }

    // PC (web)
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000/api";
    }
  }
  // Production
  return "http://192.168.1.74:8000/api";
}

function getWsBaseUrl() {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (hostname === "10.0.2.2" || hostname.startsWith("192.168.")) {
      return "ws://192.168.1.748000/ws/commandes";
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "ws://localhost:8000/ws/commandes";
    }
  }
  return "wss://http://192.168.1.74:8000/api/ws/commandes";
}

export const API_URL = getApiBaseUrl();
export const WS_URL = getWsBaseUrl();
