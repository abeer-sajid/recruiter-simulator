/* ============================================================================
 * SPRITES — every pixel in this game is defined here or drawn by code.
 * There are NO image files in this project.
 *
 * A sprite is an array of equal-length strings. One character = one pixel.
 * Look up the character in CHARS below to see which palette colour it is.
 *   '.' = transparent
 *   'S' = the sprite's "tint" colour, passed in at draw time (skill crystals
 *         use this so a crystal's colour comes from the skill's level)
 *   'T' = a darkened version of the tint
 *
 * TO EDIT A SPRITE: change characters. Rows must all be the same length.
 * The validator checks that for you and names the sprite if you slip.
 *
 * TO ADD A SPRITE: add a key to SPRITES, then reference that key from
 * src/data/maps.ts or from a room generator.
 * ========================================================================= */

import { PALETTE } from './palette';

/** character -> palette colour. */
export const CHARS: Record<string, string> = {
  '0': PALETTE.void,
  '1': PALETTE.ink,
  '2': PALETTE.shadow,
  '3': PALETTE.slate,
  '4': PALETTE.stone,
  '5': PALETTE.ash,
  '6': PALETTE.fog,
  '7': PALETTE.mist,
  '8': PALETTE.linen,
  '9': PALETTE.paper,
  a: PALETTE.amber0,
  b: PALETTE.amber1,
  c: PALETTE.amber2,
  d: PALETTE.amber3,
  e: PALETTE.amber4,
  r: PALETTE.rust,
  m: PALETTE.ember,
  f: PALETTE.flame,
  g: PALETTE.moss,
  l: PALETTE.leaf,
  i: PALETTE.lime,
  t: PALETTE.teal,
  y: PALETTE.cyan,
  v: PALETTE.violet,
  o: PALETTE.orchid,
  w: PALETTE.gold,
};

export type Sprite = string[];

