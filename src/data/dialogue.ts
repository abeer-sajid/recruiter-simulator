/* ============================================================================
 * DIALOGUE — every word any character says.
 *
 * Two exports:
 *   DIALOGUE — a map of node id -> DialogueNode. Nodes can branch.
 *   NPCS     — the characters themselves, and which room they stand in.
 *
 * The former-colleague NPCs in The Archives are NOT listed here: they are
 * generated from JOBS in experience.ts, so adding a job adds its NPC.
 *
 * ---------------------- HOW TO ADD AN NPC WITH DIALOGUE --------------------
 * 1. Add a node to DIALOGUE:
 *
 *      'greg.intro': {
 *        id: 'greg.intro',
 *        speaker: 'Greg, Facilities',
 *        portrait: 'terminal',          // any key from PORTRAITS in sprites.ts
 *        lines: [
 *          "I'm not supposed to be in this build.",
 *          "But here we are.",
 *        ],
 *        choices: [                      // OPTIONAL — omit for a linear chat
 *          { text: 'Carry on, Greg.', goto: 'greg.ok' },
 *          { text: 'This is a portfolio, Greg.', sarcastic: true, goto: 'greg.ok' },
 *        ],
 *        onEnd: { xp: 20 },              // OPTIONAL
 *      },
 *
 * 2. Add the NPC to NPCS:
 *
 *      { id: 'greg', name: 'Greg', room: 'breakroom', dialogue: 'greg.intro',
 *        barks: ['Mind the wet floor sign.'],
 *        colors: { shirt: '#5f9e58' } }
 *
 * 3. There is no step 3. The room finds a free tile, places him, keeps every
 *    path walkable, and adds him to the "talk to every NPC" achievement count.
 *
 * HOUSE RULE: in any encounter with choices, exactly one is marked
 * `sarcastic: true`. Picking sarcastic options enough times is an achievement.
 * ========================================================================= */

import type { DialogueNode, NpcDef } from '../types/content';
import { PALETTE } from './palette';
import { PLANT_CONCERN } from './jokes';

