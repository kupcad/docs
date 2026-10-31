---
title: 8. Structuring a script
description: Keeping a model readable as it grows — from one script to methods, classes, files and packages, and when each step is worth taking.
sidebar:
  order: 8
---

Every build in this section fits on two screens, and that is where a script should stay. When a
model grows past that, it is time to give it structure. Each step below costs a little and buys
a lot, in order; take only the ones the model needs.

## One script, in order

A readable script runs top to bottom in the order someone would ask about it:

1. `# @title` and `# @description`, so a host can name it.
2. Parameters, all of them, with `title:`, `unit:` and `validate:`. Nothing is read before it
   is declared.
3. Derived numbers: the sizes everything else is computed from (`pitch = cell + web`), each
   named for what it is, not how it is used.
4. Settings: `CAD.config`.
5. Methods, if any.
6. The geometry, in the order it is built, with a comment of a line or two before each piece
   saying what it is and why it is shaped so.
7. Names, materials, and the model as the last expression.

Comments say *why*: the hinge's "the pin itself is the first leaf's, one piece through them
all" tells what the code can't. A comment that repeats the code ("extrude 8 mm") is noise.
`kupcad fmt` keeps the layout consistent, so no one has to think about it.

## Methods

A method is worth writing when the same shape is made twice with different numbers (the
honeycomb's `hexagon`, the jar's `thread`), or when a piece of arithmetic has a name
(`cell_at`). A method sees the script's variables, so it needn't be passed what every call would
pass the same:

```kupcad
pitch = 21.8
row_step = 18.9

def cell_at(column, row)
  [column * pitch + (row.odd? ? pitch / 2 : 0), row * row_step]
end

def hexagon(across)
  circle(r: across / Math.sqrt(3), sides: 6).rotate(30)
end

cells = [cell_at(0, 0), cell_at(1, 0), cell_at(0, 1), cell_at(1, 1)]
cells.map { |(x, y)| hexagon(20).translate(x, y) }.reduce { |all, one| all + one }
```

Name a method for what it returns (`hexagon`, `knuckle`, `thread`), take the arguments that
vary between calls, and keep it to one shape or one number. A method that builds half the
model is a script in disguise.

## Classes

A class is worth it when several methods share the same numbers and would otherwise all take
them as arguments. A gear is the standard case: its tooth count and module give its pitch
radius, its tip radius, its outline and its blank, and a planetary gearbox has three kinds of
gear that must agree. The [planetary gearbox](/examples/) example is written that way; the
shape of it is:

```kupcad
class Pulley
  attr_reader :teeth, :pitch

  def initialize(teeth, pitch)
    @teeth = teeth
    @pitch = pitch
  end

  def radius = @teeth * @pitch / (2 * Math::PI)

  def body(h) = cylinder(r: self.radius, h: h) - cylinder(d: 5, h: h + 2).translate(z: -1)

  def flange(h) = cylinder(r: self.radius + 1.5, h: 1).translate(z: h)
end

small = Pulley.new(20, 2)
puts small.radius.round(2)   # 6.37

small.body(8) + small.flange(8)
```

Inside a class, a bare name is a variable, never a method: the pulley's own methods are called
with `self.`, its fields read with `@`. That is KupCAD's rule, not Ruby's, and it keeps a
long class honest. [Classes and modules](/reference/language/classes-and-modules/) has the
rest: inheritance, class methods, `to_s`, constants.

Don't reach for a class to hold one shape; a method does that. Reach for it when the numbers
have a life of their own.

## Files

When a script has parts that another script would want — fasteners, a profile, a gear class —
move them to a file of their own and `export` them:

```kupcad frame="none"
# fasteners.kup
def m3_hole(h) = cylinder(d: 3.4, h: h + 2).translate(z: -1)
def countersink(h) = cylinder(r1: 3.2, r2: 1.7, h: 1.8).translate(z: h - 1.8) + m3_hole(h)

export m3_hole, countersink
```

```kupcad frame="none"
# bracket.kup
import { m3_hole, countersink } from "./fasteners.kup"

plate = cube(x: 40, y: 30, z: 3)
plate - countersink(3).translate(10, 15, 0) - m3_hole(3).translate(30, 15, 0)
```

Each file has its own variables; only what it exports is visible. A file imports others
relative to itself, and can't reach above the project's folder. The
[Files](/guides/language/files/) guide walks through it; [Imports and exports](/reference/language/imports/)
is the reference.

The IDE and the desktop app open a folder as a project, so files see each other as they do on
the command line.

## Packages

A library used by more than one project is a package: a folder with a `kupcad.json` naming
it, published as a git repository or a tarball, and imported by its name:

```kupcad frame="none"
import { m3_hole } from "hardware/fasteners.kup"
```

`kupcad pkg add` writes the dependency and its pinned version into the project's `kupcad.json`
and `kupcad.lock`, so a build is the same on every machine. [Packages](/reference/inputs/packages/)
has the format and the commands.

## Which step, when

| The model has… | Do |
|---|---|
| One shape repeated with different numbers | a method |
| A piece of arithmetic used in several places | a method, named for the number |
| Several methods sharing the same numbers | a class |
| Parts another script will want | a file, with `export` |
| Parts several projects will want | a package |

Everything on this list is in the examples: methods in the honeycomb wall, hinge and jar; a
class in the gearbox; a file and a package in the [Files](/guides/language/files/) guide.

[Methods](/reference/language/methods/) · [Classes and modules](/reference/language/classes-and-modules/) ·
[Imports and exports](/reference/language/imports/) · [Packages](/reference/inputs/packages/) ·
[Formatter](/reference/tooling/formatter/)

Next: [Data-driven models](/mastering/data-driven-models/).
