import { useRouter } from "next/navigation";

export default function RoomCard({
  roomName,
  roomId,
}: {
  roomName: string;
  roomId: string;
}) {
  const router = useRouter();

  return (
    <div
      className="w-56 h-40 bg-slate-800 rounded-lg flex flex-col justify-end cursor-pointer hover:bg-slate-700 transition-all duration-200"
      onClick={() => router.push(`/canvas/${roomId}`)}
    >
      <div className="text-xl text-white/80 font-bold p-1 bg-slate-600 w-full flex justify-center items-center rounded-b-lg">
        {roomName}
      </div>
    </div>
  );
}
