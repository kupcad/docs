// Checks every example in the docs (scripts/lib/blocks.mjs) with the kupcad binary: `kupcad
// check` for what the language no longer accepts, then `kupcad run`, so an example that fails
// when it runs fails here, not in a reader's editor; and what a `puts` line says it prints
// (`puts x.volume   # 500`) is compared with what it printed. The files examples read are put
// beside them (scripts/fixtures; the meshes and drawings built by the binary). The binary is $KUPCAD, else `kupcad` on the PATH:
// KUPCAD=../kupcad/core/zig-out/bin/kupcad pnpm check:examples

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { allExamples, printedAsSaid } from './lib/blocks.mjs';
import { prepare } from './lib/fixtures.mjs';

// A path, resolved here: the checks run in a scratch directory
const KUPCAD = process.env.KUPCAD ? resolve(process.env.KUPCAD) : 'kupcad';
/** How long one example may run: a slow boolean on CI's machine, not a script that never ends. */
const RUN_TIMEOUT_MS = 120_000;

/**
 * Runs the binary: whether it succeeded, and what it printed on both streams (a script's `puts`
 * and warnings go to stderr, as its errors do).
 * @param {string[]} args
 * @param {string} cwd
 * @returns {{ ok: boolean, output: string }}
 */
function kupcad(args, cwd) {
  const ran = spawnSync(KUPCAD, args, { cwd, timeout: RUN_TIMEOUT_MS, encoding: 'utf8' });
  const output = `${ran.stdout}${ran.stderr}` || ran.error?.message || '';
  return { ok: ran.status === 0, output };
}

/**
 * Whether an example that stopped with an error meant to: a comment in it names the error's
 * class (`# KeyError: machine.json: gears[1] has no key "pitch"`).
 * @param {string} output
 * @param {string} code
 */
function raisesAsSaid(output, code) {
  const said = [...code.matchAll(/#\s*([A-Z]\w*Error)\b/g)].map((match) => match[1]);
  return said.some((klass) => output.includes(`${klass}:`));
}

/**
 * What is wrong with what an example printed against what its comments say, if anything.
 * @param {string} printed
 * @param {string[]} expected
 */
function misprinted(printed, expected) {
  if (expected.length === 0) return null;
  const lines = printed.split('\n').filter((line) => line !== '' && !line.startsWith('[Warning]'));
  // Line for line where the puts lines each printed once; else each said line somewhere
  const aligned = lines.length === expected.length;
  const wrong = expected.filter((said, i) => {
    if (aligned && printedAsSaid(lines[i], said)) return false;
    if (lines.some((line) => printedAsSaid(line, said))) return false;
    // `# 0, 0.5, 1`: a loop's lines, said in one comment
    const several = said.split(', ');
    return !lines.some((_, at) => several.every((one, k) => lines[at + k] === one));
  });
  if (wrong.length === 0) return null;
  return `said it prints ${wrong.map((w) => JSON.stringify(w)).join(', ')}; printed:\n${printed}`;
}

const scratch = mkdtempSync(join(tmpdir(), 'kupcad-docs-'));
let checked = 0;
let failed = 0;
try {
  prepare(scratch, KUPCAD);
  for (const example of allExamples()) {
    const script = join(scratch, `example_${checked}.kup`);
    writeFileSync(script, example.code);
    checked++;
    const where = `${relative(process.cwd(), example.file)}:${example.line}`;
    const linted = kupcad(['check', script], scratch);
    if (!linted.ok) {
      failed++;
      console.error(`${where}\n${linted.output.replaceAll(script, 'example')}`);
      continue;
    }
    const ran = kupcad(['run', script], scratch);
    const wrong = ran.ok
      ? misprinted(ran.output, example.expected)
      : raisesAsSaid(ran.output, example.code)
        ? null
        : ran.output;
    if (wrong !== null) {
      failed++;
      console.error(`${where}\n${wrong.replaceAll(script, 'example')}`);
    }
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

console.log(`${checked} examples checked, ${failed} failed`);
process.exit(failed ? 1 : 0);
