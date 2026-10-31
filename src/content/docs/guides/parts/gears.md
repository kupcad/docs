---
title: 8. A function that draws
description: A spur gear from a few numbers — a tooth drawn with trigonometry, repeated round a circle, in a method you call again.
sidebar:
  order: 8
---

The second part of this guide builds a planetary gearbox: a sun gear, planets round it and a
ring round them. It needs three new things: a method that draws a shape from numbers, copies
placed by arithmetic, and an assembly of named parts.

## One tooth

A gear is a circle with teeth. Each tooth is a small polygon, drawn with its middle on the +x
axis, from the root circle out to the tip:

```kupcad
gear_module = 2
teeth = 12
pitch_r = teeth * gear_module / 2
tip_r = pitch_r + gear_module
root_r = pitch_r - 1.25 * gear_module
half = Math::PI * gear_module / 4

polygon([
  [root_r - 0.5, -half * 1.3],
  [tip_r, -half * 0.5],
  [tip_r, half * 0.5],
  [root_r - 0.5, half * 1.3],
])
```

The *module* is the size of a tooth; gears mesh when their modules are equal. The pitch radius
is where teeth meet, the tip a module out, the root a little more than a module in. `half` is
half a tooth's width at the pitch circle. The tooth starts half a millimetre inside the root
circle, so the two join without a seam.

## Round the circle

`repeat_polar` makes copies of a shape turned about the z axis, spread evenly:

```kupcad
# @title Simple gear
gear_module = 2
teeth = 12
pitch_r = teeth * gear_module / 2
tip_r = pitch_r + gear_module
root_r = pitch_r - 1.25 * gear_module
half = Math::PI * gear_module / 4

tooth = polygon([
  [root_r - 0.5, -half * 1.3],
  [tip_r, -half * 0.5],
  [tip_r, half * 0.5],
  [root_r - 0.5, half * 1.3],
])
(circle(r: root_r) + tooth.repeat_polar(teeth)).extrude(8)
```

Twelve teeth on a disc, 8 mm thick.

## Make it a method

Three gears means three sets of these lines, unless they become a method:

```kupcad
# @title Spur gear
def spur_gear(teeth, gear_module, thickness, bore: 0)
  pitch_r = teeth * gear_module / 2
  tip_r = pitch_r + gear_module
  root_r = pitch_r - 1.25 * gear_module
  half = Math::PI * gear_module / 4
  tooth = polygon([
    [root_r - 0.5, -half * 1.3],
    [tip_r, -half * 0.5],
    [tip_r, half * 0.5],
    [root_r - 0.5, half * 1.3],
  ])
  outline = circle(r: root_r) + tooth.repeat_polar(teeth)
  outline = outline - circle(d: bore) if bore > 0
  outline.extrude(thickness)
end

spur_gear(12, 2, 8, bore: 5)
```

`spur_gear(12, 2, 8, bore: 5)` is a gear; so is `spur_gear(24, 2, 8)`. The method draws the
outline in 2D and extrudes it last, so a bore is a circle taken out of the outline before.

## Real teeth

Straight flanks work for a model. Teeth that roll on each other without catching have
*involute* flanks, a curve computed point by point with `Math.cosd`, `Math.sind` and
`Math.acosd`. The [planetary gearbox example](https://github.com/kupcad/kupcad/blob/main/examples/planetary_gearbox.kup)
does that in a `gear_outline` method of forty lines, with the same shape as this one: numbers
in, a polygon out. Swap it in when the model has to turn.

## The script so far

The "Spur gear" block above.

## In the reference

[polygon](/reference/geometry/sketches/#polygon) · [repeat_polar](/reference/geometry/transforms/#repeat_polar)
· [Math](/reference/stdlib/math/) · [Methods](/reference/language/methods/)

Next: [Repetition and placement](/guides/parts/placement/).
