/* Quest log, inventory, skill sheet, achievements, help overlay, credits,
 * victory screen and the item-card popup. All driven by the content arrays. */

import { useGame } from '../systems/store';
import { MAX_LEVEL, XP_PER_LEVEL } from '../systems/store';
import { buildObjectives, completionPercent, verdictFor } from '../systems/quests';
import { Bar, Panel, PixelButton, Portrait } from './common';
import ProjectCard from './ProjectCard';
import { orderedProjects, orderedSkills, skillCategories } from '../engine/world';
import { PALETTE, tierFor } from '../data/palette';
import { ACHIEVEMENTS } from '../data/achievements';
import { PROFILE, EDUCATION } from '../data/profile';
import { VICTORY_LINES } from '../data/jokes';
import { visible } from '../types/content';

/* ------------------------------------------------------------- quest log */

export function QuestLog() {
  const progress = useGame((s) => s.progress);
  const bossDefeated = useGame((s) => s.bossDefeated);
  const close = useGame((s) => s.setPanel);
  const objs = buildObjectives(progress, bossDefeated);
  const pct = completionPercent(objs);

  return (
    <Panel
      title="QUEST LOG — REQ-2026-0914"
      subtitle={`Candidate evaluation · ${pct}% complete`}
      onClose={() => close(null)}
    >
      <div className="mb-4">
        <Bar value={pct} max={100} color={PALETTE.lime} />
      </div>
      <ul className="space-y-3">
        {objs.map((o) => (
          <li key={o.id} className="border-2 border-ash bg-shadow p-3">
            <div className="flex items-start justify-between gap-3">
              <span className={`font-head text-[10px] ${o.complete ? 'text-lime line-through' : 'text-paper'}`}>
                {o.complete ? '✓ ' : '□ '}
                {o.label}
              </span>
              <span className="shrink-0 font-body text-[17px] text-amber1">
                {Math.min(o.done, o.total)}/{o.total}
              </span>
            </div>
            {!o.complete && o.hint && <p className="mt-2 text-mist">{o.hint}</p>}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-fog">
        Objectives are generated from the content files. Add a project and this list grows by itself.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------- inventory */

export function Inventory() {
  const progress = useGame((s) => s.progress);
  const close = useGame((s) => s.setPanel);
  const all = orderedProjects();
  const owned = all.filter((p) => progress.has(`project:${p.id}`));

  return (
    <Panel
      title="INVENTORY — ARTIFACTS"
      subtitle={`${owned.length} of ${all.length} collected`}
      onClose={() => close(null)}
      wide
    >
      {owned.length === 0 ? (
        <p className="text-mist">
          Empty. Artifacts are collected by inspecting the arcade cabinets in the Hall of Projects.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {owned.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      )}
      {owned.length < all.length && (
        <p className="mt-4 text-fog">
          {all.length - owned.length} still in the Hall of Projects.
        </p>
      )}
    </Panel>
  );
}

/* ----------------------------------------------------------- skill sheet */

export function SkillSheet() {
  const close = useGame((s) => s.setPanel);
  const cats = skillCategories();
  const skills = orderedSkills();

  return (
    <Panel
      title="STAT SHEET"
      subtitle="Self-reported, 1–99. Hover or focus a row for the real proficiency context."
      onClose={() => close(null)}
      wide
    >
      <div className="space-y-5">
        {cats.map((cat) => (
          <section key={cat}>
            <h3 className="mb-2 font-head text-[10px] text-amber1">{cat.toUpperCase()}</h3>
            <ul className="space-y-2">
              {skills
                .filter((s) => s.category === cat)
                .sort((a, b) => b.level - a.level)
                .map((s) => {
                  const lvl = Math.max(1, Math.min(99, s.level));
                  const tier = tierFor(lvl);
                  return (
                    <li key={s.id} className="border-2 border-ash bg-shadow p-3" tabIndex={0}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-head text-[10px] text-paper">{s.name}</span>
                        <span className="shrink-0 font-head text-[9px]" style={{ color: tier.color }}>
                          Lv.{lvl} · {tier.label}
                        </span>
                      </div>
                      <div className="my-2">
                        <Bar value={lvl} max={99} color={tier.color} />
                      </div>
                      <p className="text-linen">{s.descriptor}</p>
                      {s.context && <p className="mt-1 text-fog">{s.context}</p>}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------- achievements */

export function AchievementsPanel() {
  const got = useGame((s) => s.achievements);
  const close = useGame((s) => s.setPanel);
  return (
    <Panel
      title="ACHIEVEMENTS"
      subtitle={`${got.size} of ${ACHIEVEMENTS.length} unlocked`}
      onClose={() => close(null)}
    >
      <ul className="space-y-2">
        {ACHIEVEMENTS.map((a) => {
          const have = got.has(a.id);
          const hide = a.secret && !have;
          return (
            <li key={a.id} className={`border-2 p-3 ${have ? 'border-gold bg-amber4/30' : 'border-ash bg-shadow'}`}>
              <div className="font-head text-[10px] text-paper">
                {have ? '★ ' : '☆ '}
                {hide ? '???' : a.name}
              </div>
              <p className="mt-1 text-mist">{hide ? 'Secret achievement.' : a.description}</p>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* ------------------------------------------------------------ item cards */

export function CardPanel() {
  const card = useGame((s) => s.card);
  const close = useGame((s) => s.openCard);
  if (!card) return null;

  if (card.kind === 'project') {
    const p = orderedProjects().find((x) => x.id === card.id);
    if (!p) return null;
    return (
      <Panel title="ARTIFACT ACQUIRED" subtitle="Added to your inventory." onClose={() => close(null)}>
        <ProjectCard p={p} />
      </Panel>
    );
  }

  const s = orderedSkills().find((x) => x.id === card.id);
  if (!s) return null;
  const lvl = Math.max(1, Math.min(99, s.level));
  const tier = tierFor(lvl);
  return (
    <Panel title={s.name.toUpperCase()} subtitle={`${s.category} · Lv.${lvl} · ${tier.label}`} onClose={() => close(null)}>
      <div className="mb-3">
        <Bar value={lvl} max={99} color={tier.color} />
      </div>
      <p className="text-paper">{s.descriptor}</p>
      {s.context && <p className="mt-2 text-mist">{s.context}</p>}
      <div className="mt-4">
        <PixelButton onClick={() => useGame.getState().setPanel('skills')}>OPEN FULL STAT SHEET</PixelButton>
      </div>
    </Panel>
  );
}

/* ----------------------------------------------------------------- help */

export function HelpOverlay() {
  const close = useGame((s) => s.setPanel);
  const rows: [string, string][] = [
    ['WASD / Arrows', 'Walk (8 directions)'],
    ['E / Space', 'Interact · advance dialogue · hold to fast-forward'],
    ['1 / 2 / 3', 'Pick a dialogue response'],
    ['Q', 'Quest log'],
    ['I', 'Inventory'],
    ['K', 'Stat sheet'],
    ['V', 'Achievements'],
    ['M', 'Mute / unmute'],
    ['C', 'CRT scanlines on / off'],
    ['?', 'This help panel'],
    ['ESC', 'Close any panel'],
  ];
  return (
    <Panel title="CONTROLS" subtitle="Everything is keyboard operable." onClose={() => close(null)}>
      <table className="w-full">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-slate last:border-0">
              <th scope="row" className="w-40 py-2 text-left font-head text-[9px] text-amber1">
                {k}
              </th>
              <td className="py-2 text-linen">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-fog">
        On a touch device a D-pad and an A button appear at the bottom of the screen.
      </p>
    </Panel>
  );
}

/* -------------------------------------------------------------- credits */

export function Credits() {
  const close = useGame((s) => s.setPanel);
  const links = visible(PROFILE.links);
  return (
    <Panel title="CREDITS" subtitle={PROFILE.tagline} onClose={() => close(null)} wide>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Portrait which="avatar" size={140} />
        <div className="min-w-0 flex-1">
          <h3 className="font-head text-[12px] text-amber0">{PROFILE.name}</h3>
          <p className="mt-2 text-linen">
            {PROFILE.title} · {PROFILE.location}
            {PROFILE.availability ? ` · ${PROFILE.availability}` : ''}
          </p>
          <ul className="mt-3 space-y-1">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  className="text-cyan underline underline-offset-4 hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  href={l.url}
                  target={l.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer noopener"
                >
                  {l.label}: {l.display ?? l.url}
                </a>
              </li>
            ))}
          </ul>
          {visible(EDUCATION).length > 0 && (
            <ul className="mt-3 space-y-1 text-mist">
              {visible(EDUCATION).map((e) => (
                <li key={e.id}>
                  {e.credential} — {e.institution}
                  {e.detail ? ` · ${e.detail}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <hr className="my-4 border-slate" />
      <h4 className="font-head text-[9px] text-amber2">BUILT WITH</h4>
      <p className="mt-2 text-linen">
        React 18, TypeScript, Vite, Zustand, Tailwind. Canvas renderer, tile engine, collision, dialogue system,
        procedural room layout and save migrations written from scratch. No game engine. No image files — every
        sprite in this project is a character grid in a data file. All audio synthesised at runtime with the
        Web Audio API.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="#/resume"
          className="border-2 border-amber2 bg-amber4 px-3 py-2 font-head text-[9px] text-amber0 hover:bg-amber3"
        >
          PLAIN RESUME
        </a>
        <PixelButton onClick={() => close(null)}>BACK TO THE GAME</PixelButton>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------- victory */

export function Victory() {
  const close = useGame((s) => s.setPanel);
  const progress = useGame((s) => s.progress);
  const level = useGame((s) => s.level);
  const xp = useGame((s) => s.xp);
  const pct = completionPercent(buildObjectives(progress, true));
  const v = verdictFor(pct, level);

  return (
    <Panel title="VICTORY — VERDICT ISSUED" subtitle="THE HIRING PROCESS has been defeated." onClose={() => close(null)} wide>
      <div className="border-2 border-gold bg-amber4/20 p-4">
        <div className="font-head text-[14px] text-gold">{v.grade}</div>
        <p className="mt-2 text-paper">{v.line}</p>
      </div>

      <ul className="mt-4 space-y-1 text-linen">
        {VICTORY_LINES.map((l) => (
          <li key={l}>▸ {l}</li>
        ))}
      </ul>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="border-2 border-ash bg-shadow p-2">
          <dt className="font-head text-[8px] text-amber2">LEVEL</dt>
          <dd className="font-head text-[12px] text-paper">
            {level}/{MAX_LEVEL}
          </dd>
        </div>
        <div className="border-2 border-ash bg-shadow p-2">
          <dt className="font-head text-[8px] text-amber2">XP</dt>
          <dd className="font-head text-[12px] text-paper">{xp}</dd>
        </div>
        <div className="border-2 border-ash bg-shadow p-2">
          <dt className="font-head text-[8px] text-amber2">EXPLORED</dt>
          <dd className="font-head text-[12px] text-paper">{pct}%</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <PixelButton tone="accent" onClick={() => close('credits')}>
          ROLL THE CREDITS
        </PixelButton>
        <PixelButton onClick={() => close(null)}>KEEP EXPLORING</PixelButton>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------- XP helper text */

export function xpWithinLevel(xp: number, level: number) {
  const floor = (level - 1) * XP_PER_LEVEL;
  return { value: Math.max(0, xp - floor), max: XP_PER_LEVEL };
}
