import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { installPaletteVars } from './data/palette';
import { runValidation } from './systems/validate';
import { useGame } from './systems/store';
import { allRoomIds } from './engine/world';

installPaletteVars();

// Loud in dev, silent in prod. See src/systems/validate.ts.
runValidation();

// Debug handle. Open the console and poke at the game:
//   __rs.store.getState().goToRoom('archives')
//   __rs.store.getState().addXp(2000)
(window as unknown as { __rs: unknown }).__rs = { store: useGame, rooms: allRoomIds };

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
