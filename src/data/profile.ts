/* ============================================================================
 * PROFILE — who you are. Used by the title screen, the credits, the footer,
 * the boss room and the /resume page.
 *
 * COMPLETE EXAMPLE (copy, paste over the object below, edit):
 *
 *   export const PROFILE: Profile = {
 *     name: 'Ada Lovelace',
 *     title: 'Analytical Engine Programmer',
 *     tagline: 'Writes the notes everyone else cites.',
 *     summary: 'Two paragraphs max. Real sentences. No buzzword soup.',
 *     location: 'London, UK',
 *     yearsExperience: 7,
 *     email: 'ada@example.com',
 *     resumeUrl: '/resume.pdf',
 *     availability: 'Open to relocate',
 *     links: [
 *       { id: 'github', label: 'GitHub', url: 'https://github.com/ada', display: 'github.com/ada' },
 *     ],
 *     seo: {
 *       siteTitle: 'Ada Lovelace — Programmer',
 *       description: 'Portfolio of Ada Lovelace, shaped like an RPG.',
 *       canonicalUrl: 'https://ada.example.com',
 *     },
 *   };
 * ========================================================================= */

import type { Profile, EducationEntry, CertGroup, WeirdFact, Hobby } from '../types/content';

export const PROFILE: Profile = {
  name: 'Abeer Sajid',
  title: 'Production Support Engineer — L2/L3',
  tagline: 'Keeps healthcare payments running at 3am, then builds the AI agent that would have caught it.',
  summary:
    'Production Support Engineer delivering incident management, incident response, root cause analysis and system monitoring for high-availability, regulated healthcare payment platforms. Skilled in observability and monitoring tools (New Relic, Splunk, Dynatrace, AWS CloudWatch, Catchpoint), ITSM incident workflows (BMC Remedy), on-call support, SLA compliance, process improvement and cross-functional stakeholder communication. Builds AI/ML solutions using Python, LangChain, the OpenAI API and RAG pipelines, including LLM agents for automated incident triage.',
  location: 'Charlotte, NC, USA',
  yearsExperience: 5,
  email: 'abrsjd5@gmail.com',

  // The PDF lives in /public, so this path works on any static host.
  resumeUrl: './resume.pdf',

  availability: 'Open to relocate · Visa status: H1B',

  links: [
    {
      id: 'email',
      label: 'Email',
      url: 'mailto:abrsjd5@gmail.com',
      display: 'abrsjd5@gmail.com',
    },
    {
      id: 'github',
      label: 'GitHub',
      url: 'https://github.com/abeer-sajid',
      display: 'github.com/abeer-sajid',
    },
    {
      id: 'site',
      label: 'Website',
      url: 'https://abeer-sajid.github.io',
      display: 'abeer-sajid.github.io',
    },
    // TODO(abeer): paste your LinkedIn URL here and delete `hidden: true`.
    // Until you do, no LinkedIn button is rendered anywhere. Nothing breaks.
    {
      id: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/YOUR-HANDLE',
      display: 'linkedin.com/in/YOUR-HANDLE',
      hidden: true,
    },
  ],

  seo: {
    siteTitle: 'Abeer Sajid — Production Support Engineer (L2/L3) & AI Engineer',
    description:
      'Portfolio of Abeer Sajid: L2/L3 production support for regulated healthcare payment platforms, observability with Splunk / New Relic / Dynatrace / AWS CloudWatch, and AI incident-triage agents built with Python, LangChain and RAG. Playable as an RPG, or read the plain resume.',
    // TODO(abeer): change this to your real deployed URL before launch.
    canonicalUrl: 'https://abeer-sajid.github.io',
  },
};

/* --------------------------------------------------------------- EDUCATION
 * Shown in the Break Room and on the resume page.
 * Example entry:
 *   { id: 'phd', credential: 'PhD, Computer Science', institution: 'MIT',
 *     detail: 'Thesis on distributed tracing', location: 'Cambridge, MA',
 *     year: '2021' }
 * ------------------------------------------------------------------------ */
export const EDUCATION: EducationEntry[] = [
  {
    id: 'masters-uab',
    credential: "Master's in Computer Science",
    institution: 'University of Alabama at Birmingham',
    detail: 'GPA 3.66',
    location: 'Birmingham, AL, USA',
  },
  {
    id: 'bachelors-usa',
    credential: "Bachelor's in Software Engineering",
    institution: 'University of South Asia',
    detail: 'GPA 3.09',
    location: 'Pakistan',
  },
];