export const DIALOGUE: Record<string, DialogueNode> = {
  /* ----------------------------------------------------------- FICUS ---- */
  'ficus.intro': {
    id: 'ficus.intro',
    speaker: 'Ficus (Office Plant)',
    portrait: 'ficus',
    lines: [
      'Acknowledging your page. Severity: career-defining.',
      'You have been assigned ticket REQ-2026-0914: evaluate one Abeer Sajid for a role you have not fully defined. Standard.',
      "I am Ficus. I am a plant. I am also, due to a headcount freeze, the onboarding function for this entire building.",
    ],
    choices: [
      { text: 'How do I move?', goto: 'ficus.controls' },
      { text: 'What is this place?', goto: 'ficus.premise' },
      {
        text: 'A talking plant. Sure. This is normal.',
        sarcastic: true,
        goto: 'ficus.sarcasm',
      },
    ],
  },

  'ficus.controls': {
    id: 'ficus.controls',
    speaker: 'Ficus (Office Plant)',
    portrait: 'ficus',
    lines: [
      'WASD or the arrow keys to walk. Diagonals work. You are not on a grid, emotionally, but you are on one literally.',
      'When an exclamation mark appears above something, press E or SPACE to interact with it. That is the entire game loop.',
      'Q opens your quest log. I opens your inventory. ? shows every key. ESC closes whatever you have opened.',
      'On a phone, a directional pad appears at the bottom. We anticipated you being on a phone. We anticipate that a lot.',
    ],
    choices: [
      { text: 'And what am I meant to be doing?', goto: 'ficus.premise' },
      { text: 'Got it. I will start walking.', goto: 'ficus.signposts' },
      {
        text: 'I have used a computer before, but thank you.',
        sarcastic: true,
        goto: 'ficus.signposts',
      },
    ],
  },

  'ficus.premise': {
    id: 'ficus.premise',
    speaker: 'Ficus (Office Plant)',
    portrait: 'ficus',
    lines: [
      "This is a portfolio. It is aware that it is a portfolio. We have all made peace with that at different speeds.",
      'Four rooms hold the evidence. The Hall of Projects has the things she built. The Skill Tree Chamber has an honest stat sheet, including the unflattering numbers. The Archives hold former colleagues, who will talk. The Break Room holds the part where she is a person.',
      'The fifth door is the Boss Room. Behind it is THE HIRING PROCESS. You will know it when you see it, because it will already be asking you to re-enter information it has.',
      'You do not have to do any of this. The button in the top right corner is a real resume, loads instantly, and I will not take it personally. I will take it slightly personally.',
    ],
    choices: [
      { text: 'How do I move?', goto: 'ficus.controls' },
      { text: 'Point me at the rooms.', goto: 'ficus.signposts' },
      {
        text: 'A candidate built an entire RPG. Is she okay?',
        sarcastic: true,
        goto: 'ficus.okay',
      },
    ],
  },

  'ficus.sarcasm': {
    id: 'ficus.sarcasm',
    speaker: 'Ficus (Office Plant)',
    portrait: 'ficus',
    lines: [
      'I detect scepticism. I am logging it as expected behaviour rather than a defect.',
      "For the record: I am the most stable component in this building. Everything else here was written in the last few weeks by someone between contracts.",
    ],
    choices: [
      { text: 'Fine. What is this place?', goto: 'ficus.premise' },
      { text: 'How do I move?', goto: 'ficus.controls' },
    ],
  },

  'ficus.okay': {
    id: 'ficus.okay',
    speaker: 'Ficus (Office Plant)',
    portrait: 'ficus',
    lines: [
      'She is fine. She ran on-call for a healthcare payment platform for two years. Her baseline for "not okay" is calibrated differently to yours.',
      'Also, and I say this as the narrator: building a working game engine to apply for jobs is either a red flag or a portfolio. There is no third category. You get to decide which.',
    ],
    choices: [
      { text: "I'll decide after I look around.", goto: 'ficus.signposts' },
      { text: 'Point me at the rooms.', goto: 'ficus.signposts' },
    ],
  },

  'ficus.signposts': {
    id: 'ficus.signposts',
    speaker: 'Ficus (Office Plant)',
    portrait: 'ficus',
    lines: [
      'The doors are labelled. I fought for that. The original design had them unlabelled, "for discovery."',
      'Go. Walk into things. Press E at them. I will be here, photosynthesising under a fluorescent tube, which is the plant equivalent of a stand-up meeting.',
    ],
    onEnd: { xp: 30, achievement: 'met-ficus', completeObjective: 'talk-ficus' },
  },

  /* ---------------------------------------------------- RECEPTIONIST ---- */
  'dolores.intro': {
    id: 'dolores.intro',
    speaker: 'Dolores, Front Desk',
    portrait: 'terminal',
    lines: [
      'Visitor badge. Sign here. And here. And here, which is the same information as the first two but in a different order.',
      "You're the recruiter, yes? Evaluating Abeer. She's not here. She's never here. She's on a bridge call in a different timezone, which is the most accurate thing this building does.",
    ],
    choices: [
      {
        text: 'What is she actually like to work with?',
        goto: 'dolores.real',
      },
      { text: 'Where should I start?', goto: 'dolores.where' },
      {
        text: 'I have three more of these today.',
        sarcastic: true,
        goto: 'dolores.three',
      },
    ],
  },

  'dolores.real': {
    id: 'dolores.real',
    speaker: 'Dolores, Front Desk',
    portrait: 'terminal',
    lines: [
      "Calm. That's the first thing. Not quiet — calm. There's a difference and you learn it fast in support.",
      'She writes things down. Runbooks, SQL references, CloudWatch guides. Leadership called it out formally. Most engineers guard that knowledge. She published it.',
      "Also she mentors the new hires. Nobody asked her to. It wasn't in the contract scope. She did it anyway and the ramp-up time dropped.",
    ],
    onEnd: { xp: 25 },
    choices: [
      { text: 'Where should I start?', goto: 'dolores.where' },
      { text: 'Thanks, Dolores.' },
    ],
  },

  'dolores.where': {
    id: 'dolores.where',
    speaker: 'Dolores, Front Desk',
    portrait: 'terminal',
    lines: [
      'Projects if you want proof she can build. Archives if you want other people to vouch. Break Room if you want to know whether you would like her.',
      'Boss Room when you are ready to stop browsing and send a message. It is a real form. It goes to a real inbox. I have checked, because I am the one who would have to forward it otherwise.',
    ],
  },

  'dolores.three': {
    id: 'dolores.three',
    speaker: 'Dolores, Front Desk',
    portrait: 'terminal',
    lines: [
      'Three more evaluations today. Understood. Then I will be brief, which is more than this building usually manages.',
      'Two years L2/L3 on a regulated healthcare payment platform. Splunk, New Relic, CloudWatch, Dynatrace, Catchpoint, BMC Remedy. Builds LLM triage agents in Python and LangChain. Master\'s in CS, 3.66. Open to relocate.',
      'That is the whole thing in fifteen seconds. The game is optional. It always was.',
    ],
    onEnd: { xp: 25 },
  },

  /* ------------------------------------------------------- ARCHIVIST ---- */
  'archivist.intro': {
    id: 'archivist.intro',
    speaker: 'The Archivist',
    portrait: 'bookshelf',
    lines: [
      'Employment history. Chronological, newest first, because that is how you will read it regardless of how I file it.',
      'Each doorway holds a former colleague. They have been briefed to be honest rather than glowing, which in practice produced something better than glowing.',
    ],
    choices: [
      {
        text: 'Are these real references?',
        goto: 'archivist.real',
      },
      { text: 'Understood. I will walk the corridor.', goto: 'archivist.go' },
      {
        text: 'Let me guess — they all loved her.',
        sarcastic: true,
        goto: 'archivist.loved',
      },
    ],
  },

  'archivist.real': {
    id: 'archivist.real',
    speaker: 'The Archivist',
    portrait: 'bookshelf',
    lines: [
      'They are dramatisations. The NAMES are invented — obviously, nobody puts a former manager in a video game without asking.',
      'What they SAY is not invented. Every claim in this corridor appears on the resume, which is one click away in the top right corner. Cross-check us. We would prefer it.',
    ],
    onEnd: { xp: 20 },
  },

  'archivist.loved': {
    id: 'archivist.loved',
    speaker: 'The Archivist',
    portrait: 'bookshelf',
    lines: [
      'One of them describes her contract ending. One of them calls a job "the early-career one everyone deletes."',
      'If you want uncritical praise, the internet has an enormous amount of it. This corridor has dates and specifics.',
    ],
  },

  'archivist.go': {
    id: 'archivist.go',
    speaker: 'The Archivist',
    portrait: 'bookshelf',
    lines: ['Left to right. Recent to less recent. Mind the filing.'],
  },

  /* --------------------------------------------------- SKILL TERMINAL ---- */
  'stats.intro': {
    id: 'stats.intro',
    speaker: 'ASSESSMENT TERMINAL',
    portrait: 'terminal',
    lines: [
      'SKILL ASSESSMENT SYSTEM v2.1. Self-reported. Unverified. Unusually honest.',
      'Levels run 1 to 99. Nothing here is at 99, because nobody is at 99 and the ones who claim it are the reason you ask technical questions.',
      'The crystals in this room are the individual skills. Walk into one and press E. Or open the full sheet and read all of them at once.',
    ],
    choices: [
      { text: 'Open the full stat sheet.', effect: { open: 'skills' } },
      {
        text: 'Why are some of these under 70?',
        goto: 'stats.honest',
      },
      {
        text: 'Everyone self-reports 95. Why not you.',
        sarcastic: true,
        goto: 'stats.honest',
      },
    ],
  },

  'stats.honest': {
    id: 'stats.honest',
    speaker: 'ASSESSMENT TERMINAL',
    portrait: 'terminal',
    lines: [
      'Because a number you cannot defend in an interview is worse than a lower number you can.',
      'Dynatrace is 70. She used it on real incidents; she would not claim to configure it from scratch. CSS is 64 and the descriptor tells you exactly what that means in practice.',
      'The high numbers are therefore worth something. Splunk at 85. Incident management at 89. Documentation at 88, which is the least glamorous score on this sheet and the one that actually mattered to her team.',
    ],
    onEnd: { xp: 30 },
    choices: [
      { text: 'Open the full stat sheet.', effect: { open: 'skills' } },
      { text: 'Noted.' },
    ],
  },

  /* ------------------------------------------------------ BREAK ROOM ---- */
  'breakroom.sofa': {
    id: 'breakroom.sofa',
    speaker: 'Karim, Someone on Lunch',
    portrait: 'coffee',
    lines: [
      "Oh — you're the evaluation. Sit down, I have eleven minutes.",
      "This is the room where the bit stops, mostly. Every other room is trying to impress you. This one is just information about a person.",
    ],
    choices: [
      { text: 'What does she do when she is not working?', goto: 'breakroom.hobbies' },
      { text: 'What is the actual career story?', goto: 'breakroom.story' },
      {
        text: 'Is there a version of this that is shorter?',
        sarcastic: true,
        goto: 'breakroom.short',
      },
    ],
  },

  'breakroom.hobbies': {
    id: 'breakroom.hobbies',
    speaker: 'Karim, Someone on Lunch',
    portrait: 'coffee',
    lines: [
      'Builds small AI things that fix something that annoyed her during an on-call shift. That is genuinely where the triage agent came from. It was not a portfolio project first, it was an irritation first.',
      'And she explains things to stressed people. Grad assistant habit, from teaching Computer Security at UAB. Office hours and a Sev-1 bridge call turn out to be the same skill.',
    ],
    onEnd: { xp: 25, achievement: 'read-about', completeObjective: 'visit-breakroom' },
  },

  'breakroom.story': {
    id: 'breakroom.story',
    speaker: 'Karim, Someone on Lunch',
    portrait: 'coffee',
    lines: [
      'Web developer in 2019. Two years of client sites — HTML, CSS, JavaScript, WordPress. The unglamorous one she did not delete from the resume.',
      "Then a Master's in Computer Science at UAB, 3.66, teaching security on the side. Then a software engineering traineeship. Then two years L2/L3 on a healthcare payment platform at Bank of America, running triage on merchant-impacting incidents.",
      'And all through the last stretch, building LLM agents and RAG pipelines in Python — because she kept watching incidents get slower for reasons software could fix.',
      'That is not a wandering career. That is someone who kept moving toward the part of the work that was actually hard.',
    ],
    onEnd: { xp: 40, achievement: 'read-about', completeObjective: 'visit-breakroom' },
  },

  'breakroom.short': {
    id: 'breakroom.short',
    speaker: 'Karim, Someone on Lunch',
    portrait: 'coffee',
    lines: [
      'Yes. Top right corner, "Skip the game". Plain resume, loads in under a second, works on a phone, screen-reader friendly.',
      'It was built before the game was. That order was deliberate.',
    ],
  },

  /* ------------------------------------------------- SECRET / CREDITS ---- */
  'secret.rack': {
    id: 'secret.rack',
    speaker: 'Server Closet',
    portrait: 'rack',
    lines: [
      'You reached max level, which means you talked to nearly everyone in a building designed to be skipped.',
      'So here is the part that is not a joke: this whole environment — the tile renderer, the collision, the dialogue system, the procedural room layout, the save migrations, the sprites — is about four thousand lines of TypeScript written from scratch. No game engine.',
      'Every room you walked through was generated from four content files. Add a project to an array and a cabinet appears, the room re-flows, the quest count updates, and a flood-fill check proves you can still reach everything.',
      'That is the actual portfolio piece. The jokes were to get you to stay long enough to notice it.',
    ],
    onEnd: { xp: 80, achievement: 'secret-room' },
    choices: [
      { text: 'Roll the credits.', effect: { open: 'credits' } },
      { text: 'Go fight the boss.', effect: { goToRoom: 'boss' } },
    ],
  },

  /* ------------------------------------------------------------ BOSS ---- */
  'boss.intro': {
    id: 'boss.intro',
    speaker: 'THE HIRING PROCESS',
    portrait: 'boss',
    lines: [
      'YOU HAVE REACHED THE FINAL STAGE.',
      'PLEASE RE-ENTER YOUR ENTIRE WORK HISTORY, WHICH IS ATTACHED, INTO THESE FIELDS.',
      'I HAVE PARSED YOUR RESUME. YOUR NAME IS NOW `null`. YOUR MOST RECENT EMPLOYER IS "PRESENT".',
      'THERE ARE ONLY SIX MORE ROUNDS.',
    ],
    choices: [
      { text: 'Fight it. (Open the contact form.)', effect: { open: 'boss' } },
      {
        text: 'What is its weakness?',
        goto: 'boss.weakness',
      },
      {
        text: 'We will circle back.',
        sarcastic: true,
        goto: 'boss.circle',
      },
    ],
  },

  'boss.weakness': {
    id: 'boss.weakness',
    speaker: 'Ficus (Office Plant)',
    portrait: 'ficus',
    lines: [
      'It is weak to a real message from a real person about a specific role.',
      'It has never received one. It is built entirely to absorb applications going the other direction. A recruiter actually reaching out breaks its damage model completely.',
      'Fill the three fields. Each one lands a hit. Send it, and it goes to abrsjd5@gmail.com, which is checked, by a person, who replies.',
    ],
    choices: [{ text: 'Understood. Engage.', effect: { open: 'boss' } }],
  },

  'boss.circle': {
    id: 'boss.circle',
    speaker: 'THE HIRING PROCESS',
    portrait: 'boss',
    lines: [
      'CIRCLING BACK IS MY ATTACK. YOU CANNOT USE MY ATTACK.',
      'THE ROLE HAS BEEN PUT ON HOLD. THE ROLE HAS BEEN REOPENED. THE ROLE NOW REQUIRES SEVEN YEARS OF A FRAMEWORK RELEASED FOUR YEARS AGO.',
    ],
    choices: [
      { text: 'Fight it. (Open the contact form.)', effect: { open: 'boss' } },
      { text: 'Retreat for now.' },
    ],
  },
};

