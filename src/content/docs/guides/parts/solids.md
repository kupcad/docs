---
title: 1. Solids and space
description: Boxes, cylinders and spheres, where they land, and how to move them.
sidebar:
  order: 1
---

This guide builds a coffee mug, one idea at a time. Each page adds something; at the end of
every page is the script so far, which you can open in the playground.

We start with the three basic solids and where they go.

## Three solids

```kupcad
cube(20)
```

A cube, 20 mm on each side. Its lowest corner sits on the origin: it fills from 0 to 20 along
x, y and z.

```kupcad
cylinder(d: 80, h: 95)
```

A cylinder 80 mm across and 95 mm tall, standing on the XY plane, centred on the z axis. That is
roughly a mug. `r:` gives the radius instead of `d:`.

```kupcad
sphere(d: 20)
```

A sphere centred on the origin.

## Where things land

Every solid starts at the origin. `translate` moves it:

```kupcad
cylinder(d: 80, h: 95).translate(z: 10)
```

The axes you name are the ones that move; the rest stay. `translate(x, y, z)` with three
numbers does the same.

`center: true` puts a cube on the origin by its middle instead of its corner:

```kupcad
cube(20, center: true)
```

## Turning

`rotate` turns a shape, in degrees:

```kupcad
cube([40, 10, 10]).rotate(45)
```

One number turns about the z axis. `rotate(x, y, z)` turns about each axis in turn. The mug's
handle, later, is drawn flat and stood up with `rotate(90, 0, 0)`.

## Reading off sizes

A shape can tell you where it is:

```kupcad
mug = cylinder(d: 80, h: 95).translate(z: 10)
puts mug.bbox.z_max   # 105
mug
```

`bbox` is the box around the shape; `puts` prints to the console. The script still ends with
`mug`, so that is the model.

## The script so far

```kupcad
# @title Mug blank
cylinder(d: 80, h: 95)
```

## In the reference

[cube, cylinder, sphere](/reference/geometry/solids/) ·
[translate, rotate](/reference/geometry/transforms/) · [bbox](/reference/geometry/inspection/#bbox)
· [Units and axes](/reference/geometry/shapes/#units-and-axes)

Next: [Booleans](/guides/parts/booleans/), to hollow the mug.
