"use client";

import DrawSelections from "@/app/components/DrawSelections";
import { Draw, ShapeTypes } from "@/app/draw/draw";
import { useEffect, useRef, useState } from "react";

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Draw>();
  const [selectedShape, setSelectedShape] = useState<ShapeTypes>("selection");

  useEffect(() => {
    game?.setTool(selectedShape);
  }, [selectedShape, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const draw = new Draw(canvasRef.current, socket, roomId, (newShape) => {
        setSelectedShape(newShape);
      });
      setGame(draw);
      return () => {
        draw.eventRemover();
      };
    }
  }, [canvasRef, socket, roomId]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <canvas
        style={{
          cursor: `${selectedShape === "selection" ? "default" : selectedShape === "pan" ? "grab" : selectedShape === "text" ? "text" : "crosshair"}`,
        }}
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
