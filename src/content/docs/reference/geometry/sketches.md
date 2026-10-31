---
title: Sketches
description: The 2D primitives — square, circle, regular_polygon, polygon and text.
sidebar:
  order: 3
---

The 2D primitives make a `Sketch`: a filled region in the XY plane, which may have holes. Each is
a global function and a class method of `Sketch` (`Sketch.square(10)`). A Sketch becomes a Solid
by a [sweep](/reference/geometry/sweeps/) such as `extrude`.

A Sketch stays in the XY plane. It moves, turns about z, scales and mirrors as a Solid does (see
[Transforms](/reference/geometry/transforms/)), and combines with other Sketches by the same
[booleans](/reference/geometry/booleans/). Its `area` is what it encloses, holes left out.

A Sketch takes `named(name)` and `material(color:)` for its drawing: the name and colour an SVG or
DXF export gives it. They stay through moves, and are not passed to a Solid extruded from it or
to its offset. See [Materials, names and display](/reference/geometry/appearance/).

The argument rules are the same as the [solids'](/reference/geometry/solids/): an unknown
keyword is an `ArgumentError`, a keyword overrides a position, and two keywords for one option
(`r:` and `d:`, `round_r:` and `chamfer:`) are an `ArgumentError`.

## square

```kupcad frame="none"
square(size)
square(x, y, center = false)
square([x, y], center = false)
square(size: [20, 10], center: true, round_r: 2)
```

A rectangle with its sides along the axes. By default its lowest corner is at the origin.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `x`, `y` | Number | 1 | The size along each axis. One positional number sets both. |
| `size` | Number or Array | — | Both sizes: a number for a square, `[x, y]` for a rectangle. |
| `center` | Boolean | `false` | Centre it on the origin. |
| `round_r` | Number | — | Round the corners with this radius (at most half the shorter side). |
| `chamfer` | Number | — | Cut the corners at 45°, this far back along each side. |
| `segments` | Number | 0 | Segments per full turn for the rounded corners; 0 follows the resolution. |

The rounded corners stay arcs in an SVG or DXF drawing.

**Returns:** `Sketch`.

```kupcad
puts square([20, 10]).area              # 200
puts square(10, chamfer: 1).area        # 98
tab = square(20, 10, center: true)
```

## circle

```kupcad frame="none"
circle(r = 1)
circle(d: 10, segments: 64)
circle(r: 5, sides: 6)
```

A circle centred on the origin.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `r` | Number | 1 | The radius. Also `radius:`, or `d:` for the diameter. |
| `segments` | Number | 0 | How finely it is drawn on the mesh engine; 0 follows the resolution. |
| `sides` | Number | — | Make a regular polygon of this many sides (3 to 2048), its first corner on +x. |

A circle exports to SVG and DXF as a true circle, whatever its segments. `sides:` makes the
polygon on both engines; see [sides or segments](/reference/geometry/solids/#sides-or-segments).

**Returns:** `Sketch`.

```kupcad
hole = circle(d: 3.4)
hexagon = circle(r: 5, sides: 6)
```

## regular_polygon

```kupcad frame="none"
regular_polygon(sides = 6, r = 1)
regular_polygon(6, across_flats: 10)
```

A regular polygon centred on the origin, its first corner on +x.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `sides` | Number | 6 | The number of sides, 3 to 2048. |
| `r` | Number | 1 | The radius to the corners. Also `radius:`, or `d:` for the diameter. |
| `across_flats` | Number | — | The distance between opposite sides, a nut's wrench size, instead of `r:`. Even numbers of sides only. |

**Returns:** `Sketch`.

**Raises:** `ArgumentError` for `across_flats:` with an odd number of sides, or with `r:`,
`d:` or `radius:`.

```kupcad
m3_nut = regular_polygon(6, across_flats: 5.5)
puts regular_polygon(6, across_flats: 10).bbox.y_size.round(6)   # 10
```

## polygon

```kupcad frame="none"
polygon(points)
polygon(points, paths)
polygon(points, round_r: 2)
polygon(points, chamfer: 1)
```

A region bounded by straight lines through `points`, `[x, y]` each.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `points` | Array | — | The corners, `[x, y]` each; at least 3. |
| `paths` | Array | — | Several outlines, each an Array of indices into `points` (at least 3). |
| `round_r` | Number | — | Round each corner with the arc of this radius that touches both sides. |
| `chamfer` | Number | — | Cut each corner by the line between the points this far back along each side. |
| `segments` | Number | 0 | Segments per full turn for the rounded corners; 0 follows the resolution. |

Without `paths:`, the points are one outline, closed back to the first point. With `paths:`,
each path is an outline. Outlines fill by the even-odd rule, whichever way they run: an outline
inside another is a hole, and a self-crossing outline (a bow tie) fills both its lobes.

`round_r:` and `chamfer:` ease every corner, concave ones included. Rounded corners stay arcs in
a drawing. They don't apply to the outlines of `paths:` yet.

**Returns:** `Sketch`.

**Raises:** `ValueError` for a point that repeats the one before it, a corner where the outline
doubles back, or, with `round_r:` or `chamfer:`, a side too short for the corners at its ends.
The message names the point: `polygon: the side from point 0 is 10 long, too short for the
corners at its ends, which take 12 of it (round_r = 6)`. `ArgumentError` for `paths:` with
`round_r:` or `chamfer:`.

```kupcad
frame = polygon(
  [[0, 0], [10, 0], [10, 10], [0, 10], [2, 2], [8, 2], [8, 8], [2, 8]],
  paths: [[0, 1, 2, 3], [4, 5, 6, 7]],   # the outline, then a hole
)
puts frame.area                           # 64

bracket = polygon([[0, 0], [30, 0], [30, 5], [5, 5], [5, 20], [0, 20]], round_r: 1)
```

## text

```kupcad frame="none"
text(content, size = 10)
text(content, size: 12, font: "sans", halign: "center", valign: "baseline")
```

The outlines of a line of text, as a Sketch.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `content` | String | — | The text: one line. |
| `size` | Number | 10 | The font size in millimetres (the em). |
| `font` | String, Symbol or Font | `"sans"` | An embedded font by name, or a [Font imported](/reference/inputs/fonts/) from a file. |
| `halign` | String or Symbol | `"left"` | Where the origin is across the text: `left`, `center` or `right`. |
| `valign` | String or Symbol | `"baseline"` | Where the origin is up the text: `baseline`, `bottom`, `center` or `top`. |
| `tolerance` | Number | from the resolution | How far the drawn outline may stray from the font's curves, in mm. At least `size × 0.0001`. |

The embedded fonts:

| Name | Font |
|---|---|
| `"sans"` (also `"default"`) | Roboto, the default |
| `"sans-bold"` (`:sans_bold` as a Symbol) | Roboto Bold, with strokes half again as thick, for text printed small |
| `"mono"` (also `"monospace"`) | Roboto Mono |
| `"serif"` | Roboto Serif |
| `"stencil"` | Allerta Stencil |

Glyphs are kerned as the font says. Without `tolerance:`, they are drawn as finely as the
resolution draws a circle half the text size. A text's curves stay curves in an SVG or DXF
export. A character the font has no glyph for, such as the diameter sign `⌀`, comes from the
[symbol font](/reference/inputs/fonts/#symbols), at the same size and on the same baseline.

**Returns:** `Sketch`.

**Raises:** `ValueError` for a character neither the font nor the symbol font has (a line break, an
emoji, a CJK character in the embedded fonts), naming it. `ArgumentError` for a font name that
doesn't exist, listing the fonts.

```kupcad
label = text("KupCAD", size: 8, font: :sans_bold, halign: :center, valign: :center)
plate = cube(x: 60, y: 20, z: 2).translate(-30, -10, 0)
plate - label.extrude(1).translate(z: 1.5)
```
