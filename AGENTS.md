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
- A framed ```` ```kupcad ```` block is an example: `npm run check:examples` runs each through
  `kupcad check` (`KUPCAD=../kupcad/core/zig-out/bin/kupcad`), and it must also run with
  `kupcad run`. A comment shows what a line gives (`# 1000`) or raises (`# ValueError`), checked
  by running it. Signatures and deliberately invalid code go in `frame="none"` blocks.
- Lengths are millimetres and angles degrees. Prose is British English, as the kupcad repo's
  docs are (colour, centre); identifiers are as the language spells them (`color:`, `center`).
- Links are absolute with a trailing slash: `/reference/geometry/solids/#cube`. The build puts
  the site's base in front of them (`src/plugins/base-links.mjs`); a component's `href` (the
  landing page's cards and buttons) doesn't pass through it, so write those relative.
- Terse and present tense. No implementation details a script can't see, and nothing hidden
  from scripts (`on_face`, `Workplane`).

## Deployment

`.github/workflows/deploy.yml` builds the site and deploys it to GitHub Pages on every push to
`main`. It first checks the examples against the KupCAD release in `KUPCAD_VERSION`, the one the
reference describes: bump it when the reference is updated for a new release. The site's URL and
base path come from the repository's Pages settings (`SITE_URL`, `BASE_PATH`), so a custom domain
needs no change here.