export const SPRITES: Record<string, Sprite> = {
  /* Ficus — the narrator. Leaves, a face, a terracotta pot. */
  plant: [
    '................',
    '.......ll.......',
    '......liil......',
    '..ll..liil..ll..',
    '.liil.lggl.liil.',
    '.liilllggllliil.',
    '..llig0gg0glli..',
    '....lggggggl....',
    '......gggg......',
    '.......gg.......',
    '.......gg.......',
    '....dddddddd....',
    '....dcccccdd....',
    '....dcccccdd....',
    '....edddddde....',
    '.....eeeeee.....',
  ],

  /* Arcade cabinet — one per project. */
  cabinet: [
    '..000000000000..',
    '..0bbbbbbbbbb0..',
    '..0baaaaaaaab0..',
    '..0bbbbbbbbbb0..',
    '..000000000000..',
    '..01yyyyyyyy10..',
    '..01y000000y10..',
    '..01y0wwww0y10..',
    '..01y0woow0y10..',
    '..01y000000y10..',
    '..01yyyyyyyy10..',
    '..011111111110..',
    '..0cc111111cc0..',
    '..0cmm1111mmc0..',
    '..011111111110..',
    '..044444444440..',
    '..044444444440..',
    '..044444444440..',
    '..000000000000..',
    '..022222222220..',
  ],

  /* Skill crystal — 'S'/'T' are tinted by the skill's tier colour. */
  crystal: [
    '................',
    '.......SS.......',
    '......SSSS......',
    '.....SS99SS.....',
    '....SSS99SSS....',
    '...SSSS99SSSS...',
    '..SSSSSSSSSSSS..',
    '..SSSSSSSSSSSS..',
    '...TTTTTTTTTT...',
    '....TTTTTTTT....',
    '.....TTTTTT.....',
    '......TTTT......',
    '.......TT.......',
    '................',
    '................',
    '................',
  ],

  /* Coffee machine — clicking it ten times is an achievement. */
  coffee: [
    '..000000000000..',
    '..055555555550..',
    '..050000000050..',
    '..050wwwwww050..',
    '..050000000050..',
    '..055555555550..',
    '..055333333550..',
    '..055333333550..',
    '..0550dddd0550..',
    '..05500cc00550..',
    '..055009900550..',
    '..055000000550..',
    '..055555555550..',
    '..044444444440..',
    '..044444444440..',
    '..044444444440..',
    '..000000000000..',
  ],

  /* Bookshelf — certifications live here. */
  bookshelf: [
    '..eeeeeeeeeeee..',
    '..e0000000000e..',
    '..e0mmbbttvv0e..',
    '..e0mmbbttvv0e..',
    '..eeeeeeeeeeee..',
    '..e0yyllccoo0e..',
    '..e0yyllccoo0e..',
    '..eeeeeeeeeeee..',
    '..e0wwrrggmm0e..',
    '..e0wwrrggmm0e..',
    '..eeeeeeeeeeee..',
    '..e0bbvvyyll0e..',
    '..e0bbvvyyll0e..',
    '..eeeeeeeeeeee..',
    '..dddddddddddd..',
  ],

  /* Signpost — points at rooms. */
  sign: [
    '................',
    '..cccccccccccc..',
    '..c9999999999c..',
    '..c9011011109c..',
    '..c9999999999c..',
    '..c9011101109c..',
    '..c9999999999c..',
    '..cccccccccccc..',
    '.......dd.......',
    '.......dd.......',
    '.......dd.......',
    '.......dd.......',
    '.....eeeeee.....',
    '................',
    '................',
    '................',
  ],

  /* Terminal — opens the full stat sheet / credits. */
  terminal: [
    '..000000000000..',
    '..0yyyyyyyyyy0..',
    '..0y00000000y0..',
    '..0y0wwwwww0y0..',
    '..0y0w0000w0y0..',
    '..0y0wwwwww0y0..',
    '..0y00000000y0..',
    '..0yyyyyyyyyy0..',
    '..000000000000..',
    '....44444444....',
    '....44444444....',
    '...4444444444...',
    '...0000000000...',
  ],

  /* Archive doorway — one per job. */
  doorway: [
    '..000000000000..',
    '..0dddddddddd0..',
    '..0d11111111d0..',
    '..0d1yyyyyy1d0..',
    '..0d1y0000y1d0..',
    '..0d1y0000y1d0..',
    '..0d1y0000y1d0..',
    '..0d1y0000y1d0..',
    '..0d1y0000y1d0..',
    '..0d1yyyyyy1d0..',
    '..0d11111111d0..',
    '..0dddddddddd0..',
    '..000000000000..',
  ],

  /* Server rack — the secret room. */
  rack: [
    '..000000000000..',
    '..033333333330..',
    '..03111111ll30..',
    '..033333333330..',
    '..03111111mm30..',
    '..033333333330..',
    '..03111111ll30..',
    '..033333333330..',
    '..03111111ww30..',
    '..033333333330..',
    '..000000000000..',
  ],

  /* Water cooler. */
  cooler: [
    '....yyyyyyyy....',
    '....y999999y....',
    '....y9yyyy9y....',
    '....y999999y....',
    '....yyyyyyyy....',
    '.....888888.....',
    '.....888888.....',
    '.....877778.....',
    '.....888888.....',
    '.....888888.....',
    '.....000000.....',
  ],

  /* Window — used for the day/night tint and the sincere-paragraph NPC. */
  window: [
    '0000000000000000',
    '0yyyyyyyyyyyyyy0',
    '0y000000000000y0',
    '0y0aaaaaaaaaa0y0',
    '0y0aaaaaaaaaa0y0',
    '0y0aaaaaaaaaa0y0',
    '0y000000000000y0',
    '0yyyyyyyyyyyyyy0',
    '0y000000000000y0',
    '0y0aaaaaaaaaa0y0',
    '0y0aaaaaaaaaa0y0',
    '0y0aaaaaaaaaa0y0',
    '0y000000000000y0',
    '0yyyyyyyyyyyyyy0',
    '0000000000000000',
  ],

  /* Filing cabinet / crate — generic clutter. */
  crate: [
    '..000000000000..',
    '..0dddddddddd0..',
    '..0deeeeeeeed0..',
    '..0de000000ed0..',
    '..0de0dddd0ed0..',
    '..0de000000ed0..',
    '..0deeeeeeeed0..',
    '..0dddddddddd0..',
    '..000000000000..',
  ],
};

/* ---------------------------------------------------------------------------
 * NPC / PLAYER COLOURS
 * Characters are drawn by code (see engine/renderer.ts) from four colours, so
 * a new NPC is four hex values, not a spritesheet.
 * ------------------------------------------------------------------------ */

export interface CharColors {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
}

export const DEFAULT_NPC_COLORS: CharColors = {
  skin: '#d9a06b',
  hair: PALETTE.ink,
  shirt: PALETTE.fog,
  pants: PALETTE.slate,
};

/** The player: a recruiter in a lanyard. */
export const PLAYER_COLORS: CharColors = {
  skin: '#e2b183',
  hair: PALETTE.shadow,
  shirt: PALETTE.amber2,
  pants: PALETTE.ink,
};

/* ---------------------------------------------------------------------------
 * PORTRAITS — what appears beside dialogue text.
 * Either a sprite key from SPRITES above (drawn zoomed), or 'npc:<colors>'
 * which draws a character head. Unknown keys fall back to a silhouette.
 * ------------------------------------------------------------------------ */
export const PORTRAITS: Record<string, { kind: 'sprite' | 'npc' | 'boss'; key?: string; colors?: CharColors }> = {
  ficus: { kind: 'sprite', key: 'plant' },
  cabinet: { kind: 'sprite', key: 'cabinet' },
  crystal: { kind: 'sprite', key: 'crystal' },
  coffee: { kind: 'sprite', key: 'coffee' },
  bookshelf: { kind: 'sprite', key: 'bookshelf' },
  terminal: { kind: 'sprite', key: 'terminal' },
  window: { kind: 'sprite', key: 'window' },
  rack: { kind: 'sprite', key: 'rack' },
  boss: { kind: 'boss' },
  player: { kind: 'npc', colors: PLAYER_COLORS },
};
