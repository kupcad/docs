---
title: 2. Booleans
description: Adding, cutting and intersecting solids, with + , - and &.
sidebar:
  order: 2
---

A mug is a cylinder with a smaller cylinder taken out. Taking one shape out of another is a
boolean; so is joining two or keeping only where they overlap.

## Cut

```kupcad
# @title Hollow mug
outside = cylinder(d: 80, h: 95)
inside = cylinder(d: 72, h: 95).translate(z: 4)
outside - inside
```

`-` takes the second shape out of the first. The inside cylinder is moved up 4 mm, so 4 mm of
floor stays; it reaches above the rim, so the top is open.

## Join

```kupcad
base = cube(x: 30, y: 30, z: 4)
post = cylinder(d: 6, h: 20).translate(15, 15, 4)
base + post
```

`+` joins two shapes into one. The post stands on the base: it is moved to the middle, and up
by the base's thickness.

## Keep the overlap

```kupcad
cube(20, center: true) & sphere(d: 26)
```

`&` keeps only where both shapes are: here, a cube with its corners rounded off by the sphere.

## Many at once

The operators take one shape on each side. The method forms, `union`, `difference` and
`intersection`, do the same and take a list too. This is the plate from
[Your first model](/start/first-model/):

```kupcad
plate = cube(x: 40, y: 30, z: 4, round_r: 2)
hole = cylinder(d: 3.4, h: 10).translate(z: -1)
holes = [[5, 5], [35, 5], [5, 25], [35, 25]].map { |(x, y)| hole.translate(x, y, 0) }
plate.difference(holes)
```

`map` turns the list of positions into a list of holes, and `difference` cuts them all.

## The script so far

```kupcad
# @title Hollow mug
outside = cylinder(d: 80, h: 95)
inside = cylinder(d: 72, h: 95).translate(z: 4)
outside - inside
```

A mug with square edges. The next pages give it a rounded rim and a handle; for that we need to
draw in 2D first.

## In the reference

[Booleans and hulls](/reference/geometry/booleans/) · [map](/reference/stdlib/array/)

Next: [Sketches](/guides/parts/sketches/).
