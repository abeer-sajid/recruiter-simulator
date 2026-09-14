/* Title screen with Continue / New Game, a random loading tip, and the
 * resume escape hatch — which is present here too, exactly as promised. */

import { useMemo } from 'react';
import { useGame } from '../systems/store';
import { PROFILE } from '../data/profile';
import { LOADING_TIPS } from '../data/jokes';
import { PixelButton, Portrait } from './common';
import { SkipToResume } from './Hud';
import { hasSave } from '../systems/save';
import { visible } from '../types/content';

export default function TitleScreen() {
  const newGame = useGame((s) => s.newGame);
  const cont = useGame((s) => s.continueGame);
  const muted = useGame((s) => s.muted);
  const canContinue = useMemo(() => hasSave(), []);
  const tip = useMemo(() => LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)], []);

  return (
    <div className="relative min-h-[100dvh] overflow-y-auto bg-void px-4 py-6">
      <SkipToResume />

      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 pt-10 text-center">
        <Portrait which="avatar" size={132} />

        <div>
          <h1 className="font-head text-[15px] leading-relaxed text-amber0 sm:text-[22px]">
            RECRUITER
            <br />
            SIMULATOR 2026
          </h1>
          <p className="mt-4 font-body text-[20px] leading-tight text-linen">
            A playable portfolio for <strong className="text-gold">{PROFILE.name}</strong>
          </p>
          <p className="font-body text-[18px] leading-tight text-mist">
            {PROFILE.title} · {PROFILE.location}
          </p>
        </div>

        <p className="max-w-lg border-2 border-ash bg-ink px-4 py-3 font-body text-[18px] leading-snug text-linen">
          {PROFILE.tagline}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {canContinue && (
            <PixelButton tone="accent" onClick={cont}>
              ▶ CONTINUE
            </PixelButton>
          )}
          <PixelButton tone={canContinue ? 'default' : 'accent'} onClick={newGame}>
            ▶ NEW GAME
          </PixelButton>
          <PixelButton onClick={() => useGame.getState().toggleMute()}>
            {muted ? '🔇 SOUND OFF' : '🔊 SOUND ON'}
          </PixelButton>
        </div>

        {muted && (
          <p className="font-body text-[17px] text-fog">
            Audio starts muted and is synthesised in the browser. Turn it on if you want the chiptune.
          </p>
        )}

        <p className="max-w-lg font-body text-[18px] leading-snug text-amber1">{tip}</p>

        <footer className="mt-6 w-full border-t-2 border-slate pt-4">
          <p className="font-body text-[17px] text-mist">
            Contact is never locked behind the game:
          </p>
          <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {visible(PROFILE.links).map((l) => (
              <li key={l.id}>
                <a
                  href={l.url}
                  target={l.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer noopener"
                  className="font-body text-[18px] text-cyan underline underline-offset-4 hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </div>
  );
}
