---
title: Measuring
description: Bounding boxes, volume, area, mass, distances, containment and ray casts.
sidebar:
  order: 9
---

The measuring methods compute the shape first (see
[When geometry is computed](/reference/geometry/shapes/#when-geometry-is-computed)) and answer
in millimetres: mm² for areas, mm³ for volumes, grams for masses. The B-Rep engine can't measure
yet: every method here except a Path's is a `NotImplementedError` for a B-Rep part (see
[Engine settings](/reference/geometry/engine-settings/#the-b-rep-engine-today)).

| Method | Solid | Sketch | Path | Assembly | Returns |
|---|:-:|:-:|:-:|:-:|---|
| [`bbox`](#bbox) | ✓ | ✓ | ✓ | ✓ | `BoundingBox` |
| [`volume`](#volume) | ✓ | | | | Number |
| [`surface_area`](#surface_area) | ✓ | | | | Number |
| [`area`](#area) | | ✓ | | | Number |
| [`genus`](#genus) | ✓ | | | | Number |
| [`center_of_mass`](#center_of_mass) | ✓ | | | | `[x, y, z]` |
| [`mass`](#mass) | ✓ | | | ✓ | Number |
| [`intersects?`](#intersects) | ✓ | | | | Boolean |
| [`min_gap`](#min_gap) | ✓ | | | | Number |
| [`contains?`](#contains) | ✓ | ✓ | | | Boolean |
| [`ray_cast`](#ray_cast) | ✓ | | | | Array of Maps |
| [`empty?`](#empty) | ✓ | ✓ | | | Boolean |

A Path's `length`, `start` and `end` are on the [Paths](/reference/geometry/paths/#start-end-length)
page.

## bbox

```kupcad frame="none"
shape.bbox
```

The shape's axis-aligned bounding box. A Sketch's and a Path's have z 0. An Assembly's holds
all its parts.

An empty Sketch's `bbox` is `nil`. An empty Solid's is a box with `min` at `Infinity` and `max`
at `-Infinity` (its `size` is `[0, 0, 0]`); check [`empty?`](#empty) first.

**Returns:** `BoundingBox`.

```kupcad
box = cube(x: 50, y: 30, z: 20).bbox
puts box.size.inspect     # [50, 30, 20]
puts box.center.inspect   # [25, 15, 10]
puts box.x_max            # 50
```

### BoundingBox

A `BoundingBox` answers its corners, centre and size as `[x, y, z]` Arrays, and each axis's
part of them as a Number.

| Method | Returns |
|---|---|
| `min`, `max` | The low and high corners, `[x, y, z]`. |
| `center` | The centre, `[x, y, z]`. |
| `size` | The extent along each axis, `[x, y, z]`; never negative. |
| `x_min`, `y_min`, `z_min` | One axis of `min`. |
| `x_max`, `y_max`, `z_max` | One axis of `max`. |
| `x_size`, `y_size`, `z_size` | One axis of `size`. |
| `to_s`, `inspect` | `BoundingBox(min: [0, 0, 0], max: [50, 30, 20], size: [50, 30, 20])` |

## volume

```kupcad frame="none"
solid.volume
```

The volume the solid encloses, in mm³.

**Returns:** Number.

```kupcad
puts cube(x: 50, y: 30, z: 20).volume   # 30000
```

## surface_area

```kupcad frame="none"
solid.surface_area
```

The area of the solid's surface, in mm².

**Returns:** Number.

```kupcad
puts cube(x: 50, y: 30, z: 20).surface_area   # 6200
```

## area

```kupcad frame="none"
sketch.area
```

How much the sketch encloses, holes left out, in mm².

**Returns:** Number.

```kupcad
puts (square(10) - square(4).translate(3, 3)).area   # 84
```

## genus

```kupcad frame="none"
solid.genus
```

The number of holes through the solid: 0 for a cube, 1 for a ring.

**Returns:** Number.

```kupcad
puts cube(10).genus                                                   # 0
puts (cube(10) - cylinder(r: 2, h: 30).translate(5, 5, -1)).genus     # 1
```

## center_of_mass

```kupcad frame="none"
solid.center_of_mass
```

The centroid of the solid's volume, `[x, y, z]`: where it balances at a uniform density.

**Returns:** Array.

**Raises:** `ValueError` for an empty solid.

```kupcad
puts cube(x: 50, y: 30, z: 20).center_of_mass.inspect   # [25, 15, 10]
```

## mass

```kupcad frame="none"
solid.mass
assembly.mass
```

The mass in grams: the volume times the `density:` of the solid's
[material](/reference/geometry/appearance/#material), in g/cm³. An Assembly's mass is that of
every Solid in it, its sub-assemblies' too. A union has no material of its own, so assemble
parts of different materials to weigh them.

**Returns:** Number.

**Raises:** `ValueError` naming the part when a Solid has no density.

```kupcad
steel = cube(10).material(density: 7.85)
puts steel.mass   # 7.85
```

## intersects?

```kupcad frame="none"
solid.intersects?(other)
```

Whether the two solids overlap by more than the tolerance cubed. Solids that only touch, face on
face, don't.

**Returns:** Boolean.

**Raises:** `TypeError` when `other` isn't a Solid.

```kupcad
box = cube(10)
puts box.intersects?(cube(5).translate(8, 0, 0))    # true
puts box.intersects?(cube(5).translate(10, 0, 0))   # false
```

## min_gap

```kupcad frame="none"
solid.min_gap(other)
solid.min_gap(other, search_length)
```

The shortest distance between two solids, however far apart. With `search_length`, it looks only
that far, which costs less: a wider gap answers `search_length`. 0 when they touch or overlap,
`Infinity` when either is empty.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `other` | Solid | — | The solid to measure to. |
| `search_length` | Number | — | The farthest to look, greater than 0. |

**Returns:** Number.

```kupcad
box = cube(10)
puts box.min_gap(cube(5).translate(20, 0, 0))       # 10
puts box.min_gap(cube(5).translate(50, 0, 0), 5)    # 5
```

## contains?

```kupcad frame="none"
solid.contains?([x, y, z])
sketch.contains?([x, y])
```

Whether the point is inside the shape. A point within the
[tolerance](/reference/geometry/engine-settings/#tolerance) of the surface or outline counts as
inside. A Sketch's holes don't contain; it takes `[x, y]` or `[x, y, z]`, and a point off the
z = 0 plane is never inside.

**Returns:** Boolean.

```kupcad
box = cube(10)
puts box.contains?([5, 5, 5])      # true
puts box.contains?([0, 0, 0])      # true: on the surface
puts box.contains?([15, 5, 5])     # false
puts square(10).contains?([5, 5])  # true
```

## ray_cast

```kupcad frame="none"
solid.ray_cast(origin, end)
```

Where the segment from `origin` to `end` (each `[x, y, z]`) meets the solid's surface, nearest
`origin` first. Each hit is a Map with String keys:

| Key | Value |
|---|---|
| `"distance"` | From `origin`, in mm. |
| `"position"` | Where it meets the surface, `[x, y, z]`. |
| `"normal"` | The face's outward normal, `[x, y, z]`. |
| `"crossing"` | `1` where the ray goes into the solid, `-1` where it comes out. |

A ray that only grazes an edge or a corner meets it as a `1` and a `-1` at the same distance,
which cancel. To measure how much material lies along a ray, sum by crossings rather than count
hits.

**Returns:** Array of Maps.

```kupcad
box = cube(x: 50, y: 30, z: 20)
hits = box.ray_cast([10, 10, 100], [10, 10, -100])
puts hits[0]["position"].inspect                            # [10, 10, 20]
puts hits.map { |h| -h["crossing"] * h["distance"] }.sum    # 20: the thickness along the ray
```

## empty?

```kupcad frame="none"
shape.empty?
```

Whether a Solid has no volume, or a Sketch no area. See
[Empty shapes](/reference/geometry/shapes/#empty-shapes).

**Returns:** Boolean.
