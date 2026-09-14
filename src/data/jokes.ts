/* ============================================================================
 * JOKES — every piece of non-essential text in the game lives here.
 *
 * These are plain arrays. Add a line, delete a line, rewrite a line. Nothing
 * else in the project needs to know. To change the humour tone of the whole
 * game, rewrite these arrays and the dialogue in dialogue.ts — no component
 * contains a joke string.
 *
 * HOUSE STYLE (current tone: deadpan corporate parody)
 *   - Specific beats generic. "BMC Remedy" is funny. "job hunting" is not.
 *   - The joke sits NEXT TO a fact; it never replaces one.
 *   - Incident-management vocabulary, delivered completely straight.
 * ========================================================================= */

/** Shown on the loading/title screen, one at random. Add as many as you like. */
export const LOADING_TIPS: string[] = [
  'Tip: The candidate does in fact know SQL. She is just tired of being asked to prove it on a whiteboard.',
  'Tip: Press E to interact. Press Q for the quest log. Press ESC to close things. Press the back button to trigger an achievement you will not enjoy.',
  'Tip: This entire building was generated from four TypeScript files. That is the actual flex.',
  'Tip: Severity levels in this game run from P1 (critical) to P4 ("we will look at it in the next sprint", i.e. never).',
  'Tip: The plant is load-bearing. Emotionally.',
  'Tip: Every skill level on the stat sheet is an honest self-assessment. Yes, including the ones under 70. Especially those.',
  'Tip: If you are a recruiter with thirty seconds, the button in the top-right corner is not a trap. It is a real resume.',
  'Tip: The candidate has been paged at 4am and remained polite. This is the single most marketable fact in this building.',
  'Tip: There are no image files in this project. Every sprite you see was drawn with code, which was either a principled choice or a lack of an art budget.',
  'Tip: Root cause analysis is just journalism with worse hours.',
  'Tip: The boss fight is a job application form. We considered making it subtle and then decided against it.',
  'Tip: Two years of on-call for a healthcare payment platform. Ask her about the 4am ones. She has material.',
  'Tip: "Open to relocate" is doing a lot of quiet work on that resume.',
  'Tip: Idling for sixty seconds unlocks an achievement. This is the only job-search process that rewards inaction.',
  'Tip: The runbooks she wrote are the reason someone else got to sleep. That is the job.',
];

/** The Lobby plant's escalating commentary. Index = how many times you've
 *  walked past it without doing anything productive. Runs out gracefully. */
export const PLANT_CONCERN: string[] = [
  'Ficus: Status nominal. Proceed to any room. I have no preference. That is a lie, I prefer the Hall of Projects.',
  'Ficus: Noting for the record that you have re-entered the Lobby. No action required. Yet.',
  'Ficus: You have now passed me three times. I am updating the ticket to "customer browsing."',
  'Ficus: Four passes. I am obligated to ask whether you are stuck or whether this is a stalling tactic.',
  'Ficus: Escalating to P3. The issue is that you have not visited the Boss Room and the candidate can see the analytics.',
  'Ficus: I have opened a problem record. The problem is you. The workaround is the Boss Room. It is the door with the flames.',
  'Ficus: P2. I want you to know that I am a plant and that this is the most stressful shift I have worked.',
  'Ficus: I have stopped photosynthesising. That is a joke. Probably.',
];

/** Short lines idle NPCs say when the player walks past. Each NPC picks from
 *  its own list first (see dialogue.ts / npcs), then falls back to these. */
export const GENERIC_BARKS: string[] = [
  'Have you tried restarting it.',
  "It's not DNS. It's never DNS. It was DNS.",
  'I have a meeting in four minutes and no agenda.',
  "Whoever wrote this runbook: thank you. Whoever didn't: I know who you are.",
  'The alert fired at 3:52am. I want that on the record.',
  'Is the candidate aware we can all see her building a video game instead of applying to jobs.',
  'Sev-2. Allegedly.',
];

/** Displayed in the Hall of Projects when you inspect a cabinet, above the
 *  card. Purely flavour. */
export const CABINET_FLAVOR: string[] = [
  'The cabinet hums. Somebody has taped a Post-it to the side reading "DO NOT UNPLUG — RUNNING".',
  'Coin slot jammed with a paperclip. Classic.',
  'The marquee flickers in a way that would fail a Catchpoint synthetic check.',
  'High score table contains one name, entered four hundred times.',
];

/** Idle lines for the coffee machine. Clicking it ten times is an achievement. */
export const COFFEE_LINES: string[] = [
  'The machine dispenses something brown. It is technically a beverage.',
  'ERROR: DESCALE REQUIRED. The machine dispenses anyway. Respect.',
  'This is the fourth coffee. The machine is judging you.',
  'The machine has begun dispensing before you press anything. It has learned your pattern.',
  'You and this machine have now interacted more than most people interact with their manager.',
  "Six. The machine's display reads: 'ARE YOU OKAY'.",
  'Seven. It is 3am somewhere and that somewhere is inside this coffee machine.',
  'Eight. The machine dispenses an empty cup. A statement.',
  'Nine. You can hear the pump struggling. Solidarity.',
  'Ten. A small light turns green. Somewhere, an achievement fires. This is the most any coffee machine has ever done for anyone.',
];

/** Shown while the boss fight form is submitting. */
export const BOSS_TAUNTS: string[] = [
  'THE HIRING PROCESS: "Please re-enter your entire work history in this form."',
  'THE HIRING PROCESS: "Your resume has been parsed. Your name is now `null`."',
  'THE HIRING PROCESS: "We will circle back."',
  'THE HIRING PROCESS: "This role requires 7 years of a framework released 4 years ago."',
  'THE HIRING PROCESS: "Great news — there are only six more rounds."',
  'THE HIRING PROCESS: "We went with someone whose experience was a closer fit."',
];

/** Boss hit reactions, shown when a contact field is filled correctly. */
export const BOSS_HITS: string[] = [
  'CRITICAL HIT — a human being has typed a real name into the form.',
  'EFFECTIVE — the form did not expect a working email address.',
  'SUPER EFFECTIVE — an actual message, written by a person, about a specific role.',
  'THE HIRING PROCESS staggers. It has never received a reply before.',
];

/** Fired on the victory screen. */
export const VICTORY_LINES: string[] = [
  'THE HIRING PROCESS has been defeated.',
  'It will respawn at every other company. That is canon.',
  'Your message has been sent to a real inbox, checked by a real person, who will reply.',
];
