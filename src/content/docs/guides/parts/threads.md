---
title: 12. Threads, lofts and speed
description: A helix for threads, a loft between two outlines, hollowing with shell, and what makes a build slow.
sidebar:
  order: 12
---

Three more ways to make a solid from a sketch, and a note on speed. They come from the
[screw-top jar example](https://github.com/kupcad/kupcad/blob/main/examples/screw_top_jar.kup),
which uses all three.

## Helix

`helix` extrudes a sketch while turning it about the z axis: a thread, or a spring.

```kupcad
# @title Thread
circle(r: 1).translate(x: 10).helix(20, pitch: 4)
```

A circle 10 mm from the axis, risen 20 mm, turning once every 4 mm. `turns:` gives the number
of turns instead of the pitch. For a thread on a jar, the sketch is the thread's profile and
the jar's neck is added with `+`:

```kupcad
# @title Threaded neck
neck = cylinder(r: 10, h: 20)
thread = polygon([[9.5, -1.2], [11, -0.5], [11, 0.5], [9.5, 1.2]]).helix(20, pitch: 4)
neck + thread
```

The profile starts half a millimetre inside the neck, so the two join.

## Loft

`loft` joins one sketch to another at a height, blending between them:

```kupcad
# @title Transition
square(20, center: true).loft(circle(r: 6), 15)
```

A square at the bottom, a circle 15 mm up, and a smooth surface between: a funnel, a nozzle,
an adapter. A list of sketches with a list of heights lofts through all of them.

## Shell

`shell` hollows a shape to walls of one thickness, keeping its outside:

```kupcad
# @title Cup by shell
cylinder(r: 20, h: 30).shell(2) - cylinder(r: 30, h: 10).translate(z: 29)
```

A solid's shell is closed all round, so the top is cut off afterwards to open it. On a
*sketch*, `shell` is the band along its outline; the jar example shells its section and then
revolves, which is fast. A solid's shell is slow on anything but simple shapes: prefer the
sketch where you can, or draw the inside yourself as the mug did.

## Speed

A build's time shows in the status line. What makes it long:

- **Resolution.** `CAD.config(resolution: { segments: n })` sets how many edges a circle gets.
  Every curved face pays for it. Set it once, as high as the part needs and no higher.
- **Booleans of many pieces.** Union a list in one call, `union(list)`, rather than one piece
  at a time.
- **A solid's `shell` and `minkowski`**, which grow with the shape's detail.
- **Sweeps round many corners** and text with many glyphs.

While working, keep the resolution low and raise it to export. The viewer shows how long each
run took, so you can see what a change costs.

## The guide ends here

You have the pieces the examples are made of: solids and booleans, sketches and paths,
revolve and sweep, methods and repetition, assemblies and drawings. The
[examples](https://github.com/kupcad/kupcad/tree/main/examples) put them together, and the
[reference](/reference/) has every method.

## In the reference

[helix](/reference/geometry/sweeps/#helix) · [loft](/reference/geometry/sweeps/#loft) ·
[shell](/reference/geometry/modifiers/#shell) · [Engine settings](/reference/geometry/engine-settings/)
