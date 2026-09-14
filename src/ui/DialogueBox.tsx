/* Typewriter dialogue box: portrait, speaker name, blinking continue arrow,
 * and branching choices. Space advances; holding Space fast-forwards. */

import { useEffect, useRef, useState } from 'react';
import { useGame } from '../systems/store';
import { Portrait } from './common';
import { sfx } from '../systems/audio';
import { useIsTouch } from './MobileControls';

const CHARS_PER_SEC = 55;

export default function DialogueBox() {
  const d = useGame((s) => s.dialogue);
  const reduced = useGame((s) => s.reducedMotion);
  const advance = useGame((s) => s.advance);
  const choose = useGame((s) => s.choose);
  const [shown, setShown] = useState(0);
  const touch = useIsTouch();
  const raf = useRef(0);
  const startedAt = useRef(0);

  const line = d ? d.lines[d.page] ?? '' : '';
  const full = shown >= line.length;

  useEffect(() => {
    if (!d) return;
    if (reduced) {
      setShown(line.length);
      return;
    }
    setShown(0);
    startedAt.current = performance.now();
    const tick = (now: number) => {
      const n = Math.floor(((now - startedAt.current) / 1000) * CHARS_PER_SEC);
      setShown(Math.min(line.length, n));
      if (n < line.length) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [d, line, reduced]);

  useEffect(() => {
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useGame.getState().closeDialogue();
        return;
      }
      if (d.showChoices && d.choices) {
        const n = Number(e.key);
        if (n >= 1 && n <= d.choices.length) choose(n - 1);
        return;
      }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (!full) setShown(line.length);
        else advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [d, full, line.length, advance, choose]);

  if (!d) return null;

  return (
    <div className={`pointer-events-auto fixed inset-x-0 bottom-0 z-40 p-2 sm:p-4 ${touch ? 'pb-28' : ''}`}>
      <div className="mx-auto max-w-3xl border-4 border-amber2 bg-ink/95 shadow-[0_0_0_4px_#0d0b14]">
        <div className="flex gap-3 p-3">
          <Portrait which={d.portrait} colors={d.portraitColors} size={72} />
          <div className="min-w-0 flex-1">
            <div className="font-head text-[10px] text-amber0">{d.speaker}</div>
            <p
              className="mt-2 min-h-[4.5rem] whitespace-pre-wrap font-body text-[19px] leading-tight text-paper"
              aria-live="polite"
            >
              {line.slice(0, shown)}
              {!full && <span className="opacity-40">{line.slice(shown)}</span>}
            </p>

            {d.showChoices && d.choices ? (
              <div className="mt-2 flex flex-col gap-2">
                {d.choices.map((c, i) => (
                  <button
                    key={c.text}
                    onClick={() => choose(i)}
                    className={`border-2 px-3 py-2 text-left font-body text-[18px] leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                      c.sarcastic
                        ? 'border-orchid bg-violet/30 text-orchid hover:bg-violet/60'
                        : 'border-ash bg-shadow text-paper hover:bg-slate'
                    }`}
                  >
                    <span className="mr-2 font-head text-[9px] opacity-70">{i + 1}</span>
                    {c.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between">
                <span className="font-body text-sm text-fog">
                  {d.page + 1}/{d.lines.length} · SPACE to continue, hold to skip
                </span>
                <button
                  onClick={() => {
                    if (!full) setShown(line.length);
                    else {
                      sfx('blip');
                      advance();
                    }
                  }}
                  aria-label="Continue"
                  className="font-head text-[12px] text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span className={reduced ? '' : 'animate-pulse'}>▼</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
