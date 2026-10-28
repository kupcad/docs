---
title: Booleans and hulls
description: Union, difference and intersection of shapes, their operators, convex hulls and Minkowski sums.
sidebar:
  order: 6
---

Booleans combine shapes of one kind: Solids with Solids, Sketches with Sketches. A Path has
none; see [Paths](/reference/geometry/paths/#what-a-path-doesnt-have).

## Operators

| Expression | Means |
|---|---|
| `a + b` | `a.union(b)` |
| `a - b` | `a.difference(b)` |
| `a & b` | `a.intersection(b)` |

Both sides are Solids, or both are Sketches. Anything else is a `TypeError`
(`'-' can't combine Solid and Sketch`). For two Paths, `+` [joins them](/reference/geometry/paths/#joining-paths).

```kupcad
a = cube(10)
b = cube(10).translate(5, 0, 0)
puts (a + b).volume   # 1500
puts (a - b).volume   # 500
puts (a & b).volume   # 500
```

## union

```kupcad frame="none"
shape.union(other, ...)
```

The shape and every other one together. Each argument is a shape of the receiver's kind or an
Array of them.

**Returns:** the receiver's kind.

**Raises:** `TypeError` naming the argument and index for anything else, `nil` included. Leave
optional parts out with `compact`:

```kupcad
with_boss = false
boss = with_boss ? cylinder(r: 4, h: 6) : nil
rib = cube([2, 20, 6])
part = cube(20).union([boss, rib].compact)
```

## difference

```kupcad frame="none"
shape.difference(other, ...)
```

The shape with every other one taken away: `a.difference(b, c)` is `a - b - c`. The arguments
are as `union`'s.

**Returns:** the receiver's kind.

```kupcad
holes = [[5, 5], [35, 5]].map { |(x, y)| cylinder(d: 3.4, h: 10).translate(x, y, -1) }
plate = cube(x: 40, y: 10, z: 3).difference(holes)
```

## intersection

```kupcad frame="none"
shape.intersection(other, ...)
```

What the shape and every other one have in common. The arguments are as `union`'s.

**Returns:** the receiver's kind.

## Empty lists

An empty list follows set theory, so a list of optional parts that ends up empty is never an
error:

- `a.union([])` and `a.difference([])` are `a`.
- `a.intersection([])` is the empty shape.

```kupcad
part = cube(10)
puts part.union([]).volume             # 1000
puts part.intersection([]).empty?      # true
```

## hull

```kupcad frame="none"
shape.hull(other, ...)
```

The convex hull of the shape and every other one: the smallest convex shape that holds them
all. The arguments are as `union`'s; with none, it is the hull of the shape alone. A Sketch's
hull is a Sketch, its round ends arcs in a drawing.

**Returns:** the receiver's kind.

```kupcad
slot = circle(5).hull(circle(5).translate(x: 20))
standoff = cylinder(d: 8, h: 2).hull(cylinder(d: 5, h: 10))
```

## Global union and batch_hull

```kupcad frame="none"
union([solid, ...])
batch_hull([solid, ...])
```

The union or the convex hull of every Solid in one Array, as a single operation.

- `union([])` is the empty Solid.
- `batch_hull([])` is an `ArgumentError`, a hull of nothing being no shape.
- Both take Solids only; anything else is a `TypeError`.

**Returns:** `Solid`.

```kupcad
pins = [cylinder(r: 2, h: 10), cylinder(r: 2, h: 10).translate(x: 20)]
casing = union(pins)
wrap = batch_hull(pins)
```

## minkowski

```kupcad frame="none"
solid.minkowski(other)
```

The Minkowski sum of two Solids: `other` swept over every point of the solid. With a sphere it
rounds every edge and grows the solid by the sphere's radius; [`offset`](/reference/geometry/modifiers/#offset)
does that in one call.

**Returns:** `Solid`.

```kupcad
rounded = cube(10).minkowski(sphere(1))
puts rounded.bbox.min.inspect   # [-1, -1, -1]
```

## Parts

A union of copies of a part is one fused Solid, and so one part in the
[parts list](/reference/geometry/assemblies/#parts-lists). To count the copies, assemble them
instead.
