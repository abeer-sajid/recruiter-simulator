/* ============================================================================
 * WORLD — turns content arrays into rooms.
 *
 * THIS IS THE FILE THAT MAKES "ADD A PROJECT IN FIVE MINUTES" TRUE.
 *
 * Nothing here contains a project name, a skill, a job title or a line of
 * dialogue. It reads /src/data, lays objects out on a lattice, and proves by
 * flood-fill that everything it placed is still reachable from the spawn tile.
 * ========================================================================= */

import { visible } from '../types/content';
import type { Job, Project, Skill } from '../types/content';
import { PROJECTS } from '../data/projects';
import { SKILLS, CATEGORY_ORDER } from '../data/skills';
import { JOBS } from '../data/experience';
import { NPCS } from '../data/dialogue';
import { CERTIFICATIONS } from '../data/profile';
import {
  LOBBY_MAP,
  BREAKROOM_MAP,
  BOSSROOM_MAP,
  SECRET_MAP,
  DOOR_TARGETS,
  DOOR_LABELS,
  ROOMS,
  LAYOUT,
} from '../data/maps';
import { tierFor } from '../data/palette';
import { T } from './types';
import type { DoorTile, Room, WorldObject } from './types';

/* ------------------------------------------------------------- ordering -- */

export function orderedProjects(): Project[] {
  const list = visible(PROJECTS);
  return [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
}

export function orderedSkills(): Skill[] {
  return visible(SKILLS);
}

export function skillCategories(): string[] {
  const seen: string[] = [];
  for (const s of orderedSkills()) if (!seen.includes(s.category)) seen.push(s.category);
  // Honour CATEGORY_ORDER first, then anything new, in first-appearance order.
  const ordered = CATEGORY_ORDER.filter((c) => seen.includes(c));
  for (const c of seen) if (!ordered.includes(c)) ordered.push(c);
  return ordered;
}

export function orderedJobs(): Job[] {
  const list = visible(JOBS);
  if (list.every((j) => typeof j.sortKey === 'number')) {
    return [...list].sort((a, b) => (b.sortKey as number) - (a.sortKey as number));
  }
  return list;
}

/* ------------------------------------------------------------ primitives -- */

function blankRoom(id: string, w: number, h: number): Room {
  const meta = ROOMS.find((r) => r.id === id);
  const tiles = new Uint8Array(w * h).fill(T.FLOOR);
  for (let x = 0; x < w; x++) {
    tiles[x] = T.WALL;
    tiles[(h - 1) * w + x] = T.WALL;
  }
  for (let y = 0; y < h; y++) {
    tiles[y * w] = T.WALL;
    tiles[y * w + (w - 1)] = T.WALL;
  }
  return {
    id,
    name: meta?.name ?? id,
    subtitle: meta?.subtitle ?? '',
    floor: meta?.floor ?? 'office',
    w,
    h,
    tiles,
    solid: new Uint8Array(w * h),
    objects: [],
    doors: [],
    spawn: { tx: 1, ty: 1 },
    entry: { tx: 1, ty: 1 },
  };
}

function fromAscii(id: string, map: string[]): Room {
  const h = map.length;
  const w = map[0].length;
  const room = blankRoom(id, w, h);
  for (let y = 0; y < h; y++) {
    const row = map[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      const i = y * w + x;
      if (ch === '#') room.tiles[i] = T.WALL;
      else if (ch === ',') room.tiles[i] = T.CARPET;
      else if (ch === '~') room.tiles[i] = T.LINO;
      else if (ch === '@') {
        room.tiles[i] = T.FLOOR;
        room.spawn = { tx: x, ty: y };
        room.entry = { tx: x, ty: y };
      } else if (DOOR_TARGETS[ch]) {
        room.tiles[i] = T.DOOR;
        room.doors.push({
          tx: x,
          ty: y,
          to: DOOR_TARGETS[ch],
          ...(ch === 'S' ? { locked: 'maxLevel' as const } : {}),
        });
      } else {
        room.tiles[i] = T.FLOOR;
      }
    }
  }
  return room;
}

function place(room: Room, o: WorldObject) {
  room.objects.push(o);
  if (o.solid) {
    for (let dy = 0; dy < o.h; dy++) {
      for (let dx = 0; dx < o.w; dx++) {
        const x = o.tx + dx;
        const y = o.ty + dy;
        if (x >= 0 && y >= 0 && x < room.w && y < room.h) room.solid[y * room.w + x] = 1;
      }
    }
  }
}

export function isBlocked(room: Room, tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return true;
  const i = ty * room.w + tx;
  return room.tiles[i] === T.WALL || room.solid[i] === 1;
}

export function doorAt(room: Room, tx: number, ty: number): DoorTile | undefined {
  return room.doors.find((d) => d.tx === tx && d.ty === ty);
}

/** Free tiles near a target, used to auto-place NPCs that have no `at`. */
function findFreeTile(room: Room, preferX: number, preferY: number): { tx: number; ty: number } {
  for (let r = 0; r < Math.max(room.w, room.h); r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = preferX + dx;
        const y = preferY + dy;
        if (isBlocked(room, x, y)) continue;
        if (doorAt(room, x, y)) continue;
        // keep a walkable neighbour so the player can reach them
        if (isBlocked(room, x, y + 1) && isBlocked(room, x, y - 1) && isBlocked(room, x + 1, y) && isBlocked(room, x - 1, y)) continue;
        return { tx: x, ty: y };
      }
    }
  }
  return { tx: 1, ty: 1 };
}

