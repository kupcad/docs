---
title: Where next
description: What these pages left out, and where each thing is explained.
sidebar:
  order: 12
---

Six builds and five chapters don't cover the language, and weren't meant to. This is what they
skipped, and where it is.

## More to build

The [examples](/examples/) hold nine more complete, parametric parts, each a click from the
playground: the coffee mug and the planetary gearbox that the
[Making parts](/guides/parts/solids/) guide builds from the first line; a project box with a
lid that fits; a grid organizer; an antenna standoff; a twisted vase; a phone stand; a hex bit
holder; a name tag that is also a laser-cut drawing; and a text sampler. Read a script, move a
slider, change a line.

The [recipes](/recipes/countersunk-holes/) are shorter: one problem, one solution —
countersunk holes, text on a face, a printed thread, modifying an STL, building in CI.

## What the builds didn't use

| | Where |
|---|---|
| Spheres, cones, tori, polyhedra | [Solids](/reference/geometry/solids/) |
| `hull` and `minkowski` | [Booleans](/reference/geometry/booleans/) |
| `loft` between sketches, `shell` on solids, `slice` and `project` | [Sweeps](/reference/geometry/sweeps/), [Modifiers](/reference/geometry/modifiers/) |
| Fillets and chamfers on solids | [Finishing](/guides/parts/finishing/), [Modifiers](/reference/geometry/modifiers/) |
| Gears | [Gears](/guides/parts/gears/) |
| `align`, `center`, `mirror`, `scale`, `transform` | [Transforms](/reference/geometry/transforms/) |
| Importing STL, OBJ, 3MF and STEP meshes, and modifying them | [Meshes](/reference/inputs/meshes/), [Modify an STL](/recipes/modify-an-stl/) |
| Importing SVG and DXF drawings | [Drawings](/reference/inputs/drawings/) |
| Your own fonts, and right-to-left text | [Fonts](/reference/inputs/fonts/) |
| Drawings for a laser or a plotter: `stroke`, `project`, SVG and DXF export | [Drawings](/guides/parts/drawings/), [Export](/reference/geometry/export/) |
| Classes, inheritance, modules | [Classes and modules](/reference/language/classes-and-modules/) |
| Maps, Strings, Symbols, Ranges, Math | [Standard library](/reference/stdlib/kernel/) |
| What differs from Ruby | [Coming from Ruby or OpenSCAD](/guides/language/coming-from/), [Ruby differences](/reference/language/ruby-differences/) |
| The language server, the viewport, the editor | [Language server](/reference/tooling/language-server/), [Tooling](/guides/language/tooling/) |
| Exact geometry and STEP | [Engine settings](/reference/geometry/engine-settings/#the-b-rep-engine-today) |

## Everything, on one page

The [cheat sheet](/cheat-sheet/) has every common shape, operation and method with its
signature, and the [glossary](/glossary/) says what the words mean. When you know what you
want and not what it is called, start there.

## Keep in touch

KupCAD is developed in the open at [github.com/kupcad/kupcad](https://github.com/kupcad/kupcad).
A model that doesn't build, a page that is wrong, an example you'd like to see: open an issue.
A part you have made and are proud of: the examples folder takes pull requests.
