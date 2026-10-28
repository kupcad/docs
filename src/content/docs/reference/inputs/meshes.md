---
title: Meshes and STEP
description: Read STL, OBJ and 3MF meshes into a script as Solids.
sidebar:
  order: 3
---

A mesh from a scanner, a mesh modeller, a slicer or a model site reads as a `Solid`. It can be
cut, combined, measured and exported like any other.

```kupcad
import scan from "./scan.stl"

bracket = import_obj("parts/bracket.obj")
scan.difference(bracket.translate(x: 5))
```

## import_stl

```kupcad frame="none"
import_stl(path, repair: true)
import name from "./file.stl"
```

Reads an STL file, binary or ASCII.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `path` | String | — | The file, from the project's directory. |
| `repair:` | Boolean | `true` | Mend a mesh that isn't closed; `false` refuses one instead. See [Mending](#mending). |

**Returns:** `Solid`.

**Raises:** `ImportError` when the file can't be read or parsed, or its mesh isn't closed and
can't be mended (or `repair: false` is given).

## import_obj

```kupcad frame="none"
import_obj(path, repair: true)
import name from "./file.obj"
```

Reads a Wavefront OBJ file. Each object (`o`) is a mesh of its own and the Solid is their union,
so overlapping parts (an assembly's `export_obj`) merge cleanly; faces before any `o` form one
mesh.

- A face names its corners by vertex number, from 1, or back from the last vertex for a
  negative number. Texture and normal numbers after slashes are ignored.
- A face of more than three corners is cut into triangles along its inside. A face with no
  area is left out.
- Normals, texture coordinates, groups, smoothing, materials, points, lines, curves and
  surfaces are left out.
- A line ending in `\` continues on the next.

Parameters, return value and errors are as for [`import_stl`](#import_stl).

## import_3mf

```kupcad frame="none"
import_3mf(path, repair: true)
import name from "./file.3mf"
```

Reads a 3D Manufacturing Format package. The Solid is what the package's build places: each
item's object where its transform puts it, so a plate of four copies of a part reads as the
four of them, united.

- An object made of components holds other objects, each placed by its own transform, nested.
- Objects stored in another part of the package (the production extension's `p:path`, which
  Bambu Studio and PrusaSlicer projects use) are read from there.
- The model's `unit` (micron to metre, inches and feet) is converted to millimetres.
- Only objects of type `model` are read. Supports and `other` objects are left out, as are
  colours, materials, textures, beam lattices and slices.
- The package's files may be stored or deflated.

Parameters, return value and errors are as for [`import_stl`](#import_stl).

## import_step

```kupcad frame="none"
import_step(path)
import name from "./file.step"
```

STEP import is not available yet: `import_step`, and an import of a `.step` or `.stp` file,
raise `NotImplementedError`.

## Importing by file name

An import of a file whose name ends in `.stl`, `.obj`, `.3mf`, `.step` or `.stp` (in any case)
reads it as a mesh instead of running it as a module. The path is relative to the importing
file, and a mesh is named bare, without braces, since it has no names in it.
`with { type: ... }` reads a file named otherwise:

```kupcad
import scan from "./scan.bin" with { type: "stl" }
import plate from "./plate.data" with { type: :"3mf" }
scan + plate
```

The types are `"stl"`, `"obj"`, `"3mf"` and `"step"`, as Strings or Symbols.
`import { part } from "./gear.stl"` is the syntax error `file-import-names`.

## Units

STL and OBJ numbers are read as millimetres: neither format records its unit, and KupCAD writes
millimetres. A 3MF file states its own unit, which is converted.

## Mending

The geometry kernel takes only a closed mesh: each edge on exactly two triangles, which run
along it in opposite directions. Many files from model sites aren't closed, so an import mends
the mesh, as a slicer does, and warns saying what it changed:

```text
import_stl: mended the mesh of 'part.stl' to close it: 3 holes filled, 12 points welded
```

The warning goes to stderr under `kupcad build`, and into the editor's diagnostics on the
import's line.

Mending:

1. drops degenerate triangles (a corner twice) and duplicates, including a pair facing
   opposite ways, which is a wall of no thickness;
2. welds the points of open edges that are closer than the tolerance (or than the file's
   numbers can tell apart);
3. turns triangles around to agree with their neighbours;
4. fills each hole, a loop of open edges, with triangles.

A mesh that is closed is left as it is. With `repair: false`, a mesh that isn't closed is an
`ImportError` instead. A mesh that mending can't close (an edge on more than two triangles, a
run of open edges that isn't a loop) is an `ImportError` either way, naming the problem and the
first such edge:

```text
ImportError: ... its mesh isn't closed, even mended: 1 edge is on more than two triangles; the first from [0, 0, 0] to [5, -10, 0]
```

## Errors and limits

Each of these is an `ImportError` naming the file, and for a text format the line:

- a face naming a vertex the file doesn't have;
- a vertex that isn't three finite numbers;
- a face of fewer than three corners, or more than 4096;
- a file with no faces;
- a 3MF package that isn't a zip archive, has no 3D model, places an object it doesn't have, or
  holds an object within itself.

| Limit | Value |
|---|---|
| File size | 256 MiB |
| A 3MF package, unpacked | 512 MiB |
| Triangles a 3MF build places | 20 million |
| Vertices a 3MF build places | 60 million |
| Meshes a 3MF build places (components multiply) | 100,000 |
