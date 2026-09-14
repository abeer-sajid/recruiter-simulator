/* ============================================================================
 * CONTENT TYPES  —  the contract between your content and the game engine.
 *
 * You will rarely need to edit this file. You edit /src/data/*.ts.
 * This file exists so that TypeScript tells you *immediately* when a content
 * entry is missing something required, instead of the game breaking later.
 *
 * READING THE TYPES:
 *   name: string    -> REQUIRED. The game will not compile without it.
 *   name?: string   -> OPTIONAL. If you omit it, the UI hides that piece
 *                      entirely. It will never render "undefined", an empty
 *                      row, or a dead link.
 * ========================================================================= */

/* ---------------------------------------------------------------- PROFILE */

/** A single contact link. `hidden: true` pulls it without deleting it. */
export interface ContactLink {
  /** Unique key, lowercase, no spaces. e.g. "github" */
  id: string;
  /** Shown to the player. e.g. "GitHub" */
  label: string;
  /** Full URL, or a "mailto:" link. */
  url: string;
  /** Short text shown on the resume page. e.g. "github.com/abeer-sajid" */
  display?: string;
  /** Leave out (or set false) to show it. */
  hidden?: boolean;
}

export interface Profile {
  name: string;
  /** Job title shown under your name. */
  title: string;
  /** One-sentence positioning statement. Shown on the title screen. */
  tagline: string;
  /** Longer paragraph for the resume page's summary section. */
  summary: string;
  location: string;
  /** Total years of professional experience, as a number. */
  yearsExperience: number;
  email: string;
  /** Path or URL to your resume PDF. Omit to hide the download button. */
  resumeUrl?: string;
  /** Optional one-liner, e.g. work authorisation. Hidden if omitted. */
  availability?: string;
  links: ContactLink[];
  /** Used for the <title>, meta description and Open Graph tags. */
  seo: {
    siteTitle: string;
    description: string;
    /** Absolute URL of the deployed site, no trailing slash. */
    canonicalUrl: string;
    /** Optional social preview image URL. A pixel-art one is generated if absent. */
    ogImage?: string;
  };
}

/* --------------------------------------------------------------- PROJECTS */

export interface Project {
  /** Unique. Used in the save file, so changing it resets that project's
   *  "inspected" flag for returning visitors. Keep it stable. */
  id: string;
  /** Full name. Long names truncate in the card header with a tooltip. */
  name: string;
  /** One line, under ~90 chars. Shown on the card and in the arcade marquee. */
  pitch: string;
  /** What problem it solves. 1–3 sentences. */
  problem: string;
  /** Technologies. Each becomes an "elemental type" chip. Unknown techs get a
   *  neutral type automatically — see TECH_TYPES in /src/data/projects.ts. */
  stack: string[];
  /** What YOU specifically did. Be concrete. */
  role: string;
  /** One interesting technical detail. This is the bit engineers read. */
  highlight: string;
  /** Optional. If omitted, no "Live demo" button is rendered. */
  liveUrl?: string;
  /** Optional. If omitted, no "Source" button is rendered. */
  repoUrl?: string;
  /** Optional image URL or data URI. If omitted, a deterministic pixel-art
   *  placeholder is generated from the project name + palette. */
  screenshot?: string;
  /** Optional, e.g. "2026" or "2025–2026". Hidden if omitted. */
  year?: string;
  /** Optional. Featured projects are placed nearest the room entrance. */
  featured?: boolean;
  /** Optional. Hidden projects vanish from the room, quests, inventory and
   *  resume page, but stay in the file so you can bring them back. */
  hidden?: boolean;
}

/* ----------------------------------------------------------------- SKILLS */

export interface Skill {
  id: string;
  name: string;
  /** Free text. Skills are grouped into rows by category, in the order the
   *  categories first appear in the array. A new category just works. */
  category: string;
  /** 1–99. Bar width, tier colour and sort order are ALL derived from this.
   *  Anything outside 1–99 is clamped and reported by the validator. */
  level: number;
  /** The joke. One line. Must still contain a real claim. */
  descriptor: string;
  /** Optional honest context shown on hover / below the descriptor. */
  context?: string;
  /** Optional. Hidden skills disappear from the room, sheet and resume. */
  hidden?: boolean;
}

/* ------------------------------------------------------------- EXPERIENCE */