/* ----------------------------------------------------------- CERTIFICATIONS
 * Grouped by provider so the Break Room bookshelf can render one shelf per
 * provider. Add a provider = add a shelf. No layout work needed.
 * ------------------------------------------------------------------------ */
export const CERTIFICATIONS: CertGroup[] = [
  {
    id: 'datacamp',
    provider: 'DataCamp',
    items: [
      'Working with the OpenAI API',
      'Prompt Engineering with the OpenAI API',
      'Introduction to FastAPI',
      'Introduction to LLMs in Python',
      'Developing LLM Applications with LangChain',
      'Retrieval Augmented Generation (RAG) with LangChain',
      'Designing Agentic Systems with LangChain',
      'Vector Databases for Embeddings with Pinecone',
      'Working with Hugging Face',
    ],
  },
  {
    id: 'udemy',
    provider: 'Udemy',
    items: [
      'The Complete Splunk Beginner Course',
      'JIRA Fundamentals: Effective Scrum Project Management',
    ],
  },
  {
    id: 'uab',
    provider: 'University of Alabama at Birmingham',
    items: ['Cyber Security Completion (Dec 2023)'],
  },
];

/* ------------------------------------------------------------- ACTIVITIES */
export const ACTIVITIES: CertGroup[] = [
  {
    id: 'activities',
    provider: 'Research & Community',
    items: [
      'Research & Social Media Intern — TechHub Connect (Punjab IT Board), Summer 2017',
      'Freelancing Workshop Certificate of Appreciation — TechHub Connect',
      '1st National Conference on Emerging Technologies — University of South Asia',
    ],
  },
];

/* ------------------------------------------------------------ WEIRD FACTS
 * The coffee machine easter egg reads this array.
 *
 * RIGHT NOW IT IS EMPTY ON PURPOSE. You said no invented content, and these
 * are not in your resume. While the array is empty the coffee machine says
 * "Personal anecdotes are pending review by Legal" — which is funnier than a
 * blank panel, so there is no rush.
 *
 * TO FILL IT: uncomment the three entries and write real ones. Anything true
 * and slightly odd works better than anything impressive.
 * ------------------------------------------------------------------------ */
export const WEIRD_FACTS: WeirdFact[] = [
  // { id: 'fact-1', text: 'I can tell which service is down from the shape of the graph before I read the label.' },
  // { id: 'fact-2', text: 'REPLACE ME with something true and slightly odd.' },
  // { id: 'fact-3', text: 'REPLACE ME too.' },
];

/* ---------------------------------------------------------------- HOBBIES
 * Shown by the Break Room sofa NPC. Empty array = that NPC says something
 * else instead. Example: { id: 'chess', label: 'Chess', detail: 'Badly, fast.' }
 * ------------------------------------------------------------------------ */
export const HOBBIES: Hobby[] = [
  {
    id: 'building',
    label: 'Building small AI things that fix real annoyances',
    detail:
      'Most of my side projects started as something that irritated me during an on-call shift.',
  },
  {
    id: 'teaching',
    label: 'Explaining things to people who are stressed',
    detail:
      'Grad-assistant habit. Turns out a bridge call and a lab section need the same skill.',
  },
];

/* --------------------------------------------------- THE SINCERE PARAGRAPH
 * Exactly one moment in this game is not a joke. This is it. It is delivered
 * by the Break Room window NPC. Rewrite it in your own voice — the contrast
 * with everything else is what makes the rest land.
 * ------------------------------------------------------------------------ */
export const SINCERE_NOTE: string[] = [
  "Alright. No bit this time.",
  "When a payment platform goes down, somebody is standing at a counter in a clinic with a card in their hand, and somebody behind that counter is getting shouted at. That is the actual stake. It is not abstract and it is not about uptime percentages.",
  "I like this work because it is one of the few jobs where being calm is a technical skill. You read the graph, you say the honest thing on the bridge call even when it is your team's fault, you write the runbook afterwards so the next person at 3am does not have to be clever. That is the whole job.",
  "The AI projects come from the same place. I got tired of watching good engineers spend the first twenty minutes of an incident deciding who owns it. So I built something that decides faster, and gets out of the way.",
  "That is why I do this. Thanks for reading it.",
];
