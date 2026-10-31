---
title: Modify an STL
description: Import a mesh, cut or add to it, and export it again.
sidebar:
  order: 3
---

A mesh you downloaded or scanned can be a shape like any other: import it, then cut holes,
add bosses, or split it.

```kupcad
# @title Mounting holes in a scan
import scan from "./scan.stl"

holes = [[2, 2], [8, 8]].map { |(x, y)| cylinder(d: 1.5, h: 30).translate(x, y, -1) }
scan.difference(holes)
```

- `import name from "./file.stl"` reads the file beside the script; `.obj`, `.3mf` and `.step`
  import the same way.
- The mesh is repaired as it is read (holes closed, faces oriented), so booleans work on it.
  A mesh that can't be repaired is an error that says why.
- Everything else applies: `translate`, `rotate`, `center`, `bbox` to find where it is, `slice`
  to see a section.

To put it in place first:

```kupcad frame="none"
part = import_stl("scan.stl").center("xy").translate(z: -import_stl("scan.stl").bbox.z_min)
```

That centres it on the origin and sets it on the floor, which is where a printer wants it.

```sh
kupcad build fix.kup -o fixed.stl
```

[Meshes](/reference/inputs/meshes/) · [center, align](/reference/geometry/transforms/#center)
