/* ============================================================================
 * EXPERIENCE — one doorway + one former-colleague NPC each, in The Archives.
 *
 * The Archives corridor grows horizontally: width = jobs × 6 tiles + padding.
 * Add a job and a new doorway appears, the corridor lengthens, the camera
 * scrolls further, the quest count goes up, and /resume gains a section.
 *
 * ------------------------------ COMPLETE EXAMPLE ---------------------------
 * {
 *   id: 'acme-sre',                        // unique, stable
 *   title: 'Site Reliability Engineer',
 *   company: 'Acme Corp',
 *   start: 'Jan 2027',
 *   end: 'Present',
 *   sortKey: 2027.01,                      // OPTIONAL, higher = newer
 *   location: 'Remote',                    // OPTIONAL
 *   mode: 'Full-time',                     // OPTIONAL
 *   achievements: [
 *     'Cut mean time to detect by 40% by replacing threshold alerts with ...',
 *     'Owned the on-call rotation for 12 services across 3 teams.',
 *   ],
 *   testimonial: [                         // one array entry = one dialogue page
 *     "Oh, Abeer? Yeah. Good hire.",
 *     "Cut our MTTD by forty percent. I know that because I had to stop ...",
 *   ],
 *   colleague: {                           // OPTIONAL — a default NPC is used
 *     name: 'Dana', role: 'Former SRE lead',
 *     colors: { shirt: '#4fb3a5', hair: '#221d2e' },
 *   },
 *   hidden: false,
 * }
 *
 * NOTE ON NUMBERS: recruiters read numbers first. Where your resume has a
 * metric, put it in the FIRST achievement bullet. Where it does not yet, the
 * bullets below are your real ones verbatim — add figures as you get them.
 * ------------------------------------------------------------------------ */

import type { Job } from '../types/content';
import { PALETTE } from './palette';

