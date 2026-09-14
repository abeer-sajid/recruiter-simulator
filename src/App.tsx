/* Tiny hash router: '#/resume' shows the plain resume, anything else the game.
 * A hash route keeps the whole thing a zero-config static deploy, while the
 * build ALSO emits a real prerendered /resume/index.html for crawlers. */

import { lazy, Suspense, useEffect, useState } from 'react';
import Game from './pages/Game';

const Resume = lazy(() => import('./pages/Resume'));

function currentRoute() {
  return window.location.hash.replace(/^#/, '') || '/';
}

export default function App() {
  const [route, setRoute] = useState(currentRoute());

  useEffect(() => {
    const onHash = () => {
      setRoute(currentRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route.startsWith('/resume')) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-[100dvh] items-center justify-center bg-paper font-head text-[10px] text-ink">
            Loading resume…
          </div>
        }
      >
        <Resume />
      </Suspense>
    );
  }

  return <Game />;
}
