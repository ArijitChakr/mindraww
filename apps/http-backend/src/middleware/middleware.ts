import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

interface JWTPayload {
  userId: string;
}

export const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const decoded: JWTPayload = jwt.verify(token, JWT_SECRET) as JWTPayload;
  if (!decoded.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = decoded.userId;
  next();
};
