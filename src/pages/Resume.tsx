/* ============================================================================
 * RESUME — the plain, fast, semantic fallback. This is the SEO and
 * screen-reader source of truth.
 *
 * It renders from the SAME /src/data files as the game, so it can never drift
 * out of sync: add a project to projects.ts and it appears here too.
 *
 * This component is also rendered to static HTML at build time by
 * scripts/prerender-resume.mjs, which is why it must stay free of browser-only
 * APIs (no window, no canvas, no effects that touch the DOM).
 * ========================================================================= */

import { visible } from '../types/content';
import { ACTIVITIES, CERTIFICATIONS, EDUCATION, PROFILE } from '../data/profile';
import { orderedJobs, orderedProjects, orderedSkills, skillCategories } from '../engine/world';
import { tierFor } from '../data/palette';

export function personJsonLd() {
  const links = visible(PROFILE.links).filter((l) => !l.url.startsWith('mailto:'));
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PROFILE.name,
    jobTitle: PROFILE.title,
    email: `mailto:${PROFILE.email}`,
    url: PROFILE.seo.canonicalUrl,
    image: `${PROFILE.seo.canonicalUrl.replace(/\/$/, '')}/avatar.png`,
    address: { '@type': 'PostalAddress', addressLocality: PROFILE.location },
    description: PROFILE.summary,
    sameAs: links.map((l) => l.url),
    knowsAbout: visible(orderedSkills()).map((s) => s.name),
    alumniOf: visible(EDUCATION).map((e) => ({
      '@type': 'EducationalOrganization',
      name: e.institution,
    })),
    worksFor: orderedJobs().slice(0, 1).map((j) => ({ '@type': 'Organization', name: j.company })),
    hasOccupation: orderedJobs().map((j) => ({
      '@type': 'Occupation',
      name: j.title,
      occupationLocation: j.location ? { '@type': 'Place', name: j.location } : undefined,
    })),
  };
}

