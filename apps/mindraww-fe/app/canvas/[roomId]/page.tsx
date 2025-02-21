"use client";

import DrawSelections from "@/app/components/DrawSelections";
import { Draw, ShapeTypes } from "@/app/draw/draw";
import { useEffect, useRef, useState } from "react";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedShape, setSelectedShape] = useState<ShapeTypes>("rect");

  useEffect(() => {
    if (canvasRef.current) {
      const draw = new Draw(canvasRef.current, selectedShape);

      return () => {
        draw.eventRemover();
      };
    }
  }, [canvasRef, selectedShape]);
  return (
    <div className="w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      />
      <DrawSelections
        setShape={setSelectedShape}
        selectedShape={selectedShape}
      />
    </div>
  );
}
