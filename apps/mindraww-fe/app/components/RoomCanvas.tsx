"use client";

import Canvas from "./Canvas";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.push("/signin");
      return;
    }

    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:3001/?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      const data = JSON.stringify({
        type: "join",
        payload: { roomId },
      });
      ws.send(data);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, [roomId, token]);

  if (!socket) {
    return <div>Loading...</div>;
  }

  return <Canvas roomId={roomId} socket={socket} />;
}
