import express from "express";
import {
  RoomSchema,
  ChatSchema,
  SignupSchema,
  SigninSchema,
} from "@repo/common/types";
import { prisma } from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { authMiddleware } from "./middleware/middleware";
import cors from "cors";

const app = express();

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  const parsedData = SignupSchema.safeParse(req.body);

  if (!parsedData.success) {
    console.log(parsedData.success);
    res.status(403).json({ error: "Invalid email or password" });
    return;
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: parsedData.data.email,
        name: parsedData.data.name,
        password: parsedData.data.password,
      },
    });

    res.json({
      userId: user.id,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

app.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(403).json({ error: "Invalid email or password" });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: parsedData.data.email,
        password: parsedData.data.password,
      },
    });

    if (!user) {
      res.status(403).json({ error: "Invalid email or password" });
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({
      token,
    });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/create-room", authMiddleware, async (req, res) => {
  const parsedData = RoomSchema.safeParse(req.body);
  const userId = req.userId;

  if (!parsedData.success) {
    res.status(403).json({ error: "Invalid slug" });
    return;
  }

  try {
    const room = await prisma.room.create({
      data: {
        slug: parsedData.data.slug,
        userId,
      },
    });

    res.json({
      roomId: room.id,
    });
  } catch (e) {
    res.status(500).json({ message: "Invalid slug" });
  }
});

app.get("/chats/:roomId", async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        roomId,
      },
    });
    res.json(chats);
  } catch (e) {
    res.json({
      chats: [],
    });
  }
});

app.listen(8080);