function addNpcs(room: Room) {
  for (const npc of visible(NPCS)) {
    if (npc.room !== room.id) continue;
    const at = npc.at && !isBlocked(room, npc.at.tx, npc.at.ty)
      ? npc.at
      : findFreeTile(room, npc.at?.tx ?? Math.floor(room.w / 2), npc.at?.ty ?? Math.floor(room.h / 2));
    place(room, {
      id: `npc-${npc.id}`,
      kind: 'npc',
      tx: at.tx,
      ty: at.ty,
      w: 1,
      h: 1,
      solid: true,
      sprite: npc.sprite,
      colors: npc.colors,
      name: npc.name,
      barks: npc.barks,
      barksSequential: npc.barksSequential,
      interact: { type: 'dialogue', node: npc.dialogue },
      progressKey: `npc:${npc.id}`,
    });
  }
}

/* ------------------------------------------------------------ the lobby -- */

function buildLobby(): Room {
  const room = fromAscii('lobby', LOBBY_MAP);

  // A signpost under every door, labelled from DOOR_LABELS. Add a door to the
  // ASCII map and its signpost appears automatically.
  for (const d of room.doors) {
    const ch = Object.keys(DOOR_TARGETS).find((k) => DOOR_TARGETS[k] === d.to);
    const label = (ch && DOOR_LABELS[ch]) || d.to.toUpperCase();
    const onTopWall = d.ty === 0;
    const onBottomWall = d.ty === room.h - 1;
    const onRightWall = d.tx === room.w - 1;
    const sx = onRightWall ? d.tx - 2 : d.tx + 1;
    const sy = onTopWall ? d.ty + 1 : onBottomWall ? d.ty - 1 : d.ty;
    if (isBlocked(room, sx, sy)) continue;
    place(room, {
      id: `sign-${d.to}`,
      kind: 'sign',
      tx: sx,
      ty: sy,
      w: 1,
      h: 1,
      sprite: 'sign',
      solid: true,
      label,
      interact: { type: 'sign', text: label },
    });
  }

  place(room, {
    id: 'lobby-cooler',
    kind: 'prop',
    tx: 2,
    ty: 10,
    w: 1,
    h: 1,
    sprite: 'cooler',
    solid: true,
  });

  addNpcs(room);
  return room;
}

/* -------------------------------------------------- the hall of projects -- */

