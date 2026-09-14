/* ============================================================================
 * GAME CANVAS — the single requestAnimationFrame loop.
 *
 * Movement is grid-snapped with delta-time tweening (no setInterval anywhere).
 * Per-frame state lives in a ref, not in React, so walking never re-renders
 * the UI tree; only discrete events (entering a room, opening a panel) do.
 * ========================================================================= */

import { useEffect, useRef } from 'react';
import { input } from '../engine/input';
import { renderRoom } from '../engine/renderer';
import { TILE } from '../engine/types';
import type { Dir, Room, WorldObject } from '../engine/types';
import { doorAt, getRoom, isBlocked } from '../engine/world';
import { useGame } from '../systems/store';
import { footstep, sfx } from '../systems/audio';
import { PALETTE } from '../data/palette';
import { GENERIC_BARKS } from '../data/jokes';

const MOVE_MS = 150;
const MAX_DT = 50;

interface Runtime {
  room: Room;
  tx: number;
  ty: number;
  px: number;
  py: number;
  dir: Dir;
  moving: boolean;
  fromPx: number;
  fromPy: number;
  toPx: number;
  toPy: number;
  moveT: number;
  frame: number;
  stepPhase: number;
  idleMs: number;
  barkedAt: Record<string, number>;
  barkIndex: Record<string, number>;
  lastBark: number;
  camX: number;
  camY: number;
}

function nightTint(): { alpha: number; color: string } {
  const h = new Date().getHours();
  if (h >= 20 || h < 5) return { alpha: 0.42, color: '#3b3a6b' };
  if (h >= 18) return { alpha: 0.24, color: '#8a5a4a' };
  if (h < 8) return { alpha: 0.16, color: '#6a7ba8' };
  return { alpha: 0, color: '#ffffff' };
}

