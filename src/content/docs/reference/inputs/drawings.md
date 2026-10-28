---
title: Drawings
description: Read DXF and SVG drawings into a script as Sketches, or their open lines as Paths.
sidebar:
  order: 4
---

A 2D drawing from another CAD tool, a laser cutter's or a CNC's, or a logo from an
illustration program, reads as a `Sketch`, ready to extrude, offset or cut. Its arcs stay arcs
and its curves stay curves, so a drawing exported again has the same circles and splines.

```kupcad
import outline from "./bracket.dxf"

bracket = outline.extrude(4)
gasket = import_dxf("bracket.dxf", layers: ["cut", "holes"]).offset(-0.5).extrude(1)
[bracket, gasket.translate(z: 10)]
```

## import_dxf

```kupcad frame="none"
import_dxf(path, layers: nil, tolerance: nil, paths: false)
import name from "./file.dxf"
```

Reads an ASCII DXF file.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `path` | String | — | The file, from the project's directory. |
| `layers:` | String or Array | every layer | The layers to read, by name. |
| `tolerance:` | Number | the active tolerance | How far apart two ends may be and still join. Greater than 0. |
| `paths:` | Boolean | `false` | Return the drawing's open lines instead; see [Open lines](#open-lines). |

**Returns:** `Sketch`, or with `paths: true` an `Array` of `Path`s.

**Raises:** `ImportError` when the file can't be read, an outline doesn't close, a layer has no
outline (the message lists the layers there are), or with `paths: true` the file has no open
line.

## import_svg

```kupcad frame="none"
import_svg(path, tolerance: nil, paths: false)
import name from "./file.svg"
```

Reads an SVG file.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `path` | String | — | The file, from the project's directory. |
| `tolerance:` | Number | the active tolerance | How far apart a subpath's ends may be and still close. Greater than 0. |
| `paths:` | Boolean | `false` | Return the drawing's open lines instead; see [Open lines](#open-lines). |

**Returns:** `Sketch`, or with `paths: true` an `Array` of `Path`s.

**Raises:** `ImportError` when the file can't be read or parsed, or with `paths: true` it has no
open line.

## Importing by file name

An import of a file whose name ends in `.dxf` or `.svg` (in any case) reads it as a drawing:
`import plate from "./plate.dxf"` is `import_dxf` with the path taken from the importing file.
`with { type: "dxf" }` or `with { type: "svg" }` reads a file named otherwise. The import binds
a Sketch; use the function for `layers:`, `tolerance:` or `paths:`.

## Outlines and holes

Outlines fill by nesting, as a laser cutter reads them: an outline inside another is a hole, and
one inside the hole an island, whichever way each is drawn and whatever an SVG's fill rule says.
Pieces drawn separately are joined where their ends meet within `tolerance:`, either way round.
An outline that still doesn't close is an `ImportError` saying where its ends are and how far
apart, unless it is read as an open line.

## Open lines

`paths: true` reads what a Sketch can't hold: the drawing's open lines, such as a laser's score
and engrave lines, as an Array of Paths in the file's order. For an SVG these are its unfilled
open subpaths and its `line` elements; for a DXF, the pieces that join into no outline. Their
arcs stay arcs and their curves cubics.

The Sketch and the Paths together are the whole drawing:

```kupcad
[import_svg("box.svg"), *import_svg("box.svg", paths: true)]
```

`kupcad check` and the editor know the result's class: a Sketch, or with `paths: true` written
out, an Array.

## DXF entities

| Entity | Read as |
|---|---|
| `LINE`, `ARC`, `CIRCLE` | Exact lines, arcs and circles. |
| `LWPOLYLINE`, `POLYLINE` | Lines, their bulges as arcs. |
| `SPLINE` | Its curve: a polynomial spline of degree 3 or less exactly, as Bézier pieces; a rational or higher-degree one as cubics within `tolerance:`; one given by fit points alone as the cubic through them. |
| `ELLIPSE` | Cubic pieces of at most an eighth of a turn, within 4.2e-6 of its size. |
| `INSERT` | Its block's entities, placed (see [Blocks and use](#blocks-and-use)). |

A cubic whose control points lie on its chord is read as the line it draws.

## SVG elements

`path` (every command, `A` included), `rect` (with `rx` and `ry`), `circle`, `ellipse`,
`polygon`, `polyline`, `line` and `use` are read, through their own and their groups'
`transform`s.

- **Curves.** A circle's arcs (a `circle`, a rounded `rect`'s corners, an `A` with equal radii)
  stay arcs while the transforms keep circles round. Béziers stay curves (a quadratic raised to
  a cubic). An ellipse's arcs, and a circle's under an uneven scale, become cubic pieces of at
  most an eighth of a turn.
- **Outlines and strokes.** A subpath is an outline when it closes (`Z`, or ends within
  `tolerance:` of each other) or when its shape is filled, as SVG closes one for its fill. An
  open subpath that isn't filled (`fill="none"`) is a stroke: an [open line](#open-lines).
- **Styles.** Whether a shape is filled, and whether it is drawn at all (`display: none`), is
  read as CSS ranks it: its `style` attribute, then the file's `<style>` rules, then its `fill`
  attribute, a group's reaching what is in it. Rules with selectors of a type, classes, an id or
  `*`, and lists of them, are read, the most specific winning; other selectors and `@media`
  rules are ignored, and `!important` adds no weight.
- **Left out.** Text (convert it to paths), images, and what isn't drawn: `defs` (except through
  `use`), `clipPath`, `mask`, `display: none`, and other vocabularies' elements such as
  Inkscape's.

## Units

A DXF file's own unit (`$INSUNITS`: inches, centimetres, metres and the rest) is converted to
millimetres; a file without one is read in millimetres.

An SVG's units become millimetres by the root's `width` and `viewBox`; without them a user unit
is a CSS pixel, 1/96 inch. Its y axis, which runs down the page, is turned over about its origin,
so an `export_svg` read back lands where it was.

## Layers

`layers:` reads only the outlines on the layers named. A layer the file has no outline on is an
`ImportError` listing the layers it has. An SVG has no layers.

## Blocks and use

A DXF block reference (`INSERT`) draws its block's entities at its insertion point, scaled,
turned and repeated along its columns and rows (`MINSERT`'s array), blocks within blocks too.
An entity on layer `0` takes the layer of its `INSERT`, as AutoCAD draws it. An uneven scale
draws the block's arcs as cubics.

An SVG `use` draws the element it names (`href="#id"`, in `defs` or anywhere) where it stands,
through its `transform`, `x` and `y`, with the style it gives. A `symbol` is drawn as a group,
sized by the `use`'s `width` and `height` or its own. A `symbol` or a nested `svg` with a
`viewBox` fits it into its box as SVG does (`preserveAspectRatio`: centred by default,
`xMinYMin` and the rest, `slice` to cover the box, `none` to stretch); a size not given, or
given as a percentage, is the enclosing viewport's. Nothing is clipped.

## Left out and refused

- **DXF, left out:** what isn't an outline (text, dimensions, hatches, points, 3D faces and
  meshes) and what a layout draws in paper space (a title block, a viewport's frame).
- **DXF, refused:** an entity off the XY plane, a binary DXF file.
- **Both, refused:** a block that inserts itself, a `use` within what it names, a reference to
  another file.

| Limit | Value |
|---|---|
| File size | 64 MiB |
| Points a DXF's blocks place (vertices, centres, ends) | 8 million |
| Elements an SVG's `use`s draw | 1 million |
| What `use`s read again of the file | 64 MiB |
| Nesting of SVG elements and `use`s | 256 |
