# KupCAD documentation

The source of the KupCAD documentation site: the language reference for
[KupCAD](https://github.com/kupcad/kupcad), built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build). Every push to `main` publishes it to GitHub Pages, at
https://docs.kupcad.org/.

## Running it

Requires the Node version in [`.tool-versions`](.tool-versions) and pnpm (12 or later).

```sh
pnpm install
pnpm dev            # the site at http://localhost:4321, reloading as pages change
pnpm build          # the static site in dist/
pnpm preview        # serves dist/
```

Astro keeps the rendered Markdown between builds, so a change to how code blocks render (an
Expressive Code plugin, the grammar) shows on the pages only once that cache is gone:
`rm -rf .astro node_modules/.astro`.

## Checking the examples

Every framed `kupcad` code block on a page is a script that has to work. `pnpm check:examples`
runs each one through `kupcad check`, so an example the language no longer
accepts fails here instead of in a reader's editor. It needs the `kupcad` binary: on the `PATH`,
or given by `KUPCAD`, such as a build from a checkout of the kupcad repo beside this one:

```sh
KUPCAD=../kupcad/core/zig-out/bin/kupcad pnpm check:examples
```

Blocks marked `frame="none"` (signatures, deliberately invalid code) aren't run.

Each of those examples also gets an "Open in playground" link to the website's playground
(kupcad.org/playground), the script in the link's fragment: `#code=` and its UTF-8 in base64url,
which the website reads back (its `src/lib/share.js`). The fragment never reaches a server.

## What's where

| Path | What it is |
|---|---|
| `src/content/docs/index.mdx` | The landing page |
| `src/content/docs/reference/` | The reference, a folder per sidebar section: `language`, `geometry`, `stdlib`, `inputs` (parameters and imports), `tooling` |
| `astro.config.mjs` | The site's title, sidebar, theme and code highlighting |
| `src/styles/theme.css` | The KupCAD brand colours, light and dark, the icon's among them (`--kc-icon-bg`, `--kc-icon-fg`) |
| `public/icon.svg` | KupCAD's icon: the favicon, and drawn in the page (`<use>`) in the header and on the landing page, where the theme colours it |
| `src/components/SiteTitle.astro` | Starlight's site title with the icon drawn in the page |
| `src/components/SocialIcons.astro` | The header's links out (kupcad.org, GitHub), opening in a new tab |
| `src/links.mjs` | The website's addresses the docs link to (`WEBSITE`, `PLAYGROUND`) |
| `src/grammars/kupcad.tmLanguage.json` | KupCAD's TextMate grammar, which highlights `kupcad` code blocks |
| `src/plugins/external-links.mjs` | Makes a Markdown link to another site open in a new tab, with `rel="noopener noreferrer"` |
| `src/plugins/playground-links.mjs` | Adds "Open in playground" under each example |
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
- Link with absolute paths and a trailing slash: `/reference/geometry/solids/#cube`. Links to
  other sites open in a new tab: in Markdown on their own, while a component's link (a landing
  page button) sets `target="_blank"` and `rel="noopener noreferrer"` itself.
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
examples against a KupCAD release is off until the next release (see above). The site is served
at the root of its custom domain, https://docs.kupcad.org (`site` in `astro.config.mjs`, and the
domain in the repository's Pages settings, whose source must be GitHub Actions).
