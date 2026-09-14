/* ============================================================================
 * PROJECTS — one arcade cabinet each in the Hall of Projects.
 *
 * ADDING A PROJECT TAKES ONE PASTE. Append an object to the array below and
 * the game automatically: spawns a new cabinet, re-lays out the room, grows
 * the room if needed, adds it to the quest ("Inspect all N projects"), adds an
 * inventory slot, updates the completion %, and adds it to /resume.
 * You do not touch engine code, tilemaps or positions. Ever.
 *
 * ------------------------------ COMPLETE EXAMPLE ---------------------------
 * {
 *   id: 'log-anomaly-detector',            // unique, stable, kebab-case
 *   name: 'Log Anomaly Detector',
 *   pitch: 'Flags the weird log line before the pager does.',
 *   problem:
 *     'Splunk alerts fire on thresholds, which misses novel failure modes. ' +
 *     'This watches for shape changes instead of magnitude changes.',
 *   stack: ['Python', 'scikit-learn', 'Splunk', 'AWS Lambda'],
 *   role: 'Sole author. Built the feature extraction and the alerting hook.',
 *   highlight:
 *     'Uses a rolling isolation forest over tokenised log templates, so a ' +
 *     'never-before-seen stack trace scores high even at low volume.',
 *   liveUrl: 'https://example.com/demo',   // OPTIONAL — omit and no button renders
 *   repoUrl: 'https://github.com/you/x',   // OPTIONAL — omit and no button renders
 *   screenshot: 'https://...png',          // OPTIONAL — omit for generated pixel art
 *   year: '2026',                          // OPTIONAL
 *   featured: true,                        // OPTIONAL — places it nearest the door
 *   hidden: false,                         // OPTIONAL — true = temporarily remove
 * }
 * ------------------------------------------------------------------------ */

import type { Project } from '../types/content';

export const PROJECTS: Project[] = [
  {
    id: 'ai-incident-triage-agent',
    name: 'AI Incident Triage Agent',
    pitch: 'An LLM agent that classifies, triages and routes production alerts to the right team.',
    problem:
      'The first twenty minutes of an incident are usually spent deciding who owns it. Alerts arrive unclassified, get routed by whoever is awake, and bounce between teams while the SLA clock runs. This agent makes that call in seconds and attaches a starting point.',
    stack: ['Python', 'LangChain', 'LLM Agents', 'Prompt Engineering', 'OpenAI API'],
    role:
      'Built end to end: the classification prompts, the routing logic, and the remediation-step generation. Designed it around the escalation paths I was already running manually on the L2/L3 desk.',
    highlight:
      'It does not just label the alert — it generates suggested remediation steps from the same runbook corpus the on-call engineer would have searched, so the ticket arrives with a first move already in it. That turns triage from a lookup into a review.',
    featured: true,
    year: '2026',
    // TODO(abeer): add repoUrl / liveUrl when these are public. Until then the
    // card simply renders without those buttons — no dead links.
  },
  {
    id: 'rag-knowledge-chatbot',
    name: 'RAG Knowledge Chatbot',
    pitch: 'Semantic search over internal runbooks, so nobody greps Confluence at 3am.',
    problem:
      'Support documentation is written by the people who already know the answer, and is therefore unsearchable by the people who do not. Manual lookups cost minutes per incident, and minutes are the whole product in incident response.',
    stack: ['Python', 'RAG Pipelines', 'OpenAI API', 'FAISS', 'Vector Databases', 'Embeddings'],
    role:
      'Built the ingestion and chunking of internal documentation and runbooks, the embedding/vector store layer, and the retrieval-augmented answer step.',
    highlight:
      'Retrieval is over runbooks, not prose — chunking respects procedure boundaries, so an answer comes back as a complete set of steps instead of half of one. Citations point at the runbook section, which is what an engineer actually needs to verify before acting.',
    featured: true,
    year: '2025',
    // TODO(abeer): repoUrl / liveUrl.
  },
  {
    id: 'maze-game-bot',
    name: 'Maze Game Bot',
    pitch: 'A* pathfinding bot that solves a maze along the genuinely shortest path.',
    problem:
      'A clean, self-contained study of informed search: get from start to goal optimally and fast, and be able to prove the path is shortest rather than merely working.',
    stack: ['Python', 'A* Algorithm', 'Pathfinding', 'Data Structures'],
    role: 'Designed and implemented the solver, the heuristic and the maze representation.',
    highlight:
      'Admissible heuristic means A* is provably optimal here, not just fast — the bot returns the shortest path, not the first path. The same grid/neighbour model is what the player character in this portfolio walks on.',
    year: '2024',
    // TODO(abeer): repoUrl / liveUrl.
  },
  {
    id: 'recruiter-simulator',
    name: 'Recruiter Simulator 2026',
    pitch: 'The portfolio you are currently standing inside. Yes, it counts.',
    problem:
      'A resume PDF gets eight seconds of attention and proves nothing about whether the candidate can build. This one is a real game engine with a real content pipeline, and the plain resume is one click away at all times for the eight-second readers.',
    stack: ['TypeScript', 'React', 'Canvas', 'Zustand', 'Vite', 'Web Audio API'],
    role:
      'Everything: the tile renderer, the grid movement and collision, the dialogue system, the procedural room layout, the save migrations, and every sprite (drawn in code — there are no image files in this project).',
    highlight:
      'Rooms are generated from the content arrays at runtime. Adding a seventh project spawns a seventh arcade cabinet, re-flows the grid, grows the room, updates the quest count and the completion percentage — with a flood-fill check that proves every object is still reachable from the spawn tile. No tilemap was edited by hand.',
    year: '2026',
    liveUrl: './',
    // Delete this whole entry if the self-reference is too much. It takes
    // ten seconds and nothing else needs to change.
  },
];

