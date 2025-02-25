"use client";

import DrawSelections from "@/app/components/DrawSelections";
import { Draw, ShapeTypes } from "@/app/draw/draw";
import { useEffect, useRef, useState } from "react";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Draw>();
  const [selectedShape, setSelectedShape] = useState<ShapeTypes>("selection");

  useEffect(() => {
    game?.setTool(selectedShape);
  }, [selectedShape, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const draw = new Draw(canvasRef.current);
      setGame(draw);
      return () => {
        draw.eventRemover();
      };
    }
  }, [canvasRef]);

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
