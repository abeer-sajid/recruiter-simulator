/* On-screen D-pad + A button for touch devices, and the small-viewport gate
 * that offers the plain resume instead (with "Play anyway" always available). */

import { useEffect, useState } from 'react';
import { input } from '../engine/input';
import { useGame } from '../systems/store';
import { PixelButton } from './common';
import { PROFILE } from '../data/profile';

type Btn = 'up' | 'down' | 'left' | 'right' | 'action';

function Pad({ dir, label, className }: { dir: Btn; label: string; className?: string }) {
  const bind = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      input.setTouch(dir, true);
    },
    onPointerUp: () => input.setTouch(dir, false),
    onPointerCancel: () => input.setTouch(dir, false),
    onPointerLeave: () => input.setTouch(dir, false),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
  return (
    <button
      {...bind}
      aria-label={label}
      className={`select-none border-2 border-ash bg-shadow/90 font-head text-[12px] text-paper active:bg-amber4 ${className ?? ''}`}
      style={{ touchAction: 'none' }}
    >
      {label}
    </button>
  );
}

/** True on touch devices. Used to reserve room for the D-pad. */
export function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(
      window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    );
  }, []);
  return touch;
}

export function TouchControls() {
  const touch = useIsTouch();
  // While a dialogue or panel is open the D-pad does nothing (movement is
  // suspended) and would sit on top of the text, so it steps aside. The A
  // button stays, because it is what advances the dialogue.
  const busy = useGame((s) => !!s.dialogue || !!s.panel || !!s.card);

  if (!touch) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-end justify-between p-3">
      <div
        className={`pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1 transition-opacity ${
          busy ? 'pointer-events-none opacity-0' : ''
        }`}
        style={{ width: 150, height: 150 }}
      >
        <span />
        <Pad dir="up" label="▲" />
        <span />
        <Pad dir="left" label="◀" />
        <span className="border-2 border-slate bg-ink/60" />
        <Pad dir="right" label="▶" />
        <span />
        <Pad dir="down" label="▼" />
        <span />
      </div>
      <div className="pointer-events-auto">
        {busy ? (
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              const s = useGame.getState();
              if (s.dialogue) s.advance();
            }}
            aria-label="Continue"
            className="h-20 w-20 select-none rounded-full border-2 border-amber2 bg-amber4/90 font-head text-[16px] text-paper active:bg-amber3"
            style={{ touchAction: 'none' }}
          >
            A
          </button>
        ) : (
          <Pad dir="action" label="A" className="h-20 w-20 rounded-full border-amber2 bg-amber4/90 text-[16px]" />
        )}
      </div>
    </div>
  );
}

/** Offered to small screens and slow devices. Never forced. */
export function MobileGate({ onPlay }: { onPlay: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('rs:gate-dismissed')) return;
    } catch {
      /* private mode: just show the gate by the viewport rule below */
    }
    const small = window.innerWidth < 640;
    // A low core count only counts as a signal on an already-small screen —
    // otherwise virtualised desktops and CI browsers trip it constantly.
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 2 && window.innerWidth < 900;
    const saveData = !!(navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData;
    if (small || lowPower || saveData) setShow(true);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem('rs:gate-dismissed', '1');
    } catch {
      /* ignore */
    }
    setShow(false);
    onPlay();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-void/95 p-4">
      <div className="w-full max-w-md border-4 border-amber2 bg-ink p-4">
        <h2 className="font-head text-[11px] leading-relaxed text-amber0">SMALL SCREEN DETECTED</h2>
        <p className="mt-3 font-body text-[18px] leading-snug text-linen">
          This is a full canvas RPG. It works on a phone — there is a D-pad — but if you are here to evaluate{' '}
          {PROFILE.name} in thirty seconds, the plain resume is faster and has everything.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="#/resume"
            className="border-2 border-amber2 bg-amber4 px-3 py-2 font-head text-[9px] text-amber0 hover:bg-amber3"
          >
            READ THE RESUME
          </a>
          <PixelButton onClick={dismiss}>PLAY ANYWAY</PixelButton>
        </div>
      </div>
    </div>
  );
}
