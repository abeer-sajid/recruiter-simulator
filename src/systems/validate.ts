/* ============================================================================
 * CONTENT VALIDATION
 *
 * Runs at startup. In DEV it prints loud, specific console errors naming the
 * file, the entry and the fix. In PROD it stays completely silent and the UI
 * degrades gracefully instead — a visitor must never see a stack trace because
 * you forgot a comma at 1am.
 *
 * If you are reading this because the console shouted at you: the message
 * tells you which file and which entry. Fix that, save, done.
 * ========================================================================= */

import type { ContentIssue } from '../types/content';
import { visible } from '../types/content';
import { PROJECTS } from '../data/projects';
import { SKILLS } from '../data/skills';
import { JOBS } from '../data/experience';
import { ACHIEVEMENTS } from '../data/achievements';
import { DIALOGUE, NPCS } from '../data/dialogue';
import { PROFILE } from '../data/profile';
import { SPRITES } from '../data/sprites';
import { ROOMS, DOOR_TARGETS, LOBBY_MAP, BREAKROOM_MAP, BOSSROOM_MAP, SECRET_MAP } from '../data/maps';
import { allRoomIds, getRoom, reachabilityReport } from '../engine/world';

function dupes(ids: string[]): string[] {
  const seen = new Set<string>();
  const out = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) out.add(id);
    seen.add(id);
  }
  return [...out];
}

