import {
  Circle,
  Diamond,
  Eraser,
  Hand,
  Minus,
  MousePointer,
  MoveRight,
  Pencil,
  Square,
  Type,
} from "lucide-react";
import { Dispatch, useEffect, useState } from "react";
import { ShapeTypes } from "../draw/draw";

export default function DrawSelections({
  setShape,
  selectedShape,
}: {
  setShape: Dispatch<React.SetStateAction<ShapeTypes>>;
  selectedShape: ShapeTypes;
}) {
  const [curShape, setCurShape] = useState<ShapeTypes>(selectedShape);

  useEffect(() => {
    setCurShape(selectedShape);
  }, [selectedShape]);

  return (
    <div className="absolute top-10 left-[28%] flex gap-10 items-center justify-center rounded-full bg-white/20 py-2 px-6">
      <div
        onClick={() => {
          setShape("pan");
          setCurShape("pan");
        }}
        className={`${curShape === "pan" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Hand className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => {
          setShape("selection");
          setCurShape("selection");
        }}
        className={`${curShape === "selection" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <MousePointer className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => {
          setShape("rect");
          setCurShape("rect");
        }}
        className={`${curShape === "rect" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Square className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => {
          setShape("circle");
          setCurShape("circle");
        }}
        className={`${curShape === "circle" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Circle className="w-8 h-8 text-white  cursor-pointer" />
      </div>
      <div
        onClick={() => {
          setShape("diamond");
          setCurShape("diamond");
        }}
        className={`${curShape === "diamond" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Diamond className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => {
          setShape("line");
          setCurShape("line");
        }}
        className={`${curShape === "line" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Minus className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => {
          setShape("arrow");
          setCurShape("arrow");
        }}
        className={`${curShape === "arrow" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <MoveRight className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => {
          setShape("freePencil");
          setCurShape("freePencil");
        }}
        className={`${curShape === "freePencil" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Pencil className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => {
          setShape("text");
          setCurShape("text");
        }}
        className={`${curShape === "text" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Type className="w-8 h-8 text-white cursor-pointer" />
      </div>
      <div
        onClick={() => {
          setShape("eraser");
          setCurShape("eraser");
        }}
        className={`${curShape === "eraser" && "border border-blue-600 bg-blue-600/10"} p-2 rounded-full`}
      >
        <Eraser className="w-8 h-8 text-white cursor-pointer" />
      </div>
    </div>
  );
}
