/** Fails the check if the initial JS payload exceeds the 300KB gzipped budget. */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(dirname(fileURLToPath(import.meta.url))), 'dist');
const BUDGET_KB = 300;

const files = readdirSync(join(dist, 'assets'));
let totalJs = 0;
let totalCss = 0;

for (const f of files) {
  const p = join(dist, 'assets', f);
  if (!statSync(p).isFile()) continue;
  const gz = gzipSync(readFileSync(p)).length;
  if (f.endsWith('.js')) totalJs += gz;
  if (f.endsWith('.css')) totalCss += gz;
  console.log(`  ${f.padEnd(34)} ${(gz / 1024).toFixed(1)} KB gz`);
}

const total = (totalJs + totalCss) / 1024;
console.log(`\n  JS  ${(totalJs / 1024).toFixed(1)} KB gz`);
console.log(`  CSS ${(totalCss / 1024).toFixed(1)} KB gz`);
console.log(`  ---------------------------`);
console.log(`  TOTAL ${total.toFixed(1)} KB gz  (budget ${BUDGET_KB} KB)`);

if (totalJs / 1024 > BUDGET_KB) {
  console.error(`\n✗ over budget by ${(totalJs / 1024 - BUDGET_KB).toFixed(1)} KB`);
  process.exit(1);
}
console.log('\n✓ within budget');
