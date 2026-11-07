// Draws a picture of every example in the docs, and of the examples gallery's scripts
// (src/examples), into public/examples/: each example built by the kupcad binary to GLB (or to
// SVG, for a drawing), then shown in @kupcad/ui's viewer (scripts/render, built here with Vite)
// in headless Chromium and screenshotted, in the light theme and the dark (`<id>-dark.png`). An
// example whose model can't be built (one that only prints) gets no picture. The pages show them under the code (src/plugins/playground-links.mjs).
// KUPCAD names the binary, as check-examples does. Run before `astro build`.

import { chromium } from '@playwright/test';
import { spawn, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { allExamples } from './lib/blocks.mjs';
import { prepare } from './lib/fixtures.mjs';

const KUPCAD = process.env.KUPCAD ? resolve(process.env.KUPCAD) : 'kupcad';
const RENDER = new URL('./render/', import.meta.url).pathname;
const OUT = new URL('../public/examples/', import.meta.url).pathname;
const GALLERY = new URL('../src/examples/', import.meta.url).pathname;
const PORT = 4345;
const BUILD_TIMEOUT_MS = 120_000;

/**
 * Builds `code` to a GLB, else an SVG, in `dir`; the file's name, or null for a model that
 * can't be built.
 * @param {string} code
 * @param {string} id
 * @param {string} dir
 */
function build(code, id, dir) {
  const script = join(dir, `${id}.kup`);
  writeFileSync(script, code);
  for (const format of ['glb', 'svg']) {
    const out = `${id}.${format}`;
    const built = spawnSync(KUPCAD, ['build', script, '-o', out], {
      cwd: dir,
      timeout: BUILD_TIMEOUT_MS,
      encoding: 'utf8',
    });
    if (built.status === 0) return out;
  }
  return null;
}

/** What is drawn: every example by its id, and the gallery's scripts by their names. */
function subjects() {
  const seen = new Set();
  const found = [];
  for (const example of allExamples()) {
    if (seen.has(example.id)) continue;
    seen.add(example.id);
    found.push({ id: example.id, code: example.code });
  }
  for (const file of readdirSync(GALLERY)) {
    if (!file.endsWith('.kup')) continue;
    found.push({ id: basename(file, '.kup'), code: readFileSync(join(GALLERY, file), 'utf8') });
  }
  return found;
}

const scratch = mkdtempSync(join(tmpdir(), 'kupcad-render-'));
const site = join(scratch, 'site');
const models = join(scratch, 'models');
mkdirSync(models);
let server = null;
try {
  prepare(models, KUPCAD);
  const vite = spawnSync(
    'pnpm',
    ['exec', 'vite', 'build', '--config', join(RENDER, 'vite.config.js')],
    {
      env: { ...process.env, RENDER_OUT: site },
      encoding: 'utf8',
    },
  );
  if (vite.status !== 0)
    throw new Error(`the renderer wasn't built:\n${vite.stdout}${vite.stderr}`);

  const built = [];
  for (const subject of subjects()) {
    const file = build(subject.code, subject.id, models);
    if (file) built.push({ id: subject.id, file });
  }
  for (const { file } of built) copyFileSync(join(models, file), join(site, file));

  server = spawn(
    'pnpm',
    [
      'exec',
      'vite',
      'preview',
      '--config',
      join(RENDER, 'vite.config.js'),
      '--host',
      '127.0.0.1',
      '--port',
      String(PORT),
      '--strictPort',
    ],
    {
      env: { ...process.env, RENDER_OUT: site },
      stdio: 'ignore',
    },
  );
  const url = `http://127.0.0.1:${PORT}`;
  for (let tries = 0; ; tries++) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {
      if (tries > 50) throw new Error('the renderer never served');
      await new Promise((settle) => setTimeout(settle, 200));
    }
  }

  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({
    viewport: { width: 640, height: 400 },
    deviceScaleFactor: 2,
  });
  let drawn = 0;
  for (const { id, file } of built) {
    // Once in each theme: the page shows the one that matches its own
    for (const [theme, suffix] of [
      ['light', ''],
      ['dark', '-dark'],
    ]) {
      await page.goto(`${url}/?model=${file}&theme=${theme}`);
      await page.waitForSelector('body[data-ready], body[data-failed]', { timeout: 60_000 });
      const failed = await page.evaluate(() => document.body.dataset.failed);
      if (failed) {
        console.warn(`${id}: not drawn: ${failed}`);
        break;
      }
      await page.locator('canvas').screenshot({ path: join(OUT, `${id}${suffix}.png`) });
    }
    drawn++;
  }
  await browser.close();
  console.log(`${drawn} of ${built.length} buildable examples drawn into public/examples/`);
} finally {
  server?.kill();
  rmSync(scratch, { recursive: true, force: true });
}
