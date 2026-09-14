# CONTENT GUIDE

**Written for you, six months from now, at 11pm, having forgotten all of this.**

Everything you will ever want to change lives in **`/src/data`**. You never have to
open the engine, edit a tilemap, or position anything by hand. Rooms rebuild
themselves from these files every time the page loads.

```
src/data/
  profile.ts       you, your links, education, certs, hobbies, the sincere paragraph
  projects.ts      one arcade cabinet each
  skills.ts        one crystal each
  experience.ts    one doorway + one former-colleague NPC each
  dialogue.ts      every word anyone says, and the NPC roster
  achievements.ts  the toast popups
  jokes.ts         loading tips, barks, coffee machine lines, boss taunts
  maps.ts          the hand-drawn rooms (ASCII art) + layout tuning
  palette.ts       all 24 colours
  sprites.ts       every pixel, as text
  avatar.ts        your photo, as a pixel sprite (generated, editable)
```

Before you start:

```bash
npm install       # once
npm run dev       # http://localhost:5173
```

Leave `npm run dev` running while you edit. The page reloads as you save, and if
you break something the browser console tells you **which file, which entry, and
what to do about it**.

---

## The three commands worth remembering

```bash
npm run dev             # play it locally while you edit
npm run check:content   # validate everything + print every room's size
npm run build           # production build into dist/ (runs typecheck + prerenders /resume)
```

`npm run check:content` is the one that saves you. It prints:

```
Rooms generated from your content:
  lobby        21 x 15 tiles ·   9 objects · 6 door(s)
  projects     21 x 17 tiles ·   4 objects · 1 door(s)
  skills       24 x 58 tiles ·  41 objects · 1 door(s)
  ...
✓ content is valid — every object placed, every path walkable
```

That last line is a real proof, not a vibe: it flood-fills every room from the
spawn tile and confirms that every single object you added still has a walkable
tile next to it, and that nothing overlaps anything else.

---

## 1. Add a project  *(about 3 minutes)*

1. Open **`src/data/projects.ts`**.
2. Scroll to the end of the `PROJECTS` array.
3. Paste this before the closing `];` and edit it:

```ts
  {
    id: 'log-anomaly-detector',            // unique, kebab-case, never change it later
    name: 'Log Anomaly Detector',
    pitch: 'Flags the weird log line before the pager does.',
    problem:
      'Splunk alerts fire on thresholds, which misses novel failure modes. ' +
      'This watches for shape changes instead of magnitude changes.',
    stack: ['Python', 'Splunk', 'AWS Lambda'],
    role: 'Sole author. Built the feature extraction and the alerting hook.',
    highlight:
      'A rolling isolation forest over tokenised log templates, so a ' +
      'never-before-seen stack trace scores high even at low volume.',

    // ---- everything below is OPTIONAL ----
    liveUrl: 'https://example.com/demo',   // omit and no "Live demo" button renders
    repoUrl: 'https://github.com/you/x',   // omit and no "Source" button renders
    screenshot: 'https://.../shot.png',    // omit and pixel art is generated from the name
    year: '2026',
    featured: true,                        // places it nearest the room entrance
    hidden: false,                         // true = temporarily remove it from everything
  },
```

4. Save. That is it.

**What happened automatically:** a new arcade cabinet appeared in the Hall of
Projects, the grid re-flowed and the room grew, the quest now says
"Inspect all 5 projects", the inventory gained a slot, the completion percentage
recalculated, and the project appeared on the `/resume` page.

**If you left something out,** the console says so by name:

```
src/data/projects.ts → log-anomaly-detector
   problem: missing `highlight`
   fix:     add one interesting technical detail
```

### Notes on the optional fields

| You omit | What the UI does |
|---|---|
| `liveUrl` | The button is not rendered. No dead links, ever. |
| `repoUrl` | Same. |
| `screenshot` | Generates a deterministic pixel-art placeholder from the project name and your palette. It always looks intentional. |
| `year` | The row disappears. No blank space. |

Long project names truncate with a `…` and keep the full name in a tooltip, so
you can't break the card header.

### Giving a technology its own "elemental type"

At the bottom of `projects.ts` there is `TECH_TYPES`. Anything not listed there
gets `NORMAL` automatically, so this is optional:

```ts
  'Kubernetes': { type: 'STORM', color: 'gold' },
```

`color` is any key from `palette.ts`.

---

## 2. Add a job  *(about 4 minutes)*

1. Open **`src/data/experience.ts`**.
2. Append to `JOBS` — newest first is handled for you via `sortKey`:

