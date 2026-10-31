---
title: 11. Drawings
description: Two-dimensional output — a section through a solid, its outline, and lines for a laser cutter — as SVG and DXF.
sidebar:
  order: 11
---

Not everything is printed. A gasket is cut from a sheet, a panel is engraved, a drawing goes
in a manual. KupCAD writes SVG and DXF for those, from sketches and paths or from a solid.

## A sketch is a drawing

A script whose model is a sketch exports as a drawing:

```kupcad
# @title Gear blank
circle(r: 20) - circle(d: 5) - circle(d: 3).translate(x: 12).repeat_polar(6)
```

```sh
kupcad build blank.kup -o blank.svg
kupcad build blank.kup -o blank.dxf --stroke-width 0.05
```

The circles stay circles in the file; nothing is turned into little straight lines.
`--stroke-width` sets the outline's width, for a laser that wants a hairline.

## A section through a solid

```kupcad
# @title Gear section
gear = (circle(r: 20) + square([4, 6], center: true).translate(x: 21).repeat_polar(12)).extrude(8)
gear.slice(4)
```

`slice(z)` cuts a solid at a height and gives the sketch of the cut. `project` gives its outline
seen from above, the shadow it casts:

```kupcad
taper = square(20, center: true).extrude(10, scale: 0.5)
taper.project
```

## Lines

A path has no area; to draw it as a line with a width, `stroke` it:

```kupcad
# @title Cup icon
rim = polyline([[-20, 30], [-20, 10]]) + arc(center: [0, 10], r: 20, start: 180, sweep: 180) +
  polyline([[20, 10], [20, 30]])
handle = polyline([[20, 25], [28, 25]]).arc_to([28, 13], r: 6, ccw: false).line_to([20, 12])
rim.stroke(2) + handle.stroke(2)
```

A cup, drawn as lines 2 mm wide. The rim and the handle are two paths, since they don't meet
end to end; stroked, they are sketches, which `+` unites. The
[cup example](https://github.com/kupcad/kupcad/blob/main/examples/cup.kup) makes a fuller icon
this way, with parameters.

## Mixing

A 2D export draws every sketch and path in the model, and each solid as its silhouette. A 3D
export refuses a sketch or a path: extrude it, or leave it out.

## In the reference

[slice, project](/reference/geometry/modifiers/#slice) · [stroke](/reference/geometry/paths/#stroke)
· [SVG and DXF](/reference/geometry/export/#svg)

Next: [Threads, lofts and speed](/guides/parts/threads/).
