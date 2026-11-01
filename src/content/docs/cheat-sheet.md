---
title: Cheat sheet
description: Every common shape, operation and method on one page, each with a one-line example and a link to its reference.
---

Lengths are millimetres, angles degrees. A script's last value is the model. Each name links to
its page in the reference.

## Solids

```kupcad frame="none"
cube(10)                                  # 10 × 10 × 10, corner on the origin
cube(x: 40, y: 30, z: 4, round_r: 2)      # a box, its vertical edges rounded
cube(20, center: true)                    # centred on the origin
cylinder(d: 8, h: 20)                     # also r:, and r1:/r2: for a cone
sphere(d: 20)
torus(r: 20, tube_r: 3)
polyhedron(points, faces)
```

[Solids](/reference/geometry/solids/)

## Sketches (2D)

```kupcad frame="none"
square(20)                                # also square([x, y], center: true, round_r: 2)
circle(d: 30)                             # also r:, sides: 6 for a hexagon
regular_polygon(6, r: 10)
polygon([[0, 0], [30, 0], [15, 20]])
text("KupCAD", size: 8)                   # also font:, halign:, valign:
sketch.offset(-2)                         # grow or shrink
sketch.shell(2)                           # the band along its outline
sketch.area
```

[Sketches](/reference/geometry/sketches/) · [offset, shell](/reference/geometry/modifiers/)

## Paths (lines and arcs)

```kupcad frame="none"
line([0, 0], [10, 0])
polyline([[0, 0], [10, 0], [10, 10]])
arc(center: [0, 0], r: 5, start: 0, sweep: 90)
path.line_to([x, y])                      # also arc_to, tangent_arc_to
path.fillet(3)                            # round every corner; chamfer(3) cuts them
path.close                                # the Sketch it encloses
path.stroke(1.5)                          # a Sketch of the line, this wide
a + b                                     # joins where a ends and b starts
```

[Paths](/reference/geometry/paths/)

## From 2D to 3D

```kupcad frame="none"
sketch.extrude(5)                         # also twist:, scale:, center:
sketch.revolve                            # about the y axis, which becomes z; revolve(90) a quarter
sketch.helix(20, pitch: 4)                # a thread or a spring; also turns:
sketch.loft(other_sketch, 15)             # a surface between the two
profile.sweep(path)                       # the profile along a path; or along [[x, y, z], ...]
solid.slice(4)                            # the Sketch cut at z = 4
solid.project                             # its outline from above
```

[Sweeps](/reference/geometry/sweeps/) · [slice, project](/reference/geometry/modifiers/#slice)

## Combining

```kupcad frame="none"
a + b                                     # union; also a.union(b), union([a, b, c])
a - b                                     # difference; a.difference([b, c]) takes a list
a & b                                     # intersection
hull([a, b])                              # the convex hull
a.minkowski(b)                            # rounds a with b
solid.shell(2)                            # hollow, walls 2 thick (slow on complex shapes)
solid.round_edges(1)                      # outer edges rounded, size kept (slow on complex shapes)
```

[Booleans and hulls](/reference/geometry/booleans/)

## Moving

```kupcad frame="none"
shape.translate(10, 0, 5)                 # also translate(z: 5), translate([x, y, z])
shape.rotate(45)                          # about z; rotate(x, y, z); rotate(a, axis: [1, 0, 0])
shape.scale(2)                            # uniform
shape.mirror(1, 0, 0)                     # across the plane with this normal
shape.center                              # its box centred on the origin; center("xy")
shape.align(...)
shape.repeat_linear(5, x: 10)             # copies in a row, united
shape.repeat_polar(6)                     # copies round z, united
```

[Transforms](/reference/geometry/transforms/)

## Measuring

```kupcad frame="none"
shape.bbox                                # .min, .max, .size, .x_min ... .z_max
solid.volume                              # mm³
sketch.area                               # mm²
solid.surface_area
solid.center_of_mass
solid.mass                                # with a material density
a.intersects?(b)
shape.empty?
```

[Inspection](/reference/geometry/inspection/)

## Names, colours, assemblies

```kupcad frame="none"
solid.named("lid")
solid.material(color: "#B22222", density: 1.24)
assemble(name: "Box", parts: [body, lid])  # parts kept apart in 3MF and glTF
assembly.bom                               # the parts list
solid.ghost                                # shown faint, for reference; not in the model
solid.highlight                            # drawn in the highlight colour
```

[Appearance](/reference/geometry/appearance/) · [Assemblies](/reference/geometry/assemblies/)

## Parameters

```kupcad frame="none"
w = param(:w, default: 40, validate: { min: 20, max: 120 }, step: 5, unit: "mm", title: "Width")
lid = param(:lid, default: true)                                     # a checkbox
finish = param(:finish, default: :matte, validate: { in: [:matte, :gloss] })  # a choice
label = param(:label, default: "KupCAD")                             # a text field
```

[Parameters](/reference/inputs/parameters/)

## Language

```kupcad frame="none"
wall = 3                                  # a variable; every number is one kind, 10 / 4 is 2.5
"a #{wall} mm wall"                       # interpolation
[1, 2, 3].map { |n| n * 2 }               # blocks; |(x, y)| unpacks a pair
(0...6).map { |i| ... }                   # 0 to 5
def post(h, d: 6) = cylinder(d: d, h: h)  # a method, one line; def ... end for more
x > 5 ? a : b                             # a choice; if / elsif / else / end, unless, case
assert(wall > 1) { "too thin" }           # stop with a message
puts value.inspect                        # print to the console
import { bolt } from "./hardware.kup"     # another file's exports
export bolt, M3
```

[The language](/guides/language/first-script/) · [Reference](/reference/language/syntax/)

## Settings and files

```kupcad frame="none"
CAD.config(resolution: { segments: 96 })  # smoother curves, for the rest of the script
shape.export_stl("part.stl")              # also export_3mf, export_step, export_svg, export_dxf
import data from "./sizes.json"           # a JSON file; data[:width]
import scan from "./scan.stl"             # a mesh; also .obj, .3mf, .step, .svg, .dxf, .ttf
```

```sh
kupcad build part.kup -o part.stl -p width=50   # export, with a parameter
kupcad build part.kup -o part.3mf --bom bom.json # with the parts list
kupcad build part.kup --split parts/            # each part to its own file
kupcad check .                                  # lint
kupcad fmt --write .                            # format
kupcad watch part.kup -o part.stl               # rebuild on every change
```

[Engine settings](/reference/geometry/engine-settings/) · [Export](/reference/geometry/export/) ·
[Command line](/reference/tooling/cli/)
