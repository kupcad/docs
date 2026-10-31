---
title: 6. Sweep
description: The handle — a small profile swept along a path, and a limit found with min.
sidebar:
  order: 6
---

A handle is a band bent into a C. In KupCAD that is a `sweep`: a small sketch, the band's cross
section, pushed along a path.

## The path

The path is a C, drawn flat: from high on the mug's side, out, down, and back in low on the
side. It starts and ends just inside the wall, so the handle is sunk into it.

```kupcad
radius = 40
height = 95
wall = 4
reach = 22

top = height * 0.78
bottom = height * 0.22
start = radius - wall / 2
polyline([[start, top], [radius + reach, top], [radius + reach, bottom], [start, bottom]])
```

`reach` is how far the handle stands out from the mug.

## The profile

The band's cross section: a small rounded rectangle, twice the wall wide and three times the
wall tall.

```kupcad
wall = 4
square([wall * 2.2, wall * 3], center: true, round_r: wall * 1.1)
```

`center: true` matters: a sweep puts the profile's origin on the path, so a centred profile
rides along the middle of it.

## Sweep it

```kupcad
# @title Handle
radius = 40
height = 95
wall = 4
reach = 22

top = height * 0.78
bottom = height * 0.22
start = radius - wall / 2
path = polyline([[start, top], [radius + reach, top], [radius + reach, bottom], [start, bottom]])
grip = square([wall * 2.2, wall * 3], center: true, round_r: wall * 1.1)
grip.sweep(path.fillet(10)).rotate(90, 0, 0)
```

The path's two corners are rounded with `fillet(10)`, so the handle bends instead of turning
sharply. The sweep lies flat in the XY plane, as the path does; `rotate(90, 0, 0)` stands it
up, so its height runs along z like the mug's.

## How far can it bend?

A fillet needs room: the two corners share the handle's upright side, which is `top - bottom`
long, so each bend can be at most half of that. And a bend wider than the reach would curl the
handle back on itself. The bend is the smaller of the two:

```kupcad
height = 95
reach = 22
top = height * 0.78
bottom = height * 0.22

bend = [reach * 0.6, (top - bottom) / 2].min
puts bend   # 13.2
```

`[a, b].min` is the smaller of two numbers. On a short mug, the upright side limits the bend
and the handle comes out as a half circle; on a tall one, the reach does. Either way the fillet
fits.

## The script so far

The mug and the handle together:

```kupcad
# @title Mug with handle
radius = 40
height = 95
wall = 4
reach = 22

section = polyline([
  [0, 0],
  [radius, 0],
  [radius, height],
  [radius - wall, height],
  [radius - wall, wall],
  [0, wall],
]).fillet(wall / 2)
mug = section.close.revolve

top = height * 0.78
bottom = height * 0.22
start = radius - wall / 2
path = polyline([[start, top], [radius + reach, top], [radius + reach, bottom], [start, bottom]])
bend = [reach * 0.6, (top - bottom) / 2].min
grip = square([wall * 2.2, wall * 3], center: true, round_r: wall * 1.1)
handle = grip.sweep(path.fillet(bend)).rotate(90, 0, 0)

mug + handle
```

## In the reference

[sweep](/reference/geometry/sweeps/#sweep) · [fillet](/reference/geometry/paths/#fillet) ·
[Array min](/reference/stdlib/array/)

Next: [Finishing a part](/guides/parts/finishing/).
