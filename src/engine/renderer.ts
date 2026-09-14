/* ============================================================================
 * RENDERER — canvas drawing. Knows about tiles, sprites and characters.
 * Knows nothing about projects, skills or jobs.
 * ========================================================================= */

import { CHARS, DEFAULT_NPC_COLORS, SPRITES } from '../data/sprites';
import { AVATAR_COLORS, AVATAR_SPRITE } from '../data/avatar';
import { PALETTE, ROLE } from '../data/palette';
import { T, TILE } from './types';
import type { Dir, Room, WorldObject } from './types';
import type { NpcColors } from '../types/content';

/* ------------------------------------------------------------ sprite cache */

const spriteCache = new Map<string, HTMLCanvasElement>();

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (n & 255) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function rasterise(rows: string[], colors: Record<string, string>, tint?: string): HTMLCanvasElement {
  const w = rows[0]?.length ?? 1;
  const h = rows.length;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x];
      if (ch === '.') continue;
      let col: string | undefined;
      if (ch === 'S') col = tint ?? PALETTE.cyan;
      else if (ch === 'T') col = shade(tint ?? PALETTE.cyan, -50);
      else col = colors[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

export function spriteCanvas(key: string, tint?: string): HTMLCanvasElement | null {
  const cacheKey = `${key}|${tint ?? ''}`;
  const hit = spriteCache.get(cacheKey);
  if (hit) return hit;
  const rows = key === 'avatar' ? AVATAR_SPRITE : SPRITES[key];
  if (!rows) return null;
  const c = rasterise(rows, key === 'avatar' ? AVATAR_COLORS : CHARS, tint);
  spriteCache.set(cacheKey, c);
  return c;
}

/** Draw a sprite so that it sits on the given footprint. */
export function drawSpriteOnFootprint(
  ctx: CanvasRenderingContext2D,
  key: string,
  tx: number,
  ty: number,
  w: number,
  h: number,
  tint?: string,
) {
  const c = spriteCanvas(key, tint);
  if (!c) return;
  const k = (w * TILE) / c.width;
  const dw = c.width * k;
  const dh = c.height * k;
  const dx = tx * TILE;
  const dy = (ty + h) * TILE - dh;
  ctx.drawImage(c, dx, dy, dw, dh);
}

/* -------------------------------------------------------------- characters */

const DIR_ORDER: Dir[] = ['down', 'left', 'right', 'up'];
export { DIR_ORDER };

/**
 * A character, drawn from four colours. 16 wide, 18 tall, feet at the bottom.
 * There is no spritesheet — this is why adding an NPC costs four hex values.
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  colors: NpcColors | undefined,
  dir: Dir,
  frame: number,
) {
  const c = { ...DEFAULT_NPC_COLORS, ...(colors ?? {}) };
  const r = (x: number, y: number, w: number, h: number, col: string) => {
    ctx.fillStyle = col;
    ctx.fillRect(px + x, py + y, w, h);
  };
  const out = PALETTE.void;
  const bob = frame === 1 ? 1 : 0;

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(px + 8, py + 17, 5.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  r(5, 13 - bob, 2, 5, c.pants ?? DEFAULT_NPC_COLORS.pants);
  r(9, 13 + bob, 2, 5, c.pants ?? DEFAULT_NPC_COLORS.pants);
  r(5, 17, 2, 1, out);
  r(9, 17, 2, 1, out);

  // torso
  r(4, 8, 8, 6, c.shirt ?? DEFAULT_NPC_COLORS.shirt);
  r(3, 9, 1, 4, c.shirt ?? DEFAULT_NPC_COLORS.shirt);
  r(12, 9, 1, 4, c.shirt ?? DEFAULT_NPC_COLORS.shirt);
  r(3, 13 - bob, 1, 1, c.skin ?? DEFAULT_NPC_COLORS.skin);
  r(12, 13 + bob, 1, 1, c.skin ?? DEFAULT_NPC_COLORS.skin);
  r(4, 14, 8, 1, out);

  // head
  r(4, 2, 8, 7, c.skin ?? DEFAULT_NPC_COLORS.skin);
  r(4, 1, 8, 2, c.hair ?? DEFAULT_NPC_COLORS.hair);
  r(3, 2, 1, 4, c.hair ?? DEFAULT_NPC_COLORS.hair);
  r(12, 2, 1, 4, c.hair ?? DEFAULT_NPC_COLORS.hair);
  r(4, 9, 8, 1, out);

  // face
  if (dir === 'down') {
    r(6, 5, 1, 2, out);
    r(9, 5, 1, 2, out);
  } else if (dir === 'left') {
    r(5, 5, 1, 2, out);
    r(8, 5, 1, 2, out);
  } else if (dir === 'right') {
    r(7, 5, 1, 2, out);
    r(10, 5, 1, 2, out);
  } else {
    r(4, 2, 8, 5, c.hair ?? DEFAULT_NPC_COLORS.hair);
  }
}

/* ------------------------------------------------------------------- boss */

export function drawBoss(ctx: CanvasRenderingContext2D, tx: number, ty: number, w: number, h: number, t: number, hurt: number) {
  const x = tx * TILE;
  const bottom = (ty + h) * TILE;
  const width = w * TILE;
  const height = 74;
  const y = bottom - height;
  const wob = Math.sin(t / 420) * 1.5;

  ctx.save();
  ctx.translate(wob, 0);

  // paper body
  ctx.fillStyle = hurt > 0 ? PALETTE.flame : PALETTE.paper;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = PALETTE.void;
  ctx.fillRect(x, y, width, 2);
  ctx.fillRect(x, bottom - 2, width, 2);
  ctx.fillRect(x, y, 2, height);
  ctx.fillRect(x + width - 2, y, 2, height);

  // header bar
  ctx.fillStyle = PALETTE.rust;
  ctx.fillRect(x + 4, y + 5, width - 8, 9);

  // "form fields"
  for (let i = 0; i < 5; i++) {
    const fy = y + 20 + i * 9;
    ctx.fillStyle = PALETTE.linen;
    ctx.fillRect(x + 6, fy, width - 12, 6);
    ctx.fillStyle = PALETTE.ash;
    ctx.fillRect(x + 7, fy + 1, Math.max(4, (width - 20) * (0.3 + 0.14 * ((i + Math.floor(t / 900)) % 5))), 4);
  }

  // eyes
  const blink = Math.sin(t / 1100) > 0.94 ? 1 : 3;
  ctx.fillStyle = PALETTE.ember;
  ctx.fillRect(x + width * 0.28, y + 7, 5, blink);
  ctx.fillRect(x + width * 0.62, y + 7, 5, blink);

  ctx.restore();
}

/* -------------------------------------------------------------- the world */

function floorColors(floor: string): [string, string, string] {
  switch (floor) {
    case 'hall':
      return [PALETTE.stone, PALETTE.slate, PALETTE.shadow];
    case 'vault':
      return [PALETTE.shadow, PALETTE.slate, PALETTE.ink];
    case 'lino':
      return [PALETTE.fog, PALETTE.mist, PALETTE.ash];
    case 'arena':
      return [PALETTE.slate, PALETTE.stone, PALETTE.ink];
    case 'closet':
      return [PALETTE.ink, PALETTE.shadow, PALETTE.void];
    default:
      return [ROLE.floorA, ROLE.floorB, ROLE.floorGrout];
  }
}

function drawTile(ctx: CanvasRenderingContext2D, room: Room, x: number, y: number) {
  const i = y * room.w + x;
  const v = room.tiles[i];
  const px = x * TILE;
  const py = y * TILE;
  const [a, b, grout] = floorColors(room.floor);

  if (v === T.WALL) {
    const openBelow = y + 1 < room.h && room.tiles[(y + 1) * room.w + x] !== T.WALL;
    ctx.fillStyle = ROLE.wallShade;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = ROLE.wallFace;
    ctx.fillRect(px, py, TILE, TILE - 3);
    ctx.fillStyle = ROLE.wallTop;
    ctx.fillRect(px, py, TILE, 3);
    if (openBelow) {
      ctx.fillStyle = PALETTE.void;
      ctx.fillRect(px, py + TILE - 3, TILE, 3);
    }
    // brick seams
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.fillRect(px, py + 7, TILE, 1);
    ctx.fillRect(px + (y % 2 ? 4 : 11), py + 8, 1, 5);
    return;
  }

  if (v === T.DOOR) {
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = PALETTE.amber3;
    ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
    ctx.fillStyle = PALETTE.void;
    ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 4);
    ctx.fillStyle = PALETTE.amber0;
    ctx.fillRect(px + TILE - 6, py + 8, 2, 2);
    return;
  }

  if (v === T.CARPET) {
    ctx.fillStyle = PALETTE.amber4;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = PALETTE.amber3;
    ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(px + ((x + y) % 2 ? 4 : 8), py + 6, 3, 3);
    return;
  }

  if (v === T.LINO) {
    ctx.fillStyle = (x + y) % 2 ? PALETTE.mist : PALETTE.linen;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.fillRect(px, py + TILE - 1, TILE, 1);
    ctx.fillRect(px + TILE - 1, py, 1, TILE);
    return;
  }

  // default floor: subtle checker + grout
  ctx.fillStyle = (x + y) % 2 ? a : b;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = grout;
  ctx.fillRect(px, py + TILE - 1, TILE, 1);
  ctx.fillRect(px + TILE - 1, py, 1, TILE);
}

