/* ============================================================================
 * PALETTE — "Cubicle Dusk", 24 colours.
 *
 * This is the ONLY place colours are defined. Change a hex here and the whole
 * game changes: the canvas, the tiles, the sprites, the UI, the resume page.
 * Every entry is also emitted as a CSS custom property (--c-<key>) at startup,
 * which is how Tailwind classes like `text-amber1` get their value.
 *
 * TO RE-SKIN THE GAME: replace the 24 hex values below. Keep the keys.
 * Keep the *roles* consistent (void = darkest, paper = lightest) and it will
 * look coherent automatically.
 * ========================================================================= */

export const PALETTE = {
  // --- darks: walls, shadow, outlines ---------------------------------
  void: '#0d0b14',
  ink: '#17141f',
  shadow: '#221d2e',
  slate: '#32293f',
  stone: '#443a52',
  ash: '#5b5068',

  // --- neutrals: floors, furniture, body text -------------------------
  fog: '#7a6f85',
  mist: '#9d93a6',
  linen: '#c8bfcc',
  paper: '#efe6e0',

  // --- warm ramp: light, wood, UI chrome, highlights -------------------
  amber0: '#ffd9a0',
  amber1: '#ffb562',
  amber2: '#e88f3c',
  amber3: '#b8631f',
  amber4: '#7d3c12',

  // --- reds: the boss, damage, warnings --------------------------------
  rust: '#8f2f2f',
  ember: '#d64545',
  flame: '#ff7a5c',

  // --- greens: Ficus, success, completed objectives ---------------------
  moss: '#3f6b4a',
  leaf: '#5f9e58',
  lime: '#a8d06a',

  // --- cools: screens, terminals, water ---------------------------------
  teal: '#2f6b6b',
  cyan: '#4fb3a5',

  // --- violets: skill crystals, magic, sarcasm ---------------------------
  violet: '#6d4b8f',
  orchid: '#a86fd4',

  // --- the single brightest accent ---------------------------------------
  gold: '#ffe27a',
} as const;

export type PaletteKey = keyof typeof PALETTE;

/* ---------------------------------------------------------------------------
 * SEMANTIC ROLES — what each colour *means*. Engine code reads these, not the
 * raw names, so a re-skin only needs the block above to stay sensible.
 * ------------------------------------------------------------------------ */
export const ROLE = {
  floorA: PALETTE.slate,
  floorB: PALETTE.stone,
  floorGrout: PALETTE.shadow,
  carpetA: PALETTE.amber4,
  carpetB: PALETTE.amber3,
  wallFace: PALETTE.ash,
  wallTop: PALETTE.fog,
  wallShade: PALETTE.ink,
  outline: PALETTE.void,
  uiBg: PALETTE.ink,
  uiPanel: PALETTE.shadow,
  uiBorder: PALETTE.amber2,
  uiText: PALETTE.paper,
  uiTextDim: PALETTE.mist,
  accent: PALETTE.amber1,
  sarcasm: PALETTE.orchid,
  success: PALETTE.lime,
  danger: PALETTE.ember,
} as const;

/** Skill tier colours, chosen by level. Index 0 = lowest tier. */
export const SKILL_TIERS: { min: number; label: string; color: string }[] = [
  { min: 0, label: 'Novice', color: PALETTE.fog },
  { min: 40, label: 'Competent', color: PALETTE.cyan },
  { min: 60, label: 'Proficient', color: PALETTE.lime },
  { min: 75, label: 'Advanced', color: PALETTE.amber1 },
  { min: 88, label: 'Expert', color: PALETTE.gold },
];

export function tierFor(level: number) {
  let out = SKILL_TIERS[0];
  for (const t of SKILL_TIERS) if (level >= t.min) out = t;
  return out;
}

/** Injects every palette entry as a CSS custom property on :root. */
export function installPaletteVars(doc: Document = document) {
  const root = doc.documentElement;
  for (const [k, v] of Object.entries(PALETTE)) {
    root.style.setProperty(`--c-${k}`, v);
  }
}

/** Deterministic colour pick from a string — used for placeholder art. */
export function hashColor(seed: string, from: PaletteKey[] = ['amber2', 'teal', 'violet', 'moss', 'rust', 'cyan']): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[from[h % from.length]];
}