```ts
  {
    id: 'acme-sre',
    title: 'Site Reliability Engineer',
    company: 'Acme Corp',
    start: 'Jan 2027',
    end: 'Present',
    sortKey: 2027.01,                      // OPTIONAL, higher = more recent
    location: 'Remote',                    // OPTIONAL
    mode: 'Full-time',                     // OPTIONAL
    achievements: [
      'Cut mean time to detect by 40% by replacing threshold alerts with anomaly scoring across 60 services.',
      'Owned the on-call rotation for 12 services across 3 teams.',
    ],
    testimonial: [                          // one array entry = one dialogue page
      "Abeer? Yeah. Good hire.",
      "Cut our MTTD by forty percent. I know the number because I had to stop quoting the old one in reviews.",
      "Wrote it all down afterwards, too. That part is rarer than the fix.",
    ],
    colleague: {                            // OPTIONAL — a default NPC is used otherwise
      name: 'Dana',
      role: 'Former SRE lead',
      colors: { shirt: '#4fb3a5', hair: '#221d2e' },
    },
  },
```

3. Save.

**What happened automatically:** The Archives corridor got 6 tiles longer, a new
doorway appeared with a new NPC standing in it, the quest went to
"Complete 5 reference checks", and `/resume` gained an experience section.

**Write the numbers into the FIRST bullet.** Recruiters read the first bullet of
each job and skim the rest. Three of your current jobs have no metrics in them —
that is the single highest-value edit available to you in this whole project.

---

## 3. Add a skill  *(about 60 seconds)*

1. Open **`src/data/skills.ts`**.
2. Append to `SKILLS`:

```ts
  {
    id: 'terraform',
    name: 'Terraform',
    category: 'Cloud & Infrastructure',    // an unused category creates a new row block
    level: 58,                             // 1–99
    descriptor:
      'Can stand up the stack. Has also destroyed the stack. Learned both ' +
      'lessons the same afternoon.',
    context: 'Used for two internal environments; not my primary tool.',  // OPTIONAL
  },
```

3. Save.

The **level does everything**: bar width, tier colour, tier label
(Novice → Competent → Proficient → Advanced → Expert), sort order inside its
category, and the crystal's colour in the room. You never pick a colour.

**The house rule for descriptors:** the joke must contain a real claim. Someone
who reads only the descriptors should still learn what you can do. Compare:

- ❌ "CSS — Lv. 64. lol css am i right"
- ✅ "CSS — Lv. 64. Can centre a div on the first try roughly 70% of the time."

To reorder the category blocks in the room, edit `CATEGORY_ORDER` at the bottom
of the file. Categories you don't list still appear, after the ones you do.

---

## 4. Add an NPC with custom dialogue  *(about 5 minutes)*

Two steps, both in **`src/data/dialogue.ts`**.

**Step 1 — write what they say.** Add to the `DIALOGUE` object:

```ts
  'greg.intro': {
    id: 'greg.intro',                 // must match the key above it
    speaker: 'Greg, Facilities',
    portrait: 'terminal',             // any key from PORTRAITS in sprites.ts
    lines: [
      "I'm not supposed to be in this build.",
      "But here we are.",
    ],
    choices: [                        // OPTIONAL — omit for a linear conversation
      { text: 'Carry on, Greg.', goto: 'greg.ok' },
      { text: 'This is a portfolio, Greg.', sarcastic: true, goto: 'greg.ok' },
    ],
    onEnd: { xp: 20 },                // OPTIONAL
  },

  'greg.ok': {
    id: 'greg.ok',
    speaker: 'Greg, Facilities',
    portrait: 'terminal',
    lines: ['Understood. I was never here.'],
  },
```

**Step 2 — put them in a room.** Add to the `NPCS` array:

```ts
  {
    id: 'greg',
    name: 'Greg',
    room: 'breakroom',                // lobby | projects | skills | archives | breakroom | boss | secret
    dialogue: 'greg.intro',
    barks: ['Mind the wet floor sign.', 'That machine is not plumbed in.'],
    colors: { shirt: '#5f9e58', hair: '#17141f' },
    // at: { tx: 6, ty: 4 },          // OPTIONAL — omit and the room finds a legal spot
    // sprite: 'plant',               // OPTIONAL — for an NPC that isn't a person
  },
```

**There is no step 3.** The room places Greg on a free tile with a walkable
neighbour, keeps every path clear, and adds him to the "talk to every NPC" count.

### What dialogue can do

`effect` on a choice, and `onEnd` on a node, both accept:

```ts
{
  xp: 25,                        // award XP once
  achievement: 'some-id',        // unlock an achievement
  completeObjective: 'some-key', // tick a quest objective
  open: 'inventory',             // 'quests' | 'inventory' | 'skills' | 'boss' | 'credits' | 'resume'
  goToRoom: 'archives',          // teleport
}
```

Point a `goto` at a node that doesn't exist and the validator tells you the
choice text and the bad id. Nothing crashes.

### The one style rule the validator enforces

