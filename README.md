# KupCAD documentation

The source of the KupCAD documentation site: the language reference for
[KupCAD](https://github.com/kupcad/kupcad), built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build). Every push to `main` publishes it to GitHub Pages, at
https://docs.kupcad.org/.

## Running it

Requires the Node version in [`.tool-versions`](.tool-versions) and npm.

```sh
npm install
npm run dev         # the site at http://localhost:4321, reloading as pages change
npm run build       # the static site in dist/
npm run preview     # serves dist/
```

## Checking the examples

Every framed `kupcad` code block on a page is a script that has to work. `npm run
check:examples` runs each one through `kupcad check`, so an example the language no longer
accepts fails here instead of in a reader's editor. It needs the `kupcad` binary: on the `PATH`,
or given by `KUPCAD`, such as a build from a checkout of the kupcad repo beside this one:

```sh
KUPCAD=../kupcad/core/zig-out/bin/kupcad npm run check:examples
```

Blocks marked `frame="none"` (signatures, deliberately invalid code) aren't run.

## What's where

| Path | What it is |
|---|---|
| `src/content/docs/index.mdx` | The landing page |
| `src/content/docs/reference/` | The reference, a folder per sidebar section: `language`, `geometry`, `stdlib`, `inputs` (parameters and imports), `tooling` |
| `astro.config.mjs` | The site's title, sidebar, theme and code highlighting |
| `src/styles/theme.css` | The KupCAD brand colours, light and dark |
| `src/grammars/kupcad.tmLanguage.json` | KupCAD's TextMate grammar, which highlights `kupcad` code blocks |
| `src/plugins/base-links.mjs` | Puts the site's base path in front of the pages' links |
| `scripts/check-examples.mjs` | The example check |
| `.github/workflows/deploy.yml` | Builds and deploys the site |

## Writing pages

The reference documents the language from its implementation, the kupcad repo's stdlib
(`core/src/stdlib/`) and spec (`core/docs/README.md`). Where the two disagree, a page follows
what the `kupcad` binary does. [AGENTS.md](AGENTS.md) has the full conventions; in short:

- One `.md` file per page, with `title`, a one-sentence `description` and `sidebar.order` in its
  frontmatter. A new page in a section's folder appears in the sidebar on its own.
- An API page gives each member a heading of its name, then its call forms in a
  `frame="none"` block, a parameter table, **Returns:**, **Raises:** and an example.
- Link with absolute paths and a trailing slash: `/reference/geometry/solids/#cube`. The build
  adds the base path, except to a component's `href`, so links on the landing page are relative.
- Lengths are millimetres, angles degrees, and the prose British English, as the kupcad repo's
  docs are.

## Keeping in step with KupCAD

- **Highlighting:** the grammar is a copy of the one the kupcad repo generates. When the language
  gains keywords or built-ins, regenerate it there (`cd core && zig build grammar`) and copy
  `packages/kupcad-vscode/syntaxes/kupcad.tmLanguage.json` to `src/grammars/`.
- **Colours:** `theme.css` uses the values of the `--kc-*` tokens in the kupcad repo's
  `packages/kupcad-ui/src/tokens.css`, so the docs match the playground and the desktop app.
  Change them there first.
- **Release:** the reference follows kupcad's main branch, ahead of the 0.1.0 release, so the
  deploy workflow doesn't check the examples yet. Once a release has caught up, uncomment its
  Install KupCAD and Check examples steps and set `KUPCAD_VERSION` to that release; bump it with
  each release after.

## Deployment

[`deploy.yml`](.github/workflows/deploy.yml) runs on every push to `main`, and on demand from the
Actions tab. It builds the site and deploys it with `actions/deploy-pages`; checking the
examples against a KupCAD release is off until the next release (see above). The site's URL and base path come from the repository's Pages
settings, so adding a custom domain needs no change here. Pages must be enabled with GitHub
Actions as its source (Settings → Pages).
