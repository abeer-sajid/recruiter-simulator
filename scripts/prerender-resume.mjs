/**
 * Renders src/pages/Resume.tsx to real static HTML at dist/resume/index.html,
 * and rewrites the <title>/<meta> tags in dist/index.html from profile.ts.
 *
 * This is what makes the resume the SEO and screen-reader source of truth: a
 * crawler that never runs JavaScript still gets semantic <h1>/<h2>, every job,
 * every project, every skill, plus JSON-LD Person data.
 *
 * Runs automatically as part of `npm run build`.
 */

import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const tmp = join(root, 'node_modules', '.prerender');

const entrySource = () => `
import { renderToStaticMarkup } from 'react-dom/server';
import Resume, { personJsonLd } from ${JSON.stringify(join(root, 'src/pages/Resume'))};
import { PROFILE } from ${JSON.stringify(join(root, 'src/data/profile'))};
import { PALETTE } from ${JSON.stringify(join(root, 'src/data/palette'))};
export const html = renderToStaticMarkup(<Resume standalone />);
export const profile = PROFILE;
export const jsonLd = personJsonLd();
export const palette = PALETTE;
`;

function findAsset(ext) {
  const dir = join(dist, 'assets');
  const hit = readdirSync(dir).find((f) => f.endsWith(ext));
  return hit ? `assets/${hit}` : null;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function main() {
  mkdirSync(tmp, { recursive: true });
  const entryFile = join(tmp, 'entry.tsx');
  writeFileSync(entryFile, entrySource());

  const outFile = join(tmp, 'out.mjs');
  await build({
    entryPoints: [entryFile],
    bundle: true,
    platform: 'node',
    format: 'esm',
    jsx: 'automatic',
    packages: 'external',
    outfile: outFile,
    logLevel: 'error',
    loader: { '.png': 'dataurl' },
  });

  const mod = await import(pathToFileURL(outFile).href);
  const { html, profile, jsonLd, palette } = mod;

  // The prerendered page runs NO JavaScript, so the palette custom properties
  // that the SPA installs at runtime have to be baked in here. Without this the
  // page renders with the right background and invisible text.
  const paletteCss = `:root{${Object.entries(palette)
    .map(([k, v]) => `--c-${k}:${v}`)
    .join(';')}}`;

  const css = findAsset('.css');
  const canonical = profile.seo.canonicalUrl.replace(/\/$/, '');

  const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(profile.name)} — Resume · ${esc(profile.title)}</title>
<meta name="description" content="${esc(profile.seo.description)}" />
<link rel="canonical" href="${esc(canonical)}/resume/" />
<meta property="og:type" content="profile" />
<meta property="og:title" content="${esc(profile.name)} — ${esc(profile.title)}" />
<meta property="og:description" content="${esc(profile.seo.description)}" />
<meta property="og:url" content="${esc(canonical)}/resume/" />
<meta property="og:image" content="${esc(profile.seo.ogImage || `${canonical}/avatar.png`)}" />
<meta name="twitter:card" content="summary" />
<meta name="theme-color" content="#efe6e0" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<style>${paletteCss}</style>
${css ? `<link rel="stylesheet" href="../${css}" />` : ''}
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>${html}</body>
</html>
`;

  mkdirSync(join(dist, 'resume'), { recursive: true });
  writeFileSync(join(dist, 'resume', 'index.html'), page);

  // Keep the SPA shell's metadata in sync with profile.ts.
  const shellPath = join(dist, 'index.html');
  let shell = readFileSync(shellPath, 'utf8');
  shell = shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(profile.seo.siteTitle)}</title>`)
    .replace(/(<meta name="description" content=")[\s\S]*?(")/, `$1${esc(profile.seo.description)}$2`)
    .replace(/(<meta property="og:title" content=")[\s\S]*?(")/, `$1${esc(profile.seo.siteTitle)}$2`);
  writeFileSync(shellPath, shell);

  rmSync(tmp, { recursive: true, force: true });
  console.log(`prerendered dist/resume/index.html (${(page.length / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error('prerender failed:', err);
  process.exit(1);
});
