---
title: A printed thread
description: A bolt and a nut that screw together off the printer, with a clearance parameter to tune for yours.
sidebar:
  order: 5
---

A thread is a profile swept up a helix. The same profile, grown by a clearance, cuts the nut;
the clearance is a parameter, because every printer differs.

```kupcad
# @title Bolt and nut
d = param(:d, default: 12, validate: { min: 6, max: 30 }, unit: "mm", title: "Diameter")
pitch = param(:pitch, default: 2, validate: { min: 1, max: 4 }, step: 0.5, unit: "mm", title: "Pitch")
clearance = param(:clearance, default: 0.3, validate: { min: 0, max: 0.8 }, step: 0.05, unit: "mm", title: "Clearance")

length = 20
depth = pitch * 0.5

# A thread round a core of radius `r`, `h` tall, standing `depth` proud: its profile a
# trapezoid half sunk into the core, so the two join
def thread(r, h)
  profile = polygon([
    [r - 0.5, -pitch * 0.3],
    [r + depth, -pitch * 0.1],
    [r + depth, pitch * 0.1],
    [r - 0.5, pitch * 0.3],
  ])
  profile.helix(h, pitch: pitch)
end

core_r = d / 2 - depth
bolt = cylinder(r: core_r, h: length) + thread(core_r, length)
head = cylinder(r: d / 2 + 2, h: 5, sides: 6).translate(z: -5)

# The nut: a hexagon with the bolt's thread, grown by the clearance, taken out of it
nut_height = 8
cutter = cylinder(r: core_r + clearance, h: nut_height + 2).translate(z: -1) +
  thread(core_r + clearance, nut_height + 2).translate(z: -1)
nut = cylinder(r: d / 2 + 3, h: nut_height, sides: 6) - cutter

[(bolt + head).named("bolt"), nut.translate(x: d + 10).named("nut")]
```

- `helix(h, pitch:)` turns the profile as it rises; one turn per `pitch`.
- The nut's cutter is the bolt's thread at `core_r + clearance`: everything the bolt has, plus
  the gap.
- `sides: 6` on a cylinder is a hexagon, for the head and the nut.

Print both flat, head and nut down. Start with a clearance of 0.3 mm; if the nut binds, raise
it in steps of 0.05, and if it is loose, lower it.

[helix](/reference/geometry/sweeps/#helix) · [Threads, lofts and speed](/guides/parts/threads/)
