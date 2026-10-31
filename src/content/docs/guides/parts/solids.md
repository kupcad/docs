---
title: 1. Solids and space
description: Boxes, cylinders and spheres, where they land, and how to move them.
sidebar:
  order: 1
---

This guide builds a coffee mug, one idea at a time, then a planetary gearbox. Each page adds
something; at the end of every page is the script so far, which you can open in the playground.
It uses variables, methods and blocks as [The language](/guides/language/first-script/)
explains them; you can read that first, or look things up there as they come.

We start with the three basic solids and where they go.

## The axes

<figure class="kc-diagram">
<svg viewBox="0 0 320 200" width="320" height="200" role="img" aria-label="The axes: x to the right, y away, z up; a cube with its corner on the origin">
  <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M90 150 L250 150" /><path d="M244 145 L250 150 L244 155" />
    <path d="M90 150 L170 100" /><path d="M162 101 L170 100 L167 108" />
    <path d="M90 150 L90 30" /><path d="M85 36 L90 30 L95 36" />
    <path d="M90 150 L150 150 L150 90 L90 90 Z" stroke-opacity="0.9" />
    <path d="M150 150 L180 131 L180 71 L150 90" stroke-opacity="0.9" /><path d="M90 90 L120 71 L180 71" stroke-opacity="0.9" />
  </g>
  <g font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" fill="currentColor">
    <text x="256" y="155">x</text><text x="176" y="98">y</text><text x="84" y="22">z</text>
    <text x="70" y="166" font-size="12" opacity="0.7">0, 0, 0</text>
  </g>
</svg>
<figcaption>x to the right, y away from you, z up. <code>cube(20)</code> fills from the origin along all three.</figcaption>
</figure>

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
