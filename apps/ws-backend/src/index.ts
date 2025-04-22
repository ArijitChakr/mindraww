import WebSocket, { WebSocketServer } from "ws";
import { prisma } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import { parse } from "path";

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
      const roomId: string = parsedMessage.payload.roomId;
      const message: string = parsedMessage.payload.message;
      const shapeId: string = JSON.parse(message).shapeId;

      try {
        if (
          !parsedMessage.isDrawing &&
          parsedMessage.payload.type !== "erase" &&
          parsedMessage.payload.type !== "update"
        ) {
          await prisma.chat.create({
            data: {
              id: shapeId,
              message,
              roomId,
              userId,
            },
          });
        }

        if (parsedMessage.payload.type === "erase") {
          await prisma.chat.delete({
            where: {
              id: shapeId,
            },
          });
        }

        if (
          parsedMessage.payload.type === "update" &&
          parsedMessage.isUpdating === false
        ) {
          await prisma.chat.update({
            where: {
              id: shapeId,
            },
            data: {
              message,
            },
          });
        }

        rooms.get(roomId)?.forEach((socket) => {
          if (socket !== ws && socket.readyState === WebSocket.OPEN) {
            if (parsedMessage.isDrawing) {
              socket.send(
                JSON.stringify({
                  type: "chat",
                  payload: { message, userId, roomId },
                  isDrawing: true,
                })
              );
            } else if (parsedMessage.payload.type === "erase") {
              socket.send(
                JSON.stringify({
                  type: "chat",
                  payload: { message, userId, roomId, type: "erase" },
                })
              );
            } else if (parsedMessage.payload.type === "update") {
              socket.send(
                JSON.stringify({
                  type: "chat",
                  payload: { message, userId, roomId, type: "update" },
                })
              );
            } else {
              socket.send(
                JSON.stringify({
                  type: "chat",
                  payload: { message, userId, roomId },
                  isDrawing: false,
                })
              );
            }
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
