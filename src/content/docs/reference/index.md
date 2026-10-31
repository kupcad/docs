---
title: Reference overview
description: How the KupCAD reference is organised, and the conventions its pages follow.
---

KupCAD is a language for parametric CAD. A script (a `.kup` file) reads like Ruby: values have
methods, calls chain, and blocks iterate. It builds geometry by calling shape constructors and
chaining operations on what they return. The script's last value is the model that
`kupcad build` exports.

```kupcad
# @title Mounting plate
width = param(:width, default: 40, validate: { min: 20, max: 120 }, unit: "mm")
holes = param(:holes, default: 4, validate: { in: [2, 4] })

plate = cube(x: width, y: 30, z: 4, round_r: 2)
bolt = cylinder(d: 3.4, h: 10).translate(z: -1)
spots = holes == 4 ? [[5, 5], [width - 5, 5], [5, 25], [width - 5, 25]] : [[5, 15], [width - 5, 15]]

plate.difference(spots.map { |(x, y)| bolt.translate(x, y, 0) })
```

This reference describes KupCAD's main branch, ahead of the 0.1.0 release. New to KupCAD?
[Start here](/start/install/), then the guides [The language](/guides/language/first-script/)
and [Making parts](/guides/parts/solids/).

## Sections

- **[Language](/reference/language/syntax/)**: the syntax, from literals and operators to
  methods, blocks, classes, errors and modules, and where KupCAD differs from Ruby.
- **[Geometry](/reference/geometry/shapes/)**: the shapes (`Solid`, `Sketch`, `Path`), their
  constructors, every operation on them, assemblies, export and the engine settings.
- **[Standard library](/reference/stdlib/kernel/)**: the global functions and the built-in
  classes: `Number`, `String`, `Array`, `Map`, `Math`, `Random` and the rest.
- **[Parameters and imports](/reference/inputs/parameters/)**: the parameters a host fills in,
  data, mesh, drawing and font files, and packages.
- **[Tooling](/reference/tooling/cli/)**: the `kupcad` command, its configuration file, the
  lint rules, the formatter and the language server.

## Conventions

**Units.** Lengths are millimetres and angles are degrees, unless a page says otherwise (the
`Math` functions without a `d` suffix take radians). Areas are mm², volumes mm³, masses grams
and densities g/cm³.

**Signatures.** A built-in's call forms are shown first, without a frame, then a table of its
parameters:

```kupcad frame="none"
cylinder(r, h, center = false)
cylinder(r: 5, h: 10, sides: 6)
```

A parameter listed in a call form can be passed by position or as a keyword; the table lists
the keywords that have no position. `name = value` in a call form is the default. `nil` passed
for an optional parameter leaves it unset, as if it weren't passed. A keyword a built-in doesn't
take is an `ArgumentError`, never ignored.

**Results.** **Returns** names the class of the result. A method that returns *the receiver's
kind* gives a `Solid` for a solid and a `Sketch` for a sketch. Shapes are values: an operation
returns a new shape and never changes the one it is called on.

**Errors.** **Raises** lists the errors a call raises for bad input, by class. All are
subclasses of `StandardError` and can be rescued; see [Errors](/reference/language/errors/).

**Examples.** Every framed example is a script that `kupcad check` accepts. A comment after a
line shows what it gives (`# 1000`) or what it raises (`# ValueError`).
