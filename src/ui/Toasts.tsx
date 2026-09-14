/* Xbox-style achievement toasts, top-right, under the resume button. */

import { useEffect } from 'react';
import { useGame } from '../systems/store';

function Toast({ k, title, body }: { k: number; title: string; body: string }) {
  const drop = useGame((s) => s.dropToast);
  useEffect(() => {
    const id = window.setTimeout(() => drop(k), 5200);
    return () => window.clearTimeout(id);
  }, [k, drop]);

  return (
    <div
      role="status"
      className="pointer-events-auto w-72 max-w-[80vw] border-2 border-gold bg-ink/95 p-3 shadow-[0_0_0_3px_#0d0b14]"
    >
      <div className="font-head text-[10px] text-gold">★ {title}</div>
      <p className="mt-1 font-body text-[17px] leading-tight text-linen">{body}</p>
    </div>
  );
}

export default function Toasts() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed right-2 top-20 z-40 flex flex-col items-end gap-2">
      {toasts.map((t) => (
        <Toast key={t.key} k={t.key} title={t.title} body={t.body} />
      ))}
    </div>
  );
}