/* ---------------------------------------------------------------------------
 * TECH "ELEMENTAL TYPES" — how a stack entry becomes a coloured chip.
 *
 * Add a line to give a technology its own type. Anything not listed here gets
 * the NEUTRAL type automatically, so you never *have* to update this.
 * Colours are palette keys — see src/data/palette.ts.
 * ------------------------------------------------------------------------ */
export const TECH_TYPES: Record<string, { type: string; color: string }> = {
  // AI / ML → PSYCHIC (violet)
  'LangChain': { type: 'PSYCHIC', color: 'orchid' },
  'LLM Agents': { type: 'PSYCHIC', color: 'orchid' },
  'OpenAI API': { type: 'PSYCHIC', color: 'orchid' },
  'Prompt Engineering': { type: 'PSYCHIC', color: 'orchid' },
  'RAG Pipelines': { type: 'PSYCHIC', color: 'orchid' },
  'Embeddings': { type: 'PSYCHIC', color: 'orchid' },
  'Generative AI': { type: 'PSYCHIC', color: 'orchid' },

  // Languages → SCRIPT (amber)
  'Python': { type: 'SCRIPT', color: 'amber1' },
  'TypeScript': { type: 'SCRIPT', color: 'amber1' },
  'JavaScript': { type: 'SCRIPT', color: 'amber1' },

  // Data → AQUA (cyan)
  'FAISS': { type: 'AQUA', color: 'cyan' },
  'Vector Databases': { type: 'AQUA', color: 'cyan' },
  'SQL': { type: 'AQUA', color: 'cyan' },
  'MySQL': { type: 'AQUA', color: 'cyan' },

  // Cloud / infra → STORM (gold)
  'AWS Lambda': { type: 'STORM', color: 'gold' },
  'AWS CloudWatch': { type: 'STORM', color: 'gold' },
  'Vite': { type: 'STORM', color: 'gold' },

  // Algorithms → LOGIC (lime)
  'A* Algorithm': { type: 'LOGIC', color: 'lime' },
  'Pathfinding': { type: 'LOGIC', color: 'lime' },
  'Data Structures': { type: 'LOGIC', color: 'lime' },

  // Front end → STEEL (mist)
  'React': { type: 'STEEL', color: 'mist' },
  'Canvas': { type: 'STEEL', color: 'mist' },
  'Zustand': { type: 'STEEL', color: 'mist' },
  'Web Audio API': { type: 'STEEL', color: 'mist' },
};

export const NEUTRAL_TYPE = { type: 'NORMAL', color: 'linen' };

export function techType(tech: string) {
  return TECH_TYPES[tech] ?? NEUTRAL_TYPE;
}
