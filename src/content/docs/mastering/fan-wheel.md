---
title: 1. Fan wheel
description: An impeller with twisted, leaning blades round a hub — one blade shaped by a twist, a lean and a trim, then copied round.
sidebar:
  order: 1
---

A fan wheel is one blade, done well, and copied. The blade starts as a flat strip, is twisted as
it is extruded, leaned over about its own length, and trimmed to the rim. The lean and the twist
are parameters, so the same script makes a gentle desk fan or a steep impeller.

## What's new

- [`extrude`](/reference/geometry/sweeps/#extrude) with `twist:` and `slices:`.
- Turning a shape about its own middle: translate, rotate, translate back.
- `&`, the [intersection](/reference/geometry/booleans/#intersection), to trim.
- [`repeat_polar`](/reference/geometry/transforms/#repeat_polar): copies round the z axis.

## Let's go

### 1. The strip

```kupcad
diameter = 80
hub_d = diameter / 4
radius = diameter / 2

root = hub_d / 3
square([radius + 2 - root, 2], center: true).translate(x: (root + radius + 2) / 2)
```

A blade's outline, seen from above: 2 mm thick, from a third of the way out of the hub to 2 mm
past the rim. It starts inside the hub so the two fuse, and ends past the rim so the trim later
has something to cut. `center: true` draws the square about the origin, and the `translate`
moves its middle to the middle of that span.

### 2. Twisted

```kupcad
diameter = 80
height = 20
twist = 30
hub_d = diameter / 4
radius = diameter / 2

root = hub_d / 3
strip = square([radius + 2 - root, 2], center: true).translate(x: (root + radius + 2) / 2)
strip.extrude(height, twist: twist, slices: 8)
```

`twist: 30` turns the strip 30° about the z axis between the bottom and the top. Because the
strip is off to one side of the axis, the turn swings its tip round as it rises: the tip leads
the root. `slices: 8` cuts the height into eight layers; the twist is a straight segment in
each. More slices make it smoother and the model heavier.

### 3. Leaned over

The pitch is the blade's lean about its own length, the x axis. `rotate` always turns about
the origin, so a shape that should turn about its own middle is moved there first and back
after:

```kupcad
diameter = 80
height = 20
twist = 30
pitch = 35
hub_d = diameter / 4
radius = diameter / 2

root = hub_d / 3
strip = square([radius + 2 - root, 2], center: true).translate(x: (root + radius + 2) / 2)
strip
  .extrude(height, twist: twist, slices: 8)
  .translate(z: -height / 2)
  .rotate(pitch, 0, 0)
  .translate(z: height / 2)
```

The blade's middle is at `height / 2`; move it down to z = 0, turn 35° about x, move it back.
Without the two translates, the blade would pivot about its bottom edge and its top would swing
off to the side. This move-turn-move pattern comes up constantly.

### 4. Trimmed to the rim

The leaned blade now pokes above and below the hub's height, and past the rim. A cylinder the
size of the finished wheel is the shape it may fill; `&` keeps only what is inside both:

```kupcad
diameter = 80
height = 20
twist = 30
pitch = 35
hub_d = diameter / 4
radius = diameter / 2

root = hub_d / 3
strip = square([radius + 2 - root, 2], center: true).translate(x: (root + radius + 2) / 2)
blade = strip
  .extrude(height, twist: twist, slices: 8)
  .translate(z: -height / 2)
  .rotate(pitch, 0, 0)
  .translate(z: height / 2)
rim = cylinder(d: diameter, h: height)

blade & rim
```

Intersection is the trimming tool: build a shape roughly, then keep the part of it inside a
simple envelope. It is often easier than making the shape fit in the first place.

### 5. The hub, and the copies

```kupcad
blades = 7
diameter = 80
height = 20
pitch = 35
twist = 30
shaft = 5

hub_d = diameter / 4
blade_t = 2
radius = diameter / 2

root = hub_d / 3
strip = square([radius + 2 - root, blade_t], center: true).translate(x: (root + radius + 2) / 2)
blade = strip
  .extrude(height, twist: twist, slices: 8)
  .translate(z: -height / 2)
  .rotate(pitch, 0, 0)
  .translate(z: height / 2)
rim = cylinder(d: diameter, h: height)
blade = blade & rim

hub = cylinder(d: hub_d, h: height) - cylinder(d: shaft, h: height + 2).translate(z: -1)
hub + blade.repeat_polar(blades)
```

`repeat_polar(7)` is the blade and six copies, each turned a seventh of a turn further about z,
as one solid. The hub's bore is cut a millimetre longer than the hub at each end, so the hole
is sure to go through.

### 6. Parameters

Count, diameter, height, pitch, twist and shaft diameter become sliders in the whole script
below. With `pitch: 0` and `twist: 0` you get a paddle wheel, which is a good way to see what
each does: raise one at a time.

## Printing tips

A leaning blade overhangs on its underside by the pitch angle, and at 35° that prints
cleanly on most machines. Above 45°, reduce the layer height or print with supports under the
blades. Odd blade counts, like the default 7, run quieter than even ones, as no two blades
pass a strut together. For a wheel that must spin true, print it hub down on a clean, level
bed and keep `blade_t` at a multiple of your line width.

## Make it yours

- A shroud: a ring round the tips, `cylinder(d: diameter + 4, h: height) - cylinder(d: diameter, h: height + 2).translate(z: -1)`, added to the wheel.
- Curved blades: replace the strip with a thin `polygon` that bends back from root to tip, and
  keep the rest.
- A boss: a taller hub with a grub-screw hole into the bore, as the
  [hex bit holder's](/examples/) sockets are cut.

## The whole script

```kupcad
# @title Fan wheel
# @description An impeller: twisted blades round a hub, their pitch and twist yours to set

blades = param(:blades, default: 7, validate: { min: 2, max: 16 }, step: 1, title: "Blades")
diameter = param(
  :diameter,
  default: 80,
  validate: { min: 30, max: 200 },
  unit: "mm",
  title: "Diameter",
)
height = param(:height, default: 20, validate: { min: 8, max: 60 }, unit: "mm", title: "Height")
pitch = param(
  :pitch,
  default: 35,
  validate: { min: 0, max: 60 },
  step: 5,
  unit: "°",
  title: "Pitch",
  description: "How far each blade leans from the axis",
)
twist = param(
  :twist,
  default: 30,
  validate: { min: 0, max: 90 },
  step: 5,
  unit: "°",
  title: "Twist",
  description: "How far a blade turns from its root to its tip",
)
shaft = param(
  :shaft,
  default: 5,
  validate: { min: 2, max: 12 },
  step: 0.5,
  unit: "mm",
  title: "Shaft",
)

hub_d = diameter / 4
blade_t = 2
radius = diameter / 2

# A blade starts as a flat strip from a third of the way out of the hub to past the rim,
# extruded with a twist about the axis, leaned over by the pitch about its own length (turned
# about its middle, so moved to the origin and back), and trimmed to the rim
root = hub_d / 3
strip = square([radius + 2 - root, blade_t], center: true).translate(x: (root + radius + 2) / 2)
blade = strip
  .extrude(height, twist: twist, slices: 8)
  .translate(z: -height / 2)
  .rotate(pitch, 0, 0)
  .translate(z: height / 2)
rim = cylinder(d: diameter, h: height)
blade = blade & rim

hub = cylinder(d: hub_d, h: height) - cylinder(d: shaft, h: height + 2).translate(z: -1)
wheel = hub + blade.repeat_polar(blades)

wheel.named("fan wheel").material(color: "#C0392B")
```

[extrude](/reference/geometry/sweeps/#extrude) · [rotate](/reference/geometry/transforms/#rotate) ·
[intersection](/reference/geometry/booleans/#intersection) ·
[repeat_polar](/reference/geometry/transforms/#repeat_polar)

Next: [Honeycomb wall](/mastering/honeycomb-wall/).