function buildProjects(): Room {
  const items = orderedProjects();
  const L = LAYOUT.projects;
  const n = Math.max(items.length, 1);
  const cols = Math.min(L.maxCols, Math.max(L.minCols, Math.ceil(Math.sqrt(n))));
  const rows = Math.ceil(n / cols);

  const w = Math.max(L.minW, L.padX * 2 + cols * L.cellW);
  const h = L.padTop + rows * L.cellH + L.padBottom;
  const room = blankRoom('projects', w, h);
  // Centre the grid inside the room, whatever the room ended up being.
  const offsetX = Math.floor((w - cols * L.cellW) / 2);

  // Entrance: bottom-centre, back to the lobby.
  const doorX = Math.floor(w / 2);
  room.tiles[(h - 1) * w + doorX] = T.DOOR;
  room.doors.push({ tx: doorX, ty: h - 1, to: 'lobby' });
  room.spawn = { tx: doorX, ty: h - 2 };
  room.entry = { tx: doorX, ty: h - 2 };

  // Candidate cells, sorted by walking distance from the entrance so that
  // `featured: true` projects land nearest the door.
  const cells: { tx: number; ty: number; d: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tx = offsetX + c * L.cellW + Math.floor((L.cellW - 2) / 2);
      const ty = L.padTop + r * L.cellH;
      cells.push({ tx, ty, d: Math.abs(tx - doorX) + Math.abs(ty - (h - 2)) });
    }
  }
  cells.sort((a, b) => a.d - b.d);

  items.forEach((p, i) => {
    const cell = cells[i];
    if (!cell) return;
    place(room, {
      id: `project-${p.id}`,
      kind: 'cabinet',
      tx: cell.tx,
      ty: cell.ty,
      w: 2,
      h: 1,
      sprite: 'cabinet',
      solid: true,
      label: p.name,
      interact: { type: 'project', id: p.id },
      progressKey: `project:${p.id}`,
    });
  });

  addNpcs(room);
  return room;
}

/* --------------------------------------------------- skill tree chamber -- */

function buildSkills(): Room {
  const L = LAYOUT.skills;
  const cats = skillCategories();
  const byCat = cats.map((c) => ({
    cat: c,
    items: orderedSkills()
      .filter((s) => s.category === c)
      .sort((a, b) => b.level - a.level),
  }));

  const cols = Math.min(
    L.maxCols,
    Math.max(L.minCols, Math.max(1, ...byCat.map((b) => Math.min(L.maxCols, b.items.length)))),
  );

  let h = L.padTop;
  const blocks = byCat.map((b) => {
    const rows = Math.max(1, Math.ceil(b.items.length / cols));
    const top = h;
    h += rows * L.cellH + L.categoryGap;
    return { ...b, rows, top };
  });
  h += L.padBottom;
  const w = L.padX * 2 + cols * L.cellW;
  const room = blankRoom('skills', w, h);

  // The entrance is at the TOP here: you walk DOWN through the skill tree, so
  // the first category in CATEGORY_ORDER is the one you meet first.
  const doorX = Math.floor(w / 2);
  room.tiles[doorX] = T.DOOR;
  room.doors.push({ tx: doorX, ty: 0, to: 'lobby' });
  room.spawn = { tx: doorX, ty: 1 };
  room.entry = { tx: doorX, ty: 1 };

  // The assessment terminal, just inside the entrance.
  place(room, {
    id: 'stat-terminal',
    kind: 'terminal',
    tx: doorX + 2,
    ty: 2,
    w: 1,
    h: 1,
    sprite: 'terminal',
    solid: true,
    label: 'ASSESSMENT TERMINAL',
    interact: { type: 'dialogue', node: 'stats.intro' },
    progressKey: 'terminal:stats',
  });

  for (const b of blocks) {
    b.items.forEach((s, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const tx = L.padX + c * L.cellW + Math.floor((L.cellW - 1) / 2);
      const ty = b.top + r * L.cellH;
      place(room, {
        id: `skill-${s.id}`,
        kind: 'crystal',
        tx,
        ty,
        w: 1,
        h: 1,
        sprite: 'crystal',
        tint: tierFor(s.level).color,
        solid: true,
        label: `${s.name} · Lv.${s.level}`,
        interact: { type: 'skill', id: s.id },
        progressKey: `skill:${s.id}`,
        bob: i * 0.7,
      });
    });
  }

  // Category banners are rendered by the renderer from this list.
  room.bands = blocks.map((b) => ({ label: b.cat, top: b.top, rows: b.rows }));

  addNpcs(room);
  return room;
}