Any node with **three or more** choices should mark exactly one
`sarcastic: true`. Two-option follow-ups are exempt. If you change the tone of
the whole game and no longer want this, delete that check in
`src/systems/validate.ts` — it's about ten lines and clearly labelled.

---

## 5. Add an achievement  *(about 90 seconds)*

1. Open **`src/data/achievements.ts`** and append:

```ts
  {
    id: 'read-the-footer',
    name: 'Fine Print Enjoyer',
    description: 'Scrolled to the bottom of the resume page. Nobody does this.',
    secret: true,   // OPTIONAL — shows as "???" until unlocked
    xp: 40,         // OPTIONAL — defaults to 25
  },
```

2. Unlock it from anywhere:

```ts
// from a dialogue choice:
{ text: 'Read the small print.', effect: { achievement: 'read-the-footer' } }

// from code:
useGame.getState().unlock('read-the-footer');
```

If you unlock an id that isn't in the list, dev mode prints a clear error and
production does nothing at all. It will never crash a visitor's browser.

---

## 6. Change the palette  *(about 30 seconds)*

Open **`src/data/palette.ts`** and replace hex values in the `PALETTE` object.
**Keep the keys.** Keep the roles roughly consistent — `void` darkest, `paper`
lightest, `ember` for danger, `lime` for success — and everything stays coherent
by itself.

```ts
export const PALETTE = {
  void:   '#0d0b14',   // darkest — page background
  ink:    '#17141f',   // panels
  ...
  gold:   '#ffe27a',   // the single brightest accent
} as const;
```

One file changes: the canvas tiles, the sprites, the walls, every UI panel, the
skill tier colours, the resume page, and the generated project placeholder art.
There is no second place colours are defined.

Two things you can also tune while you're in there:

- `ROLE` — which palette colour plays which part (floor, wall, accent, danger).
- `SKILL_TIERS` — the level thresholds and names for Novice → Expert.

---

## 7. Swap the humour tone  *(about 20 minutes, and worth it)*

The tone lives in exactly three places. No component contains a joke.

1. **`src/data/jokes.ts`** — loading tips, NPC barks, the plant's escalating
   concern, coffee machine lines, boss taunts and hit lines, victory lines.
   Rewrite the arrays. Add or delete entries freely; nothing counts them.
2. **`src/data/dialogue.ts`** — everything anyone says, and every player
   response option.
3. **`src/data/skills.ts`** — the `descriptor` on each skill.

The current register is **deadpan corporate parody**: incident-management
vocabulary delivered completely straight. The house rules that make it work:

- Specific beats generic. "BMC Remedy" is funny. "job hunting is hard" is not.
- The joke sits **next to** a fact; it never replaces one.
- Exactly one moment in the whole game is sincere — `SINCERE_NOTE` in
  `profile.ts`, delivered by the Break Room window. **Do not add a second one.**
  The contrast is the entire mechanism. If everything is sincere, nothing is.

To go drier, cut adjectives. To go warmer, let the NPCs like you. To go
corporate-parody harder, add more acronyms and fewer punchlines.

---

## 8. Hand-drawn rooms (Lobby, Break Room, Boss Room, Server Closet)

These four are ASCII art in **`src/data/maps.ts`**. Edit them like text:

```
'###1####2####3####4##',
'#...................#',
'#....##.......##....#',
'#......,,,,,,,......S',
'#.........@.........#',
'##########5##########',
```

| Char | Meaning |
|---|---|
| `#` | wall |
| `.` | floor |
| `,` | carpet |
| `~` | lino (break room) |
| `@` | player spawn |
| `1`–`5`, `S`, `D` | doors — see `DOOR_TARGETS` |

Rules: every row must be the same length, and there must be exactly one `@`. The
validator checks both and names the map if you slip.

Adding a door is three lines: a character in the map, an entry in
`DOOR_TARGETS` (which room it leads to), and an entry in `DOOR_LABELS` (what the
signpost says). The signpost places itself.

The other three rooms — **Hall of Projects, Skill Tree Chamber, The Archives** —
have no map at all. They are computed from your content using the `LAYOUT`
numbers at the bottom of `maps.ts`. You should not need to touch those, but if a
room ever feels cramped, `cellW` / `cellH` / `padX` are the dials.

---

## 9. Sprites, and your avatar

Every sprite is a block of text in **`src/data/sprites.ts`**. One character = one
pixel; `.` is transparent; the character-to-colour map is `CHARS` at the top of
the file.

```ts
  crate: [
    '..000000000000..',
    '..0dddddddddd0..',
    '..0deeeeeeeed0..',
    '..000000000000..',
  ],
```

All rows must be the same length (the validator checks). To add a sprite, add a
key, then reference that key from a room generator or an NPC's `sprite` field.

**Your photo** is `public/avatar.png`, and its pixel-art version is
`src/data/avatar.ts`. If you change the photo:

