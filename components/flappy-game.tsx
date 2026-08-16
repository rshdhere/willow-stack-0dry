"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  GAME,
  createInitialState,
  flap,
  restart,
  step,
  type GameState,
} from "@/lib/flappy-engine";

const BEST_KEY = "willow-flappy-best";

function drawSky(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME.height);
  gradient.addColorStop(0, "#4eb6e8");
  gradient.addColorStop(0.55, "#87d6f5");
  gradient.addColorStop(1, "#c8eef8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME.width, GAME.height);

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  const clouds = [
    [48, 72, 36],
    [180, 110, 28],
    [300, 58, 42],
  ] as const;
  for (const [x, y, r] of clouds) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.8, y + 6, r * 0.75, 0, Math.PI * 2);
    ctx.arc(x - r * 0.7, y + 8, r * 0.65, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGround(ctx: CanvasRenderingContext2D, offset: number) {
  const y = GAME.height - GAME.groundHeight;
  ctx.fillStyle = "#5c4030";
  ctx.fillRect(0, y, GAME.width, GAME.groundHeight);
  ctx.fillStyle = "#6fbf3a";
  ctx.fillRect(0, y, GAME.width, 18);

  ctx.fillStyle = "#5aa82f";
  for (let x = -((offset * 2) % 28); x < GAME.width; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, y + 18);
    ctx.lineTo(x + 14, y);
    ctx.lineTo(x + 28, y + 18);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPipes(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const pipe of state.pipes) {
    const topH = pipe.gapY;
    const bottomY = pipe.gapY + GAME.pipeGap;
    const bottomH = GAME.height - GAME.groundHeight - bottomY;

    ctx.fillStyle = "#2f9e44";
    ctx.fillRect(pipe.x, 0, GAME.pipeWidth, topH);
    ctx.fillRect(pipe.x, bottomY, GAME.pipeWidth, bottomH);

    ctx.fillStyle = "#37b24d";
    ctx.fillRect(pipe.x - 4, topH - 24, GAME.pipeWidth + 8, 24);
    ctx.fillRect(pipe.x - 4, bottomY, GAME.pipeWidth + 8, 24);

    ctx.strokeStyle = "#1b6b2a";
    ctx.lineWidth = 2;
    ctx.strokeRect(pipe.x, 0, GAME.pipeWidth, topH);
    ctx.strokeRect(pipe.x, bottomY, GAME.pipeWidth, bottomH);
  }
}

function drawBird(ctx: CanvasRenderingContext2D, state: GameState) {
  const x = GAME.birdX;
  const y = state.birdY;
  const size = GAME.birdSize;
  const tilt = Math.max(-0.6, Math.min(0.9, state.velocity / 10));
  const wing = Math.sin(state.frame / 4) * 5;

  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate(tilt);

  ctx.fillStyle = "#fcc419";
  ctx.beginPath();
  ctx.ellipse(0, 0, size / 2, size / 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff922b";
  ctx.beginPath();
  ctx.ellipse(-4, wing * 0.3, size / 3.1, size / 4.2, -0.35 + wing * 0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(6, -4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#212529";
  ctx.beginPath();
  ctx.arc(7.5, -4, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f76707";
  ctx.beginPath();
  ctx.moveTo(10, 2);
  ctx.lineTo(20, 5);
  ctx.lineTo(10, 8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawHud(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
  ctx.font = "bold 36px Trebuchet MS, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(state.score), GAME.width / 2 + 2, 58);
  ctx.fillStyle = "#fffef5";
  ctx.fillText(String(state.score), GAME.width / 2, 56);
}

function render(ctx: CanvasRenderingContext2D, state: GameState) {
  drawSky(ctx);
  drawPipes(ctx, state);
  drawGround(ctx, state.frame);
  drawBird(ctx, state);
  drawHud(ctx, state);
}

export function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const [ui, setUi] = useState<GameState>(stateRef.current);
  const rafRef = useRef<number>(0);

  const syncUi = useCallback(() => {
    setUi({ ...stateRef.current, pipes: [...stateRef.current.pipes] });
  }, []);

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(BEST_KEY) || "0");
      if (!Number.isNaN(stored) && stored > 0) {
        stateRef.current = createInitialState(stored);
        syncUi();
      }
    } catch {
      // ignore storage errors
    }
  }, [syncUi]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastScore = stateRef.current.score;

    const loop = () => {
      stateRef.current = step(stateRef.current);
      if (
        stateRef.current.status === "playing" &&
        stateRef.current.score > lastScore
      ) {
        lastScore = stateRef.current.score;
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate(12);
          } catch {
            // ignore
          }
        }
      }
      if (stateRef.current.status === "playing") {
        syncUi();
      } else if (stateRef.current.status === "over") {
        lastScore = 0;
        try {
          localStorage.setItem(BEST_KEY, String(stateRef.current.best));
        } catch {
          // ignore
        }
        syncUi();
      }
      render(ctx, stateRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    render(ctx, stateRef.current);
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [syncUi]);

  const doFlap = useCallback(() => {
    if (stateRef.current.status === "over") return;
    stateRef.current = flap(stateRef.current);
    syncUi();
  }, [syncUi]);

  const doRestart = useCallback(() => {
    stateRef.current = restart(stateRef.current.best);
    syncUi();
  }, [syncUi]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        if (stateRef.current.status === "over") {
          doRestart();
        } else {
          doFlap();
        }
      }
      if (event.code === "Enter" && stateRef.current.status === "over") {
        event.preventDefault();
        doRestart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doFlap, doRestart]);

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-4">
      <div className="relative w-full overflow-hidden rounded-2xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <canvas
          ref={canvasRef}
          width={GAME.width}
          height={GAME.height}
          className="block h-auto w-full cursor-pointer touch-manipulation bg-sky-300"
          onPointerDown={(event) => {
            event.preventDefault();
            if (ui.status === "over") return;
            doFlap();
          }}
          role="img"
          aria-label="Flappy Bird game canvas. Tap or press Space to flap."
        />

        {ui.status !== "playing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35 p-6 backdrop-blur-[1px]">
            <div className="w-full max-w-[280px] rounded-xl border border-white/20 bg-slate-950/70 p-5 text-center shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                {ui.status === "ready" ? "Get ready" : "Game over"}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                {ui.status === "ready" ? "Tap to fly" : `Score ${ui.score}`}
              </h2>
              <p className="mt-2 text-sm text-slate-200">
                {ui.status === "ready"
                  ? "Space, ↑, or click to flap through the pipes."
                  : `Best run: ${ui.best}. Press Enter or restart.`}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {ui.status === "ready" ? (
                  <Button size="lg" onClick={doFlap} className="w-full">
                    Start flying
                  </Button>
                ) : (
                  <Button size="lg" onClick={doRestart} className="w-full">
                    Play again
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card/80 px-4 py-3 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Score
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">{ui.score}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/80 px-4 py-3 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Best
          </p>
          <p className="mt-1 text-2xl font-bold text-secondary">{ui.best}</p>
        </div>
      </div>
    </div>
  );
}
