---
title: Export formats
description: The export methods, and what each file format holds.
sidebar:
  order: 12
---

A model is usually exported by `kupcad build`, which writes the script's last value (see
[The model](/reference/geometry/shapes/#the-model)) in the format of its output file's
extension. The [command line](/reference/tooling/cli/) has the flags. A script can also write a
shape itself with the export methods below.

## Export methods

```kupcad frame="none"
shape.export_stl(path)
shape.export_3mf(path)
shape.export_gltf(path, draco = false)
shape.export_obj(path, mtl: false)
shape.export_step(path)
shape.export_svg(path)
shape.export_dxf(path)
```

| Method | Solid | Assembly | Sketch | Path |
|---|:-:|:-:|:-:|:-:|
| `export_stl`, `export_3mf`, `export_gltf`, `export_obj`, `export_step` | ✓ | ✓ | | |
| `export_svg`, `export_dxf` | ✓ | ✓ | ✓ | ✓ |

| Parameter | Type | Default | Description |
|---|---|---|---|
| `path` | String | — | The file to write, relative to the directory `kupcad` runs in. |
| `draco` | Boolean | `false` | `export_gltf`: compress each part's mesh with Draco. |
| `mtl:` | Boolean | `false` | `export_obj`: write the materials to a library beside it (`part.mtl`). |

`draco` is positional, `export_gltf("part.glb", true)`; `mtl:` is a keyword only,
`export_obj("part.obj", mtl: true)`.

An export writes only a file named for its format, in any case: `export_stl` a `.stl`,
`export_3mf` a `.3mf`, `export_gltf` a `.gltf` or `.glb`, `export_obj` a `.obj`,
`export_step` a `.step` or `.stp`, `export_svg` a `.svg` and `export_dxf` a `.dxf`. So neither a
script nor a package it imports can write over the project's scripts, `kupcad.json`,
`.kupcad.json` or `kupcad.lock`.

**Returns:** the receiver.

**Raises:** `ArgumentError` for a path not named for the format; `GeometryError` for an empty
model; `RuntimeError` naming the file when it can't be written (a missing directory, or a host
that gives the script no file system, such as the editor's preview);
`NotImplementedError` for `export_step` of a part the mesh engine built.

```kupcad
part = cube(20).material(color: "#FF5F14").named("block")
part.export_stl("block.stl")
part.export_gltf("block.glb", true)
part.export_obj("block.obj", mtl: true)
part.export_svg("block.svg")
```

## What the model may hold

A 3D format (STL, 3MF, glTF, OBJ, STEP) takes the model's Solids and refuses a Sketch (extrude
it) or a Path (close or stroke it, then extrude). A 2D format (SVG, DXF) draws the Sketches, the
Paths, open and unfilled, and each Solid as its silhouette on the XY plane, as `project` gives
it. A model a format can't hold is an error naming what is wrong, never a file with part of the
model.

Parts are named from [`named`](/reference/geometry/appearance/#named). Where a format names its
objects, a name used twice is numbered (`lid`, `lid_2`), and a part without a name is `part_1`,
`part_2` and so on.

## STL

Binary STL: one mesh, in millimetres. An assembly's parts are united into it, as STL holds a
single mesh. No colours or names.

## 3MF

Each part of the [parts list](/reference/geometry/assemblies/#parts-lists) is stored once, as a
mesh in millimetres with its name and colours, and placed once per copy. A slicer gets four bolts
as one part printed four times, where an STL merges them.

## glTF and GLB

A `.glb` file is binary glTF. A `.gltf` file is glTF JSON with its buffer embedded as a base64
data URI. Each part is a node of its own, named after it, with its material.

glTF is in metres with y up, as the format defines: the meshes stay in millimetres, under a root
node that scales them by 0.001. Ghosts are exported beside the model, in glTF and GLB only.

With Draco compression, each part's primitive carries its own compressed vertices, their positions
quantized to 14 bits: an error of the part's size / 16384. `kupcad build --draco-bits` sets
another precision.

## OBJ

Wavefront OBJ text: one object per Solid, named after its part (`o lid`, `o lid_2`), in
millimetres with z up as the script made it (OBJ has no unit or up axis), with a normal per face.

Without the material library it has no materials. With it (`mtl: true`, or `kupcad build --mtl`),
the library is written beside it (`part.mtl`; `materials.mtl` for the parts of a `--split`):
each run of faces names its material, and the library gives each the script's colour as its
diffuse and ambient colour and its alpha as its dissolve.

## STEP

A STEP file (AP214) holds exact geometry only, so every part must be built by the B-Rep engine:
make the part inside `CAD.with_config(engine: :brep) do ... end`, or set
`CAD.config(engine: :brep)`. A part the mesh engine built is a `NotImplementedError` naming it.
`kupcad build -f step` builds the script on the B-Rep engine. The B-Rep engine supports only
some shapes so far; see [The B-Rep engine today](/reference/geometry/engine-settings/#the-b-rep-engine-today).

```kupcad
CAD.with_config(engine: :brep) do
  cube(20).export_step("block.step")
end
```

## SVG

A drawing in millimetres: `width`, `height` and a `viewBox` of the drawing's bounds, y turned
over, as SVG's runs down the page.

- Each Sketch, and each Solid's silhouette, is one `<path>` of its outlines, filled by the
  even-odd rule in its material colour (grey without one), with a thin black outline: 0.1 mm, or
  `kupcad build --stroke-width`, a laser cutter's hairline, say.
- A Path is an open, unfilled `<path>`.
- A shape's name is its path's `id`. Each id is different: a name used twice, or two names that
  spell alike as an id (`a:b` and `a/b`), are numbered (`a_b_2`).

## DXF

The same drawing as ASCII DXF (AutoCAD 2004), in millimetres with y up. Each outline is a
closed `LWPOLYLINE` on a layer named after its shape (`0` for a shape without a name), in the
shape's colour, as true colour and as the nearest basic colour. A name's characters DXF forbids
become `_`, and two names that spell alike that way get layers of their own (`a_b`, `a_b_2`).

## Curves in drawings

SVG and DXF write the curves a script defines as true curves, not the chords the kernel draws
them with, so a laser or a mill cuts a round hole round whatever the resolution:

- As arcs (SVG `A`, DXF bulges; an outline that is one circle, a DXF `CIRCLE`): a `circle`
  through moves, turns, even scales, mirrors and the booleans it survives; the corners of
  `square(round_r:)` and `polygon(round_r:)`; a Path's arcs; and in a Solid's projection or
  slice, its cylinders' caps and its straight extrusions' sketches, through moves that keep the
  XY plane.
- As cubic curves (SVG `C`, a DXF `SPLINE` per outline that has one): a `text`'s glyphs, and an
  imported drawing's curves, through any move, scale or boolean they survive whole.

What a boolean cut through a chord or a curve, an ellipse (`scale(2, 1)`), an offset, and a
tilted or tapered Solid stay polylines. An arc lies on the ideal circle, so a drawing is outside
the mesh of the same model by up to the chord's sagitta.
