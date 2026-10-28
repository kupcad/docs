---
title: Sweeps
description: Turning a Sketch into a Solid — extrude, revolve, helix, loft and sweep.
sidebar:
  order: 7
---

A sweep moves a Sketch through space and gives the Solid it sweeps out. They are methods of a
Sketch only; close or stroke a [Path](/reference/geometry/paths/) first.

A sweep that turns the profile (a revolve, a twist, a helix) is cut into segments as a circle is:
`segments:` is the count for a full turn, and a partial turn gets its share. Without
`segments:`, the count comes from the [resolution](/reference/geometry/engine-settings/#resolution)
at the profile's farthest point from the axis. `slices:`, where a method takes it, is the count
itself.

## extrude

```kupcad frame="none"
sketch.extrude(h = 1)
sketch.extrude(h, twist: 0, scale: 1, center: false, slices: 0)
```

The sketch pushed straight up along z, from z = 0 to `h`.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `h` | Number | 1 | The height. |
| `center` | Boolean | `false` | Centre it along z, from `-h / 2` to `h / 2`. |
| `twist` | Number | 0 | Degrees the profile turns about the z axis from bottom to top. |
| `scale` | Number | 1 | The top's size against the bottom's, about the sketch's origin. |
| `scale_x`, `scale_y` | Number | 1 | The top's scale along x and y alone. `scale:` sets both. |
| `slices` | Number | 0 | Layers the side is cut into. With 0, a twist gets its share of a full turn's segments, and a straight extrusion none. |

**Returns:** `Solid`.

```kupcad
puts square(10).extrude(5).volume          # 500
taper = square(10, center: true).extrude(10, scale: 0.5)
vase = regular_polygon(8, r: 15).extrude(60, twist: 90, scale: 1.4)
```

## revolve

```kupcad frame="none"
sketch.revolve(deg = 360, segments: 0)
sketch.revolve(angle: 90)
```

The sketch turned about the y axis, which becomes the z axis of the solid: the sketch's x is
the distance from the axis and its y the height. A partial revolve starts at +x and turns
counter-clockwise seen from above.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `deg` | Number | 360 | The angle to turn through, in degrees. Also `angle:`. |
| `segments` | Number | 0 | Segments for a full turn; a partial revolve gets its share (at least 3). |

**Returns:** `Solid`.

```kupcad
ring = square([2, 10]).translate(x: 5).revolve
puts ring.bbox.z_max      # 10
quarter = square([2, 10]).translate(x: 5).revolve(90)
knob = regular_polygon(6, r: 15).translate(x: 20).revolve(deg: 360)
```

## helix

```kupcad frame="none"
sketch.helix(h = 10, twist = 360, slices = 0)
sketch.helix(h, pitch: 2)
sketch.helix(h: 20, turns: 10)
```

The sketch extruded `h` high while it turns about the z axis: a thread or a spring. Give the
turn one of three ways.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `h` | Number | 10 | The height. |
| `twist` | Number | 360 | The total turn, in degrees. |
| `pitch` | Number | — | The rise per turn, instead of `twist`. |
| `turns` | Number | — | The number of turns, instead of `twist`. |
| `slices` | Number | 0 | Layers along the height; 0 gives the twist its share of the segments. |

`helix(20, 3600)`, `helix(20, pitch: 2)` and `helix(h: 20, turns: 10)` are the same ten turns.

**Returns:** `Solid`.

**Raises:** `ArgumentError` for more than one of `twist`, `pitch:` and `turns:`.

```kupcad
thread = circle(r: 1).translate(x: 3).helix(20, pitch: 2)
```

## loft

```kupcad frame="none"
sketch.loft(target, height)
sketch.loft([section, ...], [height, ...])
```

A solid joining the sketch at z = 0 to `target` at `height` (below it, for a negative height).
Given Arrays, it runs on through each section at its height above the base, the heights
rising: a loft from each to the next.

- Two convex profiles loft to the exact convex hull of their outlines.
- When either is concave, the loft is the ruled surface between them: points matched by how far
  along its outline each lies, each outline's corners kept, the top turned to twist least
  against the base. An L lofted to a smaller L is its frustum.
- Profiles of several outlines, or with holes, loft outline to outline and hole to hole, each
  joined to the one at the nearest place in the other profile. The two need as many outlines,
  holes and islands in holes as each other.

**Returns:** `Solid`.

**Raises:** `ValueError` when the profiles' outlines and holes don't match, saying how many each
has, or when the heights don't rise; `TypeError` for a section that isn't a Sketch.

```kupcad
transition = square(10, center: true).loft(circle(r: 3), 10)
stack = square(10, center: true).loft([square(6, center: true), circle(r: 2)], [5, 12])
puts stack.bbox.z_max   # 12
```

## sweep

```kupcad frame="none"
sketch.sweep(path, segments: 0)
sketch.sweep([[x, y, z], ...])
```

The solid the sketch sweeps out along a path, standing on it: the profile's origin on the path,
its x across it (to the path's left) and its y up.

The path is a [Path](/reference/geometry/paths/) in the XY plane, or an Array of points
(`[x, y, z]`, or `[x, y]` in the plane) for a polyline through space: a spring, a hose, a
frame's tube.

- Along a line the profile is extruded; along a Path's arc it is revolved about the arc's
  centre; a curve is followed along the chords the resolution draws it with.
- Where the path turns at a corner, the profile turns about the corner on its outer side,
  filling the corner round. A closed path has a corner where it starts too.
- Along points in space, the profile starts with its y as near up (z) as the path's first
  direction allows (along y, for a path that starts straight up or down), and only the corners
  turn it, so it doesn't twist about the path. Round a closed loop that isn't flat, it is
  twisted evenly by as much as the loop would turn it, so it meets itself where it started.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `path` | Path or Array | — | What to sweep along; an Array of 2 to 10,000 points. |
| `segments` | Number | 0 | Segments for a full turn at the corners and arcs; 0 follows the resolution. |

**Returns:** `Solid`.

**Raises:** `ValueError` for a profile that reaches the centre of an arc it is swept round (it
would cross itself), a point that repeats the one before it, or more than 10,000 points;
`TypeError` for a path that is neither a Path nor an Array.

```kupcad
rail = square(2, center: true).translate(y: 1).sweep(polyline([[0, 0], [40, 0], [40, 30]]))
puts rail.bbox.max.inspect   # [41, 30, 2]

# two turns of a coil, radius 10, rising 10
coil_points = (0..72).map { |i| a = i * 10.0; [10 * Math.cosd(a), 10 * Math.sind(a), a / 72] }
coil = circle(r: 1).sweep(coil_points)
```