export interface RenderState {
  room: Room;
  camX: number;
  camY: number;
  viewW: number;
  viewH: number;
  playerPx: number;
  playerPy: number;
  dir: Dir;
  frame: number;
  time: number;
  /** object id the player can interact with right now */
  focusId?: string;
  /** progress keys already completed, for the ✓ markers */
  done: Set<string>;
  reducedMotion: boolean;
  bossHurt: number;
  nightAlpha: number;
  nightTint: string;
}

export function renderRoom(ctx: CanvasRenderingContext2D, s: RenderState) {
  const { room } = s;
  ctx.imageSmoothingEnabled = false;

  const x0 = Math.max(0, Math.floor(s.camX / TILE) - 1);
  const y0 = Math.max(0, Math.floor(s.camY / TILE) - 1);
  const x1 = Math.min(room.w - 1, Math.ceil((s.camX + s.viewW) / TILE) + 1);
  const y1 = Math.min(room.h - 1, Math.ceil((s.camY + s.viewH) / TILE) + 1);

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) drawTile(ctx, room, x, y);
  }

  // category banners (Skill Tree Chamber)
  if (room.bands) {
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textBaseline = 'alphabetic';
    for (const band of room.bands) {
      const py = band.top * TILE - 6;
      ctx.fillStyle = 'rgba(13,11,20,0.55)';
      ctx.fillRect(TILE, py - 9, room.w * TILE - TILE * 2, 12);
      ctx.fillStyle = PALETTE.amber1;
      ctx.fillText(band.label.toUpperCase(), TILE + 4, py);
    }
  }

  // objects + player, sorted so lower things draw in front
  const drawables: { y: number; draw: () => void }[] = [];

  for (const o of room.objects) {
    if (o.tx > x1 + 3 || o.tx + o.w < x0 - 3) continue;
    drawables.push({
      y: o.ty + o.h,
      draw: () => drawObject(ctx, o, s),
    });
  }

  drawables.push({
    y: s.playerPy / TILE + 1,
    draw: () => drawCharacter(ctx, s.playerPx, s.playerPy - 2, undefined, s.dir, s.frame),
  });

  drawables.sort((a, b) => a.y - b.y);
  for (const d of drawables) d.draw();

  // day/night tint
  if (s.nightAlpha > 0.01) {
    ctx.globalAlpha = s.nightAlpha;
    ctx.fillStyle = s.nightTint;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(s.camX - 32, s.camY - 32, s.viewW + 64, s.viewH + 64);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
}