export default function Resume({ standalone = false }: { standalone?: boolean }) {
  const jobs = orderedJobs();
  const projects = orderedProjects();
  const skills = orderedSkills();
  const cats = skillCategories();
  const links = visible(PROFILE.links);
  // The prerendered copy lives at /resume/, one level deeper than the SPA.
  const asset = (p?: string) => (p ? (standalone ? p.replace(/^\.\//, '../') : p) : p);

  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
      />

      {!standalone && (
        <a
          href="#/"
          className="fixed right-3 top-3 z-50 border-2 border-ink bg-ink px-3 py-2 font-head text-[9px] text-amber0 hover:bg-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-amber3"
        >
          ◀ BACK TO THE GAME
        </a>
      )}

      <main className="mx-auto max-w-3xl px-4 py-10 print:py-0">
        <header className="border-b-4 border-ink pb-6">
          <div className="flex flex-wrap items-center gap-5">
            <img
              src={asset("./avatar.png")}
              alt={PROFILE.name}
              width={110}
              height={110}
              className="h-[110px] w-[110px] rounded-full border-4 border-ink object-cover"
            />
            <div className="min-w-0">
              <h1 className="font-head text-[20px] leading-relaxed text-ink">{PROFILE.name}</h1>
              <p className="mt-3 text-xl font-semibold text-stone">{PROFILE.title}</p>
              <p className="text-lg text-ash">
                {PROFILE.location}
                {PROFILE.availability ? ` · ${PROFILE.availability}` : ''}
                {` · ${PROFILE.yearsExperience}+ years experience`}
              </p>
            </div>
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-lg">
            {links.map((l) => (
              <li key={l.id}>
                <span className="font-semibold text-stone">{l.label}: </span>
                <a
                  href={l.url}
                  className="text-teal underline underline-offset-4 hover:text-amber3"
                  rel="noreferrer noopener"
                >
                  {l.display ?? l.url}
                </a>
              </li>
            ))}
            {PROFILE.resumeUrl && (
              <li>
                <a
                  href={asset(PROFILE.resumeUrl)}
                  className="font-semibold text-teal underline underline-offset-4 hover:text-amber3"
                >
                  Download PDF resume
                </a>
              </li>
            )}
          </ul>
        </header>

        <Section title="Professional summary">
          <p className="text-lg leading-relaxed text-slate">{PROFILE.summary}</p>
        </Section>

        <Section title="Experience">
          <div className="space-y-7">
            {jobs.map((j) => (
              <article key={j.id}>
                <h3 className="text-xl font-bold text-ink">{j.title}</h3>
                <p className="text-lg text-stone">
                  <span className="font-semibold">{j.company}</span>
                  {j.location ? ` · ${j.location}` : ''}
                  {j.mode ? ` · ${j.mode}` : ''}
                  {' · '}
                  <time>{j.start}</time> – <time>{j.end}</time>
                </p>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-lg leading-relaxed text-slate">
                  {j.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        <Section title={`Projects (${projects.length})`}>
          <div className="space-y-6">
            {projects.map((p) => (
              <article key={p.id}>
                <h3 className="text-xl font-bold text-ink">
                  {p.name}
                  {p.year ? <span className="ml-2 text-base font-normal text-ash">{p.year}</span> : null}
                </h3>
                <p className="text-lg font-semibold text-stone">{p.pitch}</p>
                <p className="mt-1 text-lg leading-relaxed text-slate">{p.problem}</p>
                <p className="mt-1 text-lg leading-relaxed text-slate">
                  <span className="font-semibold">My role: </span>
                  {p.role}
                </p>
                <p className="mt-1 text-lg leading-relaxed text-slate">
                  <span className="font-semibold">Technical detail: </span>
                  {p.highlight}
                </p>
                <p className="mt-1 text-base text-ash">{p.stack.join(' · ')}</p>
                {(p.liveUrl || p.repoUrl) && (
                  <p className="mt-1 flex gap-4 text-lg">
                    {p.liveUrl && (
                      <a className="text-teal underline underline-offset-4" href={p.liveUrl} rel="noreferrer noopener">
                        Live demo
                      </a>
                    )}
                    {p.repoUrl && (
                      <a className="text-teal underline underline-offset-4" href={p.repoUrl} rel="noreferrer noopener">
                        Source
                      </a>
                    )}
                  </p>
                )}
              </article>
            ))}
          </div>
        </Section>

        <Section title="Technical skills">
          <div className="space-y-4">
            {cats.map((c) => (
              <div key={c}>
                <h3 className="text-lg font-bold text-ink">{c}</h3>
                <p className="text-lg leading-relaxed text-slate">
                  {skills
                    .filter((s) => s.category === c)
                    .sort((a, b) => b.level - a.level)
                    .map((s) => `${s.name} (${tierFor(s.level).label})`)
                    .join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Education">
          <ul className="space-y-2 text-lg text-slate">
            {visible(EDUCATION).map((e) => (
              <li key={e.id}>
                <span className="font-bold text-ink">{e.credential}</span> — {e.institution}
                {e.detail ? ` · ${e.detail}` : ''}
                {e.location ? ` · ${e.location}` : ''}
                {e.year ? ` · ${e.year}` : ''}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Certifications">
          <div className="space-y-3">
            {visible(CERTIFICATIONS).map((g) => (
              <div key={g.id}>
                <h3 className="text-lg font-bold text-ink">{g.provider}</h3>
                <p className="text-lg leading-relaxed text-slate">{g.items.join(' · ')}</p>
              </div>
            ))}
          </div>
        </Section>

        {visible(ACTIVITIES).length > 0 && (
          <Section title="Activities">
            {visible(ACTIVITIES).map((g) => (
              <ul key={g.id} className="list-disc space-y-1 pl-5 text-lg text-slate">
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            ))}
          </Section>
        )}

        <footer className="mt-10 border-t-4 border-ink pt-5 text-lg text-slate">
          <p className="font-semibold text-ink">Contact</p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            {links.map((l) => (
              <li key={l.id}>
                <a className="text-teal underline underline-offset-4" href={l.url} rel="noreferrer noopener">
                  {l.display ?? l.label}
                </a>
              </li>
            ))}
          </ul>
          {!standalone && (
            <p className="mt-4">
              <a className="font-head text-[9px] text-teal underline underline-offset-4" href="#/">
                ◀ There is also a playable version of this resume.
              </a>
            </p>
          )}
          {standalone && (
            <p className="mt-4">
              <a className="font-head text-[9px] text-teal underline underline-offset-4" href="../">
                ◀ There is also a playable version of this resume.
              </a>
            </p>
          )}
        </footer>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 border-b-2 border-stone pb-1 font-head text-[11px] uppercase tracking-wide text-amber4">
        {title}
      </h2>
      {children}
    </section>
  );
}
