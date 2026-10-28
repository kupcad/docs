---
title: Materials, names and display
description: Colours, materials and densities, part names, and the viewer's ghost and highlight.
sidebar:
  order: 10
---

These methods change how a shape looks, what it is called and what it weighs, not its geometry.
Each returns a new shape of the receiver's kind.

## material

```kupcad frame="none"
shape.material(color: "#RRGGBB", alpha: 1, roughness: 0.5, metallic: 0, transmission: 0, density: nil)
```

How a Solid is shaded, and what it is made of. On a Sketch or a Path, `color:` is the colour of
its drawing (its SVG fill, its DXF colour); the rest is kept with it.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `color` | String | `"#FFFFFF"` | `"#RRGGBB"` or `"#RGB"`. |
| `alpha` | Number | 1 | Opacity, 0 to 1. Becomes an OBJ material's dissolve. |
| `roughness` | Number | 0.5 | 0 (mirror) to 1 (matte). |
| `metallic` | Number | 0 | 0 to 1. |
| `transmission` | Number | 0 | How much light passes through, 0 to 1. |
| `density` | Number | — | g/cm³, for the [parts list](/reference/geometry/assemblies/#parts-lists)'s mass and [`mass`](/reference/geometry/inspection/#mass). Shows nowhere. |

At least one keyword is needed. The material goes with the Solid into glTF, 3MF, OBJ (with its
material library) and SVG and DXF exports, and into the viewer. A Solid's outermost material is
the one that counts: `cube(5).material(color: "#f00").material(color: "#00f")` is blue. A
union has no material of its own.

The B-Rep engine can't keep materials yet: a B-Rep model is built without them, with one
warning.

**Returns:** the receiver's kind.

**Raises:** `ValueError` for a colour in another form, a factor outside 0 to 1, or a density of
0 or less; `ArgumentError` with no keywords.

```kupcad
part = cube(10).material(color: "#FF5F14", roughness: 0.2, metallic: 0.8, density: 1.24)
glass = sphere(5).material(color: "#88CCFF", alpha: 0.4, transmission: 0.9)
```

## named

```kupcad frame="none"
shape.named(name)
```

Gives a Solid, a Sketch or a Path a name: the name its part has in the
[parts list](/reference/geometry/assemblies/#parts-lists), and in exports (a glTF node, an OBJ
object, an SVG path's `id`, a DXF layer, a `--split` file). It stays through moves. A Sketch's
name isn't passed to a Solid extruded from it, nor to its offset. As with materials, the
outermost name counts.

**Returns:** the receiver's kind.

```kupcad
bolt = cylinder(r: 1.5, h: 20).named("M3 bolt")
lid = square(40).named("lid")
```

## ghost

```kupcad frame="none"
solid.ghost
ghost { solid }
```

Shows a semi-transparent copy of a Solid in the viewer, for reference: a mating part, an
envelope, a part from a previous version. A ghost isn't part of the model. It is exported beside
the model to glTF and GLB, and nowhere else.

- `solid.ghost` returns the solid itself, unchanged, so the script can go on using it. A script
  that ends with `.ghost` ends with that solid, which is then its model.
- `ghost { ... }` shows the Solid the block gives and returns `nil`.

**Returns:** the Solid (method); `nil` (block form).

**Raises:** `TypeError` when the block gives anything but a Solid; `ArgumentError` for a `break`
in the block.

```kupcad
envelope = cube(100).ghost
ghost { cylinder(d: 22, h: 7) }
cube(20)
```

## highlight

```kupcad frame="none"
solid.highlight
highlight { solid }
```

Shows a Solid in the viewer's highlight colour, seen through whatever hides it, to find a part
in a busy model. The geometry is unchanged; a glTF export only tags the part's material for the
viewer.

- `solid.highlight` returns the solid, marked.
- `highlight { ... }` returns the Solid the block gives, marked.

**Returns:** `Solid`.

**Raises:** `TypeError` when the block gives anything but a Solid; `ArgumentError` for a `break`
in the block.

```kupcad
bolt = cylinder(r: 3, h: 20).highlight
body = cube(30) - bolt
```
