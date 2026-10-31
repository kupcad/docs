## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Writing the reference

The reference under `src/content/docs/reference/` documents the KupCAD language from its
implementation, the `kupcad` repo (`core/src/stdlib/manifest.zig`, `core/src/stdlib/classes/`,
`core/docs/README.md`). Where the code and the spec disagree, the pages follow what the
`kupcad` binary does.

- One `.md` file per page, with `title`, a one-sentence `description` and `sidebar.order` in its
  frontmatter. A section's pages are listed by `autogenerate` in `astro.config.mjs`.
- An API page gives each member a heading of its name (`## cube`, or `### each` under a
  `## Iteration` category), so its anchor is the name (`#contains` for `contains?`).
- A member's call forms come first in a ```` ```kupcad frame="none" ```` block, then what it
  does in a few sentences, a `Parameter | Type | Default | Description` table, **Returns:**,
  **Raises:** for the errors specific to it, and an example.
- A framed ```` ```kupcad ```` block is an example: `pnpm check:examples`
  (`KUPCAD=../kupcad/core/zig-out/bin/kupcad`) lints it with `kupcad check`, runs it with
  `kupcad run`, and compares what each `puts` line prints with its comment (`puts x   # 1000`;
  `# 0, 0.5, 1` for a loop's lines); an example that stops with an error passes when a comment
  names the error's class (`# KeyError`). An example that reads a file gets it from
  `scripts/fixtures` (data, fonts, a package; the meshes and drawings built by the binary).
  Signatures and deliberately invalid code go in `frame="none"` blocks. Under each example the
  page shows its picture (`pnpm render:examples` draws every buildable example into
  `public/examples/`, not committed), "Edit here" for one that starts with `# @title` (the
  playground on the page, `src/scripts/try-here.js`) and "Open in playground"
  (`src/plugins/playground-links.mjs`), so an example should also run in the playground on its
  own.
- The guides (`start/`, `guides/`, `mastering/`, `recipes/`) are tutorials: one idea a page, plain words,
  each page ending with the script so far and links into the reference; they never repeat a
  method's parameter table.
- Lengths are millimetres and angles degrees. Prose is British English, as the kupcad repo's
  docs are (colour, centre); identifiers are as the language spells them (`color:`, `center`).
- Links are absolute with a trailing slash: `/reference/geometry/solids/#cube`. A Markdown link
  to another site opens in a new tab with `rel="noopener noreferrer"`
  (`src/plugins/external-links.mjs`); a component's link (the landing page's buttons, the
  header's) doesn't pass through it, so it sets the same attributes itself.
- Terse and present tense. No implementation details a script can't see, and nothing hidden
  from scripts (`on_face`, `Workplane`).

## Deployment

`.github/workflows/deploy.yml` builds the site and deploys it to GitHub Pages on every push to
`main`: it downloads the KupCAD release the reference describes (`KUPCAD_VERSION`), checks every
example against it, draws their pictures in headless Chromium, and builds. A reference page that
describes something newer than that release fails the check: bump `KUPCAD_VERSION` (and the
version named on `reference/index.md`) with each release. The site is served at the root of its
custom domain, https://docs.kupcad.org (`site` in `astro.config.mjs`).
