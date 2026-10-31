---
title: 5. Revolve
description: Turning the half section about the axis, and measuring what the mug holds.
sidebar:
  order: 5
---

`revolve` turns a sketch about the y axis, which becomes the model's z axis. The sketch's x is
the distance from the axis, its y the height. That is exactly how the half section was drawn.

<figure class="kc-diagram">
<svg viewBox="0 0 360 200" width="360" height="200" role="img" aria-label="A half section drawn with x as the distance from the axis and y as the height, turned about the axis into the mug">
  <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M40 170 L40 20" stroke-dasharray="4 4" />
    <path d="M40 170 L120 170 L120 40 L104 40 L104 154 L40 154" />
    <path d="M40 180 L130 180" /><path d="M124 176 L130 180 L124 184" />
    <path d="M30 170 L30 40" /><path d="M26 46 L30 40 L34 46" />
    <path d="M170 100 L210 100" /><path d="M204 95 L210 100 L204 105" />
    <ellipse cx="290" cy="40" rx="60" ry="12" />
    <path d="M230 40 L230 170 A60 12 0 0 0 350 170 L350 40" />
    <ellipse cx="290" cy="46" rx="48" ry="9" stroke-opacity="0.6" />
  </g>
  <g font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="currentColor">
    <text x="134" y="184">x</text><text x="22" y="34">y</text>
    <text x="48" y="32" opacity="0.7" font-size="12">the axis</text>
    <text x="150" y="92" font-size="12">revolve</text>
  </g>
</svg>
<figcaption>In the sketch, x is the distance from the axis and y the height. Turned about the axis, the half section is the whole mug.</figcaption>
</figure>

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
