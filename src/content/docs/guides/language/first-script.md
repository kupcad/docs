---
title: 1. Your first script
description: What a line of KupCAD does, how calls chain, and how a script becomes a model.
sidebar:
  order: 1
---

This guide is about the language itself: values, methods, blocks, classes, parameters and
files. It builds nothing big; each page has small scripts you can run. The next guide,
[Making parts](/guides/parts/solids/), then builds a mug and a gearbox with them.

## A call

```kupcad
cube(10)
```

`cube` is a method; `10` is its argument. Most of KupCAD is calls like this one.

## A chain

The result of a call is a value, and a value has methods of its own. A dot calls one:

```kupcad
cube(10).translate(z: 5).rotate(45)
```

Read it left to right: a cube, moved up 5, turned 45 degrees. Each call gives a new shape; the
one before is unchanged.

## Variables

A name holds a value, so you can use it twice or give it a meaning:

```kupcad
wall = 3
box = cube(20)
box - cube(20 - 2 * wall).translate(wall, wall, wall)
```

Names are lower case with underscores. There is no declaration: a name exists from its first
assignment.

## The model is the last value

A script's last value is what the viewer shows and `kupcad build` exports. In the script above,
that is the hollow box. A `puts` prints something and isn't the model:

```kupcad
box = cube(20)
puts box.volume   # 8000
box
```

The script ends with `box`, on its own line, so `box` is the model.

## Comments

```kupcad
# A comment runs to the end of the line
wall = 3 # and can follow code
cube(wall)
```

Two comments at the very top, `# @title` and `# @description`, name the script for the apps.

## Running it

- In the [playground](https://kupcad.org/playground/) or the [IDE](https://kupcad.dev/): type,
  and the model follows.
- On the command line: `kupcad build part.kup -o part.stl` exports the model;
  `kupcad run part.kup` runs the script for what it prints.

## In the reference

[Syntax](/reference/language/syntax/) · [Shapes and the model](/reference/geometry/shapes/#the-model)
· [kupcad build](/reference/tooling/cli/#kupcad-build)

Next: [Values](/guides/language/values/).
