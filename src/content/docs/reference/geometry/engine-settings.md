---
title: Engine settings
description: CAD.config and its settings — the engine, the tolerance and the resolution — and what the B-Rep engine supports today.
sidebar:
  order: 13
---

The `CAD` object holds the settings geometry is built under. The shared settings mean the same
on both engines, so a model reads the same whichever engine builds it.

## CAD.config

```kupcad frame="none"
CAD.config(engine: :manifold, tolerance: 1e-5, resolution: { ... }, max_vertices: 5_000_000, manifold: { ... }, brep: { ... })
```

Changes the settings for the rest of the script. Only the settings given change. A module the
script imports starts with the settings the script started with, and the settings it puts in
force end with it.

**Returns:** `nil`.

**Raises:** `ArgumentError` for a setting that doesn't exist, naming the ones that do; `TypeError`
for a value of the wrong type; `ValueError` for a value the engines can't use (a tolerance of 0,
a 2-edge circle). Nothing is applied then.

```kupcad
CAD.config(
  engine: :manifold,          # or :brep (exact B-Rep, for STEP)
  tolerance: 1e-5,            # points closer than this are the same point
  resolution: {               # how finely curves are cut into straight edges
    segments: 0,              # edges per full circle; 0 = from the two rules below
    min_angle: 12,            # at most this many degrees of arc per edge ...
    min_length: 2,            # ... and edges no shorter than this, whichever gives fewer
  },
  max_vertices: 5_000_000,    # most vertices one operation may produce
  manifold: { simplify_coplanar: false },                       # mesh engine only
  brep: { max_newton_trials: 50, max_marching_steps: 500 },     # B-Rep only
)
```

## CAD.with_config

```kupcad frame="none"
CAD.with_config(settings) do ... end
```

Runs the block with the settings applied on top of the current ones, then puts the current ones
back, however the block ends. The settings are those of `CAD.config`.

**Returns:** the block's value.

```kupcad
fine_ball = CAD.with_config(resolution: { min_angle: 5 }) do
  sphere(r: 10)
end
```

## CAD.current_config

```kupcad frame="none"
CAD.current_config
```

The settings in force, as a Map with the keys `CAD.config` takes (groups as nested Maps).

**Returns:** Map.

```kupcad
puts CAD.current_config[:resolution].inspect   # {segments: 0, min_angle: 12, min_length: 2}
```

## CAD.preview?

```kupcad frame="none"
CAD.preview?
```

`true` while the editor's or the playground's live preview runs the script (and for the hovers
that read that run); `false` under `kupcad build`, `run` and `watch`. A script can leave out
detail only an export needs, as OpenSCAD's `$preview` lets one. What it builds then differs from
the export, so keep the difference to detail.

**Returns:** Boolean.

```kupcad
thread_turns = CAD.preview? ? 0 : 12
```

## Settings

| Setting | Type | Default | Meaning |
|---|---|---|---|
| `engine` | Symbol | `:manifold` | The engine new geometry is built on: `:manifold` (meshes) or `:brep` (exact). |
| `tolerance` | Number | `1e-5` | The distance below which two points are the same point. Greater than 0. |
| `resolution` | Map | | How finely curves are drawn; see below. |
| `resolution[:segments]` | Number | 0 | Edges per full circle; 0 takes them from `min_angle` and `min_length`. 3 to 2048 otherwise. |
| `resolution[:min_angle]` | Number | 12 | At most this many degrees of arc per edge. Above 0, at most 180. |
| `resolution[:min_length]` | Number | 2 | Edges no shorter than this, in mm. Above 0. |
| `max_vertices` | Number | 5,000,000 | The most vertices one operation may produce. At least 1. |
| `manifold[:simplify_coplanar]` | Boolean | `false` | Mesh engine: merge coplanar triangles (within the tolerance) after each boolean, hull and union. |
| `brep[:max_newton_trials]` | Number | 50 | B-Rep engine: iteration limit of the solvers that project points onto surfaces; 1 to 1,000. |
| `brep[:max_marching_steps]` | Number | 500 | B-Rep engine: step limit along a surface–surface intersection in a boolean; 1 to 100,000. |

