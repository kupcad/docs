// The files the examples read, put beside them before they run: the fixtures kept in
// scripts/fixtures (data, fonts, a package), and the meshes and drawings, built by the kupcad
// binary from small scripts here so no binary file is kept in the repository.

import { spawnSync } from 'node:child_process';
import { copyFileSync, cpSync, mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FIXTURES = new URL('../fixtures/', import.meta.url).pathname;
const BUILD_TIMEOUT_MS = 120_000;

/**
 * @param {string} dir where the examples run
 * @param {string} kupcad the binary
 */
export function prepare(dir, kupcad) {
  cpSync(FIXTURES, dir, { recursive: true });
  mkdirSync(join(dir, 'parts'), { recursive: true });
  const build = (
    /** @type {string} */ script,
    /** @type {string} */ code,
    /** @type {string[]} */ outs,
  ) => {
    writeFileSync(join(dir, script), code);
    const built = spawnSync(kupcad, ['build', script, ...outs.flatMap((out) => ['-o', out])], {
      cwd: dir,
      timeout: BUILD_TIMEOUT_MS,
      encoding: 'utf8',
    });
    if (built.status !== 0) {
      throw new Error(`${outs.join(', ')} weren't built:\n${built.stdout}${built.stderr}`);
    }
  };
  // The meshes, from a cube
  build('mesh.kup', 'cube(10)\n', ['scan.stl', 'parts/bracket.obj', 'plate.3mf']);
  copyFileSync(join(dir, 'scan.stl'), join(dir, 'scan.bin'));
  renameSync(join(dir, 'plate.3mf'), join(dir, 'plate.data'));
  // The drawings: a DXF of closed outlines on `cut` and `holes` layers, and an SVG with an open
  // line too
  build(
    'dxf.kup',
    '[square(40, 30, round_r: 3).named("cut"), circle(d: 3).translate(5, 5).named("holes")]\n',
    ['bracket.dxf'],
  );
  build('svg.kup', '[square(20).named("box"), line([0, 25], [20, 25])]\n', ['box.svg']);
}
