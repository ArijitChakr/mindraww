import Canvas from "./Canvas";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const router = useRouter();
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/signin");
  }

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/?token=${token}`);
    ws.onopen = () => {
      setSocket(ws);
      const data = JSON.stringify({
        type: "join",
        payload: { roomId },
      });
      ws.send(data);
    };
  }, [roomId, token]);
  if (!socket) {
    return <div>Loading...</div>;
  }

  return <Canvas roomId={roomId} socket={socket} />;
}
