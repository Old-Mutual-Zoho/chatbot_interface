import { useEffect, useRef, useState, useCallback } from "react";


export interface ChatMessagePayload {
  message?: string;
  session_id?: string | null;
  user_id: string;
  metadata?: Record<string, unknown> | null;
  form_data?: Record<string, unknown> | null;
}


export interface ChatResponsePayload {
  response: unknown;
  session_id: string;
  mode: string;
  timestamp: string;
}

type ReadyState = "connecting" | "open" | "closing" | "closed";

export function useChatWebSocket(userId: string) {
  const [readyState, setReadyState] = useState<ReadyState>("connecting");
  const [lastMessage, setLastMessage] = useState<ChatResponsePayload | null>(null);
  const wsRef = useRef<WebSocket | null>(null);


  // Use a ref to always have the latest connect function for reconnect
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (!userId) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL; // e.g. "https://your-app.railway.app"
    const apiKey = import.meta.env.VITE_API_KEY;
    const wsUrl = `${baseUrl.replace(/^http/, "ws")}/ws/chat?api_key=${encodeURIComponent(apiKey)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setReadyState("connecting");

    ws.onopen = () => setReadyState("open");

    ws.onclose = () => {
      setReadyState("closed");
      // Optional: basic reconnect
      setTimeout(() => connectRef.current(), 2000);
    };

    ws.onerror = () => {
      setReadyState("closing");
      ws.close();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.response && data.session_id) {
          setLastMessage(data as ChatResponsePayload);
        } else {
          // You may also handle { error: ... } shapes here
          console.warn("Non-chat payload:", data);
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };
  }, [userId]);

  // Always keep connectRef up to date
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    // Avoid calling setState synchronously in effect
    const timeout = setTimeout(() => {
      connect();
    }, 0);
    return () => {
      clearTimeout(timeout);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback(
    (payload: Omit<ChatMessagePayload, "user_id"> & { user_id?: string }) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      const data: ChatMessagePayload = {
        user_id: userId,
        ...payload,
      };
      wsRef.current.send(JSON.stringify(data));
    },
    [userId]
  );

  return { readyState, lastMessage, send };
}
