import {
  Circle,
  Diamond,
  Minus,
  MoveRight,
  Pencil,
  Square,
  Type,
} from "lucide-react";
import { Dispatch } from "react";
import { ShapeTypes } from "../draw/draw";

export default function DrawSelections({
  setShape,
  selectedShape,
}: {
  setShape: Dispatch<React.SetStateAction<ShapeTypes>>;
  selectedShape: ShapeTypes;
}) {
  return (
    <div className="absolute top-10 left-[35%] flex gap-10 items-center justify-center rounded-full bg-white/20 py-2 px-6">
      <div
        onClick={() => setShape("rect")}
        className={`${selectedShape === "rect" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Square className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => setShape("circle")}
        className={`${selectedShape === "circle" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Circle className="w-8 h-8 text-white  cursor-pointer" />
      </div>
      <div
        onClick={() => setShape("diamond")}
        className={`${selectedShape === "diamond" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Diamond className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => setShape("line")}
        className={`${selectedShape === "line" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Minus className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => setShape("arrow")}
        className={`${selectedShape === "arrow" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <MoveRight className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => setShape("freePencil")}
        className={`${selectedShape === "freePencil" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Pencil className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => setShape("text")}
        className={`${selectedShape === "text" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Type className="w-8 h-8 text-white cursor-pointer" />
      </div>
    </div>
  );
}
