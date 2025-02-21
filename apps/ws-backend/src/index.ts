import WebSocket, { WebSocketServer } from "ws";
import { prisma } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";

const wss = new WebSocketServer({ port: 3001 });

const rooms = new Map<string, WebSocket[]>();
/*
message format
{
 type: "chat",
 payload: {
   message: "hello",
   roomId: "123"
 },
} or {
 type: "join",
 payload: {
   roomId: "123"
 },
} or {
 type: "leave",
 payload: {
   roomId: "123"
 },
}
*/
const checkUser = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch (e) {
    return null;
  }
};

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }
  const token = new URLSearchParams(url.split("?")[1]).get("token");
  if (!token) {
    ws.close();
    return;
  }
  const userId = checkUser(token);
  if (!userId) {
    ws.close();
    return;
  }

  ws.on("message", async (message) => {
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === "join") {
      const roomId = parsedMessage.payload.roomId;

      if (!rooms.has(roomId)) {
        rooms.set(roomId, []);
      }

      rooms.get(roomId)?.push(ws);
    }
    if (parsedMessage.type === "leave") {
      const roomId = parsedMessage.payload.roomId;

      rooms.get(roomId)?.filter((socket) => socket !== ws);
    }
    if (parsedMessage.type === "chat") {
      const roomId = parsedMessage.payload.roomId;
      const message = parsedMessage.payload.message;

      try {
        await prisma.chat.create({
          data: {
            message,
            roomId,
            userId,
          },
        });

        rooms.get(roomId)?.forEach((socket) => {
          if (socket !== ws && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "chat",
                payload: { message, userId, roomId },
              })
            );
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
  });

  ws.on("close", () => {
    for (const [roomId, sockets] of rooms) {
      const index = sockets.indexOf(ws);
      if (index !== -1) {
        sockets.splice(index, 1);
      }
      if (sockets.length === 0) {
        rooms.delete(roomId);
      }
    }
  });
});
