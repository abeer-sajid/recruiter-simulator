/* ============================================================================
 * GAME PAGE — assembles the canvas and every React overlay.
 *
 * WHY NO PHASER: this game needs a tile renderer, grid movement, collision and
 * a camera — roughly 300 lines — and absolutely nothing else Phaser provides
 * (no physics bodies, no particle systems, no scene manager, no asset
 * pipeline, since every sprite here is generated in code). Phaser would have
 * added ~250KB gzipped to a build with a 300KB budget, and its DOM/canvas split
 * would have fought the requirement that all UI stay real, selectable,
 * screen-reader-addressable HTML. So: plain canvas, one rAF loop.
 * ========================================================================= */

import { useCallback, useEffect, useState } from 'react';
import GameCanvas from '../ui/GameCanvas';
import DialogueBox from '../ui/DialogueBox';
import Hud from '../ui/Hud';
import Toasts from '../ui/Toasts';
import BossFight from '../ui/BossFight';
import TitleScreen from '../ui/TitleScreen';
import { MobileGate, TouchControls } from '../ui/MobileControls';
import {
  AchievementsPanel,
  CardPanel,
  Credits,
  HelpOverlay,
  Inventory,
  QuestLog,
  SkillSheet,
  Victory,
} from '../ui/Panels';
import { useGame } from '../systems/store';
import { input } from '../engine/input';

export default function Game() {
  const screen = useGame((s) => s.screen);
  const panel = useGame((s) => s.panel);
  const card = useGame((s) => s.card);
  const crt = useGame((s) => s.crt);
  const roomId = useGame((s) => s.roomId);
  const [bark, setBark] = useState<string | null>(null);

  // A bark belongs to the room it was said in.
  useEffect(() => setBark(null), [roomId]);

  const onBark = useCallback((line: string) => {
    setBark(line);
    window.setTimeout(() => setBark((cur) => (cur === line ? null : cur)), 4200);
  }, []);

  /* ------------------------------------------------ boot + preferences -- */
  useEffect(() => {
    useGame.getState().boot();
    input.attach();

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => useGame.getState().setReducedMotion(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);

    return () => {
      input.detach();
      mq.removeEventListener?.('change', apply);
    };
  }, []);

  /* ----------------------------------- "tried to leave" easter egg ------ */
  useEffect(() => {
    if (screen !== 'playing') return;
    let used = false;
    history.pushState({ rs: true }, '');
    const onPop = () => {
      const st = useGame.getState();
      if (!used && !st.bossDefeated) {
        used = true;
        st.unlock('tried-to-leave');
        history.pushState({ rs: true }, '');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [screen]);

  /* ------------------------------------------------ keyboard shortcuts -- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      const st = useGame.getState();
      if (st.screen !== 'playing') return;
      const k = e.key.toLowerCase();
      if (k === 'escape') {
        if (st.card) st.openCard(null);
        else if (st.panel) st.setPanel(null);
        else if (st.dialogue) st.closeDialogue();
        return;
      }
      if (st.dialogue) return;
      if (k === 'q') st.setPanel(st.panel === 'quests' ? null : 'quests');
      else if (k === 'i') st.setPanel(st.panel === 'inventory' ? null : 'inventory');
      else if (k === 'k') st.setPanel(st.panel === 'skills' ? null : 'skills');
      else if (k === 'v') st.setPanel(st.panel === 'achievements' ? null : 'achievements');
      else if (k === 'm') st.toggleMute();
      else if (k === 'c') st.toggleCrt();
      else if (k === '?' || (k === '/' && e.shiftKey)) st.setPanel(st.panel === 'help' ? null : 'help');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (screen === 'title') return <TitleScreen />;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-void">
      <GameCanvas onBark={onBark} />

      {crt && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)',
            boxShadow: 'inset 0 0 140px rgba(0,0,0,0.75)',
          }}
        />
      )}
      {!crt && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.6)' }}
        />
      )}

      <Hud bark={bark} />
      <DialogueBox />
      <Toasts />
      <TouchControls />
      <MobileGate onPlay={() => undefined} />

      {panel === 'quests' && <QuestLog />}
      {panel === 'inventory' && <Inventory />}
      {panel === 'skills' && <SkillSheet />}
      {panel === 'achievements' && <AchievementsPanel />}
      {panel === 'help' && <HelpOverlay />}
      {panel === 'boss' && <BossFight />}
      {panel === 'credits' && <Credits />}
      {panel === 'victory' && <Victory />}
      {card && <CardPanel />}
    </div>
  );
}
