/* Engine-level types. Nothing in here is content — see /src/data for that. */

import type { NpcColors } from '../types/content';

export const TILE = 16;

export const T = {
  FLOOR: 0,
  WALL: 1,
  CARPET: 2,
  LINO: 3,
  DOOR: 4,
} as const;

export type Interaction =
  | { type: 'dialogue'; node: string }
  | { type: 'project'; id: string }
  | { type: 'skill'; id: string }
  | { type: 'skillSheet' }
  | { type: 'job'; id: string }
  | { type: 'door'; to: string }
  | { type: 'boss' }
  | { type: 'coffee' }
  | { type: 'certs' }
  | { type: 'sincere' }
  | { type: 'credits' }
  | { type: 'sign'; text: string };

export interface WorldObject {
  id: string;
  kind: 'npc' | 'prop' | 'cabinet' | 'crystal' | 'doorway' | 'sign' | 'boss' | 'terminal';
  /** Anchor tile: top-left of the object's footprint. */
  tx: number;
  ty: number;
  /** Footprint in tiles (the part that blocks movement / defines proximity). */
  w: number;
  h: number;
  /** Key into SPRITES. Omitted for NPCs, which are drawn procedurally. */
  sprite?: string;
  /** Tint for sprites that use the 'S'/'T' characters (skill crystals). */
  tint?: string;
  solid: boolean;
  interact?: Interaction;
  /** Floating label drawn above the object (project names, category banners). */
  label?: string;
  /** Speaker name for NPCs. */
  name?: string;
  colors?: NpcColors;
  barks?: string[];
  barksSequential?: boolean;
  /** Small vertical bob so the world is not static. */
  bob?: number;
  /** Set once inspected, for the checkmark overlay. */
  progressKey?: string;
}

export interface DoorTile {
  tx: number;
  ty: number;
  to: string;
  /** If set, the door refuses entry unless the condition is met. */
  locked?: 'maxLevel';
}

export interface Room {
  id: string;
  name: string;
  subtitle: string;
  floor: string;
  w: number;
  h: number;
  tiles: Uint8Array;
  /** tiles + object footprints. 1 = blocked. */
  solid: Uint8Array;
  objects: WorldObject[];
  doors: DoorTile[];
  spawn: { tx: number; ty: number };
  /** Where to place the player when arriving from another room. */
  entry: { tx: number; ty: number };
  /** Category banners for the Skill Tree Chamber, generated from the data. */
  bands?: { label: string; top: number; rows: number }[];
}

export type Dir = 'down' | 'left' | 'right' | 'up';
