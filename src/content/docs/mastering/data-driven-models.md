---
title: 9. Data-driven models
description: Models that take their shape from data — structured parameters, JSON files in, parts lists out, and a build that runs on every push.
sidebar:
  order: 9
---

A slider is one number. Real models often take a *list*: the holes in a plate, the gears in a
train, the sizes of a family of parts. KupCAD's parameters take Arrays and Maps, scripts read
JSON files, and a build writes JSON back out. Put together, a model becomes something other
programs can drive.

## Structured parameters

A parameter's default can be an Array or a Map, and its rules follow the default:

```kupcad
holes = param(
  :holes,
  default: [[8, 8], [32, 8], [8, 22], [32, 22]],
  validate: { items: { tuple: [{ min: 0, max: 40 }, { min: 0, max: 30 }] } },
  title: "Hole positions",
)
hole_d = param(:hole_d, default: 3.4, validate: { min: 1, max: 10 }, unit: "mm", title: "Hole diameter")

plate = cube(x: 40, y: 30, z: 3, round_r: 2)
cutters = holes.map { |(x, y)| cylinder(d: hole_d, h: 5).translate(x, y, -1) }
plate.difference(cutters)
```

`items:` gives every element's rules; `tuple:` says each element is a pair, with rules for each
place. A value that breaks a rule is refused with the path to it (`holes[2][1]`), before the
script runs. On the command line an Array or Map is JSON:

```sh
kupcad build plate.kup -p 'holes=[[5, 5], [35, 25]]' -o plate.stl
kupcad build plate.kup -P plate-large.json -o plate-large.stl
```

`-P` takes a whole set of values from a file, which is how a family of parts is built: one
script, one JSON file per member. [Parameters](/reference/inputs/parameters/) lists the kinds
and every rule.

## JSON in

A script can also read data that isn't a parameter — a catalogue of parts, a machine's
description — from a JSON file beside it:

```kupcad
import { name, gears } from "./machine.json"

puts "#{name}: #{gears.size} gears"   # braider: 2 gears

blanks = (0...gears.size).map do |i|
  gear = gears[i]
  cylinder(r: gear[:module] * gear[:teeth] / 2, h: 6).translate(x: 40 * i)
end
union(blanks)
```

An import of a `.json` file gives its value: objects become Maps with Symbol keys, lists
Arrays. `import { name, gears }` takes two keys of the top-level object. The file is read
relative to the script, as a module would be, and the editor rebuilds the model when it
changes. [Data files](/reference/inputs/data-files/) has `import_json` for a path from the
project's root, and what each JSON type becomes.

The same works for a package's data (`import screws from "hardware/screws.json"`), so a
library can ship a catalogue alongside its methods.

## JSON out

A build can report on the model as well as export it:

```sh
kupcad build gearbox.kup -o gearbox.3mf --bom gearbox.json
kupcad doc gearbox.kup
```

`--bom` writes the [parts list](/reference/geometry/assemblies/#parts-lists): each distinct
part once, with its count, volume, size, density and mass. A model that names its parts and
gives them a material has a bill of materials for free; the
[spiral staircase](/mastering/spiral-staircase/) reports fourteen of its one step.

`kupcad doc` writes the script's metadata and parameters — names, kinds, defaults, rules,
titles, groups — without running it. That is what the playground and the IDE build their
panels from, and what a web shop or a configurator would use to build its own.

A script can also write files itself: `part.export_stl("out/part.stl")` and the other
[export methods](/reference/geometry/export/#export-methods), one per part if it likes.

## A build on every push

Everything above is a command that exits 0 or 1, so a project builds in CI like software does.
[Build and check in CI](/recipes/parts-list-in-ci/) is the recipe; in outline:

```yaml
- run: kupcad fmt --check .
- run: kupcad check --max-warnings 0 .
- run: kupcad build parts/bracket.kup -o out/bracket.3mf --bom out/bracket.json
- run: kupcad build parts/bracket.kup -P sizes/large.json -o out/bracket-large.3mf
- run: kupcad build parts/bracket.kup --split out/parts/
```

Pin the KupCAD version in the workflow, so the same script builds the same part next year.
Keep a script of assertions in the repository and run it too; the next page shows how.

## Putting it together

A data-driven model, end to end: a JSON file of the holes a board needs; a script with a
`holes` parameter whose default is a reasonable board; a CI job that builds the plate for each
board file in a folder and uploads the STLs and the parts lists. Nothing in that pipeline edits
the script, which is the point: the script is the design, the data is the instance.

[Parameters](/reference/inputs/parameters/) · [Data files](/reference/inputs/data-files/) ·
[Parts lists](/reference/geometry/assemblies/#parts-lists) · [kupcad build](/reference/tooling/cli/#kupcad-build) ·
[kupcad doc](/reference/inputs/parameters/#kupcad-doc) · [Build and check in CI](/recipes/parts-list-in-ci/)

Next: [Performance](/mastering/performance/).
