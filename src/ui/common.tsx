/* Shared UI primitives: the pixel panel chrome, buttons and portraits.
 * All text here is chrome, never content — content comes from /src/data. */

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { drawPortrait } from '../engine/renderer';
import { PORTRAITS } from '../data/sprites';
import type { NpcColors } from '../types/content';

export function PixelButton({
  children,
  onClick,
  tone = 'default',
  className = '',
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: 'default' | 'accent' | 'danger' | 'sarcasm';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const tones: Record<string, string> = {
    default: 'border-ash bg-shadow text-paper hover:bg-slate',
    accent: 'border-amber2 bg-amber4 text-amber0 hover:bg-amber3',
    danger: 'border-ember bg-rust text-paper hover:bg-ember',
    sarcasm: 'border-orchid bg-violet text-paper hover:bg-orchid',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`border-2 px-3 py-2 font-head text-[9px] leading-relaxed tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-40 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Panel({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-void/80 p-3">
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[88vh] w-full flex-col border-4 border-amber2 bg-ink shadow-[0_0_0_4px_#0d0b14] focus:outline-none ${
          wide ? 'max-w-4xl' : 'max-w-2xl'
        }`}
      >
        <header className="flex items-start justify-between gap-3 border-b-2 border-ash bg-shadow px-4 py-3">
          <div>
            <h2 className="font-head text-[11px] text-amber0">{title}</h2>
            {subtitle && <p className="mt-2 font-body text-base leading-tight text-mist">{subtitle}</p>}
          </div>
          <PixelButton onClick={onClose}>ESC ✕</PixelButton>
        </header>
        <div className="overflow-y-auto px-4 py-4 font-body text-[17px] leading-snug text-linen">{children}</div>
      </div>
    </div>
  );
}

export function Portrait({
  which,
  colors,
  size = 72,
}: {
  which: string;
  colors?: NpcColors;
  size?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = size * dpr;
    c.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (which === 'npc') {
      drawPortrait(ctx, 'npc', size, { colors });
      return;
    }
    if (which === 'avatar') {
      drawPortrait(ctx, 'avatar', size, {});
      return;
    }
    const p = PORTRAITS[which];
    if (!p) {
      drawPortrait(ctx, 'npc', size, {});
      return;
    }
    drawPortrait(ctx, p.kind, size, { key: p.key, colors: p.colors ?? colors, time: performance.now() });
  }, [which, colors, size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
      className="shrink-0 border-2 border-ash bg-void"
      aria-hidden="true"
    />
  );
}

export function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className="h-3 w-full border-2 border-void bg-shadow">
      <div className="h-full transition-[width] duration-300" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
