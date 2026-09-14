/* ============================================================================
 * STORE — all discrete game state (Zustand).
 *
 * Per-frame state (pixel position, camera) deliberately lives OUTSIDE React in
 * engine/runtime.ts, so walking around does not re-render the UI tree.
 * ========================================================================= */

import { create } from 'zustand';
import type { DialogueChoice, DialogueEffect } from '../types/content';
import { ACHIEVEMENTS, DEFAULT_ACHIEVEMENT_XP } from '../data/achievements';
import { DIALOGUE } from '../data/dialogue';
import { CERTIFICATIONS, SINCERE_NOTE, WEIRD_FACTS } from '../data/profile';
import { COFFEE_LINES } from '../data/jokes';
import { JOBS } from '../data/experience';
import { visible } from '../types/content';
import { allRoomIds, getRoom } from '../engine/world';
import type { Interaction } from '../engine/types';
import { clearSave, emptySave, loadSave, writeSave } from './save';
import type { SaveData } from './save';
import { sfx, setMuted } from './audio';
import { buildObjectives, completionPercent } from './quests';

export const XP_PER_LEVEL = 120;
export const MAX_LEVEL = 10;

export type PanelId =
  | 'quests'
  | 'inventory'
  | 'help'
  | 'skills'
  | 'boss'
  | 'credits'
  | 'victory'
  | 'achievements'
  | null;

export interface DialogueView {
  speaker: string;
  portrait: string;
  portraitColors?: { skin?: string; hair?: string; shirt?: string; pants?: string };
  lines: string[];
  page: number;
  choices?: DialogueChoice[];
  showChoices: boolean;
  onEnd?: DialogueEffect;
}

export interface Toast {
  key: number;
  title: string;
  body: string;
}

export interface CardView {
  kind: 'project' | 'skill';
  id: string;
}

interface GameState {
  screen: 'title' | 'playing';
  roomId: string;
  /** Where to place the player on the next room render. */
  pendingSpawn: { tx: number; ty: number } | null;
  banner: string | null;

  xp: number;
  level: number;
  progress: Set<string>;
  achievements: Set<string>;
  visited: Set<string>;

  dialogue: DialogueView | null;
  panel: PanelId;
  card: CardView | null;
  toasts: Toast[];

  coffeeCount: number;
  sarcasticCount: number;
  bossDefeated: boolean;
  bossHp: number;

  muted: boolean;
  crt: boolean;
  reducedMotion: boolean;
  shake: number;

  hasSaveFile: boolean;

  /* -------------------------------------------------------------- actions */
  boot: () => void;
  newGame: () => void;
  continueGame: () => void;
  goToRoom: (id: string, opts?: { silent?: boolean }) => void;
  interact: (i: Interaction, objectId?: string) => void;
  openDialogueNode: (nodeId: string) => void;
  advance: () => void;
  choose: (index: number) => void;
  closeDialogue: () => void;
  setPanel: (p: PanelId) => void;
  openCard: (c: CardView | null) => void;
  addXp: (n: number) => void;
  unlock: (id: string) => void;
  mark: (key: string, xp?: number) => void;
  toast: (title: string, body: string) => void;
  dropToast: (key: number) => void;
  toggleMute: () => void;
  toggleCrt: () => void;
  setReducedMotion: (v: boolean) => void;
  hitBoss: (amount: number) => void;
  defeatBoss: () => void;
  persist: () => void;
  completion: () => number;
  playerTile: () => { tx: number; ty: number };
  setPlayerTile: (tx: number, ty: number) => void;
}

/** The only mutable non-React bit the store needs to know about. */
let playerTile = { tx: -1, ty: -1 };

function levelFor(xp: number) {
  return Math.max(1, Math.min(MAX_LEVEL, Math.floor(xp / XP_PER_LEVEL) + 1));
}

function effectXp(e?: DialogueEffect) {
  return e?.xp ?? 0;
}

