/* ============================================================================
 * INPUT — keyboard + on-screen D-pad, normalised into one direction vector.
 * UI panels can suspend gameplay input without unbinding anything.
 * ========================================================================= */

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  /** E / SPACE / the A button. */
  action: boolean;
  /** True only on the frame the action key went down. */
  actionPressed: boolean;
  /** How long action has been held, in ms — used to fast-forward dialogue. */
  actionHeldMs: number;
}

const KEY_MAP: Record<string, keyof Omit<InputState, 'actionPressed' | 'actionHeldMs'>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
  W: 'up',
  A: 'left',
  S: 'down',
  D: 'right',
  e: 'action',
  E: 'action',
  ' ': 'action',
  Enter: 'action',
};

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

class Input {
  state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
    actionPressed: false,
    actionHeldMs: 0,
  };

  /** When true, movement keys are ignored (a panel is open). */
  suspended = false;

  private touch = { up: false, down: false, left: false, right: false, action: false };
  private konamiIdx = 0;
  private listeners: { konami?: () => void; anyInput?: () => void } = {};

  attach(target: Window = window) {
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
    target.addEventListener('blur', this.reset);
  }

  detach(target: Window = window) {
    target.removeEventListener('keydown', this.onKeyDown);
    target.removeEventListener('keyup', this.onKeyUp);
    target.removeEventListener('blur', this.reset);
  }

  onKonami(fn: () => void) {
    this.listeners.konami = fn;
  }

  onAnyInput(fn: () => void) {
    this.listeners.anyInput = fn;
  }

  private isTypingTarget(e: KeyboardEvent) {
    const el = e.target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.listeners.anyInput?.();

    // Konami tracking works everywhere except while typing in a form.
    if (!this.isTypingTarget(e)) {
      const want = KONAMI[this.konamiIdx];
      const got = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (got === want) {
        this.konamiIdx++;
        if (this.konamiIdx === KONAMI.length) {
          this.konamiIdx = 0;
          this.listeners.konami?.();
        }
      } else {
        this.konamiIdx = got === KONAMI[0] ? 1 : 0;
      }
    }

    if (this.isTypingTarget(e)) return;
    const k = KEY_MAP[e.key];
    if (!k) return;
    if (k === 'action') {
      if (!this.state.action) this.state.actionPressed = true;
      this.state.action = true;
    } else if (!this.suspended) {
      this.state[k] = true;
    }
    if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const k = KEY_MAP[e.key];
    if (!k) return;
    if (k === 'action') {
      this.state.action = false;
      this.state.actionHeldMs = 0;
    } else {
      this.state[k] = false;
    }
  };

  private reset = () => {
    this.state.up = this.state.down = this.state.left = this.state.right = false;
    this.state.action = false;
    this.state.actionHeldMs = 0;
  };

  /** On-screen controls call this. */
  setTouch(k: keyof typeof this.touch, v: boolean) {
    this.touch[k] = v;
    if (v) this.listeners.anyInput?.();
    if (k === 'action') {
      if (v && !this.state.action) this.state.actionPressed = true;
      this.state.action = v;
      if (!v) this.state.actionHeldMs = 0;
    }
  }

  /** Called once per frame by the loop. */
  sample(dt: number) {
    const s = this.state;
    if (s.action) s.actionHeldMs += dt;
    const dirs = {
      up: (s.up || this.touch.up) && !this.suspended,
      down: (s.down || this.touch.down) && !this.suspended,
      left: (s.left || this.touch.left) && !this.suspended,
      right: (s.right || this.touch.right) && !this.suspended,
    };
    return dirs;
  }

  consumeAction(): boolean {
    const v = this.state.actionPressed;
    this.state.actionPressed = false;
    return v;
  }
}

export const input = new Input();