### Resolution

`resolution` is OpenSCAD's `$fn`, `$fa` and `$fs`. Curved shapes (`sphere`, `cylinder`,
`circle`, `torus`, `offset`, `revolve`, rounded corners) take their segment count from it:

- With `segments` above 0, every full circle gets that many edges.
- With `segments` 0, a circle of radius `r` gets `360 / min_angle` edges or
  `2πr / min_length`, whichever is fewer, rounded up: at least 5, at most 2048. Small circles
  get few edges, large ones up to the angle's limit.

`segments:` on a call overrides the resolution for that call. A rounded corner gets its circle's
share of segments, rounded up, so it is never a single chord. A sweep that turns the profile gets
its share of a full turn (see [Sweeps](/reference/geometry/sweeps/)). A count that isn't whole
(`segments:`, `sides:`, `slices:`) is rounded down, as OpenSCAD does with `$fn`.

`text` follows the resolution too: its glyphs are drawn as finely as a circle half the text size
(`tolerance:` on the call sets the chord tolerance itself).

### Tolerance

`tolerance` is the one distance tolerance:

- The B-Rep engine welds points and sews faces within it.
- `manifold: { simplify_coplanar: true }` merges coplanar faces within it.
- `contains?` counts a point within it of a shape's outline or surface as inside, the same on
  both engines. `intersects?` counts an overlap of more than its cube.
- `simplify` without a tolerance uses it, and so does joining two Paths with `+`.

### Settings stick to geometry

Geometry keeps the settings it was made under. A part made inside
`CAD.with_config(engine: :brep) do ... end` is a B-Rep part wherever it is later measured or
exported, and `CAD.config` changes the settings for what is made after it, not before. A part is
measured under its own tolerance too: `contains?`, `simplify` without a tolerance, and a
drawing's arcs read the one it was made under, not the one in force where they are called. The
same part made under two settings is two parts.

```kupcad
coarse = sphere(10)
CAD.config(resolution: { segments: 128 })
fine = sphere(10)          # coarse is still drawn as it was made
```

## The B-Rep engine today

`engine: :brep`, and every STEP export, runs on Locus, KupCAD's own exact B-Rep engine, which is
still being written. Today it builds:

- cubes, cylinders (with `r1` equal to `r2`) and polyhedra;
- the sketches `square`, `circle`, `polygon` and `text`;
- the convex hulls of flat-faced solids (`hull`, `batch_hull`);
- STEP files of them.

Everything else is a `NotImplementedError` that names what is missing and suggests
`engine: :manifold`, rather than a stand-in answer:

- shapes and operations: spheres, cones; `translate`, `rotate`, `scale`, `mirror`,
  `transform`; booleans on solids and on sketches; hulls of curved solids and of sketches;
  `extrude` (and so `cube(round_r:)` and `cube(chamfer:)`), `revolve`, `loft`, `helix`;
  `offset` and `minkowski`, `trim_by_plane` and `split_by_plane`, `slice`, `project`,
  `decompose`; empty shapes (`union([])`);
- measurements: `volume`, `surface_area`, `genus`, `empty?`, `bbox` and what uses it (`align`,
  `center`, `resize`), `contains?`, `ray_cast`, `min_gap`, and a sketch's outlines (what a
  2D export is made of);
- meshes: STL and glTF export, and the viewer.

Materials are the exception: a B-Rep model is built without them, with one warning. Each of
these turns on as Locus implements it. `kupcad check` reports what the B-Rep engine can't do
yet before the script runs ([`brep-unsupported`](/reference/tooling/lint-rules/)).

A STEP file holds only exact geometry, so a part built by the mesh engine (left on the default
engine, or made in a `CAD.with_config(engine: :manifold)` block) is a `NotImplementedError` that
names the part.
