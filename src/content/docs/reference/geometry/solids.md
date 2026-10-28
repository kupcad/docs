---
title: Solids
description: The 3D primitives — cube, cylinder, sphere, torus and polyhedron.
sidebar:
  order: 2
---

The 3D primitives make a `Solid`. Each is a global function and a class method of `Solid`
(`Solid.cube(10)`).

Each primitive checks its arguments:

- A keyword it doesn't take is an `ArgumentError` listing the ones it does.
- A keyword overrides the same option given by position: `cube(5, z: 3)` is 5 × 5 × 3.
- Two keywords for one option are an `ArgumentError`: `r:`, `d:` and `radius:`; `r1:` and
  `d1:`; `r2:` and `d2:`; `size:` with `x:`, `y:` or `z:`; `round_r:` with `chamfer:`;
  `sides:` with `segments:`.
- A size of zero or less, or one that isn't finite, is a `ValueError`. A value of the wrong
  type is a `TypeError`.

## cube

```kupcad frame="none"
cube(size)
cube(x, y, z, center = false)
cube([x, y, z], center = false)
cube(size: [40, 30, 3], center: true, round_r: 2)
```

A box with its edges along the axes. By default its lowest corner is at the origin.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `x`, `y`, `z` | Number | 1 | The size along each axis. One positional number sets all three. |
| `size` | Number or Array | — | All three sizes: a number for a cube, `[x, y, z]` for a box. |
| `center` | Boolean | `false` | Centre the box on the origin. |
| `round_r` | Number | — | Round the four vertical edges with this radius (at most half the shorter side). |
| `chamfer` | Number | — | Cut the four vertical edges at 45°, this far back along each side. |
| `segments` | Number | 0 | Segments per full turn for the `round_r:` corners; 0 follows the [resolution](/reference/geometry/engine-settings/#resolution). |

`round_r:` and `chamfer:` shape the outline seen from above: the box is a rounded or cut
rectangle, extruded. The top and bottom edges stay sharp.

**Returns:** `Solid`.

```kupcad
box = cube(5, z: 3)
puts box.bbox.size.inspect                  # [5, 5, 3]
puts cube([40, 30, 3], true).bbox.min.inspect   # [-20, -15, -1.5]
plate = cube(x: 40, y: 30, z: 3, round_r: 4)
```

## cylinder

```kupcad frame="none"
cylinder(r = 1, h = 1, center = false)
cylinder(d: 8, h: 5)
cylinder(r1: 5, r2: 2, h: 10)
cylinder(d: 8, h: 5, sides: 6)
```

A cylinder along the z axis, from z = 0 up to `h`. Different radii at the bottom and top make a
cone or a frustum.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `r` | Number | 1 | The radius. Also `radius:`, or `d:` for the diameter. |
| `h` | Number | 1 | The height. |
| `center` | Boolean | `false` | Centre it along z, from `-h / 2` to `h / 2`. |
| `r1`, `r2` | Number | `r` | The bottom and top radius, for a cone. Also `d1:`, `d2:`. |
| `round_r` | Number | — | Round the top and bottom circular edges with this radius. |
| `chamfer` | Number | — | Cut the top and bottom circular edges at 45°. |
| `segments` | Number | 0 | How finely the round surface is drawn on the mesh engine; 0 follows the resolution. |
| `sides` | Number | — | Make a prism of this many flat sides (3 to 2048) instead of a round cylinder. |

**Returns:** `Solid`.

**Raises:** `ArgumentError` for `sides:` with `round_r:` or `chamfer:`.

```kupcad
pin = cylinder(r: 2, h: 10, chamfer: 0.5)
cone = cylinder(r1: 5, r2: 2, h: 10)
nut_trap = cylinder(d: 8, h: 3, sides: 6)
puts cylinder(r: 5, h: 10, center: true).bbox.z_min   # -5
```

### sides or segments

`sides:` makes a faceted shape on purpose: `cylinder(d: 8, h: 5, sides: 6)` is a hexagonal prism,
a nut trap. Its first corner lies on +x, and it is the same on both engines. With `r1:` and
`r2:` it is a frustum.

`segments:` says only how finely a round shape is drawn. The mesh engine draws a cylinder with
that many facets, while the exact B-Rep engine keeps it round. Use `sides:` whenever the facets
are the design. `kupcad check` flags `segments:` from 3 to 8 on a `cylinder` or a `circle`
([`segments-as-sides`](/reference/tooling/lint-rules/)).

A count that isn't whole is rounded down, so `segments: r * 4` needs no rounding.

## sphere

```kupcad frame="none"
sphere(r = 1)
sphere(d: 10, segments: 64)
```

A sphere centred on the origin.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `r` | Number | 1 | The radius. Also `radius:`, or `d:` for the diameter. |
| `segments` | Number | 0 | How finely it is drawn; 0 follows the resolution. |

A sphere has no `sides:`.

**Returns:** `Solid`.

```kupcad
ball = sphere(d: 10)
puts ball.bbox.max.inspect    # [5, 5, 5]
```

## torus

```kupcad frame="none"
torus(major_r = 10, minor_r = 2)
torus(major_r: 10, minor_r: 2, segments: 48)
```

A ring around the z axis, centred on the origin: a circle of radius `minor_r`, its centre
`major_r` from the axis, revolved.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `major_r` | Number | 10 | From the axis to the centre of the tube. |
| `minor_r` | Number | 2 | The radius of the tube. |
| `segments` | Number | 0 | How finely both the tube and the ring are drawn; 0 follows the resolution for each radius. |

**Returns:** `Solid`.

**Raises:** `ValueError` when `minor_r` isn't smaller than `major_r` (the tube would reach the
axis).

```kupcad
ring = torus(major_r: 10.0, minor_r: 2.0)
```

## polyhedron

```kupcad frame="none"
polyhedron(points, faces)
polyhedron(points: [[x, y, z], ...], faces: [[i, j, k], ...])
```

A solid from its corners and faces.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `points` | Array | — | The corners, `[x, y, z]` each; at least 4. |
| `faces` | Array | — | The faces, each an Array of indices into `points`; at least 4 faces. |

Each face lists its corners in order, counter-clockwise seen from outside the solid. A face has
3 to 4096 corners, all on one plane. A face of more than three is cut into triangles on its own
plane, along its inside when it is concave, the same on both engines.

The faces must close the solid: every edge is shared by exactly two faces, running opposite ways.
One that doesn't is a `GeometryError` when the solid is computed.

**Returns:** `Solid`.

**Raises:** `ValueError` for an index out of range, a corner listed twice in a face, a face whose
corners lie in a line, or one whose outline crosses itself; `GeometryError` for faces that don't
close the solid.

```kupcad
tetra = polyhedron(points: [[0, 0, 0], [10, 0, 0], [0, 10, 0], [0, 0, 10]],
                   faces: [[0, 2, 1], [0, 1, 3], [0, 3, 2], [1, 2, 3]])
puts tetra.volume.round(3)   # 166.667
```
