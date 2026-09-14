/** Headless play-test: drives the built game, verifies movement, interaction,
 *  save migration and the resume page, and screenshots every room. */
import { createRequire } from 'node:module';
const require_ = createRequire(import.meta.url);
const { chromium } = require_('/home/claude/.npm-global/lib/node_modules/playwright/index.js');
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const shots = join(root, 'playtest');
mkdirSync(shots, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.pdf': 'application/pdf', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  let p = join(dist, decodeURIComponent((req.url || '/').split('?')[0]));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) p = join(dist, 'index.html');
  res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(4173, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1100, height: 720 } });

const errors = [];
const results = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

const shot = async (name, ms = 700) => {
  await page.waitForTimeout(ms);
  await page.screenshot({ path: join(shots, `${name}.png`) });
};
// A tap: hold shorter than one 150ms step so exactly one tile is walked.
// (Holding a direction down walks continuously — that is by design.)
const walk = async (key, times) => {
  for (let i = 0; i < times; i++) {
    await page.keyboard.down(key);
    await page.waitForTimeout(45);
    await page.keyboard.up(key);
    await page.waitForTimeout(220);
  }
};
const state = () =>
  page.evaluate(() => {
    const s = window.__rs.store.getState();
    return {
      room: s.roomId,
      tile: s.playerTile(),
      xp: s.xp,
      level: s.level,
      progress: [...s.progress],
      ach: [...s.achievements],
      dialogue: s.dialogue?.speaker ?? null,
      panel: s.panel,
      completion: s.completion(),
    };
  });
