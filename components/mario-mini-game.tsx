"use client";

/**
 * Mini platformer with original pixel sprites (homage to classic jump‑&‑run games).
 * Not affiliated with Nintendo — no official Mario artwork or trademarks.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const WORLD_W = 1280;
const CANVAS_H = 280;
const GROUND_TOP = 220;
const GRAVITY = 0.72;
const MOVE = 5.4;
const JUMP_V = -13.2;
const FRICTION = 0.88;

/** Pixel size on canvas (crisp “16‑bit” look) */
const PIX = 2.65;

type Rect = { x: number; y: number; w: number; h: number };

const PLATFORMS: Rect[] = [
  { x: 0, y: GROUND_TOP, w: WORLD_W, h: 80 },
  { x: 280, y: 168, w: 112, h: 18 },
  { x: 480, y: 132, w: 96, h: 18 },
  { x: 680, y: 156, w: 128, h: 18 },
  { x: 900, y: 128, w: 88, h: 18 },
];

const MUSHROOM_SPOTS = [
  { x: 336, y: 154 },
  { x: 528, y: 118 },
  { x: 744, y: 142 },
  { x: 944, y: 114 },
];

const FLAG_X = 1180;

const HERO_COL: Record<string, string> = {
  ".": "",
  " ": "",
  R: "#e53935",
  r: "#9a1b1d",
  S: "#ffccbc",
  H: "#5d4037",
  L: "#3e2723",
  B: "#1565c0",
  b: "#0d47a1",
  Y: "#ffeb3b",
  O: "#263238",
  K: "#6d4c41",
  W: "#eceff1",
};

/** Small plumber‑style hero (12×16 px) */
const HERO_SMALL = [
  "...RRRR....",
  "..RRrrRR...",
  "..SSHHSS...",
  "..SLLLLS...",
  ".BBBBBBBB.",
  ".BYB..BYB.",
  ".BBBBBBBB.",
  "..BBB.BBB.",
  ".KK...KK...",
];

/** Super — taller torso + gloves */
const HERO_SUPER = [
  "...RRRR....",
  "..RRRRRR...",
  "..rrrrrr...",
  "..SSHHSS...",
  "..SSLLSS...",
  ".WBBBBBBW.",
  ".BYB..BYB.",
  ".BBBBBBBB.",
  ".BBBBBBBB.",
  "..BBB.BBB.",
  ".KK...KK...",
];

/** Mega — broad shoulders, big boots */
const HERO_MEGA = [
  "....RRRR....",
  "...RRRRRR...",
  "..RRrrrrRR..",
  "..SSHHHHSS..",
  "..SSLLLLSS..",
  ".WWBBBBBBWW.",
  ".BBYBBBBYBB.",
  ".BBBBBBBBBB.",
  ".BBBBBBBBBB.",
  ".BBBBBBBBBB.",
  "..BBB..BBB..",
  ".KKK....KKK.",
];

const MUSH_COL: Record<string, string> = {
  ".": "",
  " ": "",
  R: "#e53935",
  r: "#b71c1c",
  W: "#fffde7",
  w: "#ffffff",
  Y: "#fff8e1",
  y: "#ffe0b2",
  O: "#4e342e",
};

/** Classic red “power” mushroom silhouette (no branded face) */
const MUSHROOM_PIX = [
  "...RRRRR...",
  "..RRRRRRR..",
  ".RrWwRwWrR.",
  ".RRRRRRRRR.",
  "..YYYYYYY..",
  "..YyYyYyY..",
  "...YYYYY...",
];

function heroRows(tier: number): string[] {
  if (tier >= 2) return HERO_MEGA;
  if (tier >= 1) return HERO_SUPER;
  return HERO_SMALL;
}

function spritePixelSize(rows: string[]) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  return { w, h };
}

function tierSize(tier: number): { w: number; h: number } {
  const { w, h } = spritePixelSize(heroRows(tier));
  return { w: w * PIX, h: h * PIX };
}

function blitSprite(
  ctx: CanvasRenderingContext2D,
  worldX: number,
  worldY: number,
  rows: string[],
  palette: Record<string, string>,
  scale: number,
  flipX: boolean,
) {
  const pw = Math.max(...rows.map((r) => r.length)) * scale;
  ctx.save();
  if (flipX) {
    const cx = worldX + pw * 0.5;
    ctx.translate(cx, 0);
    ctx.scale(-1, 1);
    ctx.translate(-cx, 0);
  }
  for (let row = 0; row < rows.length; row++) {
    const line = rows[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      const hex = palette[ch];
      if (!hex) continue;
      ctx.fillStyle = hex;
      ctx.fillRect(worldX + col * scale, worldY + row * scale, Math.ceil(scale), Math.ceil(scale));
    }
  }
  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tier: number,
  flipX: boolean,
) {
  blitSprite(ctx, x, y, heroRows(tier), HERO_COL, PIX, flipX);
}