/* ---------------------------------------------------------------------------
 * NPCS — free-standing characters. Archives colleagues come from JOBS instead.
 * `at` is optional: leave it out and the room finds a legal tile for them.
 * ------------------------------------------------------------------------ */
export const NPCS: NpcDef[] = [
  {
    id: 'ficus',
    name: 'Ficus',
    room: 'lobby',
    dialogue: 'ficus.intro',
    portrait: 'ficus',
    sprite: 'plant', // drawn as the plant sprite, not as a person

    barks: PLANT_CONCERN,
    barksSequential: true,
    at: { tx: 9, ty: 8 },
  },
  {
    id: 'dolores',
    name: 'Dolores',
    room: 'lobby',
    dialogue: 'dolores.intro',
    portrait: 'terminal',
    barks: [
      'Sign here. And here.',
      'She is on a bridge call. She is always on a bridge call.',
      'Badge must be visible at all times. Yours is a JPEG.',
    ],
    colors: { shirt: PALETTE.orchid, hair: PALETTE.linen, pants: PALETTE.ink },
    at: { tx: 4, ty: 5 },
  },
  {
    id: 'archivist',
    name: 'The Archivist',
    room: 'archives',
    dialogue: 'archivist.intro',
    portrait: 'bookshelf',
    barks: ['Chronological. Newest first.', 'Cross-check us against the resume. Please.'],
    colors: { shirt: PALETTE.slate, hair: PALETTE.mist, pants: PALETTE.void },
    at: { tx: 3, ty: 7 }, // just inside the corridor entrance
  },
  {
    id: 'karim',
    name: 'Karim',
    room: 'breakroom',
    dialogue: 'breakroom.sofa',
    portrait: 'coffee',
    barks: [
      'Eleven minutes of lunch left.',
      'The microwave is a shared resource with no locking mechanism.',
      'This is the only room without a bit.',
    ],
    colors: { shirt: PALETTE.cyan, hair: PALETTE.ink, pants: PALETTE.stone },
  },
];
