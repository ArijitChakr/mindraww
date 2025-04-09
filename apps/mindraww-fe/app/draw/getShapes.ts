import axios from "axios";
import { BACKEND_URL } from "../config";

export const getShapes = async (roomId: string) => {
  const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);

  const shapes = response.data.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.message;
  });

  return shapes;
};
