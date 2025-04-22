"use client";
import { Button, Input } from "@repo/ui";
import Navbar from "../components/Navbar";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RoomCard from "../components/RoomCard";
import useFetch, { Room } from "../Hooks/UseFetch";

export default function DashboardPage() {
  const [roomname, setRoomName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/signin");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const { data, loading, refetch } = useFetch(`${BACKEND_URL}/rooms`, token);

  async function createRoom() {
    if (!token) return;
    const response = await axios.post(
      `${BACKEND_URL}/create-room`,
      { slug: roomname },
      {
        headers: { authorization: token },
      }
    );

    const roomId = response.data.roomId;
    setIsModalOpen(false);
    refetch(); // ✅ refresh the room list
    router.push(`/canvas/${roomId}`);
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="pt-20 px-72 flex justify-end w-full">
        <div className="justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            Create room
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 pt-10 px-72">
        {loading ? (
          <h1>Loading...</h1>
        ) : data?.length ? (
          data.map((room: Room) => (
            <div key={room.id}>
              <RoomCard roomName={room.slug} roomId={room.id} />
            </div>
          ))
        ) : (
          <p className="text-white">No rooms found</p>
        )}
      </div>

      <div
        className={`w-screen h-screen absolute top-0 left-0 bg-white/30 backdrop-blur-sm z-30 ${
          isModalOpen ? "flex" : "hidden"
        } justify-center items-center`}
        onClick={() => setIsModalOpen(false)}
      >
        <div
          className="p-10 m-2 bg-white rounded flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h1>Create new room</h1>
          <Input
            placeholder="Room name"
            onChange={(e) => setRoomName(e.target.value)}
          />
          <Button variant="primary" size="md" onClick={createRoom}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