export const useGame = create<GameState>((set, get) => ({
  screen: 'title',
  roomId: 'lobby',
  pendingSpawn: null,
  banner: null,

  xp: 0,
  level: 1,
  progress: new Set<string>(),
  achievements: new Set<string>(),
  visited: new Set<string>(),

  dialogue: null,
  panel: null,
  card: null,
  toasts: [],

  coffeeCount: 0,
  sarcasticCount: 0,
  bossDefeated: false,
  bossHp: 100,

  muted: true,
  crt: false,
  reducedMotion: false,
  shake: 0,

  hasSaveFile: false,

  /* ------------------------------------------------------------------ */

  boot: () => {
    const save = loadSave(allRoomIds());
    set({ hasSaveFile: !!save });
    if (save) {
      set({
        muted: save.muted,
        crt: save.crt,
      });
      setMuted(save.muted);
    }
  },

  newGame: () => {
    clearSave();
    playerTile = { tx: -1, ty: -1 };
    set({
      screen: 'playing',
      roomId: 'lobby',
      pendingSpawn: null,
      xp: 0,
      level: 1,
      progress: new Set(),
      achievements: new Set(),
      visited: new Set(['lobby']),
      coffeeCount: 0,
      sarcasticCount: 0,
      bossDefeated: false,
      bossHp: 100,
      dialogue: null,
      panel: null,
      card: null,
      banner: null,
      hasSaveFile: true,
    });
    get().persist();
  },

  continueGame: () => {
    const save = loadSave(allRoomIds()) ?? emptySave();
    const room = getRoom(save.roomId);
    const spawn =
      save.tx >= 0 && save.ty >= 0 && save.tx < room.w && save.ty < room.h
        ? { tx: save.tx, ty: save.ty }
        : room.spawn;
    playerTile = { ...spawn };
    set({
      screen: 'playing',
      roomId: save.roomId,
      pendingSpawn: spawn,
      xp: save.xp,
      level: levelFor(save.xp),
      progress: new Set(save.progress),
      achievements: new Set(save.achievements),
      visited: new Set(save.visited.length ? save.visited : [save.roomId]),
      coffeeCount: save.coffeeCount,
      sarcasticCount: save.sarcasticCount,
      bossDefeated: save.bossDefeated,
      bossHp: save.bossDefeated ? 0 : 100,
      muted: save.muted,
      crt: save.crt,
      dialogue: null,
      panel: null,
      card: null,
      banner: null,
    });
    setMuted(save.muted);
  },

  goToRoom: (id, opts) => {
    const room = getRoom(id);
    playerTile = { ...room.entry };
    const visited = new Set(get().visited);
    const isNew = !visited.has(id);
    visited.add(id);
    set({
      roomId: id,
      pendingSpawn: { ...room.entry },
      visited,
      dialogue: null,
      panel: null,
      card: null,
      banner: `${room.name} — ${room.subtitle}`,
    });
    if (!opts?.silent) sfx('door');
    if (isNew) get().addXp(30);
    get().persist();
  },

  interact: (i, objectId) => {
    const st = get();
    switch (i.type) {
      case 'dialogue':
        st.openDialogueNode(i.node);
        if (objectId?.startsWith('npc-')) st.mark(`npc:${objectId.slice(4)}`, 20);
        break;

      case 'sign':
        set({
          dialogue: {
            speaker: 'Signpost',
            portrait: 'sign',
            lines: [`→ ${i.text}`],
            page: 0,
            showChoices: false,
          },
        });
        sfx('blip');
        break;

      case 'project':
        st.openCard({ kind: 'project', id: i.id });
        st.mark(`project:${i.id}`, 40);
        break;

      case 'skill':
        st.openCard({ kind: 'skill', id: i.id });
        st.mark(`skill:${i.id}`, 8);
        break;

      case 'skillSheet':
        set({ panel: 'skills' });
        break;

      case 'job': {
        const job = JOBS.find((j) => j.id === i.id);
        if (!job) break;
        set({
          dialogue: {
            speaker: job.colleague?.name
              ? `${job.colleague.name} — ${job.colleague.role ?? 'Former colleague'}`
              : 'Former colleague',
            portrait: 'npc',
            portraitColors: job.colleague?.colors,
            lines: [`${job.title} · ${job.company} · ${job.start}–${job.end}`, ...job.testimonial],
            page: 0,
            showChoices: false,
            onEnd: { xp: 45 },
          },
        });
        st.mark(`job:${i.id}`, 0);
        sfx('blip');
        break;
      }

      case 'coffee': {
        const n = st.coffeeCount + 1;
        const line = COFFEE_LINES[Math.min(n - 1, COFFEE_LINES.length - 1)];
        const facts = visible(WEIRD_FACTS);
        const extra = facts.length
          ? facts[(n - 1) % facts.length].text
          : 'Personal anecdotes are pending review by Legal.';
        set({
          coffeeCount: n,
          dialogue: {
            speaker: 'Coffee Machine',
            portrait: 'coffee',
            lines: [line, extra],
            page: 0,
            showChoices: false,
          },
        });
        sfx('coffee');
        if (n >= 10) st.unlock('coffee-10');
        st.persist();
        break;
      }

      case 'certs': {
        const lines = visible(CERTIFICATIONS).flatMap((g) => [
          `${g.provider} —`,
          g.items.join(' · '),
        ]);
        set({
          dialogue: {
            speaker: 'Bookshelf',
            portrait: 'bookshelf',
            lines: lines.length
              ? ['Certifications. Filed by provider, because of course they are.', ...lines]
              : ['Empty shelf. Certifications pending.'],
            page: 0,
            showChoices: false,
            onEnd: { xp: 25 },
          },
        });
        st.mark('certs', 0);
        sfx('blip');
        break;
      }

      case 'sincere':
        set({
          dialogue: {
            speaker: 'The window',
            portrait: 'window',
            lines: SINCERE_NOTE,
            page: 0,
            showChoices: false,
            onEnd: { xp: 60, achievement: 'sincerity' },
          },
        });
        st.mark('sincere', 0);
        sfx('blip');
        break;

      case 'boss':
        set({ panel: 'boss' });
        break;

      case 'credits':
        set({ panel: 'credits' });
        break;

      case 'door':
        st.goToRoom(i.to);
        break;
    }
  },

  openDialogueNode: (nodeId) => {
    const node = DIALOGUE[nodeId];
    if (!node) return;
    set({
      dialogue: {
        speaker: node.speaker,
        portrait: node.portrait,
        lines: node.lines,
        page: 0,
        choices: node.choices,
        showChoices: false,
        onEnd: node.onEnd,
      },
    });
    sfx('blip');
  },

  advance: () => {
    const d = get().dialogue;
    if (!d) return;
    if (d.page < d.lines.length - 1) {
      set({ dialogue: { ...d, page: d.page + 1 } });
      sfx('blip');
      return;
    }
    if (d.choices?.length && !d.showChoices) {
      set({ dialogue: { ...d, showChoices: true } });
      return;
    }
    get().closeDialogue();
  },

  choose: (index) => {
    const st = get();
    const d = st.dialogue;
    if (!d?.choices) return;
    const c = d.choices[index];
    if (!c) return;
    sfx('select');
    if (c.sarcastic) {
      const n = st.sarcasticCount + 1;
      set({ sarcasticCount: n });
      if (n >= 3) st.unlock('sarcastic');
    }
    // The parent node's onEnd still fires when a choice ends the conversation.
    if (c.effect) applyEffect(c.effect, get);
    if (c.goto) {
      st.openDialogueNode(c.goto);
    } else {
      set({ dialogue: null });
    }
    st.persist();
  },

  closeDialogue: () => {
    const d = get().dialogue;
    if (d?.onEnd) applyEffect(d.onEnd, get);
    set({ dialogue: null });
    get().persist();
  },

  setPanel: (p) => {
    if (p) sfx('select');
    else sfx('back');
    set({ panel: p, card: null });
  },

  openCard: (c) => {
    set({ card: c, panel: null });
    if (c) sfx('select');
  },

  addXp: (n) => {
    if (n <= 0) return;
    const before = get().level;
    const xp = get().xp + n;
    const after = levelFor(xp);
    set({ xp, level: after });
    if (after > before) {
      sfx('levelUp');
      get().toast(`LEVEL ${after}`, after >= MAX_LEVEL ? 'Max level. The Server Closet is unlocked.' : 'Exploration bonus applied.');
      if (after >= MAX_LEVEL) get().unlock('max-level');
    }
    get().persist();
  },

  unlock: (id) => {
    const st = get();
    if (st.achievements.has(id)) return;
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a) return; // unknown id: silent in prod, flagged by the validator in dev
    const achievements = new Set(st.achievements);
    achievements.add(id);
    set({ achievements });
    st.toast(a.name, a.description);
    sfx('achievement');
    const xp = a.xp ?? DEFAULT_ACHIEVEMENT_XP;
    if (xp > 0) st.addXp(xp);
    st.persist();
  },

  mark: (key, xp = 0) => {
    const st = get();
    if (st.progress.has(key)) return;
    const progress = new Set(st.progress);
    progress.add(key);
    set({ progress });
    if (xp) st.addXp(xp);

    // Completion-driven achievements, all derived from the content arrays.
    const objs = buildObjectives(progress, st.bossDefeated);
    const by = (id: string) => objs.find((o) => o.id === id);
    if (by('projects')?.complete) st.unlock('all-projects');
    if (by('skills')?.complete) st.unlock('all-skills');
    if (by('references')?.complete) st.unlock('all-jobs');
    if (by('npcs')?.complete) st.unlock('all-npcs');
    st.persist();
  },

  toast: (title, body) => {
    const t = { key: Date.now() + Math.random(), title, body };
    set({ toasts: [...get().toasts, t].slice(-4) });
  },

  dropToast: (key) => set({ toasts: get().toasts.filter((t) => t.key !== key) }),

  toggleMute: () => {
    const muted = !get().muted;
    set({ muted });
    setMuted(muted);
    if (!muted) sfx('select');
    else get().unlock('muted');
    get().persist();
  },

  toggleCrt: () => {
    set({ crt: !get().crt });
    get().persist();
  },

  setReducedMotion: (v) => set({ reducedMotion: v }),

  hitBoss: (amount) => {
    const hp = Math.max(0, get().bossHp - amount);
    set({ bossHp: hp, shake: get().reducedMotion ? 0 : 1 });
    sfx('hit');
    setTimeout(() => set({ shake: 0 }), 260);
  },

  defeatBoss: () => {
    set({ bossHp: 0, bossDefeated: true, panel: 'victory' });
    sfx('victory');
    get().unlock('boss-defeated');
    get().persist();
  },

  persist: () => {
    const s = get();
    if (s.screen !== 'playing') return;
    const data: SaveData = {
      ...emptySave(),
      roomId: s.roomId,
      tx: playerTile.tx,
      ty: playerTile.ty,
      dir: 'down',
      xp: s.xp,
      achievements: [...s.achievements],
      progress: [...s.progress],
      visited: [...s.visited],
      coffeeCount: s.coffeeCount,
      sarcasticCount: s.sarcasticCount,
      bossDefeated: s.bossDefeated,
      muted: s.muted,
      crt: s.crt,
    };
    writeSave(data);
  },

  completion: () => completionPercent(buildObjectives(get().progress, get().bossDefeated)),

  playerTile: () => playerTile,
  setPlayerTile: (tx, ty) => {
    playerTile = { tx, ty };
  },
}));

function applyEffect(e: DialogueEffect, get: () => GameState) {
  const st = get();
  if (effectXp(e)) st.addXp(e.xp as number);
  if (e.achievement) st.unlock(e.achievement);
  if (e.completeObjective) st.mark(e.completeObjective, 0);
  if (e.open === 'resume') {
    window.location.hash = '#/resume';
    return;
  }
  if (e.open) st.setPanel(e.open as PanelId);
  if (e.goToRoom) st.goToRoom(e.goToRoom);
}