export const JOBS: Job[] = [
  {
    id: 'bofa-prod-support',
    title: 'Production Technical Support V — L2/L3 Support',
    company: 'Bank of America',
    start: 'Jul 2024',
    end: 'Jul 2026',
    sortKey: 2024.07,
    location: 'Charlotte, NC',
    mode: 'On-site · Contractor',
    achievements: [
      'Formally aligned under L2 production support scope but regularly extended into L3-level work, performing deeper root-cause diagnostics by querying production databases directly on AWS (RDS/Aurora) to get the data.',
      'Served as triage manager for production support on the AxiaMed healthcare payment platform, leading high-profile bridge calls for major merchant-impacting incidents and resolving critical issues within SLA compliance targets to protect payment reliability.',
      "Acted as the team's go-to expert for Splunk log analysis and New Relic monitoring, also leveraging AWS CloudWatch, Dynatrace and Catchpoint to proactively identify and remediate issues across APIs, databases and third-party integrations before end-user impact.",
      'Built and maintained AWS CloudWatch dashboards, alarms and supporting documentation mapping alarm thresholds to remediation steps, giving L2 responders a clear escalation path for complex incidents.',
      'Managed end-to-end incident lifecycle using BMC Remedy, performing root cause analysis and driving process improvements to prevent recurring issues, while maintaining stakeholder communication and cross-functional collaboration with engineering teams.',
      'Trained and mentored new hires on incident response processes, monitoring tools and troubleshooting procedures, operating beyond the scope of the role to strengthen team readiness and reduce onboarding ramp-up time.',
      'Authored knowledge base documentation, runbooks and troubleshooting guides, including AWS CloudWatch monitoring guides and SQL query references for production database investigations, that accelerated team resolution times; recognised by senior leadership for technical depth, ownership and performance under pressure.',
    ],
    testimonial: [
      "You're here about Abeer. Right. Come in, mind the cables.",
      "Payments platform. Healthcare. Regulated. Which means when it breaks, it breaks on somebody standing at a clinic counter with a card in their hand, and then it breaks on us.",
      "She was scoped as L2. She did not stay scoped as L2. She'd go straight into the production database on RDS and pull the actual rows, because the dashboard was telling us WHAT and she wanted WHY.",
      "Triage manager on the merchant-impacting ones. That's the person who runs the bridge call. Eleven people, three of them executives, everyone talking. She'd name an owner and the call would get quiet. That's a skill. I can't teach it.",
      "And then she wrote it all down. CloudWatch alarms mapped to remediation steps. SQL references. Runbooks. Do you know how rare that is? Most people who can fix it won't write down how, because that's their job security.",
      "Leadership called it out formally. I'd have hired her permanent. Contract ended in July. Take the hint.",
    ],
    colleague: {
      name: 'Marguerite',
      role: 'Former Support Lead',
      colors: { shirt: PALETTE.teal, hair: PALETTE.linen, pants: PALETTE.slate },
    },
  },
  {
    id: 'ics-swe-trainee',
    title: 'Software Engineer Trainee',
    company: 'Innovative Consulting Solutions, LLC',
    start: 'Feb 2024',
    end: 'Jul 2024',
    sortKey: 2024.02,
    location: 'Chicago, IL',
    mode: 'Remote',
    achievements: [
      'Assisted senior engineers in developing, testing and debugging software features for client applications using Python, Pytest and Git, participating in Agile sprint ceremonies and peer code reviews to support on-time delivery.',
      'Identified, documented and resolved software defects across client-facing applications, improving code quality and reducing recurring issues through systematic testing and root cause documentation.',
      'Collaborated with cross-functional teams of developers, QA and project managers to gather requirements and support client deliverables, gaining hands-on exposure to the full software development lifecycle.',
    ],
    testimonial: [
      "Trainee title, yes. Don't read too much into titles.",
      "What I remember is that she documented root causes. Trainees fix the bug and close the ticket. She'd write down why it happened. Six months in, that's not normal.",
      "Python, Pytest, Git, code review, sprint ceremonies. The full loop, not a sandbox.",
      "She left for the Bank of America contract. Correct decision. Slightly annoying for us.",
    ],
    colleague: {
      name: 'Devesh',
      role: 'Former Senior Engineer',
      colors: { shirt: PALETTE.amber2, hair: PALETTE.ink, pants: PALETTE.stone },
    },
  },
  {
    id: 'uab-grad-assistant',
    title: 'Graduate Assistant — Instruction, Computer Security',
    company: 'University of Alabama at Birmingham',
    start: 'Aug 2023',
    end: 'Dec 2023',
    sortKey: 2023.08,
    location: 'Birmingham, AL',
    mode: 'Part-time · On-site',
    achievements: [
      'Supported instruction for an undergraduate and graduate-level Computer Security course, assisting with lecture preparation, lab sessions and grading to reinforce student understanding of core security concepts.',
      'Held office hours and one-on-one sessions to help students troubleshoot coursework and lab exercises, strengthening technical mentoring and communication skills.',
    ],
    testimonial: [
      "Graduate assistant. Computer Security. Undergrad and grad sections.",
      "Office hours are where you find out whether someone can actually explain things. A student comes in stuck, frustrated, sometimes convinced they're not smart enough for the material. You have about four minutes.",
      "She was good at those four minutes. That's the same skill she's using now on incident calls, incidentally. Stressed person, technical problem, no time. Identical job.",
      "Strong master's GPA too. 3.66. Not that anyone reads that part.",
    ],
    colleague: {
      name: 'Dr. Okonkwo',
      role: 'Former Course Instructor',
      colors: { shirt: PALETTE.violet, hair: PALETTE.fog, pants: PALETTE.ink },
    },
  },
  {
    id: 'netrex-web-dev',
    title: 'Web Developer',
    company: 'Netrex Inc.',
    start: 'Oct 2019',
    end: 'Sep 2021',
    sortKey: 2019.1,
    location: 'Remote',
    achievements: [
      'Designed, coded and modified responsive websites from layout to full functionality using HTML, CSS, JavaScript, WordPress and Wix, translating client specifications into user-friendly, production-ready web solutions.',
      'Collaborated with cross-functional teams of designers, content creators and project managers to deliver high-quality web solutions on schedule, strengthening stakeholder communication and requirements-gathering skills.',
      'Conducted cross-browser and cross-device testing and debugging to ensure consistent functionality and performance, while staying current with emerging web development trends.',
    ],
    testimonial: [
      "Two years. Client web work. HTML, CSS, JavaScript, WordPress, Wix.",
      "I know what you're thinking. It's the early-career job. Everyone has one and most people quietly delete it.",
      "She didn't delete it, which tells you something. Also: this is where she learned that the client is on a phone, on hotel wifi, and does not care about your framework. That lesson shows up everywhere in what she builds now.",
      "Cross-browser testing. Cross-device. Before it was fashionable to admit you did that.",
    ],
    colleague: {
      name: 'Priya',
      role: 'Former Project Manager',
      colors: { shirt: PALETTE.lime, hair: PALETTE.void, pants: PALETTE.shadow },
    },
  },
];
