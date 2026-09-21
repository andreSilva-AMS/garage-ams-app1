"use client";

import { useEffect, useRef, useState } from "react";

export function SignaturePad({
  onChange,
  clearLabel = "Effacer la signature",
}: {
  onChange: (dataUrl: string | null) => void;
  clearLabel?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const hasSigRef = useRef(false);
  const [ready, setReady] = useState(false);

  function setupCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(ratio, ratio);
    // fond blanc réel : sinon transparent, ce qui devient noir une fois converti en JPEG
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1B1F24";
    ctxRef.current = ctx;
    setReady(true);
  }

  useEffect(() => {
    setupCanvas();
    const onResize = () => {
      if (!hasSigRef.current) setupCanvas();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!ready) setupCanvas();
    if (!ctxRef.current) return;
    drawingRef.current = true;
    canvasRef.current!.setPointerCapture(e.pointerId);
    const p = pos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(p.x, p.y);
    e.preventDefault();
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || !ctxRef.current) return;
    const p = pos(e);
    ctxRef.current.lineTo(p.x, p.y);
    ctxRef.current.stroke();
    hasSigRef.current = true;
    onChange(canvasRef.current!.toDataURL("image/png"));
    e.preventDefault();
  }

  function end() {
    drawingRef.current = false;
  }

  function clear() {
    setupCanvas();
    hasSigRef.current = false;
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <canvas
        ref={canvasRef}
        className="h-40 w-full touch-none rounded-2xl border border-neutral-300 bg-white sm:h-56 landscape:h-56"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      />
      <button type="button" onClick={clear} className="self-start text-sm underline">
        {clearLabel}
      </button>
    </div>
  );
}
