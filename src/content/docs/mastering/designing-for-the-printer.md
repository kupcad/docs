---
title: 7. Designing for the printer
description: Orientation, overhangs, clearances, wall thicknesses, cutting all the way through, and checking fits in the script before anything is printed.
sidebar:
  order: 7
---

A model is right when it prints right. The six builds each made a choice for the printer; this
page collects them, and adds what KupCAD can check for you.

## Orientation

Decide which face goes on the bed while you draw, and draw the part that way up. The
[phone stand](/examples/) is three plates standing on the base; the
[parabolic dish](/mastering/parabolic-dish/) is drawn the right way up but printed rim down,
and its page says so. A part the slicer must turn over is a part someone will print wrong.
When a part has a best orientation that isn't how it is drawn, turn it at the end:

```kupcad
bowl = sphere(d: 40) - sphere(d: 36) & cube(40, center: true).translate(z: -20)
flipped = bowl.rotate(180, 0, 0)
flipped.translate(z: -flipped.bbox.z_min)
```

`-bbox.z_min` after the turn puts the lowest point on z = 0, where the bed is.

## Overhangs

A face that leans more than about 45° from vertical needs support. The jar's threads have 30°
flanks and print clean; the fan wheel's blades at 35° do too. When a shape must overhang,
choose the version of it that doesn't: a chamfer under a hole instead of a flat ceiling, a
trapezoid thread instead of a square one, a dome instead of a flat-topped box. A hole drawn
across the layers (the hinge's bore) is a bridge, which prints well up to a few millimetres;
a hole drawn down the layers is a circle, which prints well at any size.

## Clearances

Two printed parts that should move, or should fit, need a gap drawn between them. These are
the gaps the builds use, for PLA on a typical 0.4 mm nozzle at 0.2 mm layers:

| Fit | Gap | Where |
|---|---|---|
| A bit in a socket: snug, pulls out | 0.1 – 0.2 mm | [Hex bit holder](/examples/), `clearance: 0.2` |
| A plug in a hole: pushes in, stays | 0.2 – 0.3 mm | [Honeycomb wall](/mastering/honeycomb-wall/), `clearance: 0.3` |
| Parts that turn, printed in place | 0.3 – 0.4 mm | [Hinge](/mastering/hinge/), `clearance: 0.3` |
| A thread that turns freely | 0.3 – 0.5 mm | [Screw-top jar](/mastering/screw-top-jar/), `clearance: 0.4` |
| A lid that lifts off | 0.2 mm each side | [Project box](/examples/) |

Make the gap a parameter, as every build does, so the person printing can tune it without
reading the script: printers differ by a tenth of a millimetre or so in how much they swell a
hole. Add the clearance to the hole, not to the part, when one of the two is a bought part
(a bit, a shaft, a bearing) whose size is fixed.

## Walls

A wall prints as whole lines of filament: a 0.4 mm nozzle lays a line about 0.45 mm wide, so a
wall 0.9 mm thick is two lines and 1.2 mm leaves a gap the slicer fills badly. Choose
thicknesses near multiples of the line width: 0.9, 1.35, 1.8 (the honeycomb's web), 2.25. The
twisted vase's `wall: 2.4` and `step: 0.4` keep the slider on usable values. A floor is layers:
0.6 to 1 mm, three to five of them.

## Cutting all the way through

A cutter that ends exactly on a face leaves a skin, or nothing, depending on rounding. Make
every cut longer than what it cuts, at both ends:

```kupcad
block = cube(x: 30, y: 20, z: 10)
hole = cylinder(d: 5, h: 10 + 2).translate(15, 10, -1)
block - hole
```

The `+ 2` and `-1` are the habit. The same goes for parts that should fuse: overlap them by a
little (the hinge's leaves reach a millimetre into their knuckles, the fan's blades start
inside the hub) so the union has no zero-thickness seam.

## Checking fits in the script

A clearance is a promise about the finished model, and the model can keep it. These checks
cost little and stop a bad change at build time:

```kupcad
CAD.config(resolution: { segments: 48 })

clearance = 0.3
pin = cylinder(d: 3, h: 20)
sleeve = cylinder(d: 6, h: 20) - cylinder(d: 3 + 2 * clearance, h: 22).translate(z: -1)

assert(pin.min_gap(sleeve, 1).round(2) >= clearance) { "the pin touches the sleeve" }
assert(!pin.intersects?(sleeve)) { "the pin overlaps the sleeve" }
puts pin.min_gap(sleeve, 1).round(2)   # 0.3

assemble(name: "Pin in sleeve", parts: [pin.named("pin"), sleeve.named("sleeve")])
```

- [`min_gap`](/reference/geometry/inspection/#min_gap) is the shortest distance between two
  solids; the second argument stops the search at that distance.
- [`intersects?`](/reference/geometry/inspection/#intersects) says whether two solids share
  any volume.
- [`assert`](/reference/stdlib/kernel/#assert) fails the build with the block's message when
  its condition is false. A failed assertion is an error like any other: the editor shows it
  on the line, `kupcad build` exits 1.

The `CAD.config` line is part of the fit. At the default resolution a 3 mm circle is drawn with
six edges, and a six-sided pin in a six-sided bore can touch where their corners meet: the gap
measures 0, and the print fuses. Anything that must fit another part needs its circles drawn
round, with `segments:` on the call or a resolution for the script.

Measure what the print must get right: a bbox against the bed size, a wall against a minimum,
a volume against the spool. [Keeping it correct](/mastering/keeping-it-correct/) has more on
assertions and warnings.

## Several parts

An [assembly](/reference/geometry/assemblies/) keeps parts apart; a union fuses them. Export
an assembly as 3MF and the slicer gets each part as an object, placed, which is right for
parts printed together in place (the hinge) and for colouring parts apart. Export it with
`--split` and each part is a file of its own, as it was made and not placed, which is right for
parts printed separately (the staircase's column and step). The parts list (`--bom`) says how
many of each to print.

[Inspection](/reference/geometry/inspection/) · [assert](/reference/stdlib/kernel/#assert) ·
[Assemblies](/reference/geometry/assemblies/) · [Export](/reference/geometry/export/) ·
[Finishing](/guides/parts/finishing/)

Next: [Structuring a script](/mastering/structuring-a-script/).
