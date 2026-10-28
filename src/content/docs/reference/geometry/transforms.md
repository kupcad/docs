---
title: Transforms
description: Moving, turning, scaling, mirroring, aligning and repeating shapes.
sidebar:
  order: 5
---

A transform returns the shape moved; the receiver is unchanged. Which shapes have which:

| Method | Solid | Sketch | Path | Assembly |
|---|:-:|:-:|:-:|:-:|
| [`translate`](#translate) | ✓ | ✓ | ✓ | ✓ |
| [`rotate`](#rotate) | ✓ | ✓ | ✓ | |
| [`scale`](#scale) | ✓ | ✓ | ✓ | |
| [`mirror`](#mirror) | ✓ | ✓ | ✓ | |
| [`resize`](#resize) | ✓ | | | |
| [`center`](#center) | ✓ | ✓ | | ✓ |
| [`align`](#align) | ✓ | ✓ | | |
| [`transform`](#transform) | ✓ | ✓ | | |
| [`repeat_linear`](#repeat_linear) | ✓ | ✓ | | |
| [`repeat_polar`](#repeat_polar) | ✓ | ✓ | | |

A vector argument (an offset, angles, factors, a normal) is three numbers, one Array, or the
keywords `x:`, `y:` and `z:`: `translate(1, 2, 3)`, `translate([1, 2, 3])` and
`translate(x: 1, y: 2, z: 3)` are the same. A Sketch or a Path lies in the XY plane, so a
component that would move it out of the plane (`translate(z: 5)`, `rotate(x: 45)`) is a
`ValueError`: extrude it first.

A copy of a part moved by `translate` or `rotate` is the same part in the
[parts list](/reference/geometry/assemblies/#parts-lists); one mirrored or scaled is a part of
its own.

## translate

```kupcad frame="none"
shape.translate(x, y, z)
shape.translate([x, y, z])
shape.translate(x: 0, y: 0, z: 0)
```

Moves the shape by the offset. A missing axis is 0. A Sketch and a Path take `x` and `y`.

**Returns:** the receiver's kind.

```kupcad
puts cube(10).translate(z: 5).bbox.z_min   # 5
```

## rotate

```kupcad frame="none"
shape.rotate(a)
shape.rotate(x, y, z)
shape.rotate(angle: a, about: [x, y, z])
solid.rotate(a, axis: [x, y, z])
```

Turns the shape, in degrees.

- `rotate(a)` or `rotate(angle: a)` turns about the z axis, for every kind of shape.
- `rotate(x, y, z)` turns about x, then about y, then about z.
- `axis:` turns a Solid by `a` about any axis through the origin, right-handed.
- `about:` turns about that point instead of the origin: `[x, y, z]`, or `[x, y]` for a Sketch
  or a Path.

A Sketch and a Path turn about z only.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `x`, `y`, `z` | Number | 0 | Angles about each axis. |
| `angle` | Number | — | An angle about z, or about `axis:`. |
| `axis` | Array | — | The axis `[x, y, z]` to turn about (Solids only). |
| `about` | Array | origin | The point to turn about. |

**Returns:** the receiver's kind.

**Raises:** `ArgumentError` for `axis:` with angles `x`, `y`, `z`, or on a Sketch or a Path.

```kupcad
bar = cube([10, 1, 1])
puts bar.rotate(90).bbox.min.inspect                          # [-1, 0, 0]
puts bar.rotate(90, about: [5, 0, 0]).bbox.min.inspect        # [4, -5, 0]
tilted = bar.rotate(30, axis: [1, 1, 0])
```

## scale

```kupcad frame="none"
shape.scale(s)
shape.scale(x, y, z)
shape.scale([x, y, z])
shape.scale(x: 2)
```

Scales the shape about the origin. One number scales every axis by it. A missing axis keeps
its size (factor 1).

**Returns:** the receiver's kind.

**Raises:** `ValueError` for a factor of 0, and for an uneven scale of a Path with arcs.

```kupcad
puts cube(10).scale(2).bbox.max.inspect         # [20, 20, 20]
puts cube(10).scale(x: 2).bbox.max.inspect      # [20, 10, 10]
```

## mirror

```kupcad frame="none"
shape.mirror(nx, ny, nz)
shape.mirror([nx, ny, nz])
sketch.mirror(nx, ny)
```

Reflects the shape across the plane through the origin with normal `[nx, ny, nz]`; a Sketch or
a Path across the line through the origin with normal `[nx, ny]`.

**Returns:** the receiver's kind.

```kupcad
left = cube([10, 5, 5]).translate(5, 0, 0)
right = left.mirror(1, 0, 0)
puts right.bbox.min.inspect   # [-15, 0, 0]
```

## resize

```kupcad frame="none"
solid.resize([x, y, z], auto: false)
```

Scales a Solid so its bounding box has the sizes given. A size of 0, or one left out, keeps that
axis; with `auto: true` it scales instead by the factor of the first size given, keeping the
proportions. An empty Solid has no box to scale, and comes back as it is.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `size` | Array | — | The target sizes `[x, y, z]`; 1 to 3 of them. |
| `auto` | Boolean | `false` | Scale the axes given as 0 in proportion. |

**Returns:** `Solid`.

**Raises:** `ValueError` for a negative size.

```kupcad
puts cube(10).resize([20]).bbox.size.inspect               # [20, 10, 10]
puts cube(10).resize([20], auto: true).bbox.size.inspect   # [20, 20, 20]
```

## center

```kupcad frame="none"
shape.center(axes = "xyz")
```

Moves the shape so the centre of its bounding box is at the origin on the axes named: a String
or a Symbol of `x`, `y` and `z` (`center(:xy)`). A Sketch centres on x and y only. An Assembly
moves as a whole. An empty shape has no box, and comes back as it is.

**Returns:** the receiver's kind.

```kupcad
puts cube(10).center(:xy).bbox.min.inspect   # [-5, -5, 0]
```

## align

```kupcad frame="none"
shape.align(target, axes, my_align, target_align = my_align, offset = 0)
```

Moves the shape along `axes` so that its `my_align` side meets the target's `target_align` side,
`offset` beyond it. The sides are `"min"`, `"max"` and `"center"`; the axes are letters of `x`,
`y` and `z`. Each name is a String or a Symbol. The target is a Solid or a Sketch. An empty
shape comes back as it is; an empty target has no side to meet.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `target` | Solid or Sketch | — | The shape to align to. |
| `axes` | String or Symbol | — | The axes to move along: `:z`, `"xy"`. |
| `my_align` | String or Symbol | — | The shape's side: `min`, `max` or `center`. |
| `target_align` | String or Symbol | `my_align` | The target's side. |
| `offset` | Number | 0 | The distance beyond the target's side. |

**Returns:** the receiver's kind.

**Raises:** `ValueError` for an empty target.

```kupcad
base = cube(x: 40, y: 40, z: 5)
knob = cylinder(d: 10, h: 8)
  .align(base, :z, :min, :max)          # on top of the base
  .align(base, :xy, :center)            # in its middle
puts knob.bbox.z_min                    # 5
```

## transform

```kupcad frame="none"
solid.transform([m00, m10, m20, m01, m11, m21, m02, m12, m22, tx, ty, tz])
sketch.transform([m00, m10, m01, m11, tx, ty])
```

Applies an affine matrix, given flat and column-major: the columns of the linear part, then the
translation. A Solid takes 12 numbers, a Sketch 6.

**Returns:** the receiver's kind.

**Raises:** `ValueError` for a singular matrix, which would flatten the shape, and for the wrong
number of entries.

```kupcad
# x moves by y: a shear
sheared = cube(10).transform([1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0])
puts sheared.bbox.max.inspect   # [20, 10, 10]
```

## repeat_linear

```kupcad frame="none"
shape.repeat_linear(count, x, y, z)
shape.repeat_linear(count, [x, y, z])
shape.repeat_linear(count, x: 0, y: 0, z: 0)
```

`count` copies of the shape, each a step further along the offset, united. A count of 1 or less
gives the shape itself. A Sketch steps in x and y.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `count` | Number | — | How many copies, the first in place; at most 10,000. |
| `x`, `y`, `z` | Number | 0 | The step from one copy to the next. |

**Returns:** the receiver's kind.

```kupcad
fins = cube([1, 20, 10]).repeat_linear(5, x: 4)
puts fins.bbox.size.inspect   # [17, 20, 10]
```

## repeat_polar

```kupcad frame="none"
shape.repeat_polar(count, angle = 360)
```

`count` copies of the shape turned about the z axis, united. Over a full turn the copies are
spaced evenly, `360 / count` apart. Over less, the first is in place and the last at `angle`.
A count of 1 or less gives the shape itself.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `count` | Number | — | How many copies; at most 10,000. |
| `angle` | Number | 360 | The angle they spread over, in degrees. Also `angle:`. |

**Returns:** the receiver's kind.

```kupcad
bolt_holes = circle(r: 2).translate(20, 0).repeat_polar(6)
flange = (circle(r: 30) - circle(r: 10) - bolt_holes).extrude(5)
```
