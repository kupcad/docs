---
title: Shapes and the model
description: The three kinds of shape, how they are made and combined, and what a script's model is.
sidebar:
  order: 1
---

Every piece of geometry a script makes is a `Shape`, of one of three kinds:

| Class | What it is | Made by | Becomes 3D by |
|---|---|---|---|
| `Solid` | A closed 3D body | [`cube`, `cylinder`, `sphere`, `torus`, `polyhedron`](/reference/geometry/solids/), and every operation on a Solid | — |
| `Sketch` | A filled 2D region in the XY plane, with holes | [`square`, `circle`, `regular_polygon`, `polygon`, `text`](/reference/geometry/sketches/), a Path's `close` or `stroke`, a Solid's `slice` or `project` | [Sweeps](/reference/geometry/sweeps/): `extrude`, `revolve`, `helix`, `loft`, `sweep` |
| `Path` | An open line of straight segments and arcs in the XY plane | [`line`, `polyline`, `arc`](/reference/geometry/paths/) | `close` or `stroke` into a Sketch, then a sweep |

`Solid`, `Sketch` and `Path` are subclasses of `Shape`, so a helper that takes any shape checks
`is_a?(Shape)` and one that needs a body checks `is_a?(Solid)`:

```kupcad
part = cube(10)
outline = square(10)
edge = line([0, 0], [10, 0])

puts part.class                 # Solid
puts outline.is_a?(Shape)       # true
puts edge.is_a?(Sketch)         # false
```

An [`Assembly`](/reference/geometry/assemblies/) is a named group of Solids, not a Shape.

## Making shapes

The constructors are global functions, and also class methods of the kind they make:
`Solid.cube(10)` is `cube(10)`, `Sketch.square(5)` is `square(5)` and `Path.line(a, b)` is
`line(a, b)`. Shapes have no `.new`, and their classes can't be subclassed; a class of your own
holds or builds a shape instead (see [Classes and modules](/reference/language/classes-and-modules/)).

Shapes are values. Every operation returns a new shape and leaves its receiver as it was, so calls
chain:

```kupcad
plate = cube(x: 40, y: 20, z: 3)
drilled = plate - cylinder(d: 4, h: 10).translate(20, 10, -1)
raised = drilled.translate(z: 5)

puts plate.bbox.z_min     # 0
puts raised.bbox.z_min    # 5
```

A shape answers only the methods of its kind: a Sketch has no `volume` and a Solid no
`extrude`. Calling one is a `NoMethodError`, and `respond_to?` says so beforehand. A Path's error
says to close or stroke it first. `kupcad check` reports such a call before the script runs
(the [`shape-mismatch`](/reference/tooling/lint-rules/) rule).

```kupcad
puts square(1).respond_to?(:volume)    # false
puts square(1).respond_to?(:extrude)   # true
puts cube(1).respond_to?(:extrude)     # false
```

## Units and axes

- Lengths are millimetres, angles degrees, areas mm² and volumes mm³.
- Axes are right-handed with z up. A positive angle turns counter-clockwise, looking down
  the axis toward the origin.
- A Sketch and a Path lie in the XY plane, at z = 0. Moving one out of the plane
  (`translate(z: 5)`, `rotate(x: 45)`) is a `ValueError`: extrude it first.
- `extrude` grows a Sketch along +z. `revolve` turns it about the z axis, its x being the
  distance from the axis and its y the height.

## Empty shapes

A shape can be empty: a Solid with no volume, a Sketch with no area. `union([])`, an
`intersection` with nothing, and a cut that removes everything are empty. An empty shape is a
valid part that renders nothing. `empty?` tells:

```kupcad
gone = cube(5) - cube(10).translate(-1, -1, -1)
puts gone.empty?      # true
puts union([]).empty? # true
puts cube(5).empty?   # false
```

An empty shape has no box: its `bbox` is `nil`. Moving one by its box leaves it as it is
(`center`, `align`, `resize`), and in a parts list its `volume` is `0` and its `size`
`[0, 0, 0]`.

## Printing a shape

`inspect` and `puts` show a Solid and a Sketch by class, `#<Solid>` and `#<Sketch>`, and a
Path by its segments and ends: `#<Path 3 segments from [0, 0] to [0, 10]>`. What a shape
measures (its size, its volume) takes the geometry kernel to work out, so printing never shows
it. Use the [measuring methods](/reference/geometry/inspection/) instead.

## When geometry is computed

Making and combining shapes records the operations. The geometry kernel computes a shape the
first time something needs its geometry: a measurement (`volume`, `bbox`, `contains?`), an
export, or the build of the model. A `GeometryError` from the kernel (a `polyhedron` that isn't
closed, say) is raised there.

## The model

The model is the script's last value. `kupcad build` exports it, and the editor and the
playground show it. It may be:

- a `Solid`, a `Sketch`, a `Path` or an `Assembly`;
- an Array of them, with Arrays nested inside it.

Anything else is an error naming it: `the model's item 2 (nil) is not a shape`. A 3D format
(STL, 3MF, glTF, OBJ, STEP) takes the Solids and refuses a Sketch or a Path: extrude a Sketch,
close or stroke a Path. A 2D format (SVG, DXF) draws the Sketches and the Paths, and each Solid
as its silhouette on the XY plane. Nothing is left out of a file silently. See
[Export formats](/reference/geometry/export/).

```kupcad
base = cube(x: 30, y: 30, z: 4)
post = cylinder(d: 6, h: 20).translate(15, 15, 4)
[base, post]
```

A script that ends with `.ghost` (see [Materials, names and display](/reference/geometry/appearance/))
ends with the shape the ghost was called on, which is then its model.

## Engines

Two geometry engines build shapes:

- **`:manifold`**, the default: fast mesh booleans, for previews and mesh formats.
- **`:brep`**: exact boundary representation, for STEP files. It is still being written and
  supports only some shapes and operations so far.

A script chooses with `CAD.config(engine: :brep)`, or for one part with
`CAD.with_config(engine: :brep) do ... end`. Geometry keeps the engine and settings it was made
under. See [Engine settings](/reference/geometry/engine-settings/).
