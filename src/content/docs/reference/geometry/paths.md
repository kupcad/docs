---
title: Paths
description: Open 2D lines and arcs — line, polyline and arc — and every method of a Path.
sidebar:
  order: 4
---

A `Path` is open 2D geometry in the XY plane: straight segments and arcs from a start point,
kept exact. An imported drawing's open lines are Paths too, and may hold cubic curves (see
[Drawings](/reference/inputs/drawings/)). A Path encloses nothing, so it has no area and no
sweep: [`close`](#close) or [`stroke`](#stroke) turns it into a Sketch, which can be extruded.

A Path exports to SVG and DXF as an open, unfilled line, its arcs and curves exact. A 3D format
refuses one.

```kupcad
hook = line([0, 0], [10, 0]) + arc(center: [10, 5], r: 5, start: -90, sweep: 180) + polyline([[10, 10], [0, 10]])
plate = hook.close.extrude(3)
wire = hook.stroke(1.5).extrude(1)
[hook.named("outline"), plate.translate(y: 20)]
```

## line

```kupcad frame="none"
line(from, to)
```

A straight segment between two points, `[x, y]` each.

**Returns:** `Path`.

**Raises:** `ValueError` when the two points are the same.

## polyline

```kupcad frame="none"
polyline(points)
```

Straight segments through `points`, `[x, y]` each, in order; at least 2.

**Returns:** `Path`.

**Raises:** `ValueError` for a point that repeats the one before it.

```kupcad
p = polyline([[0, 0], [10, 0], [10, 10]])
puts p.length   # 20
```

## arc

```kupcad frame="none"
arc(center: [x, y], r: 10, start: 0, sweep: 90)
arc(r: 10, start: [x, y], to: [x, y], ccw: true, large: false)
```

An arc of a circle, given one of two ways:

- **By its centre**: `center:`, the radius, `start:` the angle it starts at, and `sweep:`
  the angle it turns through, in degrees. A positive sweep runs counter-clockwise; at most a full
  turn.
- **By its ends**: the radius, `start:` the point it starts at and `to:` the point it ends at.
  It takes the short way round, counter-clockwise, unless `ccw: false` or `large: true`.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `r` | Number | — | The radius. Also `radius:`. |
| `center` | Array | — | The centre `[x, y]`, with a `start:` angle and `sweep:`. |
| `start` | Number or Array | — | The start angle in degrees (with `center:`), or the start point (with `to:`). |
| `sweep` | Number | — | The angle turned through, in degrees, other than 0. |
| `to` | Array | — | The end point `[x, y]`. |
| `ccw` | Boolean | `true` | Run counter-clockwise from `start:` to `to:`. |
| `large` | Boolean | `false` | Take the long way round from `start:` to `to:`. |

`end` and `from` are keywords of the language, which is why an arc's end is its `sweep:` or
`to:`.

**Returns:** `Path`.

**Raises:** `ArgumentError` for `center:` with `to:`, or a form missing its parts. `ValueError`
when the two points are further apart than twice the radius.

```kupcad
quarter = arc(center: [0, 0], r: 10, start: 0, sweep: 90)
puts quarter.length.round(3)   # 15.708
bend = arc(r: 10, start: [0, 10], to: [10, 0])
```

## Joining paths

`a + b` is the path along `a`, then on along `b`. `b` must start where `a` ends (within the
[tolerance](/reference/geometry/engine-settings/#tolerance)); otherwise it is a `ValueError`
naming both points. The result keeps `a`'s name and material.

## line_to

```kupcad frame="none"
path.line_to([x, y])
```

The path on from its end along a straight line to the point.

**Returns:** `Path`.

## arc_to

```kupcad frame="none"
path.arc_to([x, y], r: 5, ccw: true, large: false)
```

The path on from its end along an arc of radius `r` to the point: the arc
`arc(r:, start:, to:)` would draw from the end. `radius:` is the same as `r:`.

**Returns:** `Path`.

## tangent_arc_to

```kupcad frame="none"
path.tangent_arc_to([x, y])
```

The path on from its end along the arc that leaves the end the way the path does, without a
corner, and reaches the point.

**Returns:** `Path`.

**Raises:** `ValueError` for a point on the line the path leaves along, where no arc turns: use
`line_to` there.

```kupcad
slot = line([0, 0], [10, 0]).line_to([10, 5]).tangent_arc_to([5, 10]).line_to([0, 10]).close
```

## fillet

```kupcad frame="none"
path.fillet(r)
```

Rounds each corner where two segments (lines or arcs) meet by the arc of radius `r` that
touches both. Beside an arc, the arc gives up the part of its sweep the corner takes. The
path's ends stay where they are, and so does a joint where the path already goes on smoothly.

**Returns:** `Path`.

**Raises:** `ValueError` naming the point for a corner the path doubles back at, a segment too
short for the corners at its ends, or an arc that turns the corner's way more tightly than the
fillet.

```kupcad
corner = polyline([[0, 0], [10, 0], [10, 10]]).fillet(3)   # 7 along, a quarter turn of radius 3, 7 up
```

## chamfer

```kupcad frame="none"
path.chamfer(size)
```

Cuts each corner off by the line between the points `size` back along each side (round an arc).
The rules and errors are `fillet`'s.

**Returns:** `Path`.

## close

```kupcad frame="none"
path.close
```

The Sketch the path encloses, its end joined straight back to its start. Its arcs and curves
stay so in a drawing.

**Returns:** `Sketch`.

**Raises:** `ValueError` for a path of fewer than 2 segments.

## stroke

```kupcad frame="none"
path.stroke(width = 1, cap: :round, segments: 0)
```

The Sketch of the band `width` wide along the path.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `width` | Number | 1 | The band's width. |
| `cap` | Symbol | `:round` | Its ends: `:round` (a half circle), `:butt` (flat at the end) or `:square` (flat, half a width past the end). |
| `segments` | Number | 0 | Segments per full turn for the round joins and caps; 0 follows the resolution. |

The joins between segments are round.

**Returns:** `Sketch`.

## start, end, length

```kupcad frame="none"
path.start    # [x, y]
path.end      # [x, y]
path.length   # mm
```

The path's first and last point, and its length along its segments.

```kupcad
l = line([0, 0], [3, 4])
puts l.end.inspect   # [3, 4]
puts l.length        # 5
```

## bbox

```kupcad frame="none"
path.bbox
```

The [BoundingBox](/reference/geometry/inspection/#boundingbox) of the path itself, the bend of
its arcs and curves included, with z 0.

**Returns:** `BoundingBox`.

## translate, rotate, scale, mirror

```kupcad frame="none"
path.translate(x, y)
path.rotate(angle, about: [x, y])
path.scale(s)
path.mirror(nx, ny)
```

A Path moves as a Sketch does, in the XY plane: it translates in x and y, turns about z (or
about the point `about:`), and mirrors across the line through the origin with normal
`[nx, ny]`. It scales evenly; an uneven scale is a `ValueError` when the path has arcs, as an arc
must stay an arc. See [Transforms](/reference/geometry/transforms/).

**Returns:** `Path`.

## named, material

```kupcad frame="none"
path.named(name)
path.material(color: "#RRGGBB")
```

The name and colour a drawing gives the path (its SVG `id`, its DXF layer). See
[Materials, names and display](/reference/geometry/appearance/).

**Returns:** `Path`.

## export_svg, export_dxf

```kupcad frame="none"
path.export_svg(path)
path.export_dxf(path)
```

Write the path as a drawing. See [Export formats](/reference/geometry/export/).

**Returns:** the Path.

## What a Path doesn't have

A Path has no `extrude`, `revolve`, `helix`, `loft`, `sweep`, `hull`, `offset` or `shell`, and
no boolean with another shape: `-` and `&` with a Path are errors, and `+` only joins two
Paths. Calling one is a `NoMethodError` that says to close or stroke the path first, and
`kupcad check` reports it before the script runs
([`shape-mismatch`](/reference/tooling/lint-rules/)).
