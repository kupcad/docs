---
title: 6. Screw-top jar
description: A jar and its screw-on lid — a turned body with an even wall, threads swept up a helix that fit with a clearance, a twisted grip, a label, and what it all weighs.
sidebar:
  order: 6
---

The last build brings everything together: a body turned from a filleted outline, a wall made
by shelling the section, threads that are the same method called twice with a clearance between
them, a lid gripped by a twisted extrusion, a raised label, and a parts list with the mass of
each part in PLA. It is the longest script in this section; every step is still one idea.

## What's new

- [`polyline`](/reference/geometry/paths/#polyline) with [`fillet`](/reference/geometry/paths/#fillet),
  `close`, and [`mirror`](/reference/geometry/transforms/#mirror) to make a full section.
- [`shell`](/reference/geometry/modifiers/#shell) on a sketch: an even wall before the revolve.
- A thread as a profile swept along a helix of points, with a clearance between mating ones.
- [`material`](/reference/geometry/appearance/#material) with `density:`, and
  [`mass`](/reference/geometry/inspection/#mass).
- [`CAD.config`](/reference/geometry/engine-settings/) for a finer resolution, and parameter
  `group:`s.

## Let's go

### 1. The outline

The jar's profile is drawn once, from the axis round the base, up the side, over the shoulder
and up the neck, as a path with rounded corners:

```kupcad
diameter = 64
height = 60
pitch = 4
turns = 2.5

radius = diameter / 2
neck_r = radius - 4
shoulder = 6
neck = pitch * turns + 4
top = height + shoulder + neck

polyline([
  [0, 0],
  [radius, 0],
  [radius, height],
  [neck_r, height + shoulder],
  [neck_r, top],
]).fillet(5)
```

The neck is as tall as the thread needs: its turns times its pitch, and 4 mm over. `fillet(5)`
rounds every corner of the path by 5 mm, the base's and the shoulder's alike.

### 2. The section, and its wall

Closed over the top and mirrored, the path becomes the jar's full section. `shell(wall)` turns a
sketch into the band `wall` thick just inside its outline, which is the jar's wall and floor in
one go; cutting the mouth out of that band opens the top. The right half, revolved, is the jar:

```kupcad
diameter = 64
height = 60
wall = 2
pitch = 4
turns = 2.5

CAD.config(resolution: { segments: 96 })

radius = diameter / 2
neck_r = radius - 4
shoulder = 6
neck = pitch * turns + 4
top = height + shoulder + neck

outline = polyline([
  [0, 0],
  [radius, 0],
  [radius, height],
  [neck_r, height + shoulder],
  [neck_r, top],
]).fillet(5)
half = (outline + polyline([[neck_r, top], [0, top]])).close
section = half + half.mirror(1, 0)
right = square([radius + 1, top + 1])

mouth = square([2 * (neck_r - wall), 2 * wall], center: true).translate(0, top)
jar = ((section.shell(wall) - mouth) & right).revolve
cavity = (section.offset(-wall) & right).revolve
puts("Holds #{(cavity.volume / 1000).round} ml")   # Holds 203 ml

jar
```

Why mirror, shell, then keep the right half? `shell` on the half section alone would put a wall
along the axis too, down the middle of the jar. On the full section the band wraps round the
outside only; `& right` then takes the half that `revolve` needs. `offset(-wall)` of the
section is the space inside, whose volume is what the jar holds. `CAD.config(resolution:
{ segments: 96 })` draws every circle with 96 edges instead of the default's thirty-odd; a jar
is one big round thing, and it shows.

### 3. A thread

A thread is a profile — a trapezium — swept along a helix. One method makes both the jar's and
the lid's: `outward` says which way the profile stands off the surface it is on, and half a
millimetre of it is sunk into that surface so the two fuse:

```kupcad
diameter = 64
height = 60
wall = 2
pitch = 4
turns = 2.5

CAD.config(resolution: { segments: 96 })

radius = diameter / 2
neck_r = radius - 4
shoulder = 6
neck = pitch * turns + 4
top = height + shoulder + neck
depth = pitch * 0.4

outline = polyline([
  [0, 0],
  [radius, 0],
  [radius, height],
  [neck_r, height + shoulder],
  [neck_r, top],
]).fillet(5)
half = (outline + polyline([[neck_r, top], [0, top]])).close
section = half + half.mirror(1, 0)
right = square([radius + 1, top + 1])
mouth = square([2 * (neck_r - wall), 2 * wall], center: true).translate(0, top)
jar = ((section.shell(wall) - mouth) & right).revolve

def thread(r, z0, outward)
  side = outward ? -1 : 1
  root = pitch * 0.6
  tip = root - 2 * depth * Math.tand(30)
  profile = polygon([
    [-side * 0.5, -root / 2],
    [side * depth, -tip / 2],
    [side * depth, tip / 2],
    [-side * 0.5, root / 2],
  ])
  steps = (turns * 72).round
  points = (0..steps).map do |i|
    angle = i * 5.0
    [r * Math.cosd(angle), r * Math.sind(angle), z0 + pitch * angle / 360]
  end
  profile.sweep(points)
end

thread_from = top - neck + 2
jar + thread(neck_r, thread_from, true)
```

The helix is a list of points every 5°, each `pitch / 72` higher than the last, and `sweep`
carries the profile along them. The profile's 30° flanks make a trapezoid thread that prints
without supports and finds its way into the mating one. `depth` is how far the thread stands
off the surface: 40% of the pitch.

### 4. The lid

The lid is a skirt round the neck with ribs to grip, twisted as it is extruded, and bored for
the neck. Its thread stands inward from the bore, the clearance further out than the jar's
stands from the neck, and half a pitch higher so the two interleave:

```kupcad
diameter = 64
height = 60
wall = 2
pitch = 4
turns = 2.5
clearance = 0.4
ribs = 40

CAD.config(resolution: { segments: 96 })

radius = diameter / 2
neck_r = radius - 4
shoulder = 6
neck = pitch * turns + 4
top = height + shoulder + neck
depth = pitch * 0.4

def thread(r, z0, outward)
  side = outward ? -1 : 1
  root = pitch * 0.6
  tip = root - 2 * depth * Math.tand(30)
  profile = polygon([
    [-side * 0.5, -root / 2],
    [side * depth, -tip / 2],
    [side * depth, tip / 2],
    [-side * 0.5, root / 2],
  ])
  steps = (turns * 72).round
  points = (0..steps).map do |i|
    angle = i * 5.0
    [r * Math.cosd(angle), r * Math.sind(angle), z0 + pitch * angle / 360]
  end
  profile.sweep(points)
end

thread_from = top - neck + 2
bore = neck_r + depth + clearance
lid_r = bore + 2.5
skirt = neck + 1
lid_top = 2.5
ribbed = circle(r: lid_r) + circle(r: 1).translate(lid_r, 0).repeat_polar(ribs)
lid = ribbed.extrude(skirt + lid_top, twist: 20).translate(z: top - skirt) -
  cylinder(r: bore, h: skirt + 1).translate(z: top - skirt - 1)
lid + thread(bore, thread_from + pitch / 2, false)
```

`ribbed` is a circle with forty small circles round its edge, which `extrude(twist: 20)` turns
into slanted ribs. The bore is the neck plus the jar's thread depth plus the clearance: the
lid's thread tips then clear the neck by the clearance, and the jar's clear the bore by the
same. 0.4 mm is a thread that turns freely once printed; tighten it to 0.3 on a well-tuned
printer.

### 5. A label

```kupcad
label = "KUPCAD"
diameter = 64

lid_r = 29.3
lid_top = 2.5
top = 80

lid = cylinder(r: lid_r, h: lid_top).translate(z: top)
badge = text(label, size: diameter / 7, font: "sans-bold", halign: "center", valign: "center")
lid + badge.extrude(0.8).translate(z: top + lid_top)
```

The label is raised 0.8 mm on the lid's top, sized from the diameter so it fits whatever the
jar's size. This step stands in a plain disc for the lid, so you can see the letters; the
whole script puts them on the real one.

### 6. Materials, mass and the assembly

```kupcad frame="none"
jar = jar.named("jar").material(color: "#E8E4DA", density: 1.24)
lid = lid.named("lid").material(color: "#FF5F14", density: 1.24)
puts("Holds #{(cavity.volume / 1000).round} ml")
puts("In PLA: the jar #{jar.mass.round(1)} g, the lid #{lid.mass.round(1)} g")

assemble(name: "Screw-top jar", parts: [jar, lid.translate(z: lift)])
```

`density:` is in g/cm³; PLA is about 1.24. With it, `mass` is what the part weighs, and
`--bom` writes it to the parts list. `lift` is how far above the jar the lid is shown: 0 shows
it screwed on, which is also how to check that nothing collides.

### 7. Parameters in groups

Twelve parameters are too many for one list. `group:` sorts them into *Jar*, *Thread* and
*Lid* in the playground's panel, and `description:` explains the ones that aren't obvious —
the clearance, the lift. The whole script has them all.

## Printing tips

Print the jar mouth up and the lid top down, so both threads print as gentle overhangs from the
bed outwards. No supports. The trapezoid flanks are 30°, which every printer manages. If the
lid binds on the first turn, the start of the thread is the culprit: a `clearance` of 0.5 or a
little sandpaper on the lid's thread. Food-safe printing is about the filament and the layer
gaps, not the model; a thicker `wall` and three perimeters help.

## Make it yours

- A knurled grip instead of ribs: `circle(r: 1)` becomes a small `square`, and `twist: 0`.
- A seal groove under the lid's top: a thin ring taken out of the lid where the neck's rim
  meets it.
- A stackable base: a recess in the jar's bottom that the lid's top fits into. The dimensions
  are already variables.

## The whole script

```kupcad
# @title Screw-top jar
# @description A jar and its screw-on lid: a turned body, swept threads, a twisted grip and a label

diameter = param(
  :diameter,
  default: 64,
  validate: { min: 40, max: 120 },
  unit: "mm",
  group: "Jar",
  title: "Diameter",
)
height = param(
  :height,
  default: 60,
  validate: { min: 30, max: 150 },
  unit: "mm",
  group: "Jar",
  title: "Body height",
)
wall = param(
  :wall,
  default: 2,
  validate: { min: 1.2, max: 4 },
  unit: "mm",
  group: "Jar",
  title: "Wall",
)

pitch = param(
  :pitch,
  default: 4,
  validate: { min: 2, max: 6 },
  unit: "mm",
  group: "Thread",
  title: "Pitch",
)
turns = param(
  :turns,
  default: 2.5,
  validate: { min: 1, max: 4 },
  step: 0.25,
  group: "Thread",
  title: "Turns",
)
clearance = param(
  :clearance,
  default: 0.4,
  validate: { min: 0.1, max: 1 },
  unit: "mm",
  group: "Thread",
  title: "Clearance",
  description: "Between the jar's thread and the lid's, so a printed lid turns",
)

label = param(:label, default: "KUPCAD", group: "Lid", title: "Label")
ribs = param(
  :ribs,
  default: 40,
  validate: { min: 12, max: 90 },
  step: 1,
  group: "Lid",
  title: "Grip ribs",
)
lift = param(
  :lift,
  default: 24,
  validate: { min: 0, max: 60 },
  unit: "mm",
  group: "Lid",
  title: "Lid lifted",
  description: "How far above the jar the lid is shown; 0 screws it on",
)

CAD.config(resolution: { segments: 96 })

radius = diameter / 2
neck_r = radius - 4
shoulder = 6
neck = pitch * turns + 4
top = height + shoulder + neck
# How far a thread stands off the neck
depth = pitch * 0.4

# The jar's section: its outline from the axis round the base, up the side and over the
# shoulder to the neck, every corner rounded; both halves, so the wall wraps round the base
outline = polyline([
  [0, 0],
  [radius, 0],
  [radius, height],
  [neck_r, height + shoulder],
  [neck_r, top],
]).fillet(5)
half = (outline + polyline([[neck_r, top], [0, top]])).close
section = half + half.mirror(1, 0)
right = square([radius + 1, top + 1])

# The wall: the band `wall` thick inside the section's outline, open at the mouth, turned about
# the axis; and what it holds
mouth = square([2 * (neck_r - wall), 2 * wall], center: true).translate(0, top)
jar = ((section.shell(wall) - mouth) & right).revolve
cavity = (section.offset(-wall) & right).revolve

# A thread: its profile swept up a helix at radius r from height z0, `turns` turns. `outward`
# stands it off the surface away from the axis (the jar's), else towards it (the lid's); half a
# millimetre of it is sunk into the surface, so the two join.
def thread(r, z0, outward)
  side = outward ? -1 : 1
  root = pitch * 0.6
  tip = root - 2 * depth * Math.tand(30)
  profile = polygon([
    [-side * 0.5, -root / 2],
    [side * depth, -tip / 2],
    [side * depth, tip / 2],
    [-side * 0.5, root / 2],
  ])
  steps = (turns * 72).round
  points = (0..steps).map do |i|
    angle = i * 5.0
    [r * Math.cosd(angle), r * Math.sind(angle), z0 + pitch * angle / 360]
  end
  profile.sweep(points)
end

thread_from = top - neck + 2
jar = jar + thread(neck_r, thread_from, true)

# The lid, as it sits screwed on: a skirt round the neck, its thread inside half a pitch above
# the jar's, ribs twisted round it to grip by, and the label raised on its top
bore = neck_r + depth + clearance
lid_r = bore + 2.5
skirt = neck + 1
lid_top = 2.5
ribbed = circle(r: lid_r) + circle(r: 1).translate(lid_r, 0).repeat_polar(ribs)
lid = ribbed.extrude(skirt + lid_top, twist: 20).translate(z: top - skirt) -
  cylinder(r: bore, h: skirt + 1).translate(z: top - skirt - 1)
lid = lid + thread(bore, thread_from + pitch / 2, false)
badge = text(label, size: diameter / 7, font: "sans-bold", halign: "center", valign: "center")
lid = lid + badge.extrude(0.8).translate(z: top + lid_top)

jar = jar.named("jar").material(color: "#E8E4DA", density: 1.24)
lid = lid.named("lid").material(color: "#FF5F14", density: 1.24)
puts("Holds #{(cavity.volume / 1000).round} ml")   # Holds 203 ml
puts("In PLA: the jar #{jar.mass.round(1)} g, the lid #{lid.mass.round(1)} g")   # In PLA: the jar 45.3 g, the lid 22 g

assemble(name: "Screw-top jar", parts: [jar, lid.translate(z: lift)])
```

[Paths](/reference/geometry/paths/) · [shell](/reference/geometry/modifiers/#shell) ·
[revolve, sweep](/reference/geometry/sweeps/) · [material](/reference/geometry/appearance/#material) ·
[mass](/reference/geometry/inspection/#mass) · [Engine settings](/reference/geometry/engine-settings/) ·
[Parameters](/reference/inputs/parameters/)

Next: [Designing for the printer](/mastering/designing-for-the-printer/).
