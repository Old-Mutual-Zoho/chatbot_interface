import { useEffect, useRef, useState, useCallback } from "react";

// Message shape we send to the backend over WebSocket.
export interface ChatMessagePayload {
  message?: string;
  session_id?: string | null;
  user_id: string;
  metadata?: Record<string, unknown> | null;
  form_data?: Record<string, unknown> | null;
}

// Message shape we expect back from the backend.
export interface ChatResponsePayload {
  response: unknown;
  session_id: string;
  mode: string;
  timestamp: string;
}

type ReadyState = "connecting" | "open" | "closing" | "closed";

export function useChatWebSocket(userId: string) {
  // Connection status + last server message.
  const [readyState, setReadyState] = useState<ReadyState>("connecting");
  const [lastMessage, setLastMessage] = useState<ChatResponsePayload | null>(null);

  // Keep the WebSocket instance in a ref so it survives re-renders.
  const wsRef = useRef<WebSocket | null>(null);

  // Used to stop reconnect attempts when the hook unmounts.
  const shouldReconnectRef = useRef(true);

  // Keep the latest connect function for the reconnect timer.
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    // No userId = no socket.
    if (!userId) return;

    // Build a ws:// or wss:// URL from the API base URL.
    const baseUrl = import.meta.env.VITE_API_BASE_URL; // e.g. "https://your-app.railway.app"
    const apiKey = import.meta.env.VITE_API_KEY;
    const wsUrl = `${baseUrl.replace(/^http/, "ws")}/ws/chat?api_key=${encodeURIComponent(apiKey)}`;

    // Open a new WebSocket connection.
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setReadyState("connecting");

    ws.onopen = () => setReadyState("open");

    ws.onclose = () => {
      setReadyState("closed");
      // Simple reconnect after a short delay.
      if (shouldReconnectRef.current) {
        setTimeout(() => connectRef.current(), 2000);
      }
    };

    ws.onerror = () => {
      // On error we close the socket to trigger the onclose handler.
      setReadyState("closing");
      ws.close();
    };

    ws.onmessage = (event) => {
      try {
        // Backend sends JSON.
        const data = JSON.parse(event.data);
        // Accept chat responses even when response is an empty object.
        if (
          data &&
          typeof data === "object" &&
          "session_id" in data &&
          "response" in data
        ) {
          setLastMessage(data as ChatResponsePayload);
          return;
        }

        {
          // Could also be { error: ... } or other server events.
          console.warn("Non-chat payload:", data);
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };
  }, [userId]);

  // Always keep connectRef up to date.
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    // Connect on mount, and close the socket on unmount.
    shouldReconnectRef.current = true;
    const timeout = setTimeout(() => {
      connect();
    }, 0);
    return () => {
      shouldReconnectRef.current = false;
      clearTimeout(timeout);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback(
    (payload: Omit<ChatMessagePayload, "user_id"> & { user_id?: string }) => {
      // Only send when the socket is open.
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      const data: ChatMessagePayload = {
        // Always use the hook's userId.
        user_id: userId,
        ...payload,
      };
      wsRef.current.send(JSON.stringify(data));
    },
    [userId]
  );

  return { readyState, lastMessage, send };
}