function mushroomWorldSize() {
  const { w, h } = spritePixelSize(MUSHROOM_PIX);
  return { w: w * PIX, h: h * PIX };
}

function drawMushroom(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const { w, h } = mushroomWorldSize();
  const left = cx - w * 0.5;
  const top = cy - h + 2;
  blitSprite(ctx, left, top, MUSHROOM_PIX, MUSH_COL, PIX, false);
}

function drawFlag(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(x, groundY - 120, 5, 120);
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.moveTo(x + 5, groundY - 118);
  ctx.lineTo(x + 52, groundY - 100);
  ctx.lineTo(x + 5, groundY - 82);
  ctx.fill();
}

function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

type GameState = {
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    tier: number;
    onGround: boolean;
    facing: 1 | -1;
  };
  mushrooms: { x: number; y: number; alive: boolean }[];
  won: boolean;
  keys: { left: boolean; right: boolean; jump: boolean };
  jumpQueued: boolean;
};

function createInitialState(): GameState {
  const { h } = tierSize(0);
  return {
    player: {
      x: 96,
      y: GROUND_TOP - h - 2,
      vx: 0,
      vy: 0,
      tier: 0,
      onGround: false,
      facing: 1,
    },
    mushrooms: MUSHROOM_SPOTS.map((p) => ({ x: p.x, y: p.y, alive: true })),
    won: false,
    keys: { left: false, right: false, jump: false },
    jumpQueued: false,
  };
}

