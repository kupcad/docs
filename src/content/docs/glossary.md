---
title: Glossary
description: The words the reference uses as if known — from assembly to tolerance.
---

**Assembly.** A named group of solids kept apart for export: a 3MF or glTF file holds each part
on its own. Made with `assemble`. [Assemblies](/reference/geometry/assemblies/)

**B-Rep.** Boundary representation: a solid described by its exact faces, edges and curves, as
STEP files hold it. KupCAD's second engine, used for STEP export; the first works on meshes.
[Engines](/reference/geometry/shapes/#engines)

**Block.** Code handed to a method in `{ }` or `do ... end`, run once per item: `map { |x| ... }`.
[Blocks](/guides/language/blocks/)

**Boolean.** Combining two shapes: union (`+`), difference (`-`) or intersection (`&`).
[Booleans](/reference/geometry/booleans/)

**Chamfer.** A corner cut off straight. On a cube, a sketch or a path. Compare *fillet*.

**Fillet.** A corner rounded with an arc. `path.fillet(r)` rounds every corner of a path;
`round_r:` rounds a cube's or a square's corners.

**Involute.** The curve a gear tooth's flank follows so that two gears roll on each other
without catching. [Making parts](/guides/parts/gears/)

**Kernel.** The geometry engine that computes shapes: booleans, sweeps, measurements. Shapes are
recorded as a script runs and computed when something needs them.
[When geometry is computed](/reference/geometry/shapes/#when-geometry-is-computed)

**Manifold.** A mesh that encloses a volume with no gaps, no overlapping faces and no edge shared
by more than two faces: what a printer needs. KupCAD's default engine keeps every solid so.

**Mesh.** A solid as triangles, as STL, 3MF, glTF and OBJ hold it. Curves are approximated by
straight edges; see *resolution*.

**Module (gear).** The size of a gear's teeth: the pitch diameter divided by the number of teeth.
Gears mesh when their modules are equal.

**Module (language).** A `.kup` file another imports, or a `module Name ... end` block grouping
constants and functions. [Imports](/reference/language/imports/)

**Parameter.** A value a person sets without editing the script: a slider, a checkbox or a
choice in the apps, `-p name=value` on the command line. Declared with `param`.
[Parameters](/reference/inputs/parameters/)

**Part.** A solid in a model, with its name and material. A parts list counts each distinct part
and its copies. [Parts lists](/reference/geometry/assemblies/#parts-lists)

**Path.** Open 2D geometry: lines and arcs from a start to an end. It encloses nothing until
closed, and then it is a sketch. [Paths](/reference/geometry/paths/)

**Pitch.** Of a thread: the distance between turns. Of a gear: the distance between teeth along
the pitch circle.

**Resolution.** How many straight edges a full circle is cut into when a curved shape is
computed. `CAD.config(resolution: { segments: n })`.
[Resolution](/reference/geometry/engine-settings/#resolution)

**Revolve.** Turning a sketch about an axis to make a solid: a mug from its half section.
[revolve](/reference/geometry/sweeps/#revolve)

**Sketch.** Closed 2D geometry with an area: a square, a circle, a closed path. Extruded,
revolved or swept into a solid. [Sketches](/reference/geometry/sketches/)

**Solid.** 3D geometry with a volume. [Solids](/reference/geometry/solids/)

**Sweep.** Pushing a sketch along a path to make a solid: a handle, a pipe, a frame.
[sweep](/reference/geometry/sweeps/#sweep)

**Symbol.** A name used as a value, written `:name`. Parameters and fixed choices are named by
symbols. [Symbols](/reference/language/syntax/#symbols)

**Tolerance.** How close two points must be to count as the same, when the kernel joins or
compares geometry. [Tolerance](/reference/geometry/engine-settings/#tolerance)
