/**
 * Runs the same content validator the game runs in dev, but from the terminal
 * and with a non-zero exit code — so you can wire it into CI or a pre-commit
 * hook and never ship a broken project entry.
 *
 *     npm run check:content
 */

import { build } from 'esbuild';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const tmp = join(root, 'node_modules', '.contentcheck');

const entry = `
import { validateContent } from ${JSON.stringify(join(root, 'src/systems/validate'))};
import { getRoom, allRoomIds } from ${JSON.stringify(join(root, 'src/engine/world'))};
export const issues = validateContent();
export const rooms = allRoomIds().map((id) => {
  const r = getRoom(id);
  return { id, w: r.w, h: r.h, objects: r.objects.length, doors: r.doors.length };
});
`;

mkdirSync(tmp, { recursive: true });
const entryFile = join(tmp, 'entry.ts');
writeFileSync(entryFile, entry);
const outFile = join(tmp, 'out.mjs');

await build({
  entryPoints: [entryFile],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: outFile,
  logLevel: 'error',
  define: { 'import.meta.env.DEV': 'true' },
});

const { issues, rooms } = await import(pathToFileURL(outFile).href);
rmSync(tmp, { recursive: true, force: true });

console.log('\nRooms generated from your content:');
for (const r of rooms) {
  console.log(`  ${r.id.padEnd(11)} ${String(r.w).padStart(3)} x ${String(r.h).padStart(2)} tiles · ${String(r.objects).padStart(3)} objects · ${r.doors} door(s)`);
}

if (!issues.length) {
  console.log('\n✓ content is valid — every object placed, every path walkable\n');
  process.exit(0);
}

console.error(`\n✗ ${issues.length} content problem(s):\n`);
for (const i of issues) {
  console.error(`  ${i.file} → ${i.entry}`);
  console.error(`     problem: ${i.problem}`);
  console.error(`     fix:     ${i.fix}\n`);
}
process.exit(1);