/* ------------------------------------------------------------ archives -- */

function buildArchives(): Room {
  const jobs = orderedJobs();
  const L = LAYOUT.archives;
  const w = L.padX * 2 + Math.max(1, jobs.length) * L.spacing;
  const h = L.height;
  const room = blankRoom('archives', w, h);

  // Exit on the left wall — you walk in, then travel right through time.
  const doorY = Math.floor(h / 2);
  room.tiles[doorY * w] = T.DOOR;
  room.doors.push({ tx: 0, ty: doorY, to: 'lobby' });
  room.spawn = { tx: 2, ty: doorY };
  room.entry = { tx: 2, ty: doorY };

  jobs.forEach((j, i) => {
    const tx = L.padX + i * L.spacing;
    place(room, {
      id: `doorway-${j.id}`,
      kind: 'doorway',
      tx,
      ty: 2,
      w: 2,
      h: 1,
      sprite: 'doorway',
      solid: true,
      label: `${j.company} · ${j.start}–${j.end}`,
      interact: { type: 'job', id: j.id },
      progressKey: `job:${j.id}`,
    });
    place(room, {
      id: `colleague-${j.id}`,
      kind: 'npc',
      tx: tx + 1,
      ty: 5,
      w: 1,
      h: 1,
      solid: true,
      colors: j.colleague?.colors,
      name: j.colleague?.name ?? 'Former Colleague',
      barks: [`${j.title}. ${j.start} to ${j.end}.`, 'Ask me. I was there.'],
      interact: { type: 'job', id: j.id },
      progressKey: `job:${j.id}`,
    });
  });

  addNpcs(room);
  return room;
}

/* ---------------------------------------------------------- break room -- */

function buildBreakroom(): Room {
  const room = fromAscii('breakroom', BREAKROOM_MAP);

  place(room, {
    id: 'coffee-machine',
    kind: 'prop',
    tx: 2,
    ty: 2,
    w: 1,
    h: 1,
    sprite: 'coffee',
    solid: true,
    label: 'COFFEE',
    interact: { type: 'coffee' },
  });

  // One bookshelf per certification provider. Add a provider in profile.ts and
  // a shelf appears here, spaced automatically.
  visible(CERTIFICATIONS).forEach((g, i) => {
    const tx = 5 + i * 3;
    if (tx >= room.w - 2) return;
    place(room, {
      id: `shelf-${g.id}`,
      kind: 'prop',
      tx,
      ty: 1,
      w: 1,
      h: 1,
      sprite: 'bookshelf',
      solid: true,
      label: g.provider,
      interact: { type: 'certs' },
      progressKey: 'certs',
    });
  });

  place(room, {
    id: 'breakroom-window',
    kind: 'prop',
    tx: room.w - 3,
    ty: 4,
    w: 1,
    h: 1,
    sprite: 'window',
    solid: true,
    label: 'WINDOW',
    interact: { type: 'sincere' },
    progressKey: 'sincere',
  });

  place(room, {
    id: 'breakroom-cooler',
    kind: 'prop',
    tx: 2,
    ty: 8,
    w: 1,
    h: 1,
    sprite: 'cooler',
    solid: true,
  });

  place(room, {
    id: 'breakroom-crate',
    kind: 'prop',
    tx: room.w - 3,
    ty: 9,
    w: 1,
    h: 1,
    sprite: 'crate',
    solid: true,
  });

  addNpcs(room);
  return room;
}

/* ----------------------------------------------------------- boss room -- */

function buildBoss(): Room {
  const room = fromAscii('boss', BOSSROOM_MAP);
  place(room, {
    id: 'the-hiring-process',
    kind: 'boss',
    tx: Math.floor(room.w / 2) - 1,
    ty: 3,
    w: 3,
    h: 2,
    solid: true,
    label: 'THE HIRING PROCESS',
    interact: { type: 'dialogue', node: 'boss.intro' },
    progressKey: 'boss:met',
  });
  addNpcs(room);
  return room;
}

