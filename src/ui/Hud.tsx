/* Persistent HUD: level / XP, room banner, panel buttons, sound + CRT toggles,
 * and the always-visible "Skip the game" resume link. */

import { useEffect, useState } from 'react';
import { useGame } from '../systems/store';
import { xpWithinLevel } from './Panels';
import { Bar } from './common';
import { PALETTE } from '../data/palette';
import { getRoom } from '../engine/world';
import { useIsTouch } from './MobileControls';

export function SkipToResume({ floating = true }: { floating?: boolean }) {
  return (
    <a
      href="#/resume"
      onClick={() => useGame.getState().unlock('resume-viewed')}
      className={`${
        floating ? 'fixed right-2 top-2 z-50' : ''
      } border-2 border-amber2 bg-amber4 px-3 py-2 font-head text-[9px] leading-tight text-amber0 shadow-[0_0_0_3px_#0d0b14] hover:bg-amber3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold`}
    >
      SKIP THE GAME —<br />
      VIEW PLAIN RESUME
    </a>
  );
}

export default function Hud({ bark }: { bark: string | null }) {
  const level = useGame((s) => s.level);
  const xp = useGame((s) => s.xp);
  const roomId = useGame((s) => s.roomId);
  const banner = useGame((s) => s.banner);
  const muted = useGame((s) => s.muted);
  const crt = useGame((s) => s.crt);
  const setPanel = useGame((s) => s.setPanel);
  const completion = useGame((s) => s.completion());
  const busy = useGame((s) => !!s.dialogue || !!s.panel || !!s.card);
  const touch = useIsTouch();
  const [showBanner, setShowBanner] = useState(false);

  const room = getRoom(roomId);
  const { value, max } = xpWithinLevel(xp, level);

  useEffect(() => {
    if (!banner) return;
    setShowBanner(true);
    const id = window.setTimeout(() => setShowBanner(false), 2600);
    return () => window.clearTimeout(id);
  }, [banner]);

  return (
    <>
      {/* top-left status */}
      <div className="pointer-events-none fixed left-2 top-2 z-30 w-56 max-w-[45vw] border-2 border-ash bg-ink/90 p-2">
        <div className="flex items-baseline justify-between font-head text-[9px] text-amber0">
          <span>LV {level}</span>
          <span className="text-mist">{completion}%</span>
        </div>
        <div className="my-1">
          <Bar value={value} max={max} color={PALETTE.cyan} />
        </div>
        <div className="truncate font-body text-[16px] leading-none text-mist">{room.name}</div>
      </div>

      {/* room banner */}
      {showBanner && banner && (
        <div className="pointer-events-none fixed left-1/2 top-16 z-30 -translate-x-1/2 border-2 border-amber2 bg-ink/95 px-4 py-2 text-center">
          <span className="font-head text-[10px] text-amber0">{banner}</span>
        </div>
      )}

      {/* NPC bark — hidden while a dialogue or panel is open, or it shows
          through the dialogue box. */}
      {bark && !busy && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-20 max-w-[90vw] -translate-x-1/2 border-2 border-ash bg-ink/90 px-3 py-2">
          <span className="font-body text-[18px] text-linen">{bark}</span>
        </div>
      )}

      <SkipToResume />

      {/* bottom-right controls */}
      <nav
        aria-label="Game menus"
        // On touch devices the bottom corners belong to the D-pad and the A
        // button, so the menu row moves under the status panel instead.
        className={`fixed z-30 flex max-w-[60vw] flex-wrap gap-1 transition-opacity ${
          touch ? 'left-2 top-[78px] justify-start' : 'bottom-2 right-2 justify-end'
        } ${busy ? 'pointer-events-none opacity-0' : 'pointer-events-auto'}`}
      >
        <HudBtn onClick={() => setPanel('quests')} label="Quest log">Q</HudBtn>
        <HudBtn onClick={() => setPanel('inventory')} label="Inventory">I</HudBtn>
        <HudBtn onClick={() => setPanel('skills')} label="Stat sheet">K</HudBtn>
        <HudBtn onClick={() => setPanel('achievements')} label="Achievements">V</HudBtn>
        <HudBtn onClick={() => useGame.getState().toggleMute()} label={muted ? 'Sound on' : 'Mute'}>
          {muted ? '🔇' : '🔊'}
        </HudBtn>
        <HudBtn onClick={() => useGame.getState().toggleCrt()} label="CRT filter">
          {crt ? 'CRT' : 'crt'}
        </HudBtn>
        <HudBtn onClick={() => setPanel('help')} label="Controls help">?</HudBtn>
      </nav>

      {muted && !busy && !touch && (
        <button
          onClick={() => useGame.getState().toggleMute()}
          className="pointer-events-auto fixed bottom-14 right-2 z-30 border-2 border-gold bg-amber4 px-3 py-2 font-head text-[9px] text-amber0 hover:bg-amber3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          🔊 SOUND ON
        </button>
      )}
    </>
  );
}

function HudBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-9 min-w-9 border-2 border-ash bg-shadow px-2 font-head text-[9px] text-paper hover:bg-slate focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      {children}
    </button>
  );
}
