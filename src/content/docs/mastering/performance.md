---
title: 10. Performance
description: Keeping a model quick to preview and to build — resolution where it counts, fewer and bigger booleans, geometry that is only built when it is used, and where the time goes.
sidebar:
  order: 10
---

A script that takes a second to preview is a pleasure to work on; one that takes twenty is
not, and it is usually the same model drawn with more triangles than it needs, or combined in
more steps than it needs. Most of the fixes are small.

## Where the time goes

Geometry is built by the kernel when a shape is *used* — measured, exported, shown — not when
its line runs. Transforms are free: `translate` and `rotate` record a placement, they don't
move triangles. What costs is:

- **Booleans** (`+`, `-`, `&`), in proportion to the triangles of both sides.
- **Curves**: every circle, cylinder, sphere, rounded corner and revolve is drawn as straight
  edges, and the resolution says how many.
- **Sweeps and twists**: `slices` layers times the profile's edges.
- **Measuring**: `volume`, `min_gap`, `contains?` on a big mesh.

`benchmark` tells you which:

```kupcad frame="none"
wheel = benchmark("wheel") { (hub + blade.repeat_polar(blades)).volume }
# [Benchmark] wheel: 312.4 ms
```

The block must measure the shape (`.volume`, `.bbox`), or it records only the time to describe
it, which is nothing.

## Resolution where it counts

The default resolution draws a circle with an edge every 12° or every 2 mm, whichever gives
fewer: a 4 mm hole gets a handful of edges, a 200 mm wheel thirty. Raise it only where it
shows, and only by as much as it shows:

```kupcad
puts CAD.current_config[:resolution].inspect   # {segments: 0, min_angle: 12, min_length: 2}

coarse = cylinder(d: 60, h: 10)
fine = CAD.with_config(resolution: { segments: 96 }) { cylinder(d: 60, h: 10) }
bolt_hole = cylinder(d: 3.4, h: 12, segments: 16)

(fine - bolt_hole.translate(20, 0, -1)).translate(x: 40) + coarse
```

- `CAD.config(resolution: ...)` sets it for the rest of the script: the jar does, because the
  jar is one big round thing.
- `CAD.with_config(...) { }` sets it for one piece and puts it back.
- `segments:` on a call sets it for that shape alone: a bearing seat needs it, the screw holes
  beside it don't.

A resolution that doubles the edges of a cylinder roughly doubles the cost of every boolean
it is part of. Settings stick to the shape they were built with, so a fine shape stays fine
when it is moved into a coarse context.

## Fewer, bigger booleans

Ten subtractions in a row rebuild the result ten times. One subtraction of a list rebuilds it
once:

```kupcad
plate = cube(x: 60, y: 40, z: 4)
holes = (0...5).map { |i| cylinder(d: 3.4, h: 6).translate(8 + i * 11, 20, -1) }

plate.difference(holes)
```

`difference(list)`, `union(list)` and `shape.union(a, b, c)` take everything at once.
`repeat_linear` and `repeat_polar` build their copies as one shape too, which is why the bit
holder's grid of sockets is cut in one go. Build the cutters first, then cut once; build the
parts, then join once.

Prefer a sketch boolean to a solid one: the honeycomb takes its cells out of the outline as a
sketch and extrudes the result, instead of subtracting eighteen prisms from a slab. 2D work
is cheap.

## Slices and sweeps

A twist or a sweep is `slices` copies of the profile stitched together. The vase uses a slice
every 4 mm; the fan blade eight in all. The default (`slices: 0`) gives a twist its share of a
circle's segments, which is usually enough. For a sweep along points, the point count is the
slice count: the jar's thread uses a point every 5°, the staircase's handrail four per step.
Halve the points and look; if you can't see the difference, keep the half.

## Preview and build

The editor previews the model on every change; `kupcad build` runs once. A script can tell
them apart and leave out what only the export needs:

```kupcad
turns = CAD.preview? ? 1 : 12
circle(r: 1).translate(x: 4).helix(turns * 2, turns: turns)
```

Keep the difference to detail (fewer turns, coarser resolution, no label), so what you see is
what you print. The preview also has an instruction limit and a memory limit that a build
doesn't ([Configuration](/reference/tooling/configuration/#memory-limits)), so a script that
loops a million times is told so in the editor rather than hanging it.

## Memory

A script's own memory — arrays, strings, the graph of shapes it describes — is capped by
`vm_memory_limit` in `.kupcad.json`, and a run that needs more raises `OutOfMemoryError`
naming what grew. A loop that keeps every intermediate shape in an Array keeps every one of
them; let go of what is done (`reduce` instead of collecting, then joining) and build the
list of cutters rather than the list of results. `max_vertices` in `CAD.config` caps what one
operation may produce, which turns a runaway resolution into an error instead of a wait.

## The two engines

The default engine builds meshes, and everything on these pages runs on it. The B-Rep engine
(`CAD.config(engine: :brep)`) builds exact geometry for STEP export; it covers boxes, cylinders,
polyhedra, the basic sketches and hulls today, and reports what it can't do by name rather than
guessing. A geometry parameter means the same on both, so a model written for one isn't
rewritten for the other. [Engine settings](/reference/geometry/engine-settings/) has what the
B-Rep engine supports.

[Engine settings](/reference/geometry/engine-settings/) · [benchmark](/reference/stdlib/kernel/#benchmark) ·
[Booleans](/reference/geometry/booleans/) · [Sweeps](/reference/geometry/sweeps/) ·
[Configuration](/reference/tooling/configuration/)

Next: [Keeping it correct](/mastering/keeping-it-correct/).
