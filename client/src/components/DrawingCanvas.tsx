import { useRef, useEffect, useState } from "react";

type ToolType =
  | "select"
  | "pan"
  | "text"
  | "shapes"
  | "diagram"
  | "icons"
  | "images"
  | "mindmap"
  | "tables"
  | "areas";

interface DrawingCanvasProps {
  activeTool: ToolType;
  width: number;
  height: number;
  onDraw?: (data: string) => void;
}

export default function DrawingCanvas({
  activeTool,
  width,
  height,
  onDraw,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 1;
    const gridSize = 20;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + panX, 0);
      ctx.lineTo(x + panX, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y + panY);
      ctx.lineTo(width, y + panY);
      ctx.stroke();
    }
  }, [width, height, panX, panY]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartX(x);
    setStartY(y);

    if (activeTool === "pan") {
      setPanX(x);
      setPanY(y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "pan") {
      setPanX(panX + (x - startX));
      setPanY(panY + (y - startY));
      setStartX(x);
      setStartY(y);
    } else if (activeTool === "shapes") {
      // Draw rectangle preview
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "#1A237E";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, x - startX, y - startY);
    } else if (activeTool === "diagram") {
      // Draw line preview
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "#FF6D00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
  };

  const getCursorStyle = () => {
    switch (activeTool) {
      case "pan":
        return "grab";
      case "text":
        return "text";
      case "shapes":
        return "crosshair";
      case "diagram":
        return "crosshair";
      default:
        return "default";
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="border border-border rounded-lg bg-white"
      style={{ cursor: getCursorStyle() }}
    />
  );
}
