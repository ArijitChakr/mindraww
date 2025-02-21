"use client";

import { Draw } from "@/app/draw/draw";
import { useEffect, useRef } from "react";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const draw = new Draw(canvasRef.current);

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
    </div>
  );
}
