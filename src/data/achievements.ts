/* ============================================================================
 * ACHIEVEMENTS — Xbox-style toasts, top-right, with a sound.
 *
 * ADDING ONE: append an entry here, then unlock it from anywhere with
 *   useGame.getState().unlock('your-id')
 * or from a dialogue choice with `effect: { achievement: 'your-id' }`.
 * If you unlock an id that isn't in this list, the validator tells you in dev
 * and nothing happens in prod. It will never crash.
 *
 * ------------------------------ COMPLETE EXAMPLE ---------------------------
 * {
 *   id: 'read-the-footer',
 *   name: 'Fine Print Enjoyer',
 *   description: 'Scrolled to the bottom of the resume page. Nobody does this.',
 *   secret: true,   // OPTIONAL — shows as "???" until unlocked
 *   xp: 40,         // OPTIONAL — defaults to 25
 * }
 * ========================================================================= */

import type { Achievement } from '../types/content';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: 'Onboarded',
    description: 'Moved. The bar for this achievement is on the floor and you cleared it.',
    xp: 10,
  },
  {
    id: 'met-ficus',
    name: 'Acknowledged the Page',
    description: 'Talked to the plant. It has been waiting.',
    xp: 20,
  },
  {
    id: 'all-projects',
    name: 'Artifact Collector',
    description: 'Inspected every project. You now know more about the candidate than most interviewers will.',
    xp: 100,
  },
  {
    id: 'all-skills',
    name: 'Read the Stat Sheet',
    description: 'Opened the full skill tree. The honest numbers included.',
    xp: 60,
  },
  {
    id: 'all-jobs',
    name: 'Reference Check Complete',
    description: 'Spoke to every former colleague in the Archives.',
    xp: 80,
  },
  {
    id: 'read-about',
    name: 'Read the About Section',
    description: 'Nobody does this. You did this. Genuinely, thank you.',
    xp: 75,
  },
  {
    id: 'sincerity',
    name: 'Caught Him Being Sincere',
    description: 'Found the one paragraph in this building with no joke in it.',
    xp: 60,
  },
  {
    id: 'all-npcs',
    name: 'Talked to Every NPC',
    description: 'Every single one. Including the ones who did not want to talk.',
    secret: true,
    xp: 120,
  },
  {
    id: 'tried-to-leave',
    name: 'Tried to Leave Without Contacting Me',
    description: 'The back button was RIGHT THERE and you went for it. The plant saw.',
    secret: true,
    xp: 50,
  },
  {
    id: 'konami',
    name: '↑↑↓↓←→←→BA',
    description: 'Entered the Konami code. Some habits are load-bearing.',
    secret: true,
    xp: 100,
  },
  {
    id: 'idle-60',
    name: 'Idled for 60 Seconds',
    description: 'Stood perfectly still for a minute. The only hiring process that rewards this.',
    secret: true,
    xp: 40,
  },
  {
    id: 'coffee-10',
    name: 'Descale Required',
    description: 'Used the coffee machine ten times. The machine has filed a complaint.',
    secret: true,
    xp: 50,
  },
  {
    id: 'sarcastic',
    name: 'Cultural Fit',
    description: 'Chose the sarcastic dialogue option. Repeatedly. We are the same.',
    xp: 40,
  },
  {
    id: 'max-level',
    name: 'Fully Vested',
    description: 'Reached max level. The server closet is unlocked.',
    xp: 0,
  },
  {
    id: 'secret-room',
    name: 'Found the Server Closet',
    description: 'There is always a room they do not show on the tour.',
    secret: true,
    xp: 80,
  },
  {
    id: 'boss-defeated',
    name: 'Defeated THE HIRING PROCESS',
    description: 'You sent a real message to a real inbox. That is the actual win condition.',
    xp: 200,
  },
  {
    id: 'resume-viewed',
    name: 'Skipped the Game',
    description: 'Went straight for the plain resume. Respected. That button exists for you.',
    xp: 25,
  },
  {
    id: 'muted',
    name: 'Audio Off',
    description: 'Muted the chiptune. Understandable. It was synthesised at runtime, if that helps.',
    secret: true,
    xp: 15,
  },
];

/** Default XP if an achievement omits `xp`. */
export const DEFAULT_ACHIEVEMENT_XP = 25;
