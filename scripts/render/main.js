// The page scripts/render-examples.mjs screenshots: @kupcad/ui's viewer on the model the address
// names (`?model=<file>.glb` or `.svg`, served beside the page), framed whole, with the grid
// and the axes as the playground shows a model, in the light theme or the dark (`&theme=dark`).
// `data-ready` on the body says it is drawn, or `data-failed` why not.

import { DARK, LIGHT, Viewer } from '@kupcad/ui/viewer';

const canvas = /** @type {HTMLCanvasElement} */ (document.querySelector('canvas'));
const params = new URLSearchParams(location.search);
const file = params.get('model') ?? '';
const theme = params.get('theme') === 'dark' ? DARK : LIGHT;

try {
  const viewer = new Viewer(canvas, { environment: 'grid', motionMs: 0, theme });
  const response = await fetch(file);
  if (!response.ok) throw new Error(`${file}: ${response.status}`);
  const model = file.endsWith('.svg')
    ? /** @type {const} */ ({ kind: '2d', svg: await response.text() })
    : /** @type {const} */ ({ kind: '3d', glb: new Uint8Array(await response.arrayBuffer()), parts: [] });
  await viewer.setModel(model);
  viewer.fit({ instant: true });
  // Drawn once more after the fit, before the screenshot reads the canvas
  await viewer.screenshot();
  document.body.dataset.ready = 'true';
} catch (error) {
  document.body.dataset.failed = error instanceof Error ? error.message : String(error);
}
