---
title: 3. Sketches
description: Flat shapes — squares, circles and polygons — and extruding them into solids.
sidebar:
  order: 3
---

Many parts are easier to draw flat and then give a thickness. A flat shape is a `Sketch`.

## Flat shapes

```kupcad
square([40, 30], round_r: 4)
```

A rectangle, 40 by 30, with rounded corners. Like a cube, it starts at the origin, and
`center: true` centres it.

```kupcad
circle(d: 30)
```

```kupcad
polygon([[0, 0], [30, 0], [15, 20]])
```

A polygon through its points, in order; the last joins back to the first.

Sketches combine with `+`, `-` and `&` just as solids do:

```kupcad
circle(d: 90) - circle(d: 60)
```

That is a ring. A sketch has an `area`, as a solid has a `volume`.

## Extrude

`extrude` pushes a sketch up along z, into a solid:

```kupcad
# @title Coaster
(circle(d: 90) - circle(d: 60)).extrude(3)
```

A flat ring 3 mm thick: a coaster for the mug.

## Offset

`offset` grows or shrinks a sketch by a distance, keeping its shape:

```kupcad
outline = square([40, 30], round_r: 4)
outline - outline.offset(-3)
```

A frame 3 mm wide, with rounded corners inside and out. Offsetting is how you make a wall of
even thickness around any outline.

## Why draw flat first?

A sketch is exact: its circles and arcs stay circles and arcs until the solid is made, and in
an SVG or DXF drawing they stay so for good. And many solids are a sketch turned or swept: the
mug's body is a sketch turned about an axis, its handle a sketch swept along a path. The next
page draws that sketch.

## The script so far

```kupcad
# @title Coaster
(circle(d: 90) - circle(d: 60)).extrude(3)
```

## In the reference

[square, circle, polygon](/reference/geometry/sketches/) · [extrude](/reference/geometry/sweeps/#extrude)
· [offset](/reference/geometry/modifiers/#offset)

Next: [Paths](/guides/parts/paths/), to draw the mug's outline.
