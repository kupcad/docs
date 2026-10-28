---
title: Assemblies and parts lists
description: Grouping Solids into named assemblies, and the parts list (bill of materials) of a model.
sidebar:
  order: 11
---

An `Assembly` is a named group of Solids and other assemblies, kept apart for export: a 3MF or
glTF file holds each part on its own, where a union would fuse them into one. It isn't a
`Shape`: it has no booleans or sweeps, only the methods below.

## assemble

```kupcad frame="none"
assemble(name: "Housing", parts: [solid_or_assembly, ...])
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `name` | String | — | The assembly's name. |
| `parts` | Array | — | Solids and assemblies. An assembly among them stays one. |

The assembly keeps its own copy of the Array, so changing the Array afterwards doesn't change it.
Assemblies nest at most 64 deep, and an assembly places at most 100,000 Solids, counting a
sub-assembly each time it is placed.

**Returns:** `Assembly`.

**Raises:** `TypeError` naming the first part that is neither a Solid nor an assembly (for a
`nil`, it suggests `compact`); `ArgumentError` for positional arguments.

```kupcad
arm = cube([40, 5, 5])
base = cylinder(d: 30, h: 5)
robot = assemble(name: "robot", parts: [base, arm.translate(0, 0, 5), arm.translate(0, 10, 5)])
```

## Assembly methods

| Method | Returns |
|---|---|
| `name` | The name it was given. |
| `parts` | Its Solids and assemblies as it was given them, as a new Array each time. |
| `bbox` | The [BoundingBox](/reference/geometry/inspection/#boundingbox) around all its parts. |
| `bom` | Its [parts list](#parts-lists): every Solid in it, its sub-assemblies' too. |
| `mass` | The [mass](/reference/geometry/inspection/#mass) of every Solid in it, in grams. |
| `translate(x, y, z)` | A new assembly of the same name, every part moved alike. |
| `center(axes = "xyz")` | A new assembly, moved so its bounding box is centred on the origin. |
| `export_stl`, `export_3mf`, `export_gltf`, `export_obj`, `export_step`, `export_svg`, `export_dxf` | Writes it to a file; see [Export formats](/reference/geometry/export/). |

```kupcad
plate = cube(x: 40, y: 30, z: 3)
post = cylinder(d: 6, h: 20).translate(20, 15, 3)
stand = assemble(name: "Stand", parts: [plate, post])
puts stand.name                  # Stand
puts stand.parts.size            # 2
puts stand.bbox.max.inspect      # [40, 30, 23]
lifted = stand.translate(z: 10)
```

## Parts lists

`bom` lists a model's parts: each distinct part once, with how many copies of it there are.

```kupcad
bolt = cylinder(r: 1.5, h: 20).material(color: "#888888", density: 7.85).named("M3 bolt")
plate = cube(x: 40, y: 30, z: 3).named("plate")
bolts = [[5, 5], [35, 5], [5, 25], [35, 25]].map { |(x, y)| bolt.translate(x, y, 0) }
mount = assemble(name: "Mount", parts: [plate] + bolts)

mount.bom.each { |row| puts "#{row[:count]} × #{row[:name]}" }
# 1 × plate
# 4 × M3 bolt
```

**What counts as a part.** A part is the shape under a Solid's placement, with its name and
material. Two Solids are copies of one part when that shape is the same (equal content, however
it was reached) and so are the name and material.

- A copy moved by `translate` or `rotate` is the same part again.
- A mirrored or scaled copy is a part of its own, with the name it was made with. Rename it to
  tell them apart: `left.mirror(1, 0, 0).named("bracket R")`.
- A different colour or density makes another part.
- A union of copies is one fused Solid, so one part. Assemble the copies to count them.

**A row** is a Map with Symbol keys:

| Key | Value |
|---|---|
| `name` | The part's name, or `nil`. |
| `count` | How many copies. |
| `volume` | Its volume, in mm³. |
| `size` | Its bounding box's extent along x, y and z, in mm, as the part is made, before its placement. |
| `density` | Its material's density in g/cm³, or `nil`. |
| `mass` | Its mass in grams (volume times density), or `nil` without a density. |

Rows come in the order their parts first appear. The outermost `named` and `material` of a Solid
are its part's.

**Where:** `solid.bom` (one part), `assembly.bom`, and `kupcad build part.kup --bom bom.json`,
which writes the final model's list as JSON (`{"parts": [...]}`, with `null` for what a part
has none of). The same parts are what a 3MF export holds once each, and what `--split` writes a
file each of.

The B-Rep engine can't measure volume yet, so a list of B-Rep parts is a
`NotImplementedError`.
