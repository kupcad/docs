---
title: 9. Repetition and placement
description: Planets placed round the sun by arithmetic, the ring that follows from them, and a warning when the numbers don't work.
sidebar:
  order: 9
---

A planetary gearbox has one sun gear in the middle, planets round it and a ring gear round
them. Where each planet goes, and how big the ring is, follows from the tooth counts.

## The arithmetic

```kupcad
sun_teeth = 12
planet_teeth = 12
planet_count = 3
gear_module = 2

ring_teeth = sun_teeth + 2 * planet_teeth
orbit = (sun_teeth + planet_teeth) * gear_module / 2
puts ring_teeth   # 36
puts orbit        # 24
```

A planet sits between the sun and the ring, so the ring has the sun's teeth plus two planets'
worth. Its centre is the sun's pitch radius plus its own away from the middle: that is the
orbit.

## Planets round the sun

```kupcad
# @title Sun and planets
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

sun_teeth = 12
planet_teeth = 12
planet_count = 3
gear_module = 2
thickness = 8
orbit = (sun_teeth + planet_teeth) * gear_module / 2

sun = spur_gear(sun_teeth, gear_module, thickness, bore: 5)
planet = spur_gear(planet_teeth, gear_module, thickness, bore: 3)
planets = (0...planet_count).map do |i|
  angle = i * 360.0 / planet_count
  planet.rotate(180.0 / planet_teeth).translate(orbit * Math.cosd(angle), orbit * Math.sind(angle), 0)
end

[sun] + planets
```

`(0...planet_count).map` runs the block once per planet, with `i` 0, 1, 2. Each planet is
turned by half a tooth, so its tooth space faces the sun's tooth, then moved out along the
orbit at its angle: `Math.cosd` and `Math.sind` turn an angle and a distance into x and y.

The model is an array, `[sun] + planets`: several solids shown together. (With real involute
teeth, each planet also turns by an amount that depends on its angle; the example works that
out.)

## The ring

```kupcad
ring_teeth = 36
gear_module = 2
rim = 6
thickness = 8

pitch_r = ring_teeth * gear_module / 2
(circle(r: pitch_r + rim) - circle(r: pitch_r + gear_module)).extrude(thickness)
```

A ring whose hollow clears the planets' tips. A real ring has teeth on the inside: the example
cuts them with the same outline method, its "teeth" being the ring's tooth spaces.

## When the numbers don't work

Evenly spaced planets only mesh when the sun's and the ring's teeth divide by their count. A
check that doesn't stop the script, because the model is still worth looking at:

```kupcad
sun_teeth = 12
planet_teeth = 13
planet_count = 3

ring_teeth = sun_teeth + 2 * planet_teeth
unless ((sun_teeth + ring_teeth) / planet_count).integer?
  warn("#{planet_count} planets can't mesh evenly spaced: #{sun_teeth + ring_teeth} teeth don't divide by them")
end
cube(1)
```

`warn` prints a warning in the console and marks the line; the script goes on. `integer?` asks
whether a number is whole. For a rule that makes the model wrong, `assert` stops it instead.

## The script so far

The "Sun and planets" block, with the ring added to its array: `[sun, ring] + planets`.

## In the reference

[Range](/reference/stdlib/range/) · [map](/reference/stdlib/array/) ·
[translate, rotate](/reference/geometry/transforms/) · [warn](/reference/stdlib/kernel/#warn)

Next: [Assemblies](/guides/parts/assemblies/).