function drawObject(ctx: CanvasRenderingContext2D, o: WorldObject, s: RenderState) {
  const bobY = o.bob !== undefined && !s.reducedMotion ? Math.sin(s.time / 600 + o.bob) * 1.5 : 0;

  ctx.save();
  ctx.translate(0, bobY);

  if (o.kind === 'npc' && o.sprite) {
    // NPCs that are not people (the office plant, a terminal) use a sprite.
    drawSpriteOnFootprint(ctx, o.sprite, o.tx, o.ty, o.w, o.h, o.tint);
  } else if (o.kind === 'npc') {
    const dir: Dir = 'down';
    const frame = s.reducedMotion ? 0 : Math.floor(s.time / 500) % 2;
    drawCharacter(ctx, o.tx * TILE, (o.ty + 1) * TILE - 18, o.colors, dir, frame);
  } else if (o.kind === 'boss') {
    drawBoss(ctx, o.tx, o.ty, o.w, o.h, s.time, s.bossHurt);
  } else if (o.sprite) {
    drawSpriteOnFootprint(ctx, o.sprite, o.tx, o.ty, o.w, o.h, o.tint);
  }

  ctx.restore();

  /* ------------------------------------------------------------ nameplate
   * The rule from the brief: a joke never replaces a fact. So every object
   * that represents real content wears its name as you approach it — project
   * titles, job/company/dates, skill name + level. Dense objects (skill
   * crystals) only label the one you are standing next to, or the room turns
   * into soup.
   * --------------------------------------------------------------------- */
  if (o.label) {
    const ptx = s.playerPx / TILE;
    const pty = s.playerPy / TILE;
    const dist = Math.max(Math.abs(o.tx + (o.w - 1) / 2 - ptx), Math.abs(o.ty - pty));
    const dense = o.kind === 'crystal';
    if (s.focusId === o.id || (!dense && dist <= 4.5)) {
      const sprite = o.sprite ? spriteCanvas(o.sprite, o.tint) : null;
      const spriteH = sprite ? (sprite.height * (o.w * TILE)) / sprite.width : o.kind === 'boss' ? 74 : 18;
      const topY = (o.ty + o.h) * TILE - spriteH;
      const cx = o.tx * TILE + (o.w * TILE) / 2;

      const text = o.label.length > 22 ? `${o.label.slice(0, 21)}…` : o.label;
      ctx.font = '7px VT323, ui-monospace, monospace';
      ctx.textAlign = 'center';
      const tw = ctx.measureText(text).width;
      const plateY = topY - 10;
      ctx.fillStyle = 'rgba(13,11,20,0.88)';
      ctx.fillRect(cx - tw / 2 - 2, plateY, tw + 4, 9);
      ctx.fillStyle = s.focusId === o.id ? PALETTE.gold : PALETTE.linen;
      ctx.fillText(text, cx, plateY + 7);
      ctx.textAlign = 'left';
    }
  }

  // completed marker
  if (o.progressKey && s.done.has(o.progressKey)) {
    ctx.fillStyle = PALETTE.lime;
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('✓', o.tx * TILE + o.w * TILE - 6, o.ty * TILE - 4);
  }

  // "!" interaction indicator
  if (s.focusId === o.id) {
    const t = s.reducedMotion ? 0 : Math.sin(s.time / 180) * 1.5;
    const cx = o.tx * TILE + (o.w * TILE) / 2;
    const cy = o.ty * TILE - 12 + t;
    ctx.fillStyle = PALETTE.void;
    ctx.fillRect(cx - 4, cy - 2, 8, 14);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(cx - 2, cy, 4, 7);
    ctx.fillRect(cx - 2, cy + 9, 4, 3);
  }
}

/** Small portrait used by the dialogue box, drawn to its own canvas. */
export function drawPortrait(
  ctx: CanvasRenderingContext2D,
  kind: 'sprite' | 'npc' | 'boss' | 'avatar',
  size: number,
  opts: { key?: string; colors?: NpcColors; time?: number },
) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(0, 0, size, size);

  if (kind === 'avatar') {
    const c = spriteCanvas('avatar');
    if (c) ctx.drawImage(c, 0, 0, size, size);
    return;
  }
  if (kind === 'boss') {
    const k = size / 48;
    ctx.save();
    ctx.scale(k, k);
    drawBoss(ctx, 0, 0, 3, 4, opts.time ?? 0, 0);
    ctx.restore();
    return;
  }
  if (kind === 'npc') {
    const k = size / 18;
    ctx.save();
    ctx.scale(k, k);
    drawCharacter(ctx, 1, 0, opts.colors, 'down', 0);
    ctx.restore();
    return;
  }
  const c = spriteCanvas(opts.key ?? 'plant');
  if (!c) return;
  const k = Math.min(size / c.width, size / c.height);
  const dw = c.width * k;
  const dh = c.height * k;
  ctx.drawImage(c, (size - dw) / 2, size - dh, dw, dh);
}
