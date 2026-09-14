/* ============================================================================
 * BOSS FIGHT — THE HIRING PROCESS.
 *
 * The attacks are the contact form fields. Filling one lands a hit; sending
 * the message finishes it. The form is REAL.
 *
 * WIRING IT UP (one minute):
 *   1. Get a free access key at https://web3forms.com (they email it to you).
 *   2. Create a file called `.env` next to package.json containing:
 *         VITE_WEB3FORMS_KEY=your-key-here
 *   3. Redeploy. That is the whole setup.
 *
 * With no key configured the form still works: it falls back to opening the
 * visitor's mail client, pre-filled, addressed to PROFILE.email. It never
 * silently drops a message.
 * ========================================================================= */

import { useEffect, useMemo, useState } from 'react';
import { useGame } from '../systems/store';
import { Bar, Panel, PixelButton } from './common';
import { PALETTE } from '../data/palette';
import { BOSS_HITS, BOSS_TAUNTS } from '../data/jokes';
import { PROFILE } from '../data/profile';
import { visible } from '../types/content';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

export default function BossFight() {
  const close = useGame((s) => s.setPanel);
  const hitBoss = useGame((s) => s.hitBoss);
  const defeat = useGame((s) => s.defeatBoss);
  const hp = useGame((s) => s.bossHp);
  const alreadyBeaten = useGame((s) => s.bossDefeated);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [landed, setLanded] = useState<Record<string, boolean>>({});
  const [log, setLog] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [taunt, setTaunt] = useState(BOSS_TAUNTS[0]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const ready = name.trim().length > 1 && emailOk && message.trim().length > 9;

  useEffect(() => {
    if (status !== 'idle' || alreadyBeaten) return;
    const id = window.setInterval(() => {
      setTaunt(BOSS_TAUNTS[Math.floor(Math.random() * BOSS_TAUNTS.length)]);
    }, 5200);
    return () => window.clearInterval(id);
  }, [status, alreadyBeaten]);

  const land = (key: string, ok: boolean, index: number) => {
    if (!ok || landed[key] || alreadyBeaten) return;
    setLanded((l) => ({ ...l, [key]: true }));
    hitBoss(30);
    setLog((l) => [...l, BOSS_HITS[index % BOSS_HITS.length]].slice(-4));
  };

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(role ? `Role: ${role}` : `Hello from your portfolio`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    return `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
  }, [name, email, role, message]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || status === 'sending') return;

    if (!ACCESS_KEY) {
      // No backend configured: hand the message to the visitor's mail client.
      window.location.href = mailtoHref;
      setStatus('sent');
      setLog((l) => [...l, 'Opened your mail client with the message pre-filled.']);
      defeat();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: role ? `Portfolio contact — ${role}` : 'Portfolio contact',
          from_name: name,
          name,
          email,
          role,
          message,
          botcheck: '',
        }),
      });
      const data = (await res.json()) as { success?: boolean };
      if (!res.ok || !data.success) throw new Error('send failed');
      setStatus('sent');
      defeat();
    } catch {
      setStatus('error');
    }
  }

  const beaten = alreadyBeaten || status === 'sent';

  return (
    <Panel
      title="BOSS — THE HIRING PROCESS"
      subtitle={beaten ? 'Defeated. It cannot hurt you here.' : taunt}
      onClose={() => close(null)}
      wide
    >
      <div className="mb-4">
        <div className="mb-1 flex items-baseline justify-between font-head text-[9px]">
          <span className="text-ember">THE HIRING PROCESS</span>
          <span className="text-mist">HP {Math.max(0, hp)}/100</span>
        </div>
        <Bar value={beaten ? 0 : hp} max={100} color={hp > 40 ? PALETTE.ember : PALETTE.flame} />
      </div>

      {log.length > 0 && (
        <ul className="mb-4 space-y-1 font-body text-[17px] text-lime" aria-live="polite">
          {log.map((l, i) => (
            <li key={`${l}-${i}`}>▸ {l}</li>
          ))}
        </ul>
      )}

      {beaten ? (
        <div className="border-2 border-lime bg-moss/30 p-4">
          <p className="font-head text-[10px] text-lime">MESSAGE SENT</p>
          <p className="mt-2 text-paper">
            It went to {PROFILE.email}. A real person checks that, and will reply.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PixelButton tone="accent" onClick={() => close('victory')}>
              SEE THE VERDICT
            </PixelButton>
            <PixelButton onClick={() => close(null)}>BACK TO THE GAME</PixelButton>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <Field
            id="boss-name"
            label="ATTACK 1 — YOUR NAME"
            hint="The form does not expect a real human."
            value={name}
            onChange={setName}
            onBlur={() => land('name', name.trim().length > 1, 0)}
            required
          />
          <Field
            id="boss-email"
            label="ATTACK 2 — YOUR EMAIL"
            hint="So the reply has somewhere to go."
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => land('email', emailOk, 1)}
            required
          />
          <Field
            id="boss-role"
            label="OPTIONAL — THE ROLE"
            hint="Title, team, or just a vibe."
            value={role}
            onChange={setRole}
          />
          <div>
            <label htmlFor="boss-message" className="block font-head text-[9px] text-amber1">
              ATTACK 3 — YOUR MESSAGE
            </label>
            <textarea
              id="boss-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => land('message', message.trim().length > 9, 2)}
              className="mt-1 w-full border-2 border-ash bg-void px-3 py-2 font-body text-[18px] text-paper focus:border-amber1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
            <p className="mt-1 font-body text-base text-fog">
              Ten characters minimum. "hi" is how it wins.
            </p>
          </div>

          {status === 'error' && (
            <p className="border-2 border-ember bg-rust/30 p-3 text-paper" role="alert">
              The send failed. You can{' '}
              <a className="text-gold underline" href={mailtoHref}>
                email {PROFILE.email} directly
              </a>{' '}
              instead — that always works.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <PixelButton type="submit" tone="danger" disabled={!ready || status === 'sending'}>
              {status === 'sending' ? 'SENDING…' : 'FINISH IT — SEND'}
            </PixelButton>
            <span className="font-body text-[17px] text-mist">
              {ready ? 'All three attacks charged.' : 'Fill the three required fields to charge your attacks.'}
            </span>
          </div>
        </form>
      )}

      <hr className="my-4 border-slate" />
      <p className="font-body text-[17px] text-fog">
        Contact details are never gated behind this fight:{' '}
        {visible(PROFILE.links).map((l, i) => (
          <span key={l.id}>
            {i > 0 && ' · '}
            <a className="text-cyan underline underline-offset-4" href={l.url} target="_blank" rel="noreferrer noopener">
              {l.display ?? l.label}
            </a>
          </span>
        ))}
      </p>
    </Panel>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  onBlur,
  type = 'text',
  required,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-head text-[9px] text-amber1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="mt-1 w-full border-2 border-ash bg-void px-3 py-2 font-body text-[18px] text-paper focus:border-amber1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      />
      {hint && <p className="mt-1 font-body text-base text-fog">{hint}</p>}
    </div>
  );
}