export function validateContent(): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const add = (file: string, entry: string, problem: string, fix: string) =>
    issues.push({ file, entry, problem, fix });

  /* ---------------------------------------------------------- projects -- */
  for (const id of dupes(PROJECTS.map((p) => p.id))) {
    add('src/data/projects.ts', id, 'two projects share this id', 'give each project a unique `id`');
  }
  for (const p of PROJECTS) {
    if (!p.name?.trim()) add('src/data/projects.ts', p.id, 'missing `name`', 'add a name — it is shown on the cabinet and the card');
    if (!p.pitch?.trim()) add('src/data/projects.ts', p.id, 'missing `pitch`', 'add a one-line pitch, under ~90 characters');
    if (!p.problem?.trim()) add('src/data/projects.ts', p.id, 'missing `problem`', 'add 1–3 sentences about the problem it solves');
    if (!p.role?.trim()) add('src/data/projects.ts', p.id, 'missing `role`', 'add what YOU specifically did');
    if (!p.highlight?.trim()) add('src/data/projects.ts', p.id, 'missing `highlight`', 'add one interesting technical detail');
    if (!Array.isArray(p.stack) || p.stack.length === 0) {
      add('src/data/projects.ts', p.id, 'empty `stack`', 'add at least one technology — they render as elemental type chips');
    }
    for (const u of [p.liveUrl, p.repoUrl]) {
      if (u !== undefined && !/^(https?:|\.?\/|mailto:)/.test(u)) {
        add('src/data/projects.ts', p.id, `"${u}" is not a usable URL`, 'use a full https:// URL, or remove the field entirely to hide the button');
      }
    }
  }
  if (visible(PROJECTS).length === 0) {
    add('src/data/projects.ts', 'PROJECTS', 'every project is hidden or the array is empty', 'unhide at least one project, or the Hall of Projects will be an empty room');
  }

  /* ------------------------------------------------------------ skills -- */
  for (const id of dupes(SKILLS.map((s) => s.id))) {
    add('src/data/skills.ts', id, 'two skills share this id', 'give each skill a unique `id`');
  }
  for (const s of SKILLS) {
    if (!s.name?.trim()) add('src/data/skills.ts', s.id, 'missing `name`', 'add the skill name');
    if (!s.category?.trim()) add('src/data/skills.ts', s.id, 'missing `category`', 'add a category — it decides which row block the crystal goes in');
    if (typeof s.level !== 'number' || Number.isNaN(s.level)) {
      add('src/data/skills.ts', s.id, '`level` is not a number', 'set level to a number from 1 to 99');
    } else if (s.level < 1 || s.level > 99) {
      add('src/data/skills.ts', s.id, `level ${s.level} is outside 1–99 (it will be clamped)`, 'use a number between 1 and 99');
    }
    if (!s.descriptor?.trim()) {
      add('src/data/skills.ts', s.id, 'missing `descriptor`', 'add the one-line honest-but-funny descriptor — it is the whole point of this room');
    }
  }

  /* --------------------------------------------------------------- jobs -- */
  for (const id of dupes(JOBS.map((j) => j.id))) {
    add('src/data/experience.ts', id, 'two jobs share this id', 'give each job a unique `id`');
  }
  for (const j of JOBS) {
    if (!j.title?.trim()) add('src/data/experience.ts', j.id, 'missing `title`', 'add the job title');
    if (!j.company?.trim()) add('src/data/experience.ts', j.id, 'missing `company`', 'add the company name');
    if (!j.achievements?.length) {
      add('src/data/experience.ts', j.id, 'no `achievements`', 'add at least one bullet — this is what the resume page prints');
    }
    if (!j.testimonial?.length) {
      add('src/data/experience.ts', j.id, 'no `testimonial`', 'add at least one line — the Archives NPC has nothing to say without it');
    }
  }

  /* ------------------------------------------------------- achievements -- */
  for (const id of dupes(ACHIEVEMENTS.map((a) => a.id))) {
    add('src/data/achievements.ts', id, 'two achievements share this id', 'give each achievement a unique `id`');
  }

  /* ----------------------------------------------------------- dialogue -- */
  const nodeIds = new Set(Object.keys(DIALOGUE));
  for (const [id, node] of Object.entries(DIALOGUE)) {
    if (node.id !== id) {
      add('src/data/dialogue.ts', id, `node key "${id}" does not match its \`id\` field "${node.id}"`, 'make them identical');
    }
    if (!node.lines?.length) {
      add('src/data/dialogue.ts', id, 'node has no `lines`', 'add at least one line of dialogue');
    }
    if (node.next && !nodeIds.has(node.next)) {
      add('src/data/dialogue.ts', id, `\`next\` points at "${node.next}", which does not exist`, 'fix the id or remove `next`');
    }
    for (const c of node.choices ?? []) {
      if (c.goto && !nodeIds.has(c.goto)) {
        add('src/data/dialogue.ts', id, `choice "${c.text}" points at "${c.goto}", which does not exist`, 'fix the `goto` id, or remove it so the conversation simply ends');
      }
      if (c.effect?.achievement && !ACHIEVEMENTS.some((a) => a.id === c.effect?.achievement)) {
        add('src/data/dialogue.ts', id, `choice unlocks unknown achievement "${c.effect.achievement}"`, 'add it to src/data/achievements.ts');
      }
    }
    if (node.onEnd?.achievement && !ACHIEVEMENTS.some((a) => a.id === node.onEnd?.achievement)) {
      add('src/data/dialogue.ts', id, `onEnd unlocks unknown achievement "${node.onEnd.achievement}"`, 'add it to src/data/achievements.ts');
    }
    // Style check, not a correctness one: a full 3-way branch should offer a
    // sarcastic route. Two-option follow-ups are exempt.
    const sarcastic = (node.choices ?? []).filter((c) => c.sarcastic).length;
    if ((node.choices?.length ?? 0) >= 3 && sarcastic === 0) {
      add('src/data/dialogue.ts', id, 'a 3-way branch with no sarcastic option', 'house rule: mark one choice `sarcastic: true` — or delete this check in validate.ts if you have changed the tone');
    }
  }

  /* --------------------------------------------------------------- NPCs -- */
  for (const id of dupes(NPCS.map((n) => n.id))) {
    add('src/data/dialogue.ts', id, 'two NPCs share this id', 'give each NPC a unique `id`');
  }
  for (const n of NPCS) {
    if (!nodeIds.has(n.dialogue)) {
      add('src/data/dialogue.ts', n.id, `NPC points at dialogue node "${n.dialogue}", which does not exist`, 'add that node to DIALOGUE, or point the NPC at an existing one');
    }
    if (!ROOMS.some((r) => r.id === n.room)) {
      add('src/data/dialogue.ts', n.id, `NPC is assigned to room "${n.room}", which is not in ROOMS`, `use one of: ${ROOMS.map((r) => r.id).join(', ')}`);
    }
  }

  /* ------------------------------------------------------------ sprites -- */
  for (const [key, rows] of Object.entries(SPRITES)) {
    const widths = new Set(rows.map((r) => r.length));
    if (widths.size > 1) {
      add('src/data/sprites.ts', key, `rows have different lengths (${[...widths].join(', ')})`, 'pad every row to the same number of characters');
    }
  }

  /* --------------------------------------------------------------- maps -- */
  const maps: [string, string[]][] = [
    ['LOBBY_MAP', LOBBY_MAP],
    ['BREAKROOM_MAP', BREAKROOM_MAP],
    ['BOSSROOM_MAP', BOSSROOM_MAP],
    ['SECRET_MAP', SECRET_MAP],
  ];
  for (const [name, map] of maps) {
    const widths = new Set(map.map((r) => r.length));
    if (widths.size > 1) {
      add('src/data/maps.ts', name, `rows have different lengths (${[...widths].join(', ')})`, 'every row in an ASCII map must be the same length');
    }
    if (!map.some((r) => r.includes('@'))) {
      add('src/data/maps.ts', name, 'no spawn tile', "put an '@' on a walkable tile");
    }
    for (const row of map) {
      for (const ch of row) {
        if (!'#.,~@'.includes(ch) && !DOOR_TARGETS[ch]) {
          add('src/data/maps.ts', name, `unknown tile character "${ch}"`, 'use # . , ~ @ or a door character listed in DOOR_TARGETS');
        }
      }
    }
  }

  /* ------------------------------------------------------------ profile -- */
  if (!PROFILE.email?.includes('@')) {
    add('src/data/profile.ts', 'PROFILE.email', 'email looks wrong', 'the boss fight falls back to a mailto: link using this address');
  }
  if (!PROFILE.name?.trim()) {
    add('src/data/profile.ts', 'PROFILE.name', 'missing name', 'add your name — it is the <h1> of the resume page');
  }

  /* --------------------------------------------------------- room layout -- */
  for (const id of allRoomIds()) {
    try {
      const room = getRoom(id);
      for (const p of reachabilityReport(room)) {
        add('generated room', id, p, 'adjust LAYOUT in src/data/maps.ts, or move the object that is in the way');
      }
    } catch (err) {
      add('generated room', id, `failed to build: ${(err as Error).message}`, 'check the content that feeds this room');
    }
  }

  return issues;
}

/** Call once at startup. Loud in dev, silent in prod. */
export function runValidation(): ContentIssue[] {
  const issues = validateContent();
  if (import.meta.env.DEV && issues.length) {
    /* eslint-disable no-console */
    console.groupCollapsed(
      `%c⚠ ${issues.length} content problem${issues.length === 1 ? '' : 's'} — the game still runs, but fix these`,
      'color:#ff7a5c;font-weight:bold',
    );
    for (const i of issues) {
      console.error(`${i.file} → ${i.entry}\n   problem: ${i.problem}\n   fix:     ${i.fix}`);
    }
    console.groupEnd();
  }
  return issues;
}
