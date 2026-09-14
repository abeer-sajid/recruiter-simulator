/* ============================================================================
 * MAPS — room shells and layout tuning.
 *
 * Rooms come in two kinds:
 *
 *   HAND-DRAWN rooms (Lobby, Break Room, Boss Room, Server Closet) are the
 *   ASCII grids below. One character = one tile. Edit them like text art.
 *
 *   GENERATED rooms (Hall of Projects, Skill Tree Chamber, The Archives) have
 *   no map at all. They are built at runtime from projects.ts / skills.ts /
 *   experience.ts using the LAYOUT numbers at the bottom of this file. That is
 *   why adding a project never requires editing a map.
 *
 * LEGEND for the ASCII grids:
 *   '#'  wall (solid)
 *   '.'  floor (walkable)
 *   ','  carpet (walkable, different colour)
 *   '~'  tiled floor (walkable, break-room lino)
 *   '@'  player spawn (walkable)
 *   '1'..'5', 'S', 'D'  doors — see DOOR_TARGETS below
 *
 * Rules the validator enforces for you:
 *   - every row in a map must be the same length
 *   - every door character must have an entry in DOOR_TARGETS
 *   - the spawn tile must be walkable and must reach every interactable
 * ========================================================================= */

/** Which room each door character leads to. Add a room = add a line here. */
export const DOOR_TARGETS: Record<string, string> = {
  '1': 'projects',
  '2': 'skills',
  '3': 'archives',
  '4': 'breakroom',
  '5': 'boss',
  S: 'secret', // only openable at max level
  D: 'lobby', // the generic "back to the lobby" door
};

/** Labels painted on the lobby signposts, keyed by the door character. */
export const DOOR_LABELS: Record<string, string> = {
  '1': 'HALL OF PROJECTS',
  '2': 'SKILL TREE CHAMBER',
  '3': 'THE ARCHIVES',
  '4': 'BREAK ROOM',
  '5': 'BOSS ROOM  ▲ DANGER',
  S: 'SERVER CLOSET',
  D: 'LOBBY',
};

/* -------------------------------------------------------------- LOBBY ---- */
export const LOBBY_MAP: string[] = [
  '###1####2####3####4##',
  '#...................#',
  '#...................#',
  '#....##.......##....#',
  '#....##.......##....#',
  '#...................#',
  '#......,,,,,,,......#',
  '#......,,,,,,,......S',
  '#......,,,,,,,......#',
  '#......,,,,,,,......#',
  '#...................#',
  '#.........@.........#',
  '#....##.......##....#',
  '#...................#',
  '##########5##########',
];

/* ---------------------------------------------------------- BREAK ROOM ---- */
export const BREAKROOM_MAP: string[] = [
  '#################',
  '#~~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~~#',
  '#~~~~,,,,,,,~~~~#',
  '#~~~~,,,,,,,~~~~#',
  '#~~~~,,,,,,,~~~~#',
  '#~~~~~~~~~~~~~~~#',
  '#~~~~~~~~@~~~~~~#',
  '#~~~~~~~~~~~~~~~#',
  '########D########',
];

/* ----------------------------------------------------------- BOSS ROOM ---- */
export const BOSSROOM_MAP: string[] = [
  '#################',
  '#...............#',
  '#...............#',
  '#...............#',
  '#...............#',
  '#....,,,,,,,....#',
  '#....,,,,,,,....#',
  '#....,,,,,,,....#',
  '#...............#',
  '#.......@.......#',
  '#...............#',
  '#...............#',
  '########D########',
];

/* ------------------------------------------------------- SERVER CLOSET ---- */
export const SECRET_MAP: string[] = [
  '###########',
  '#.........#',
  '#.........#',
  '#.........#',
  '#.........#',
  '#....@....#',
  '#.........#',
  '####D######',
];

/* ---------------------------------------------------------------------------
 * ROOM REGISTRY — display names and the one-line subtitle shown when you
 * enter. Adding a room means adding an entry here, a door character above,
 * and a generator or a map. Nothing else knows room names.
 * ------------------------------------------------------------------------ */
export interface RoomMeta {
  id: string;
  name: string;
  subtitle: string;
  /** 'map' rooms use an ASCII grid; 'generated' rooms are built from content. */
  kind: 'map' | 'generated';
  /** Tile palette variant: 'office' | 'hall' | 'vault' | 'lino' | 'arena' | 'closet' */
  floor: string;
}

export const ROOMS: RoomMeta[] = [
  { id: 'lobby', name: 'Lobby', subtitle: 'Floor 3 · Candidate Evaluation Suite', kind: 'map', floor: 'office' },
  { id: 'projects', name: 'Hall of Projects', subtitle: 'Evidence, in cabinet form', kind: 'generated', floor: 'hall' },
  { id: 'skills', name: 'Skill Tree Chamber', subtitle: 'Self-reported. Unflatteringly honest.', kind: 'generated', floor: 'vault' },
  { id: 'archives', name: 'The Archives', subtitle: 'Employment history · newest first', kind: 'generated', floor: 'vault' },
  { id: 'breakroom', name: 'Break Room', subtitle: 'The room with the person in it', kind: 'map', floor: 'lino' },
  { id: 'boss', name: 'Boss Room', subtitle: '▲ THE HIRING PROCESS', kind: 'map', floor: 'arena' },
  { id: 'secret', name: 'Server Closet', subtitle: 'Not on the tour', kind: 'map', floor: 'closet' },
];

/* ---------------------------------------------------------------------------
 * LAYOUT — the numbers that decide how generated rooms grow.
 *
 * You can tune these, but you should not need to. Every generated room keeps
 * a clear aisle around each object because objects sit on a lattice whose
 * spacing is larger than the object footprint, and a flood-fill check proves
 * it at startup.
 * ------------------------------------------------------------------------ */
export const LAYOUT = {
  projects: {
    /** Tiles between the left-hand side of one cabinet and the next. */
    cellW: 4,
    /** Tiles between the top of one cabinet row and the next. */
    cellH: 5,
    /** Never wider than this many columns, however many projects you add. */
    maxCols: 4,
    /** Never narrower than this. */
    minCols: 2,
    /** Empty tiles around the whole grid. */
    padX: 3,
    padTop: 4,
    padBottom: 3,
    /** Rooms never narrower than this, so a 2-project hall still fills the
     *  screen instead of floating in a void. The grid is centred inside it. */
    minW: 21,
  },
  skills: {
    cellW: 3,
    cellH: 4,
    /** Skills per row inside one category block. */
    maxCols: 6,
    minCols: 3,
    padX: 3,
    padTop: 5,
    padBottom: 3,
    /** Extra tiles between category blocks (room for the category banner). */
    categoryGap: 2,
  },
  archives: {
    /** Tiles between job doorways along the corridor. */
    spacing: 6,
    padX: 5,
    /** Corridor height. */
    height: 11,
  },
} as const;
