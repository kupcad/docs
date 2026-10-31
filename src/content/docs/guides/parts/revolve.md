---
title: 5. Revolve
description: Turning the half section about the axis, and measuring what the mug holds.
sidebar:
  order: 5
---

`revolve` turns a sketch about the y axis, which becomes the model's z axis. The sketch's x is
the distance from the axis, its y the height. That is exactly how the half section was drawn.

## Turn the section

```kupcad
# @title Mug body
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

section.close.revolve
```

That is the mug: round rim, rounded foot, even wall. One outline, turned.

`revolve(90)` would turn only a quarter of the way, if you ever want a cut-away view.

## Measure it

How much does the mug hold? The space inside is the same outline's inner part, filled to the
brim: along the floor, up the inside wall, and straight across the top.

```kupcad
# @title Mug body
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
mug = section.close.revolve

inside = polyline([[0, wall], [radius - wall, wall], [radius - wall, height]]).fillet(wall / 2) +
  polyline([[radius - wall, height], [0, height]])
puts("Holds #{(inside.close.revolve.volume / 1000).round} ml to the brim")

mug
```

`volume` is in mm³; dividing by 1000 gives millilitres. The console says `Holds 368 ml to the
brim`. The script still ends with `mug`: a `puts` prints, it doesn't change the model.

Two paths are joined with `+` here: the inside wall, rounded, and the straight line across the
brim, which gets no rounding.

## Smoother curves

Curves are built from straight edges. The default is fine for most parts; for a smooth mug, ask
for more edges per circle at the top of the script:

```kupcad
CAD.config(resolution: { segments: 96 })
cylinder(d: 80, h: 10)
```

The setting holds for the rest of the script. More segments means a smoother surface and a
bigger file.

## The script so far

The "Measure it" block above.

## In the reference

[revolve](/reference/geometry/sweeps/#revolve) · [volume](/reference/geometry/inspection/#volume)
· [Resolution](/reference/geometry/engine-settings/#resolution)

Next: [Sweep](/guides/parts/sweep/), for the handle.