const goRoom = (id) => page.evaluate((r) => window.__rs.store.getState().goToRoom(r), id);
const check = (name, ok, detail = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

/* ---------------------------------------------------------- title screen */
await page.goto('http://localhost:4173/');
await shot('01-title', 1500);
check('title screen renders', await page.getByRole('button', { name: /NEW GAME/i }).isVisible());
check('resume escape hatch on title', await page.getByRole('link', { name: /SKIP THE GAME/i }).isVisible());

await page.getByRole('button', { name: /NEW GAME/i }).click();
await shot('02-lobby', 1000);

/* -------------------------------------------------------------- movement */
const before = await state();
await walk('ArrowUp', 3);
const afterUp = await state();
check('grid movement works', afterUp.tile.ty === before.tile.ty - 3, `${JSON.stringify(before.tile)} -> ${JSON.stringify(afterUp.tile)}`);

await walk('ArrowLeft', 1);
await page.keyboard.press('Space');
await shot('03-ficus-dialogue', 900);
const inDialogue = await state();
check('proximity interaction opens dialogue', (inDialogue.dialogue ?? '').includes('Ficus'), String(inDialogue.dialogue));

for (let i = 0; i < 14; i++) {
  if (await page.getByRole('button', { name: /A talking plant/i }).isVisible().catch(() => false)) break;
  await page.keyboard.press('Space');
  await page.waitForTimeout(420);
}
await shot('04-ficus-choices', 700);
check('branching choices appear', await page.getByRole('button', { name: /A talking plant/i }).isVisible());
await page.keyboard.press('3');
await shot('05-sarcastic', 900);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

const afterTalk = await state();
check('XP awarded for talking', afterTalk.xp > 0, `xp=${afterTalk.xp}`);
check('NPC recorded in progress', afterTalk.progress.includes('npc:ficus'));

/* ------------------------------------------------------------- quest log */
await page.keyboard.press('q');
await shot('06-quest-log', 700);
check('quest log opens', (await state()).panel === 'quests');
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
check('ESC closes the panel', (await state()).panel === null);

/* ------------------------------------------------- walk through a door */
// The player is standing right next to Ficus, who is solid — step down off
// the rug first, then along the bottom of the room to the door at (3,0).
const cur = (await state()).tile;
await walk('ArrowDown', 2);
const afterDown = (await state()).tile;
await walk('ArrowLeft', Math.max(0, afterDown.tx - 3));
await walk('ArrowUp', afterDown.ty + 1);
check('collision blocked the tile occupied by the plant', cur.tx === 10, `player stopped beside Ficus at ${JSON.stringify(cur)}`);
const walkedRoom = await state();
check('walking through a door changes room', walkedRoom.room === 'projects', `room=${walkedRoom.room}`);
await shot('07-projects-room', 1200);

/* ----------------------------------------------------- inspect a cabinet */
await walk('ArrowUp', 5);
await page.keyboard.press('Space');
await shot('08-project-card', 1000);
let st = await state();
if (!st.progress.some((p) => p.startsWith('project:'))) {
  await page.keyboard.press('Escape');
  await walk('ArrowLeft', 2);
  await walk('ArrowUp', 2);
  await page.keyboard.press('Space');
  await shot('08-project-card', 1000);
  st = await state();
}
check('project artifact collected', st.progress.some((p) => p.startsWith('project:')), st.progress.filter((p) => p.startsWith('project:')).join(','));
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

await page.keyboard.press('i');
await shot('09-inventory', 800);
await page.keyboard.press('Escape');
await page.waitForTimeout(200);

/* ----------------------------------------------------------- other rooms */
await goRoom('skills');
await shot('10-skill-chamber', 1200);
await page.keyboard.press('k');
await shot('11-stat-sheet', 900);
await page.keyboard.press('Escape');
await page.waitForTimeout(250);

await goRoom('archives');
await shot('12-archives', 1200);
await walk('ArrowRight', 3);
await page.keyboard.press('Space');
await shot('13-archives-testimonial', 1000);
check('archives testimonial plays', !!(await state()).dialogue, String((await state()).dialogue));
await page.keyboard.press('Escape');
await page.waitForTimeout(250);

await goRoom('breakroom');
await shot('14-break-room', 1200);

await goRoom('boss');
await shot('15-boss-room', 1200);
await walk('ArrowUp', 4);
await page.keyboard.press('Space');
await shot('16-boss-intro', 1000);
check('boss intro plays', ((await state()).dialogue ?? '').includes('HIRING'), String((await state()).dialogue));

// Press SPACE until the choices appear (first press finishes the typewriter
// line, the next one turns the page — so the count is not fixed).
for (let i = 0; i < 14; i++) {
  if (await page.getByRole('button', { name: /Fight it/i }).isVisible().catch(() => false)) break;
  await page.keyboard.press('Space');
  await page.waitForTimeout(420);
}
await page.getByRole('button', { name: /Fight it/i }).click();
await shot('17-contact-form', 1100);
check('contact form opens', await page.locator('#boss-name').isVisible());

await page.fill('#boss-name', 'Dana Whitfield');
await page.locator('#boss-name').blur();
await page.fill('#boss-email', 'dana@example.com');
await page.locator('#boss-email').blur();
await page.fill('#boss-message', 'We have an L3 support role that is 60% incident work, 40% building the tooling. Interested?');
await page.locator('#boss-message').blur();
await shot('18-boss-damaged', 1000);
const hp = await page.evaluate(() => window.__rs.store.getState().bossHp);
check('filling fields damages the boss', hp < 100, `hp=${hp}`);

/* -------------------------------------------------------- save + migrate */
const preReload = await state();
await page.reload();
await page.waitForTimeout(1300);
await page.getByRole('button', { name: /CONTINUE/i }).click();
await page.waitForTimeout(1000);
const post = await state();
check(
  'save + continue restores progress',
  post.xp === preReload.xp && post.progress.length === preReload.progress.length,
  `xp ${preReload.xp}->${post.xp}, keys ${preReload.progress.length}->${post.progress.length}`,
);
await shot('19-continued', 800);

await page.evaluate(() => {
  localStorage.setItem('recruiter-sim:save', JSON.stringify({ v: 99, achievements: ['met-ficus'], nonsense: true }));
});
await page.reload();
await page.waitForTimeout(1300);
await page.getByRole('button', { name: /CONTINUE/i }).click();
await page.waitForTimeout(1000);
const afterMigrate = await state();
check('save from a future version migrates without crashing', afterMigrate.ach.includes('met-ficus'), `ach=${afterMigrate.ach.join(',')}`);

await page.evaluate(() => localStorage.setItem('recruiter-sim:save', '{{{ corrupt'));
await page.reload();
await page.waitForTimeout(1300);
check('corrupt save falls back to a clean title screen', await page.getByRole('button', { name: /NEW GAME/i }).isVisible());

/* --------------------------------------------------------------- resume */
await page.goto('http://localhost:4173/#/resume');
await shot('20-resume-spa', 1400);

await page.goto('http://localhost:4173/resume/');
await shot('21-resume-prerendered', 1400);
const h1 = await page.locator('h1').first().innerText();
const headings = await page.locator('main h3').count();
const jsonLd = await page.locator('script[type="application/ld+json"]').count();
const color = await page.evaluate(() => getComputedStyle(document.querySelector('h1')).color);
check('prerendered resume has the right h1', h1.includes('Abeer'), h1);
check('prerendered resume lists content', headings >= 10, `${headings} sub-headings`);
check('prerendered resume carries JSON-LD', jsonLd > 0);
check('prerendered resume text is visible', color !== 'rgba(0, 0, 0, 0)' && color !== 'rgb(239, 230, 224)', color);

/* --------------------------------------------------------------- mobile */
const m = await browser.newPage({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true });
await m.goto('http://localhost:4173/');
await m.waitForTimeout(1400);
await m.screenshot({ path: join(shots, '22-mobile-title.png') });
await m.getByRole('button', { name: /NEW GAME/i }).click();
await m.waitForTimeout(1000);
await m.screenshot({ path: join(shots, '23-mobile-gate.png') });
check('small screens are offered the resume', await m.getByRole('button', { name: /PLAY ANYWAY/i }).isVisible());
await m.getByRole('button', { name: /PLAY ANYWAY/i }).click();
await m.waitForTimeout(1000);
await m.screenshot({ path: join(shots, '24-mobile-dpad.png') });
check('touch D-pad renders', await m.getByRole('button', { name: '▲' }).isVisible());

console.log('\n' + results.join('\n'));
console.log('\nconsole errors:', errors.length ? [...new Set(errors)].slice(0, 6) : 'none');
console.log(`\n${results.filter((r) => r.startsWith('PASS')).length}/${results.length} checks passed`);

await browser.close();
server.close();