```bash
python3 scripts/make-avatar-sprite.py
```

That regenerates the sprite. Or just edit the characters in `avatar.ts` by hand
like any other sprite — it's only data.

---

## 10. Wiring up the contact form  *(one minute, do this before you launch)*

The boss fight sends a real message. Right now, with no key configured, it falls
back to opening the visitor's mail client pre-filled — which works, but loses
anyone on webmail.

1. Get a free access key at <https://web3forms.com>. They email it to you.
2. Create a file called `.env` next to `package.json`:

```
VITE_WEB3FORMS_KEY=paste-your-key-here
```

3. Redeploy.

That's it. `.env` is gitignored, and on Vercel/Netlify you add the same variable
in the dashboard under Environment Variables.

---

## 11. Deploying

It's a static site with zero config.

```bash
npm run build     # everything lands in dist/
```

- **Vercel** — import the repo. Framework preset: Vite. Nothing else to set.
- **Netlify** — build command `npm run build`, publish directory `dist`.
- **GitHub Pages** — already wired up. `.github/workflows/deploy.yml` builds and
  publishes on every push to `main`. One-time setup: repo **Settings → Pages →
  Source: GitHub Actions**. To make the contact form send real email, add a repo
  secret named `VITE_WEB3FORMS_KEY` under **Settings → Secrets and variables →
  Actions**. `base: './'` is already set in `vite.config.ts`, so a project
  subdirectory URL works fine.

Before you launch, change `PROFILE.seo.canonicalUrl` in `profile.ts` to your real
URL — it's used for the canonical link, Open Graph tags and the JSON-LD.

The build also prerenders **`dist/resume/index.html`**: real server-rendered
semantic HTML with your full resume, correct headings, meta tags, Open Graph and
JSON-LD `Person` schema. That page is what Google and screen readers get, and it
is generated from the same data files as the game, so it can never drift.

---

## 12. The four things left blank on purpose

Search the project for `TODO(abeer)` — there are four, all in
`src/data/profile.ts` and `src/data/projects.ts`:

1. **LinkedIn URL** — `profile.ts`, in `links`. Paste the URL and delete
   `hidden: true`. Until then no LinkedIn button renders anywhere.
2. **Repo / live URLs for the three AI projects** — `projects.ts`. Add
   `repoUrl` and/or `liveUrl` and the buttons appear.
3. **Hard numbers in the Bank of America bullets** — `experience.ts`. Your
   bullets are strong but metric-free. "Reduced average triage time by X%" or
   "handled N incidents per month" is the highest-leverage edit in this repo.
4. **Your three weird facts** — `profile.ts`, the `WEIRD_FACTS` array, currently
   commented out. While it is empty the coffee machine says "Personal anecdotes
   are pending review by Legal," which is funnier than an empty panel, so there
   is genuinely no rush.

---

## 13. If something breaks

**The console is shouting at me.** Good — that's the point. It names the file,
the entry, the problem and the fix. Fix that one line.

**A room looks cramped or an object is somewhere silly.** Run
`npm run check:content`. If it says the content is valid, the layout is legal and
you just want different numbers — tune `LAYOUT` in `maps.ts`.

**The game won't load at all after an edit.** You almost certainly have a
trailing comma or a missing quote. `npm run typecheck` will point at the line.

**A returning visitor should not lose progress when you add content.** They
won't. Progress is stored as a set of keys like `project:rag-knowledge-chatbot`,
never as counts or positions, so new content simply shows up as not-yet-done.
Old saves are sanitised against current content on load: unknown rooms fall back
to the Lobby, deleted achievements are dropped, blocked positions reset to the
spawn tile. A corrupt save behaves exactly like a first visit.

**If you ever change the save format itself** (new fields you need populated),
bump `SAVE_VERSION` in `src/systems/save.ts` and add one line to `MIGRATIONS`:

```ts
const MIGRATIONS = {
  2: (s) => ({ ...s, myNewField: 'default' }),
};
```

Never delete an old migration step — someone's 2026 save may be several versions
behind.

---

## 14. Keyboard reference (for you, not the player)

| Key | Does |
|---|---|
| WASD / arrows | walk, 8 directions |
| E / Space | interact, advance dialogue, hold to fast-forward |
| 1 / 2 / 3 | pick a dialogue response |
| Q | quest log |
| I | inventory |
| K | stat sheet |
| V | achievements |
| M | mute |
| C | CRT scanlines |
| ? | help overlay |
| ESC | close anything |

And in the browser console:

```js
__rs.store.getState().goToRoom('archives')   // jump to a room
__rs.store.getState().addXp(2000)            // max level, unlocks the Server Closet
__rs.store.getState().unlock('konami')       // fire an achievement
localStorage.removeItem('recruiter-sim:save')// wipe the save
```
