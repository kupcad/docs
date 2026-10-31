---
title: Countersunk holes
description: A hole with a cone at the top for a flat-head screw, as a method you call for each position.
sidebar:
  order: 1
---

A countersunk hole is a through hole with a cone at the top, so a flat-head screw sits flush.
Write it once as a method, then cut it at each position.

```kupcad
# @title Countersunk plate
thickness = 4

# A hole for a screw `d` wide, its head `head` wide at the surface, cut from z = 0 down through
# a plate `thickness` thick: a cone for the head, a cylinder for the shaft
def countersink(d, head)
  cone = cylinder(r1: d / 2, r2: head / 2, h: head / 2).translate(z: thickness - head / 2)
  shaft = cylinder(d: d, h: thickness + 2).translate(z: -1)
  cone + shaft
end

plate = cube(x: 60, y: 40, z: thickness, round_r: 3)
holes = [[8, 8], [52, 8], [8, 32], [52, 32]].map { |(x, y)| countersink(3.4, 6.5).translate(x, y, 0) }
plate.difference(holes)
```

- `cylinder(r1:, r2:, h:)` is a cone: `r1` at the bottom, `r2` at the top. A 90° countersink
  has its height equal to half its top diameter.
- The shaft starts 1 mm below the plate and ends 1 mm above it, so the cut goes right through
  with no thin skin left by rounding.
- The method reads `thickness` from the script, so the cone always sits at the surface.

For an M3 flat-head screw the shaft is 3.4 mm and the head about 6.5 mm; for M4, 4.5 and 8.5.
