/* ============================================================================
 * SKILLS — one crystal node each in the Skill Tree Chamber, grouped into rows
 * by `category`.
 *
 * The level (1–99) drives EVERYTHING automatically: bar width, tier colour,
 * tier label (Novice → Expert), sort order within the category, and the crystal
 * size in the room. You never set a colour or a position by hand.
 *
 * Categories create themselves. Add a skill with a category nobody has used
 * yet and the room grows a new row block for it.
 *
 * ------------------------------ COMPLETE EXAMPLE ---------------------------
 * {
 *   id: 'terraform',                 // unique, stable, kebab-case
 *   name: 'Terraform',
 *   category: 'Cloud & Infrastructure',
 *   level: 58,                       // 1–99
 *   descriptor:
 *     'Can stand up the stack. Has also destroyed the stack. Learned both ' +
 *     'lessons in the same afternoon.',
 *   context: 'Used for two internal environments; not my primary tool.',  // OPTIONAL
 *   hidden: false,                   // OPTIONAL
 * }
 *
 * HOUSE RULE FOR DESCRIPTORS: the joke must contain a real claim. A recruiter
 * skimming only the descriptors should still learn what you can actually do.
 * ------------------------------------------------------------------------ */

import type { Skill } from '../types/content';

export const SKILLS: Skill[] = [
  /* ------------------------------------------- ITSM & Incident Management */
  {
    id: 'incident-management',
    name: 'Incident Management',
    category: 'ITSM & Incident Management',
    level: 89,
    descriptor:
      'Has run the bridge call where eleven people are on the line and none of them own the problem. Names an owner in under two minutes.',
    context:
      'Managed end-to-end incident lifecycle on a regulated healthcare payment platform for two years, including major merchant-impacting incidents.',
  },
  {
    id: 'incident-response',
    name: 'Incident Response',
    category: 'ITSM & Incident Management',
    level: 87,
    descriptor:
      'Treats "stay calm" as a technical skill rather than a personality trait, because on a Sev-1 it is one.',
    context: 'Triage manager for the AxiaMed payment platform; high-profile merchant-impacting escalations.',
  },
  {
    id: 'bmc-remedy',
    name: 'BMC Remedy',
    category: 'ITSM & Incident Management',
    level: 85,
    descriptor:
      'Fluent in a ticketing system that most people describe using words this portfolio cannot print. Daily driver for two years.',
    context: 'Primary ITSM tool for incident lifecycle management at Bank of America.',
  },
  {
    id: 'root-cause-analysis',
    name: 'Root Cause Analysis',
    category: 'ITSM & Incident Management',
    level: 84,
    descriptor:
      'Writes the RCA that says what actually happened, including the part where it was our fault. Then writes the process change that stops it recurring.',
    context: 'Drove process improvements off RCA findings with engineering teams.',
  },
  {
    id: 'sla-compliance',
    name: 'SLA Management',
    category: 'ITSM & Incident Management',
    level: 82,
    descriptor:
      'Knows that the SLA clock is a promise to a customer and not a number on a dashboard. Resolves critical payment issues inside it.',
    context: 'Payment-reliability SLAs on a regulated healthcare platform.',
  },
  {
    id: 'on-call',
    name: 'On-Call Support',
    category: 'ITSM & Incident Management',
    level: 86,
    descriptor:
      'Has been paged at every hour the clock offers and has opinions about which one is worst. (It is 4am. You are awake but not yet a person.)',
    context: 'Rotational on-call for a high-availability production payment platform.',
  },
  {
    id: 'jira',
    name: 'JIRA',
    category: 'ITSM & Incident Management',
    level: 80,
    descriptor:
      'Can build the board, run the ceremony, and still get the work done. Certified in it, which is either impressive or a cry for help.',
    context: 'Udemy JIRA Fundamentals certified; used across Agile/Scrum delivery.',
  },
  {
    id: 'itil',
    name: 'ITIL',
    category: 'ITSM & Incident Management',
    level: 72,
    descriptor:
      'Understands the framework well enough to use the useful two-thirds of it and quietly not mention the rest.',
    context: 'Applied to incident, problem and change management workflows.',
  },
  {
    id: 'escalation',
    name: 'Escalation Management',
    category: 'ITSM & Incident Management',
    level: 83,
    descriptor:
      'Escalates early, which is the unpopular correct answer. Gave L2 responders a documented path so they stop guessing.',
    context: 'Authored escalation documentation mapping alarm thresholds to remediation steps.',
  },

  /* ---------------------------------------------- Monitoring & Observability */
  {
    id: 'splunk',
    name: 'Splunk',
    category: 'Monitoring & Observability',
    level: 85,
    descriptor:
      'Can find the one error line in four hundred million, then explain it to a VP who joined the bridge call already angry.',
    context: "Team's go-to for Splunk log analysis; Udemy Splunk certified.",
  },
  {
    id: 'new-relic',
    name: 'New Relic',
    category: 'Monitoring & Observability',
    level: 83,
    descriptor:
      'Reads an APM trace the way other people read a sentence. Usually spots the slow downstream call before the alert fires.',
    context: 'Primary APM tool for proactive issue identification across APIs and integrations.',
  },
  {
    id: 'aws-cloudwatch',
    name: 'AWS CloudWatch',
    category: 'Monitoring & Observability',
    level: 81,
    descriptor:
      'Built the dashboards and alarms, then — the part everyone skips — wrote the doc that says what to DO when each alarm fires.',
    context: 'Built and maintained CloudWatch dashboards, alarms and the monitoring guides behind them.',
  },
  {
    id: 'dynatrace',
    name: 'Dynatrace',
    category: 'Monitoring & Observability',
    level: 70,
    descriptor:
      'Competent and honest about it. Used it in anger on real incidents; would not claim to be the person who configures it from scratch.',
    context: 'Used alongside New Relic and Splunk for cross-tool incident diagnosis.',
  },
  {
    id: 'catchpoint',
    name: 'Catchpoint',
    category: 'Monitoring & Observability',
    level: 68,
    descriptor:
      'Synthetic monitoring: the practice of paying a robot to have the bad experience before a customer does.',
    context: 'Synthetic and end-user monitoring for merchant-facing endpoints.',
  },
  {
    id: 'log-analysis',
    name: 'Log Analysis',
    category: 'Monitoring & Observability',
    level: 84,
    descriptor:
      'The actual core skill. Everything else in this category is a user interface for it.',
    context: 'Cross-tool log correlation across APIs, databases and third-party integrations.',
  },

  /* ------------------------------------------------------------ AI / ML */
  {
    id: 'python',
    name: 'Python',
    category: 'AI / ML Engineering',
    level: 80,
    descriptor:
      'Writes Python that another human can maintain, which is a lower bar than it should be and still not universally cleared.',
    context: 'Production support tooling, test automation with Pytest, and all AI project work.',
  },
  {
    id: 'langchain',
    name: 'LangChain',
    category: 'AI / ML Engineering',
    level: 75,
    descriptor:
      'Built an agent that routes real production alerts. Has therefore met the gap between a demo notebook and something on-call would trust.',
    context: 'DataCamp certified in LangChain apps, RAG and agentic system design; shipped the incident triage agent.',
  },
  {
    id: 'rag',
    name: 'RAG Pipelines',
    category: 'AI / ML Engineering',
    level: 74,
    descriptor:
      'Knows that retrieval quality is the whole product and the LLM is the easy part everyone posts about.',
    context: 'Built a RAG chatbot over internal runbooks with embeddings-based semantic search.',
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    category: 'AI / ML Engineering',
    level: 77,
    descriptor:
      'Two certifications and a production use case, which between them cover roughly the same ground for very different audiences.',
    context: 'DataCamp: Working with the OpenAI API; Prompt Engineering with the OpenAI API.',
  },
  {
    id: 'prompt-engineering',
    name: 'Prompt Engineering',
    category: 'AI / ML Engineering',
    level: 76,
    descriptor:
      'Believes this is a real skill for about eighteen more months and is using them productively.',
    context: 'Classification and remediation-suggestion prompts for the incident triage agent.',
  },
  {
    id: 'llm-agents',
    name: 'LLM Agents',
    category: 'AI / ML Engineering',
    level: 72,
    descriptor:
      'Designs agents with a narrow job and a clear handoff, because an agent with a broad job is just an outage with better marketing.',
    context: 'Agentic system design via LangChain; deployed for automated incident triage.',
  },
  {
    id: 'vector-db',
    name: 'Vector Databases',
    category: 'AI / ML Engineering',
    level: 68,
    descriptor:
      'FAISS and Pinecone. Understands why your chunk size is the reason the answers are bad.',
    context: 'DataCamp: Vector Databases for Embeddings with Pinecone; FAISS in the RAG chatbot.',
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    category: 'AI / ML Engineering',
    level: 62,
    descriptor:
      'Can stand up a clean typed endpoint quickly. Not claiming to have run one at scale, because that would be a different number.',
    context: 'DataCamp: Introduction to FastAPI.',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    category: 'AI / ML Engineering',
    level: 58,
    descriptor:
      'Comfortable pulling and running models. Honest middle-of-the-road number rather than a flattering one.',
    context: 'DataCamp: Working with Hugging Face.',
  },

  /* ------------------------------------------------ Cloud & Infrastructure */
  {
    id: 'aws',
    name: 'AWS (EC2, S3, Lambda, RDS)',
    category: 'Cloud & Infrastructure',
    level: 70,
    descriptor:
      'Operates in AWS daily from the support side: reads it, queries it, alarms on it, fixes things in it.',
    context: 'Queried production databases directly on AWS RDS/Aurora; CloudWatch alarms and dashboards.',
  },
  {
    id: 'aws-rds',
    name: 'RDS / Aurora',
    category: 'Cloud & Infrastructure',
    level: 73,
    descriptor:
      'Went past "check the dashboard" and into the actual production database to get the answer. That is the L3 part of L2/L3.',
    context: 'Deeper root-cause diagnostics by querying production databases directly.',
  },

  /* ------------------------------------------------------------ Databases */
  {
    id: 'sql',
    name: 'SQL',
    category: 'Databases',
    level: 78,
    descriptor:
      'Writes the query mid-incident, on a call, with someone reading it over their shoulder. It still returns the right rows.',
    context: 'Authored a SQL query reference for production database investigations used by the team.',
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: 'Databases',
    level: 70,
    descriptor: 'Relational fundamentals that have aged better than most things from 2019.',
  },
  {
    id: 'sqlalchemy',
    name: 'SQLAlchemy / ORM',
    category: 'Databases',
    level: 60,
    descriptor:
      'Uses the ORM, and knows the exact moment to stop using the ORM and write the query.',
  },

  /* ------------------------------------------------------ Web Development */
  {
    id: 'javascript',
    name: 'JavaScript / TypeScript',
    category: 'Web Development',
    level: 68,
    descriptor:
      'Good enough to have written the game you are currently standing in, which is a more useful proof than a number.',
    context: 'This portfolio: TypeScript, React 18, Canvas rendering, no game engine.',
  },
  {
    id: 'html',
    name: 'HTML',
    category: 'Web Development',
    level: 76,
    descriptor:
      'Writes semantic markup on purpose. The plain resume page on this site is real headings and landmarks, not a wall of divs.',
    context: 'Two years of production client work at Netrex Inc.',
  },
  {
    id: 'css',
    name: 'CSS',
    category: 'Web Development',
    level: 64,
    descriptor:
      'Can centre a div on the first try roughly 70% of the time. The other 30% is character-building.',
    context: 'Responsive, cross-browser client sites; layout work on this project.',
  },
  {
    id: 'wordpress',
    name: 'WordPress / Wix',
    category: 'Web Development',
    level: 62,
    descriptor:
      'Shipped real client sites on both. Lists it honestly instead of pretending the early career did not happen.',
    context: 'Oct 2019 – Sep 2021 at Netrex Inc., translating client specs into production sites.',
  },
  {
    id: 'responsive',
    name: 'Responsive Design',
    category: 'Web Development',
    level: 70,
    descriptor:
      'Assumes the recruiter is on a phone, because the recruiter is usually on a phone. This site has a D-pad for that reason.',
  },

  /* ------------------------------------------------------------- Practice */
  {
    id: 'git',
    name: 'Git / GitHub',
    category: 'Tools & Practice',
    level: 74,
    descriptor: 'Commits in units that make sense to a reviewer. Can also get out of a rebase alive.',
  },
  {
    id: 'pytest',
    name: 'Pytest',
    category: 'Tools & Practice',
    level: 66,
    descriptor:
      'Tests the thing that broke last time first. That is not a testing philosophy, it is a support engineer testing philosophy.',
    context: 'Debugging and testing client application features at Innovative Consulting Solutions.',
  },
  {
    id: 'agile',
    name: 'Agile / Scrum',
    category: 'Tools & Practice',
    level: 74,
    descriptor:
      'Has been in enough sprint ceremonies to know which ones generate value and is too polite to say which ones do not.',
    context: 'Agile sprint ceremonies and peer code review at Innovative Consulting Solutions.',
  },
  {
    id: 'documentation',
    name: 'Runbooks & Documentation',
    category: 'Tools & Practice',
    level: 88,
    descriptor:
      'The highest score on this sheet, and the least glamorous. Wrote the docs that let someone else solve it without waking me up.',
    context:
      'Authored knowledge-base articles, runbooks and troubleshooting guides that accelerated team resolution times; recognised by senior leadership for technical depth and ownership.',
  },
  {
    id: 'mentoring',
    name: 'Mentoring & Onboarding',
    category: 'Tools & Practice',
    level: 80,
    descriptor:
      'Trained new hires on incident response and cut ramp-up time. Also taught a university security course, which is the same job with worse coffee.',
    context: 'Trained and mentored new hires at Bank of America; Graduate Assistant for Computer Security at UAB.',
  },
  {
    id: 'stakeholder-comms',
    name: 'Stakeholder Communication',
    category: 'Tools & Practice',
    level: 85,
    descriptor:
      'Can tell an executive that the fix will take four more hours in a way that ends the conversation rather than extending it.',
    context: 'Led high-profile bridge calls for major merchant-impacting incidents under composure pressure.',
  },
];

/** Category display order. Categories not listed here are appended in the
 *  order they first appear in SKILLS. Reorder this to reorder the room. */
export const CATEGORY_ORDER: string[] = [
  'ITSM & Incident Management',
  'Monitoring & Observability',
  'AI / ML Engineering',
  'Cloud & Infrastructure',
  'Databases',
  'Web Development',
  'Tools & Practice',
];
