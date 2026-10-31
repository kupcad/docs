---
title: 8. Many files
description: Splitting a project into scripts with import and export, reading data files, and using packages.
sidebar:
  order: 8
---

One script is fine for one part. A project with several parts, or a library you reuse, is
several files.

## export and import

A file says what it offers with `export`:

```kupcad frame="none"
# hardware.kup
M3 = 3.4

def bolt_hole(h) = cylinder(d: M3, h: h)

export M3, bolt_hole
```

Another file takes what it needs with `import`:

```kupcad frame="none"
# bracket.kup
import { M3, bolt_hole } from "./hardware.kup"

cube(20) - bolt_hole(30).translate(10, 10, -5)
```

The path is relative to the file that imports. Only exported names cross over; everything else
in `hardware.kup` stays its own. `import name from "./file.kup"`, without braces, imports one
name.

## Each file has its own scope

A module's methods use the module's own variables, wherever they are called from. Two files
can both have a variable called `wall` without clashing.

## Data files

A JSON file is imported the same way, and becomes a value:

```kupcad frame="none"
import sizes from "./sizes.json"

cube(sizes[:width])
```

With `{"width": 40}` in `sizes.json`, `sizes[:width]` is `40`. Meshes (STL, OBJ, 3MF), drawings
(SVG, DXF) and fonts import too; see the reference.

## Packages

A library someone else wrote comes as a package: a folder of KupCAD files, usually a git
repository. The project lists it in `kupcad.json` and installs it:

```sh
kupcad pkg init
kupcad pkg add hardware=github.com/kupcad-libs/hardware@^1.2
kupcad pkg install
```

Then it imports like a local file, by its alias:

```kupcad frame="none"
import { bolt } from "hardware"
```

`kupcad.lock` pins the exact version, so a build is the same on every machine.

## In the reference

[Imports and exports](/reference/language/imports/) · [Data files](/reference/inputs/data-files/)
· [Packages](/reference/inputs/packages/)

Next: [Tooling](/guides/language/tooling/).