/* -------------------------------------------------------- server closet -- */

function buildSecret(): Room {
  const room = fromAscii('secret', SECRET_MAP);
  for (let i = 0; i < 3; i++) {
    place(room, {
      id: `rack-${i}`,
      kind: 'prop',
      tx: 2 + i * 3,
      ty: 2,
      w: 1,
      h: 1,
      sprite: 'rack',
      solid: true,
      interact: i === 1 ? { type: 'dialogue', node: 'secret.rack' } : undefined,
      label: i === 1 ? 'PROD-03' : undefined,
      progressKey: i === 1 ? 'secret:rack' : undefined,
    });
  }
  addNpcs(room);
  return room;
}

/* ------------------------------------------------------------- assembly -- */

const BUILDERS: Record<string, () => Room> = {
  lobby: buildLobby,
  projects: buildProjects,
  skills: buildSkills,
  archives: buildArchives,
  breakroom: buildBreakroom,
  boss: buildBoss,
  secret: buildSecret,
};

const cache = new Map<string, Room>();

export function getRoom(id: string): Room {
  const hit = cache.get(id);
  if (hit) return hit;
  const build = BUILDERS[id] ?? BUILDERS.lobby;
  const room = build();
  cache.set(id, room);
  return room;
}

export function allRoomIds(): string[] {
  return Object.keys(BUILDERS);
}

/** Throw away generated rooms (used by dev hot-reload and by tests). */
export function resetWorld() {
  cache.clear();
}

/* ---------------------------------------------------------------------------
 * REACHABILITY — the guarantee that a newly added project can never spawn
 * inside a wall or behind one. Flood-fills from the spawn tile and checks that
 * every interactable has a reachable neighbour.
 * ------------------------------------------------------------------------ */
export function reachabilityReport(room: Room): string[] {
  const problems: string[] = [];
  const seen = new Uint8Array(room.w * room.h);
  const q: number[] = [room.spawn.ty * room.w + room.spawn.tx];

  if (isBlocked(room, room.spawn.tx, room.spawn.ty)) {
    problems.push(`spawn tile (${room.spawn.tx},${room.spawn.ty}) is blocked`);
    return problems;
  }
  seen[q[0]] = 1;

  while (q.length) {
    const i = q.pop() as number;
    const x = i % room.w;
    const y = (i - x) / room.w;
    const nb = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of nb) {
      if (nx < 0 || ny < 0 || nx >= room.w || ny >= room.h) continue;
      const ni = ny * room.w + nx;
      if (seen[ni]) continue;
      if (isBlocked(room, nx, ny)) continue;
      seen[ni] = 1;
      q.push(ni);
    }
  }

  const occupied = new Map<number, string>();
  for (const o of room.objects) {
    for (let dy = 0; dy < o.h; dy++) {
      for (let dx = 0; dx < o.w; dx++) {
        const key = (o.ty + dy) * room.w + (o.tx + dx);
        const prev = occupied.get(key);
        if (prev && prev !== o.id) {
          problems.push(`"${o.id}" overlaps "${prev}" at tile (${o.tx + dx},${o.ty + dy})`);
        }
        occupied.set(key, o.id);
      }
    }
    if (o.tx < 1 || o.ty < 1 || o.tx + o.w > room.w - 1 || o.ty + o.h > room.h - 1) {
      problems.push(`"${o.id}" is outside the room bounds`);
    }
    if (!o.interact) continue;
    let ok = false;
    for (let dy = -1; dy <= o.h; dy++) {
      for (let dx = -1; dx <= o.w; dx++) {
        const nx = o.tx + dx;
        const ny = o.ty + dy;
        if (nx < 0 || ny < 0 || nx >= room.w || ny >= room.h) continue;
        if (seen[ny * room.w + nx]) ok = true;
      }
    }
    if (!ok) problems.push(`"${o.id}" is unreachable — no walkable tile next to it`);
  }

  for (const d of room.doors) {
    if (!seen[d.ty * room.w + d.tx]) problems.push(`door to "${d.to}" is unreachable`);
  }

  return problems;
}
