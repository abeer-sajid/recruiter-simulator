/* ============================================================================
 * SAVE — localStorage persistence with a VERSIONED schema and migrations.
 *
 * WHY THIS MATTERS FOR YOU LATER: you will add projects, jobs and skills for
 * years. A visitor who played in 2026 must be able to come back in 2028 and
 * find their old save still works, with the new rooms and new quest objectives
 * available rather than locked or crashed.
 *
 * The rules that make that true:
 *   1. Progress is stored as a SET OF KEYS ("project:rag-knowledge-chatbot"),
 *      never as counts or indexes. New content is simply a key nobody has yet.
 *   2. Every load is sanitised against the CURRENT content: unknown room ids
 *      fall back to the lobby, blocked positions fall back to the spawn tile,
 *      unknown achievement ids are dropped.
 *   3. Bumping SAVE_VERSION requires adding a migration step below. If a save
 *      is from the future (someone downgraded), we keep the achievements and
 *      reset the rest rather than crashing.
 * ========================================================================= */

import { ACHIEVEMENTS } from '../data/achievements';

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'recruiter-sim:save';

export interface SaveData {
  v: number;
  roomId: string;
  tx: number;
  ty: number;
  dir: string;
  xp: number;
  achievements: string[];
  progress: string[];
  visited: string[];
  coffeeCount: number;
  sarcasticCount: number;
  bossDefeated: boolean;
  muted: boolean;
  crt: boolean;
  savedAt: number;
}

export function emptySave(): SaveData {
  return {
    v: SAVE_VERSION,
    roomId: 'lobby',
    tx: -1,
    ty: -1,
    dir: 'down',
    xp: 0,
    achievements: [],
    progress: [],
    visited: [],
    coffeeCount: 0,
    sarcasticCount: 0,
    bossDefeated: false,
    muted: true,
    crt: false,
    savedAt: 0,
  };
}

/* ---------------------------------------------------------------------------
 * MIGRATIONS
 * One function per version step. To add version 2:
 *   1. bump SAVE_VERSION to 2
 *   2. add `2: (s) => ({ ...s, myNewField: defaultValue })` below
 * Never delete an old step — a returning visitor may be several versions back.
 * ------------------------------------------------------------------------ */
type AnySave = Record<string, unknown>;

const MIGRATIONS: Record<number, (s: AnySave) => AnySave> = {
  // 2: (s) => ({ ...s, newThing: false }),
};

function migrate(raw: AnySave): SaveData {
  let s = { ...raw };
  let v = typeof s.v === 'number' ? (s.v as number) : 0;

  // From the future: keep what is universally safe, reset the rest.
  if (v > SAVE_VERSION) {
    const keep = Array.isArray(s.achievements) ? (s.achievements as string[]) : [];
    return { ...emptySave(), achievements: keep };
  }

  while (v < SAVE_VERSION) {
    const step = MIGRATIONS[v + 1];
    s = step ? step(s) : s;
    v += 1;
    s.v = v;
  }
  return { ...emptySave(), ...(s as Partial<SaveData>), v: SAVE_VERSION };
}

/** Drop anything that no longer exists in the current content. */
function sanitise(s: SaveData, knownRooms: string[]): SaveData {
  const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
  return {
    ...s,
    roomId: knownRooms.includes(s.roomId) ? s.roomId : 'lobby',
    achievements: (s.achievements ?? []).filter((a) => ids.has(a)),
    progress: Array.isArray(s.progress) ? s.progress : [],
    visited: (s.visited ?? []).filter((r) => knownRooms.includes(r)),
    xp: Number.isFinite(s.xp) ? Math.max(0, s.xp) : 0,
  };
}

export function loadSave(knownRooms: string[]): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AnySave;
    if (!parsed || typeof parsed !== 'object') return null;
    return sanitise(migrate(parsed), knownRooms);
  } catch {
    // Corrupt save: behave exactly like a first visit rather than crashing.
    return null;
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...data, v: SAVE_VERSION, savedAt: Date.now() }));
  } catch {
    /* private mode / quota: the game keeps working, it just will not resume */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(SAVE_KEY);
  } catch {
    return false;
  }
}
