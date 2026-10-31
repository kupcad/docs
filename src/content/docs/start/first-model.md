---
title: Your first model
description: A parametric plate with four holes, in ten lines, exported for a printer.
sidebar:
  order: 2
---

A KupCAD script makes shapes and combines them. The last value in the script is the model.
Here is a whole one:

```kupcad
# @title Plate
plate = cube(x: 40, y: 30, z: 4, round_r: 2)
hole = cylinder(d: 3.4, h: 10).translate(z: -1)
holes = [[5, 5], [35, 5], [5, 25], [35, 25]].map { |(x, y)| hole.translate(x, y, 0) }

plate.difference(holes)
```

Open it in the playground (the link under the code) and you see a plate with four holes.

Line by line:

- `cube(x: 40, y: 30, z: 4, round_r: 2)` is a box, 40 by 30 by 4 mm, with its vertical edges
  rounded. Lengths are millimetres.
- `cylinder(d: 3.4, h: 10)` is a hole's shape. `.translate(z: -1)` moves it down a little, so it
  cuts right through the plate: 1 mm below, 5 mm above.
- `.map { |(x, y)| ... }` makes a copy of the hole at each of the four corners. The block runs
  once per pair of coordinates.
- `plate.difference(holes)` takes the holes out of the plate. That is the last value, so it is
  the model.

## Parameters

A number you might want to change later can be a parameter. Replace the first line:

```kupcad
# @title Plate
width = param(:width, default: 40, validate: { min: 20, max: 120 }, unit: "mm")

plate = cube(x: width, y: 30, z: 4, round_r: 2)
hole = cylinder(d: 3.4, h: 10).translate(z: -1)
holes = [[5, 5], [width - 5, 5], [5, 25], [width - 5, 25]].map { |(x, y)| hole.translate(x, y, 0) }

plate.difference(holes)
```

`param` declares `width` with a default and a range. The playground, the IDE, VS Code and the
desktop app show a slider for it; move the slider and the plate follows, holes and all.

## Export

With the `kupcad` command:

```sh
kupcad build plate.kup -o plate.stl
kupcad build plate.kup -p width=60 -o plate-60.3mf
```

The first writes an STL. The second gives `width` a value and writes a 3MF, which a slicer
opens with the model's parts and colours. In the playground and the apps, the Export menu does
the same.

## Next

- [The language](/guides/language/first-script/): values, methods, blocks and the rest, in ten
  short pages.
- [Making parts](/guides/parts/solids/): a guide that builds a coffee mug and a gearbox.
- [The reference](/reference/): every shape, method and command.
