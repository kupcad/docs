---
title: 4. Paths
description: Lines and arcs, corner by corner, rounded with fillet and closed into a sketch.
sidebar:
  order: 4
---

A `Path` is a line you draw point by point: straight segments and arcs. It encloses nothing
until you `close` it, and then it is a sketch.

We draw half of the mug: a cut through it, from the middle out. Turned about the middle, that
half becomes the whole mug.

## The half section

Think of the mug cut down the middle, and look at the right half. Starting at the centre of the
floor and going round: along the floor to the outside, up the outside wall, in over the rim,
down the inside wall to the floor, and back to the centre.

```kupcad
radius = 40
height = 95
wall = 4

polyline([
  [0, 0],
  [radius, 0],
  [radius, height],
  [radius - wall, height],
  [radius - wall, wall],
  [0, wall],
])
```

`polyline` joins the points with straight lines. On its own a path is drawn as a line; the
playground shows it flat.

In a path, x is the distance from the mug's centre and y the height. Those are the only two
numbers each point needs.

## Round the corners

Sharp corners are not what a mug has. `fillet` rounds every corner:

```kupcad
radius = 40
height = 95
wall = 4

polyline([
  [0, 0],
  [radius, 0],
  [radius, height],
  [radius - wall, height],
  [radius - wall, wall],
  [0, wall],
]).fillet(wall / 2)
```

Each corner becomes an arc of radius 2 mm, half the wall. The rim, which is `wall` wide, becomes
a half circle. The two ends of the path, on the centre line, stay as they are.

## Close it

`close` joins the end back to the start and gives a sketch. To see it as a solid for a moment,
extrude it:

```kupcad
# @title Half section
radius = 40
height = 95
wall = 4

section = polyline([
  [0, 0],
  [radius, 0],
  [radius, height],
  [radius - wall, height],
  [radius - wall, wall],
  [0, wall],
]).fillet(wall / 2)

section.close.extrude(2)
```

A flat plate in the shape of the half section. On the next page it is turned instead.

## Other paths

`line` and `arc` make paths too, and `+` joins paths end to end. `line_to` and `arc_to`
continue one. `stroke` gives a path a width, for drawing a line as a shape rather than
enclosing one.

## The script so far

The block above, under "Close it".

## In the reference

[Paths](/reference/geometry/paths/): polyline, arc, fillet, close, stroke.

Next: [Revolve](/guides/parts/revolve/), to turn the section into the mug.
