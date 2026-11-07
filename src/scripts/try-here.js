// "Edit here" under an example (src/plugins/playground-links.mjs): the playground, opened on the
// page under the example's code, on that script. The playground, the core's WebAssembly and
// three.js are loaded only when a button is pressed, once for the page; a second press closes
// it again. Light or dark as the page is: the playground's tokens (@kupcad/ui/tokens.css, in
// every page's styles with Footer.astro) follow the root's data-theme, which Starlight sets.

/** @type {Promise<{ mount: typeof import('svelte').mount, unmount: typeof import('svelte').unmount, Playground: typeof import('@kupcad/playground').Playground }> | null} */
let loading = null;

/** The playground's modules, loaded once. */
function load() {
  loading ??= Promise.all([import('svelte'), import('@kupcad/playground')]).then(
    ([svelte, playground]) => ({
      mount: svelte.mount,
      unmount: svelte.unmount,
      Playground: playground.Playground,
    }),
  );
  return loading;
}

/** The playgrounds open, by their buttons. @type {Map<HTMLButtonElement, () => void>} */
const open = new Map();

/**
 * Opens the playground under the example `button` belongs to, or closes it.
 * @param {HTMLButtonElement} button
 */
async function toggle(button) {
  const close = open.get(button);
  if (close) {
    close();
    return;
  }
  const frame = button.closest('.expressive-code');
  if (!frame) return;
  button.disabled = true;
  button.textContent = 'Loading…';
  try {
    const { mount, unmount, Playground } = await load();
    const host = document.createElement('div');
    host.className = 'kc-try-playground not-content';
    frame.after(host);
    const playground = mount(Playground, {
      target: host,
      props: { source: button.dataset.code ?? '', name: 'example' },
    });
    open.set(button, () => {
      unmount(playground);
      host.remove();
      open.delete(button);
      button.textContent = 'Edit here';
    });
    button.textContent = 'Close';
  } catch (error) {
    button.textContent = 'Edit here';
    console.error("The playground didn't open:", error);
  } finally {
    button.disabled = false;
  }
}

document.addEventListener('click', (event) => {
  const button = event.target instanceof Element ? event.target.closest('button.kc-try') : null;
  if (button instanceof HTMLButtonElement) void toggle(button);
});
