/** Records a short gameplay demo video for social posts. */
import { createRequire } from 'node:module';
const require_ = createRequire(import.meta.url);
const { chromium } = require_('/home/claude/.npm-global/lib/node_modules/playwright/index.js');
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync, readdirSync, renameSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const outDir = join(root, 'demo');
mkdirSync(outDir, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.pdf': 'application/pdf' };
const server = createServer((req, res) => {
  let p = join(dist, decodeURIComponent((req.url || '/').split('?')[0]));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) p = join(dist, 'index.html');
  res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(4180, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
});
const page = await ctx.newPage();

const walk = async (key, times, hold = 45, gap = 190) => {
  for (let i = 0; i < times; i++) {
    await page.keyboard.down(key);
    await page.waitForTimeout(hold);
    await page.keyboard.up(key);
    await page.waitForTimeout(gap);
  }
};
const hold = async (key, ms) => {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
  await page.waitForTimeout(150);
};
const pageThrough = async (n, wait = 900) => {
  for (let i = 0; i < n; i++) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(wait);
  }
};

await page.goto('http://localhost:4180/');
await page.waitForTimeout(2600);                       // title screen

await page.getByRole('button', { name: /NEW GAME/i }).click();
await page.waitForTimeout(1400);

// walk up to Ficus and talk
await walk('ArrowUp', 3);
await page.keyboard.press('Space');
await page.waitForTimeout(1600);
for (let i = 0; i < 12; i++) {
  if (await page.getByRole('button', { name: /A talking plant/i }).isVisible().catch(() => false)) break;
  await page.keyboard.press('Space');
  await page.waitForTimeout(1300);
}
await page.waitForTimeout(1800);                       // let the choices sit
await page.keyboard.press('3');                        // the sarcastic one
await page.waitForTimeout(2800);
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

// quest log
await page.keyboard.press('q');
await page.waitForTimeout(2600);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

// Walk to the Hall of Projects. Ficus is solid, so step off the rug first,
// then route to the door at (3,0) from wherever we actually are.
const tile = () => page.evaluate(() => window.__rs.store.getState().playerTile());
await walk('ArrowDown', 2);
const t0 = await tile();
await walk('ArrowLeft', Math.max(0, t0.tx - 3));
await walk('ArrowUp', t0.ty + 1);
await page.waitForTimeout(1600);

// inspect the nearest cabinet
await walk('ArrowUp', 5);
await page.keyboard.press('Space');
await page.waitForTimeout(1200);
if (!(await page.getByText('ARTIFACT ACQUIRED').isVisible().catch(() => false))) {
  await page.keyboard.press('Escape');
  await walk('ArrowLeft', 2);
  await walk('ArrowUp', 2);
  await page.keyboard.press('Space');
  await page.waitForTimeout(1200);
}
await page.waitForTimeout(3200);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

// the stat sheet — the honest numbers
await page.evaluate(() => window.__rs.store.getState().goToRoom('skills'));
await page.waitForTimeout(1600);
await hold('ArrowDown', 900);
await page.keyboard.press('k');
await page.waitForTimeout(3000);
await page.mouse.wheel(0, 500);
await page.waitForTimeout(2000);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

// the Archives
await page.evaluate(() => window.__rs.store.getState().goToRoom('archives'));
await page.waitForTimeout(1500);
await hold('ArrowRight', 900);
await page.keyboard.press('Space');
await page.waitForTimeout(1500);
await pageThrough(3, 1400);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

// the boss
await page.evaluate(() => window.__rs.store.getState().goToRoom('boss'));
await page.waitForTimeout(1500);
await hold('ArrowUp', 800);
await page.keyboard.press('Space');
await page.waitForTimeout(1500);
// Press SPACE until the choices show (the first press finishes the line).
for (let i = 0; i < 14; i++) {
  if (await page.getByRole('button', { name: /Fight it/i }).isVisible().catch(() => false)) break;
  await page.keyboard.press('Space');
  await page.waitForTimeout(1200);
}
await page.waitForTimeout(1200);
await page.getByRole('button', { name: /Fight it/i }).click();
await page.waitForTimeout(1800);
await page.locator('#boss-name').fill('Dana Whitfield');
await page.locator('#boss-name').blur();
await page.waitForTimeout(1100);
await page.locator('#boss-email').fill('dana@example.com');
await page.locator('#boss-email').blur();
await page.waitForTimeout(1100);
await page.locator('#boss-message').fill('We have an L3 support role: 60% incident work, 40% building the tooling.');
await page.locator('#boss-message').blur();
await page.waitForTimeout(3000);

await ctx.close();
await browser.close();
server.close();

const vid = readdirSync(outDir).find((f) => f.endsWith('.webm'));
if (vid) renameSync(join(outDir, vid), join(outDir, 'demo.webm'));
console.log('recorded demo/demo.webm');