export function MarioMiniGame({ reduceMotion }: { reduceMotion: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const rafRef = useRef<number>(0);
  const [hud, setHud] = useState({ tier: 0, shrooms: 0, won: false });
  const [size, setSize] = useState({ w: 640, h: CANVAS_H });

  const syncSize = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const w = Math.min(WORLD_W, Math.max(280, el.clientWidth));
    setSize({ w, h: CANVAS_H });
  }, []);

  useEffect(() => {
    syncSize();
    const ro = new ResizeObserver(syncSize);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", syncSize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncSize);
    };
  }, [syncSize]);

  useEffect(() => {
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w: mushW, h: mushH } = mushroomWorldSize();

    const step = () => {
      const s = stateRef.current;
      const { w: pw, h: ph } = tierSize(s.player.tier);

      if (!s.won) {
        if (s.keys.left) s.player.vx -= 0.58;
        if (s.keys.right) s.player.vx += 0.58;
        s.player.vx *= FRICTION;
        s.player.vx = Math.max(-MOVE, Math.min(MOVE, s.player.vx));

        if (Math.abs(s.player.vx) > 0.35) {
          s.player.facing = s.player.vx > 0 ? 1 : -1;
        }

        if (s.jumpQueued && s.player.onGround) {
          s.player.vy = JUMP_V;
          s.player.onGround = false;
        }
        s.jumpQueued = false;
        s.player.vy += GRAVITY;

        s.player.x += s.player.vx;
        s.player.x = Math.max(0, Math.min(WORLD_W - pw, s.player.x));
        if (s.player.x <= 0 || s.player.x + pw >= WORLD_W) s.player.vx = 0;

        s.player.y += s.player.vy;
        s.player.onGround = false;

        for (const p of PLATFORMS) {
          const pr: Rect = { x: s.player.x, y: s.player.y, w: pw, h: ph };
          if (!rectsOverlap(pr, p)) continue;
          const prevBottom = s.player.y - s.player.vy + ph;
          if (s.player.vy > 0 && prevBottom <= p.y + 6) {
            s.player.y = p.y - ph;
            s.player.vy = 0;
            s.player.onGround = true;
          } else if (s.player.vy < 0 && s.player.y - s.player.vy >= p.y + p.h - 4) {
            s.player.y = p.y + p.h;
            s.player.vy = 0;
          }
        }

        if (s.player.y > GROUND_TOP + 100) {
          Object.assign(s, createInitialState());
          setHud({ tier: 0, shrooms: 0, won: false });
        }

        const pr: Rect = { x: s.player.x, y: s.player.y, w: pw, h: ph };
        for (const m of s.mushrooms) {
          if (!m.alive) continue;
          const mr: Rect = {
            x: m.x - mushW * 0.45,
            y: m.y - mushH + 2,
            w: mushW * 0.9,
            h: mushH,
          };
          if (rectsOverlap(pr, mr)) {
            m.alive = false;
            s.player.tier = Math.min(2, s.player.tier + 1);
            const nh = tierSize(s.player.tier).h;
            s.player.y = Math.min(s.player.y, GROUND_TOP - nh - 2);
            setHud({
              tier: s.player.tier,
              shrooms: s.mushrooms.filter((x) => !x.alive).length,
              won: false,
            });
          }
        }

        const flagR: Rect = { x: FLAG_X - 8, y: GROUND_TOP - 120, w: 56, h: 120 };
        if (rectsOverlap(pr, flagR)) {
          s.won = true;
          setHud({
            tier: s.player.tier,
            shrooms: s.mushrooms.filter((x) => !x.alive).length,
            won: true,
          });
        }
      }

      const { w: dw } = tierSize(s.player.tier);
      const camX = Math.max(
        0,
        Math.min(WORLD_W - size.w, s.player.x + dw * 0.5 - size.w * 0.42),
      );

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#0c4a6e";
      ctx.fillRect(0, 0, size.w, size.h);
      ctx.translate(-camX, 0);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_TOP);
      skyGrad.addColorStop(0, "#38bdf8");
      skyGrad.addColorStop(1, "#bae6fd");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(camX, 0, size.w, GROUND_TOP);

      ctx.fillStyle = "#15803d";
      ctx.fillRect(camX, GROUND_TOP - 24, size.w, 24);

      for (const p of PLATFORMS) {
        if (p.y >= GROUND_TOP) {
          ctx.fillStyle = "#78350f";
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = "#451a03";
          ctx.lineWidth = 2;
          for (let i = 0; i < p.w; i += 24) {
            ctx.strokeRect(p.x + i, p.y, 24, p.h);
          }
        } else {
          ctx.fillStyle = "#b45309";
          ctx.strokeStyle = "#7c2d12";
          ctx.lineWidth = 2;
          for (let i = 0; i < p.w; i += 28) {
            ctx.fillRect(p.x + i, p.y, 26, p.h);
            ctx.strokeRect(p.x + i, p.y, 26, p.h);
          }
        }
      }

      for (const m of s.mushrooms) {
        if (m.alive) drawMushroom(ctx, m.x, m.y);
      }

      drawFlag(ctx, FLAG_X, GROUND_TOP);

      drawPlayer(ctx, s.player.x, s.player.y, s.player.tier, s.player.facing < 0);

      if (s.won) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
        ctx.fillRect(camX + size.w * 0.12, 40, size.w * 0.76, 100);
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 18px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Flag reached!", camX + size.w * 0.5, 78);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "14px system-ui, sans-serif";
        ctx.fillText("Scroll down for the full CV →", camX + size.w * 0.5, 108);
      }

      ctx.restore();

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduceMotion, size.w, size.h]);

  const setKey = (k: keyof GameState["keys"], v: boolean) => {
    stateRef.current.keys[k] = v;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === "ArrowLeft") {
      e.preventDefault();
      setKey("left", true);
    }
    if (e.code === "ArrowRight") {
      e.preventDefault();
      setKey("right", true);
    }
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      stateRef.current.jumpQueued = true;
    }
  };

  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.code === "ArrowLeft") setKey("left", false);
    if (e.code === "ArrowRight") setKey("right", false);
  };

  const reset = () => {
    stateRef.current = createInitialState();
    setHud({ tier: 0, shrooms: 0, won: false });
  };

  if (reduceMotion) {
    return (
      <div className="play-mini-game play-mini-game--reduced" role="region" aria-label="Mini-game disabled">
        <p className="play-mini-game-reduced-msg">
          Platformer warm-up is off when reduced motion is requested. Use the rest of the narrative
          below.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="play-mini-game"
      role="application"
      aria-label="Retro-style mini-game: collect mushrooms and reach the flag"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      <div className="play-mini-game-bar">
        <span className="play-mini-game-title">Warm-up run</span>
        <span className="play-mini-game-hud">
          Power: {hud.tier === 0 ? "Small" : hud.tier === 1 ? "Super" : "Mega"} · Mushrooms:{" "}
          {hud.shrooms}/{MUSHROOM_SPOTS.length}
          {hud.won ? " · Cleared!" : ""}
        </span>
        <button type="button" className="play-mini-game-reset" onClick={reset}>
          Reset
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="play-mini-game-canvas"
        width={size.w}
        height={size.h}
        aria-hidden
      />
      <p className="play-mini-game-hint">
        Click here, then <kbd>←</kbd> <kbd>→</kbd> move, <kbd>Space</kbd> jump. Pixel mushrooms grow
        your hero. Touch the flag.
      </p>
      <div className="play-mini-game-touch" aria-hidden>
        <button
          type="button"
          className="play-mini-game-touch-btn"
          onPointerDown={(e) => {
            e.preventDefault();
            setKey("left", true);
          }}
          onPointerUp={() => setKey("left", false)}
          onPointerLeave={() => setKey("left", false)}
        >
          ◀
        </button>
        <button
          type="button"
          className="play-mini-game-touch-btn play-mini-game-touch-btn--jump"
          onPointerDown={(e) => {
            e.preventDefault();
            stateRef.current.jumpQueued = true;
          }}
        >
          Jump
        </button>
        <button
          type="button"
          className="play-mini-game-touch-btn"
          onPointerDown={(e) => {
            e.preventDefault();
            setKey("right", true);
          }}
          onPointerUp={() => setKey("right", false)}
          onPointerLeave={() => setKey("right", false)}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
