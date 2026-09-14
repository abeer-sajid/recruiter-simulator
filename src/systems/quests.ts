/* ============================================================================
 * QUESTS — generated from the content arrays. There is not a single hardcoded
 * count in this file; "Inspect all 4 projects" becomes "all 7" the moment you
 * append three entries to projects.ts.
 *
 * TO ADD AN OBJECTIVE: add an entry to buildObjectives(). Give it an id, a
 * label function that receives (done, total), and the progress-key prefix it
 * counts. That is all.
 * ========================================================================= */

import { orderedJobs, orderedProjects, orderedSkills } from '../engine/world';
import { visible } from '../types/content';
import { NPCS } from '../data/dialogue';
import { JOBS } from '../data/experience';

export interface Objective {
  id: string;
  label: string;
  done: number;
  total: number;
  complete: boolean;
  /** Shown under the objective when incomplete. */
  hint?: string;
}

function count(progress: Set<string>, prefix: string, ids: string[]): number {
  return ids.filter((id) => progress.has(`${prefix}:${id}`)).length;
}

export function buildObjectives(progress: Set<string>, bossDefeated: boolean): Objective[] {
  const projects = orderedProjects();
  const skills = orderedSkills();
  const jobs = orderedJobs();

  // Every NPC in the building: the free-standing ones plus one per job.
  const npcIds = visible(NPCS).map((n) => n.id);
  const npcDone =
    count(progress, 'npc', npcIds) + count(progress, 'job', jobs.map((j) => j.id));
  const npcTotal = npcIds.length + jobs.length;

  const out: Objective[] = [
    {
      id: 'talk-ficus',
      label: 'Get onboarded by the office plant',
      done: progress.has('npc:ficus') ? 1 : 0,
      total: 1,
      complete: progress.has('npc:ficus'),
      hint: 'He is the green one in the Lobby.',
    },
    {
      id: 'projects',
      label: `Inspect all ${projects.length} project${projects.length === 1 ? '' : 's'}`,
      done: count(progress, 'project', projects.map((p) => p.id)),
      total: projects.length,
      complete: count(progress, 'project', projects.map((p) => p.id)) >= projects.length,
      hint: 'Hall of Projects — walk up to a cabinet and press E.',
    },
    {
      id: 'skills',
      label: `Examine ${skills.length} skill crystal${skills.length === 1 ? '' : 's'}`,
      done: count(progress, 'skill', skills.map((s) => s.id)),
      total: skills.length,
      complete: count(progress, 'skill', skills.map((s) => s.id)) >= skills.length,
      hint: 'Skill Tree Chamber. The terminal shows all of them at once.',
    },
    {
      id: 'references',
      label: `Complete ${jobs.length} reference check${jobs.length === 1 ? '' : 's'}`,
      done: count(progress, 'job', jobs.map((j) => j.id)),
      total: jobs.length,
      complete: count(progress, 'job', jobs.map((j) => j.id)) >= jobs.length,
      hint: 'The Archives. Walk right; talk to everyone in a doorway.',
    },
    {
      id: 'human',
      label: 'Establish whether the candidate is a person',
      done: (progress.has('sincere') ? 1 : 0) + (progress.has('npc:karim') ? 1 : 0),
      total: 2,
      complete: progress.has('sincere') && progress.has('npc:karim'),
      hint: 'Break Room. Talk to the person on lunch, and look out of the window.',
    },
    {
      id: 'npcs',
      label: `Talk to every NPC (${npcTotal})`,
      done: npcDone,
      total: npcTotal,
      complete: npcDone >= npcTotal,
      hint: 'Every room has at least one.',
    },
    {
      id: 'boss',
      label: 'Defeat THE HIRING PROCESS',
      done: bossDefeated ? 1 : 0,
      total: 1,
      complete: bossDefeated,
      hint: 'Boss Room, south of the Lobby. Its weakness is a real message.',
    },
  ];

  // Drop objectives that are vacuous because the content is empty, so a
  // stripped-down build never shows "Inspect all 0 projects".
  return out.filter((o) => o.total > 0);
}

export function completionPercent(objs: Objective[]): number {
  const total = objs.reduce((n, o) => n + o.total, 0);
  const done = objs.reduce((n, o) => n + Math.min(o.done, o.total), 0);
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

/** Everything a completed run should have touched, for the final verdict. */
export function verdictFor(percent: number, level: number): { grade: string; line: string } {
  if (percent >= 95) return { grade: 'STRONG HIRE', line: `You explored ${percent}% of the building and reached level ${level}. You know more about this candidate than most panels learn in three rounds.` };
  if (percent >= 70) return { grade: 'HIRE', line: `${percent}% explored. You did the reference checks and read the honest stat sheet. That is a real evaluation.` };
  if (percent >= 40) return { grade: 'ADVANCE TO NEXT ROUND', line: `${percent}% explored. You got the shape of it. The Archives are worth the extra two minutes.` };
  if (percent >= 15) return { grade: 'PROMISING', line: `${percent}% explored — but you sent the message, which is the only part that actually matters.` };
  return { grade: 'EFFICIENT', line: 'You skipped almost everything and went straight to contact. Honestly? Correct play.' };
}

/** Jobs whose testimonial the player has heard — used by the Archives NPCs. */
export function jobById(id: string) {
  return JOBS.find((j) => j.id === id);
}