/** Colours for a procedurally drawn NPC. All optional — sensible defaults. */
export interface NpcColors {
  skin?: string;
  hair?: string;
  shirt?: string;
  pants?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  /** Display strings, e.g. "Jul 2024". Sorting uses `sortKey` if present. */
  start: string;
  end: string;
  /** Optional numeric sort key (higher = more recent). If omitted, array
   *  order is used. Set it if your date strings sort badly. */
  sortKey?: number;
  location?: string;
  /** e.g. "On-site · Contractor". Hidden if omitted. */
  mode?: string;
  /** Bullet points. Shown on the resume page verbatim. At least one. */
  achievements: string[];
  /** What the former-colleague NPC says. Keep 2–4 short paragraphs; each
   *  array entry is one dialogue "page". */
  testimonial: string[];
  /** The NPC standing in this job's doorway. */
  colleague?: {
    name: string;
    role: string;
    colors?: NpcColors;
  };
  hidden?: boolean;
}

/* --------------------------------------------------------------- EDUCATION */

export interface EducationEntry {
  id: string;
  credential: string;
  institution: string;
  /** e.g. "GPA 3.66". Hidden if omitted. */
  detail?: string;
  location?: string;
  year?: string;
  hidden?: boolean;
}

export interface CertGroup {
  id: string;
  /** e.g. "DataCamp" */
  provider: string;
  items: string[];
  hidden?: boolean;
}

/* --------------------------------------------------------------- DIALOGUE */

/** Things a dialogue choice can do. All optional, all safe to omit. */
export interface DialogueEffect {
  /** Award XP once (tracked by the node id, so it can't be farmed). */
  xp?: number;
  /** Unlock an achievement by id. */
  achievement?: string;
  /** Mark a quest objective as done, by objective id. */
  completeObjective?: string;
  /** Open a UI panel: 'inventory' | 'quests' | 'boss' | 'credits' | 'skills' */
  open?: 'inventory' | 'quests' | 'boss' | 'credits' | 'skills' | 'resume';
  /** Travel to a room id. */
  goToRoom?: string;
}

export interface DialogueChoice {
  /** The button text the player sees. */
  text: string;
  /** Mark exactly one option per encounter as the sarcastic one. It is
   *  rendered in the sarcasm colour and tracked by an achievement. */
  sarcastic?: boolean;
  /** Id of the node to jump to. If omitted, the conversation ends. */
  goto?: string;
  effect?: DialogueEffect;
}

export interface DialogueNode {
  id: string;
  /** Display name in the dialogue box header. */
  speaker: string;
  /** Which portrait to draw. See PORTRAITS in /src/data/sprites.ts.
   *  An unknown key falls back to a generic silhouette — never a crash. */
  portrait: string;
  /** Each string is one "page" of the typewriter box. */
  lines: string[];
  /** 2–3 player responses. Omit for a linear conversation. */
  choices?: DialogueChoice[];
  /** Node to continue to when the lines run out and there are no choices. */
  next?: string;
  /** Fires when the node finishes. */
  onEnd?: DialogueEffect;
}

/* ----------------------------------------------------------- ACHIEVEMENTS */

export interface Achievement {
  id: string;
  name: string;
  /** Shown in the toast and the achievement list. */
  description: string;
  /** Secret achievements show as "???" until unlocked. */
  secret?: boolean;
  /** XP awarded on unlock. Defaults to 25. */
  xp?: number;
}

/* ------------------------------------------------------------------ NPCs */

/** A free-standing NPC you can drop into a room from a data file. */
export interface NpcDef {
  id: string;
  name: string;
  /** Room to place them in: 'lobby' | 'breakroom' | 'projects' | 'skills' |
   *  'archives' | 'boss' | 'secret' */
  room: string;
  /** Dialogue node id to start on interaction. */
  dialogue: string;
  /** Short lines said when the player walks past. Omit for a silent NPC. */
  barks?: string[];
  /** By default barks are picked at random. Set true to play them in order,
   *  which is how the plant's escalating concern works. */
  barksSequential?: boolean;
  colors?: NpcColors;
  /** Optional sprite key from SPRITES (src/data/sprites.ts). Use this for an
   *  NPC that is not a person — the office plant, a terminal, a vending
   *  machine. Omit it and the NPC is drawn as a character from `colors`. */
  sprite?: string;
  /** Optional explicit tile position. If omitted, the room places them
   *  automatically in a free spot. */
  at?: { tx: number; ty: number };
  portrait?: string;
  hidden?: boolean;
}

/* ------------------------------------------------------------------ MISC */

export interface WeirdFact {
  id: string;
  text: string;
  hidden?: boolean;
}

export interface Hobby {
  id: string;
  label: string;
  detail?: string;
  hidden?: boolean;
}

/** A validation problem found at startup. */
export interface ContentIssue {
  file: string;
  entry: string;
  problem: string;
  fix: string;
}

/* ------------------------------------------------------ helper predicates */

/** Filters out `hidden: true` entries. Used everywhere content is consumed. */
export function visible<T extends { hidden?: boolean }>(items: T[]): T[] {
  return items.filter((i) => !i.hidden);
}
