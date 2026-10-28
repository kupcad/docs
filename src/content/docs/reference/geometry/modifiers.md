---
title: Offsets, cuts and sections
description: Growing and hollowing shapes, cutting them by planes, taking sections, and splitting them into pieces.
sidebar:
  order: 8
---

| Method | Solid | Sketch | Returns |
|---|:-:|:-:|---|
| [`offset`](#offset) | ✓ | ✓ | the receiver's kind |
| [`shell`](#shell) | ✓ | ✓ | the receiver's kind |
| [`trim_by_plane`](#trim_by_plane) | ✓ | | `Solid` |
| [`split_by_plane`](#split_by_plane) | ✓ | | Array of two Solids |
| [`slice`](#slice) | ✓ | | `Sketch` |
| [`project`](#project) | ✓ | | `Sketch` |
| [`simplify`](#simplify) | ✓ | | `Solid` |
| [`decompose`](#decompose) | ✓ | | Array of Solids |

## offset

```kupcad frame="none"
sketch.offset(delta = 1, join: :round, miter_limit: 2, segments: 0)
solid.offset(delta, segments: 0)
```

Grows the shape by `delta` on every side, or shrinks it by a negative one.

**A Sketch's** corners follow `join:`. A miter reaches at most `miter_limit` times `delta` before
it is squared off.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `delta` | Number | 1 | How far to grow; negative shrinks. |
| `join` | Symbol | `:round` | The corners: `:round`, `:square`, `:miter` or `:bevel`. |
| `miter_limit` | Number | 2 | With `join: :miter` only; at least 2. |
| `segments` | Number | 0 | Segments per full turn for round corners; 0 follows the resolution for a circle of radius `delta`. |

**A Solid's** offset is round all over: grown, it is the Minkowski sum with a sphere of radius
`delta`, so every edge comes out rounded and the part grows by `delta` on every side. Shrunk,
it is what is left once the space around it, grown by that sphere, is cut away: its outer edges
stay sharp and its inner ones come out rounded. A Solid shrunk past its own thickness is empty.
It takes no other join.

**Returns:** the receiver's kind.

**Raises:** `ValueError` for a Solid's `delta` of 0, or a Solid's `join:` other than `:round`;
`ArgumentError` for `miter_limit:` without `join: :miter`, or on a Solid.

```kupcad
puts square(10).offset(1, join: :miter).area     # 144
puts square(10).offset(-1).area                  # 64
puts cube(2).offset(0.2).bbox.min.inspect        # [-0.2, -0.2, -0.2]
puts cube(10).offset(-1).bbox.min.inspect        # [1, 1, 1]
```

## shell

```kupcad frame="none"
shape.shell(thickness, segments: 0)
```

Hollows the shape to walls `thickness` thick, keeping its outside: the shape less its offset by
`-thickness`. A Sketch's shell is the band along its outlines. A Solid's is closed all round, so
a difference cuts it open. Walls thicker than half the shape leave it whole.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `thickness` | Number | — | The wall thickness, greater than 0. |
| `segments` | Number | 0 | Segments per full turn for the rounded inner edges; 0 follows the resolution. |

**Returns:** the receiver's kind.

```kupcad
puts square(10).shell(1).area   # 36
cup = cylinder(r: 20, h: 30).shell(2) - cylinder(r: 30, h: 10).translate(z: 29)
```

## trim_by_plane

```kupcad frame="none"
solid.trim_by_plane(nx, ny, nz, offset = 0)
solid.trim_by_plane([nx, ny, nz], offset = 0)
solid.trim_by_plane(normal: [nx, ny, nz], offset: 0)
solid.trim_by_plane(nz: 1, offset: 4)
```

The part of the solid on the side of a plane that its normal points to. The plane has normal
`[nx, ny, nz]` and lies `offset` along it from the origin. Given by keywords, a normal component
left out is 0.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `nx`, `ny`, `nz` | Number | 0 | The plane's normal. Also `normal:`, as an Array. |
| `offset` | Number | 0 | The plane's distance from the origin along the normal. |

**Returns:** `Solid`.

**Raises:** `ArgumentError` when no normal is given, or for `normal:` with `nx:`, `ny:` or `nz:`.

```kupcad
top = cube(10).trim_by_plane(0, 0, 1, 4)
puts top.bbox.z_min   # 4
```

## split_by_plane

```kupcad frame="none"
solid.split_by_plane(nx, ny, nz, offset = 0)
```

Both sides of a plane: `[the side the normal points to, the other side]`. The plane is given as
for `trim_by_plane`; without a normal it is the YZ plane (`[1, 0, 0]`).

**Returns:** Array of two `Solid`s. Either may be empty.

```kupcad
upper, lower = cube(10).split_by_plane(nz: 1, offset: 4)
puts upper.bbox.z_min   # 4
puts lower.bbox.z_max   # 4
```

## slice

```kupcad frame="none"
solid.slice(height = 0)
```

The cross-section of the solid at z = `height`, as a Sketch.

**Returns:** `Sketch`.

```kupcad
taper = square(10, center: true).extrude(10, scale: 0.5)
puts taper.slice(5).area   # 56.25: 7.5 × 7.5 halfway up
```

## project

```kupcad frame="none"
solid.project(cut: false)
```

The solid's shadow on the XY plane, looking down z, as a Sketch. With `cut: true` it is the
section at z = 0 instead, as `slice(0)`.

**Returns:** `Sketch`.

```kupcad
footprint = sphere(5).translate(z: 20).project
puts footprint.bbox.x_size   # 10
```

## simplify

```kupcad frame="none"
solid.simplify(tolerance = nil)
```

A copy with fewer triangles: edges and corners whose removal moves the surface by no more than
`tolerance` are collapsed, so flat regions merge. Without a tolerance it uses the one the part
was made under (see [Engine settings](/reference/geometry/engine-settings/#tolerance)). The
solid is computed at once.

**Returns:** `Solid`.

## decompose

```kupcad frame="none"
solid.decompose
```

The solid's separate pieces, each a Solid of its own. The solid is computed at once.

**Returns:** Array of `Solid`s.

```kupcad
pieces = (cube(2) + cube(2).translate(5, 0, 0)).decompose
puts pieces.size   # 2
```