export default function GameCanvas({ onBark }: { onBark: (line: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rtRef = useRef<Runtime | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const st0 = useGame.getState();
    const room = getRoom(st0.roomId);
    const start = st0.pendingSpawn ?? room.spawn;

    rtRef.current = {
      room,
      tx: start.tx,
      ty: start.ty,
      px: start.tx * TILE,
      py: start.ty * TILE,
      dir: 'down',
      moving: false,
      fromPx: 0,
      fromPy: 0,
      toPx: 0,
      toPy: 0,
      moveT: 0,
      frame: 0,
      stepPhase: 0,
      idleMs: 0,
      barkedAt: {},
      barkIndex: {},
      lastBark: 0,
      camX: 0,
      camY: 0,
    };
    useGame.getState().setPlayerTile(start.tx, start.ty);

    /* --------------------------------------------- react to room changes */
    const unsub = useGame.subscribe((s, prev) => {
      const rt = rtRef.current;
      if (!rt) return;
      if (s.roomId !== prev.roomId || s.pendingSpawn !== prev.pendingSpawn) {
        const r = getRoom(s.roomId);
        const sp = s.pendingSpawn ?? r.entry;
        rt.room = r;
        rt.tx = sp.tx;
        rt.ty = sp.ty;
        rt.px = sp.tx * TILE;
        rt.py = sp.ty * TILE;
        rt.moving = false;
        rt.barkedAt = {};
      }
      input.suspended = !!s.dialogue || !!s.panel || !!s.card;
    });

    /* -------------------------------------------------------- resize */
    let scale = 3;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const vw = canvas.clientWidth || window.innerWidth;
      const vh = canvas.clientHeight || window.innerHeight;
      scale = Math.max(2, Math.min(4, Math.floor(Math.min(vw / 300, vh / 200))));
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    /* ------------------------------------------------------- the loop */
    let last = performance.now();

    const findFocus = (rt: Runtime): WorldObject | undefined => {
      let best: WorldObject | undefined;
      let bestD = 99;
      for (const o of rt.room.objects) {
        if (!o.interact) continue;
        for (let dy = 0; dy < o.h; dy++) {
          for (let dx = 0; dx < o.w; dx++) {
            const d = Math.max(Math.abs(o.tx + dx - rt.tx), Math.abs(o.ty + dy - rt.ty));
            if (d < bestD) {
              bestD = d;
              best = o;
            }
          }
        }
      }
      return bestD <= 1 ? best : undefined;
    };

    const tryStep = (rt: Runtime, dx: number, dy: number) => {
      const nx = rt.tx + dx;
      const ny = rt.ty + dy;
      if (isBlocked(rt.room, nx, ny)) return false;
      // Diagonals require both orthogonals to be free — no corner clipping.
      if (dx && dy && (isBlocked(rt.room, rt.tx + dx, rt.ty) || isBlocked(rt.room, rt.tx, rt.ty + dy))) {
        return false;
      }
      rt.fromPx = rt.px;
      rt.fromPy = rt.py;
      rt.toPx = nx * TILE;
      rt.toPy = ny * TILE;
      rt.tx = nx;
      rt.ty = ny;
      rt.moving = true;
      rt.moveT = 0;
      return true;
    };

    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      const rt = rtRef.current;
      if (!rt) return;
      const dt = Math.min(MAX_DT, now - last);
      last = now;

      const s = useGame.getState();
      const busy = !!s.dialogue || !!s.panel || !!s.card;
      const dirs = input.sample(dt);

      /* ----------------------------------------------------- movement */
      if (!rt.moving && !busy) {
        const dx = (dirs.right ? 1 : 0) - (dirs.left ? 1 : 0);
        const dy = (dirs.down ? 1 : 0) - (dirs.up ? 1 : 0);
        if (dx || dy) {
          rt.dir = dy > 0 ? 'down' : dy < 0 ? 'up' : dx > 0 ? 'right' : 'left';
          const moved = tryStep(rt, dx, dy) || (dx && tryStep(rt, dx, 0)) || (dy && tryStep(rt, 0, dy));
          if (moved) {
            rt.idleMs = 0;
            if (!s.progress.has('moved')) useGame.getState().mark('moved', 0);
            if (!s.achievements.has('first-steps')) useGame.getState().unlock('first-steps');
          }
        } else {
          rt.idleMs += dt;
          if (rt.idleMs > 60000 && !s.achievements.has('idle-60')) {
            useGame.getState().unlock('idle-60');
          }
        }
      }

      if (rt.moving) {
        rt.moveT += dt;
        const t = Math.min(1, rt.moveT / MOVE_MS);
        const e = t * t * (3 - 2 * t);
        rt.px = rt.fromPx + (rt.toPx - rt.fromPx) * e;
        rt.py = rt.fromPy + (rt.toPy - rt.fromPy) * e;
        rt.stepPhase += dt;
        rt.frame = Math.floor(rt.stepPhase / 120) % 2;
        if (t >= 1) {
          rt.moving = false;
          rt.px = rt.toPx;
          rt.py = rt.toPy;
          footstep(now);
          useGame.getState().setPlayerTile(rt.tx, rt.ty);

          const door = doorAt(rt.room, rt.tx, rt.ty);
          if (door) {
            if (door.locked === 'maxLevel' && useGame.getState().level < 10) {
              useGame.getState().interact({ type: 'sign', text: 'LOCKED — reach max level by exploring.' });
            } else {
              useGame.getState().goToRoom(door.to);
            }
          }
        }
      } else {
        rt.frame = 0;
      }

      /* ------------------------------------------------------- barks */
      const focus = findFocus(rt);
      if (focus?.barks?.length && !busy && now - rt.lastBark > 4000 && !rt.barkedAt[focus.id]) {
        rt.barkedAt[focus.id] = now;
        rt.lastBark = now;
        const idx = rt.barkIndex[focus.id] ?? 0;
        rt.barkIndex[focus.id] = idx + 1;
        const list = focus.barks.length ? focus.barks : GENERIC_BARKS;
        const line = focus.barksSequential
          ? list[Math.min(idx, list.length - 1)]
          : list[idx % list.length];
        onBark(line);
      }

      /* -------------------------------------------------- interaction */
      if (input.consumeAction()) {
        const cur = useGame.getState();
        // Advancing dialogue is owned entirely by DialogueBox (it also needs to
        // finish the typewriter on the first press). The loop only opens things.
        if (!cur.dialogue && !busy && focus?.interact) {
          cur.interact(focus.interact, focus.id);
        }
      }

      /* ------------------------------------------------------ camera */
      const vw = canvas.width / (scale * dpr);
      const vh = canvas.height / (scale * dpr);
      const worldW = rt.room.w * TILE;
      const worldH = rt.room.h * TILE;
      let camX = rt.px + TILE / 2 - vw / 2;
      let camY = rt.py + TILE / 2 - vh / 2;
      camX = worldW <= vw ? (worldW - vw) / 2 : Math.max(0, Math.min(worldW - vw, camX));
      camY = worldH <= vh ? (worldH - vh) / 2 : Math.max(0, Math.min(worldH - vh, camY));
      rt.camX += (camX - rt.camX) * Math.min(1, dt / 90);
      rt.camY += (camY - rt.camY) * Math.min(1, dt / 90);

      /* ------------------------------------------------------- render */
      const shake = s.shake && !s.reducedMotion ? (Math.random() - 0.5) * 6 : 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = PALETTE.void;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(
        scale * dpr,
        0,
        0,
        scale * dpr,
        Math.round((-rt.camX + shake) * scale * dpr),
        Math.round((-rt.camY + shake) * scale * dpr),
      );

      const tint = nightTint();
      renderRoom(ctx, {
        room: rt.room,
        camX: rt.camX,
        camY: rt.camY,
        viewW: vw,
        viewH: vh,
        playerPx: rt.px,
        playerPy: rt.py,
        dir: rt.dir,
        frame: rt.frame,
        time: now,
        focusId: focus?.id,
        done: s.progress,
        reducedMotion: s.reducedMotion,
        bossHurt: s.bossHp < 100 && s.shake ? 1 : 0,
        nightAlpha: s.reducedMotion ? Math.min(tint.alpha, 0.2) : tint.alpha,
        nightTint: tint.color,
      });
    };

    rafRef.current = requestAnimationFrame(frame);

    /* --------------------------------------------------- konami + exit */
    input.onKonami(() => {
      useGame.getState().unlock('konami');
      sfx('victory');
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      unsub();
    };
  }, [onBark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ imageRendering: 'pixelated' }}
      aria-label="Game world. Use the quest log and the plain resume link for an accessible summary."
      role="img"
    />
  );
}
