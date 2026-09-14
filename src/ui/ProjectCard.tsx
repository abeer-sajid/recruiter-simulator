/* The project "artifact card": stats, elemental type chips, and links.
 *
 * Graceful degradation lives here:
 *   - no screenshot  -> a deterministic pixel-art placeholder drawn from the
 *                       project name and the palette
 *   - no liveUrl     -> the Live Demo button is not rendered at all
 *   - no repoUrl     -> the Source button is not rendered at all
 *   - long title     -> truncated with an accessible tooltip
 *   - no year        -> the row is omitted, not left blank
 */

import { useEffect, useRef } from 'react';
import type { Project } from '../types/content';
import { PALETTE, hashColor } from '../data/palette';
import { techType } from '../data/projects';

function Placeholder({ name, w = 320, h = 128 }: { name: string; w?: number; h?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const cells = 16;
    const cw = Math.ceil(w / cells);
    const ch = Math.ceil(h / (cells / 2));
    let seed = 0;
    for (let i = 0; i < name.length; i++) seed = (seed * 31 + name.charCodeAt(i)) >>> 0;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0xffffffff;
    };

    const base = hashColor(name);
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < cells / 2; y++) {
      for (let x = 0; x < cells / 2; x++) {
        if (rand() > 0.55) continue;
        const col = rand() > 0.6 ? base : rand() > 0.5 ? PALETTE.shadow : PALETTE.slate;
        ctx.fillStyle = col;
        // mirror horizontally so it reads as an "artifact" rather than noise
        ctx.fillRect(x * cw, y * ch, cw, ch);
        ctx.fillRect((cells - 1 - x) * cw, y * ch, cw, ch);
      }
    }
    ctx.fillStyle = PALETTE.void;
    ctx.fillRect(0, 0, w, 3);
    ctx.fillRect(0, h - 3, w, 3);
  }, [name, w, h]);

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      style={{ imageRendering: 'pixelated' }}
      className="w-full border-2 border-ash"
      aria-label={`Generated placeholder artwork for ${name}`}
      role="img"
    />
  );
}

export default function ProjectCard({ p, compact }: { p: Project; compact?: boolean }) {
  return (
    <article className="border-2 border-ash bg-shadow p-3">
      <header className="flex items-baseline justify-between gap-2">
        <h3
          className="truncate font-head text-[11px] text-amber0"
          title={p.name}
        >
          {p.name}
        </h3>
        {p.year && <span className="shrink-0 font-body text-base text-fog">{p.year}</span>}
      </header>

      <p className="mt-2 font-body text-[18px] leading-tight text-paper">{p.pitch}</p>

      {!compact && (
        <div className="mt-3">
          {p.screenshot ? (
            <img
              src={p.screenshot}
              alt={`Screenshot of ${p.name}`}
              className="w-full border-2 border-ash"
              loading="lazy"
            />
          ) : (
            <Placeholder name={p.name} />
          )}
        </div>
      )}

      <dl className="mt-3 space-y-2 font-body text-[17px] leading-snug">
        {!compact && (
          <>
            <div>
              <dt className="font-head text-[8px] text-amber2">PROBLEM</dt>
              <dd className="text-linen">{p.problem}</dd>
            </div>
            <div>
              <dt className="font-head text-[8px] text-amber2">MY ROLE</dt>
              <dd className="text-linen">{p.role}</dd>
            </div>
            <div>
              <dt className="font-head text-[8px] text-amber2">TECHNICAL DETAIL</dt>
              <dd className="text-linen">{p.highlight}</dd>
            </div>
          </>
        )}
        <div>
          <dt className="font-head text-[8px] text-amber2">TYPES</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {p.stack.map((t) => {
              const tt = techType(t);
              return (
                <span
                  key={t}
                  className="border border-void px-2 py-1 font-head text-[7px] text-void"
                  style={{ background: `var(--c-${tt.color})` }}
                >
                  {t} · {tt.type}
                </span>
              );
            })}
          </dd>
        </div>
      </dl>

      {(p.liveUrl || p.repoUrl) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.liveUrl && (
            <a
              href={p.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="border-2 border-amber2 bg-amber4 px-3 py-2 font-head text-[9px] text-amber0 hover:bg-amber3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              LIVE DEMO ↗
            </a>
          )}
          {p.repoUrl && (
            <a
              href={p.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="border-2 border-ash bg-shadow px-3 py-2 font-head text-[9px] text-paper hover:bg-slate focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              SOURCE ↗
            </a>
          )}
        </div>
      )}
    </article>
  );
}
