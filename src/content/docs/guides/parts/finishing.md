---
title: 7. Finishing a part
description: Parameters with ranges, a check that stops bad values, a name and a colour, and the export.
sidebar:
  order: 7
---

The mug works. Now it becomes a part someone else can use: its sizes as parameters, a check
that explains what went wrong, a name and a colour, and the files a printer takes.

## Parameters

The four numbers at the top become parameters:

```kupcad
height = param(:height, default: 95, validate: { min: 50, max: 140 }, unit: "mm", title: "Height")
diameter = param(:diameter, default: 80, validate: { min: 50, max: 110 }, unit: "mm", title: "Diameter")
wall = param(:wall, default: 4, validate: { min: 3, max: 6 }, step: 0.5, unit: "mm", title: "Wall")
reach = param(:reach, default: 22, validate: { min: 15, max: 40 }, unit: "mm", title: "Handle reach")

radius = diameter / 2
cylinder(r: radius, h: height)
```

Each has a default, a range and a label. The playground and the apps show them as sliders; the
command line sets them with `-p height=120`. A value outside the range is refused with a
message, before the script runs.

The script works in `radius`, so the diameter is turned into one right after the parameters.

## A check with a message

Some combinations the ranges allow still make no sense: a 6 mm wall in a 50 mm mug leaves little
inside. `assert` stops the script with an explanation:

```kupcad
diameter = param(:diameter, default: 80, validate: { min: 50, max: 110 }, unit: "mm")
wall = param(:wall, default: 4, validate: { min: 3, max: 6 }, unit: "mm")

radius = diameter / 2
assert(radius > 2 * wall) { "a #{wall} mm wall leaves no room inside a #{diameter} mm mug" }
cylinder(r: radius, h: 10)
```

The block after `assert` is the message, built only if the check fails. The person sees it in
the viewer, with the line it came from.

## A name and a colour

```kupcad
cylinder(d: 80, h: 95).named("mug").material(color: "#F4F1EA")
```

`named` is what the part is called in the viewer's parts list and in a 3MF file. `material`
sets how it is shown: here an off-white. The colour travels with the part into the file a slicer
opens.

## Export

With the `kupcad` command:

```sh
kupcad build mug.kup -o mug.stl
kupcad build mug.kup -p height=120 -p reach=30 -o tall-mug.3mf
kupcad run mug.kup
```

`build` writes the model in the format the file name says. `run` only runs the script, for what
it prints: here, how much the mug holds. In the playground and the apps, the Export menu writes
the same files.

Before printing, check the wall. A 3 mm wall is the least a printer makes well; the parameter's
range keeps it there.

## The whole mug

```kupcad
# @title Coffee mug
# @description A mug turned from one outline, rounded at its rim and base, with a swept handle

height = param(:height, default: 95, validate: { min: 50, max: 140 }, unit: "mm", title: "Height")
diameter = param(:diameter, default: 80, validate: { min: 50, max: 110 }, unit: "mm", title: "Diameter")
wall = param(:wall, default: 4, validate: { min: 3, max: 6 }, step: 0.5, unit: "mm", title: "Wall")
reach = param(:reach, default: 22, validate: { min: 15, max: 40 }, unit: "mm", title: "Handle reach")

radius = diameter / 2
assert(radius > 2 * wall) { "a #{wall} mm wall leaves no room inside a #{diameter} mm mug" }

CAD.config(resolution: { segments: 96 })

# The half section: along the floor, up the outside, over the rim, down the inside
section = polyline([
  [0, 0],
  [radius, 0],
  [radius, height],
  [radius - wall, height],
  [radius - wall, wall],
  [0, wall],
]).fillet(wall / 2)
mug = section.close.revolve

# What it holds, to the brim
inside = polyline([[0, wall], [radius - wall, wall], [radius - wall, height]]).fillet(wall / 2) +
  polyline([[radius - wall, height], [0, height]])
puts("Holds #{(inside.close.revolve.volume / 1000).round} ml to the brim")

# The handle: a band swept along a C, drawn flat and stood up
top = height * 0.78
bottom = height * 0.22
start = radius - wall / 2
path = polyline([[start, top], [radius + reach, top], [radius + reach, bottom], [start, bottom]])
bend = [reach * 0.6, (top - bottom) / 2].min
grip = square([wall * 2.2, wall * 3], center: true, round_r: wall * 1.1)
handle = grip.sweep(path.fillet(bend)).rotate(90, 0, 0)

(mug + handle).named("mug").material(color: "#F4F1EA")
```

Sixty lines, and every size on a slider.

## In the reference

[param](/reference/inputs/parameters/) · [assert](/reference/stdlib/kernel/) ·
[named, material](/reference/geometry/appearance/) · [Export formats](/reference/geometry/export/)
· [kupcad build](/reference/tooling/cli/#kupcad-build)

## Next

The second part of this guide builds a planetary gearbox: a method that draws a gear, gears
placed by arithmetic, and an assembly of named parts.
[A function that draws](/guides/parts/gears/).
