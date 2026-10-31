---
title: 10. Coming from Ruby or OpenSCAD
description: What to expect if you know one of them — the same ideas, and the few places KupCAD chose differently.
sidebar:
  order: 10
---

## From OpenSCAD

The shapes are the same; the way they are written is turned round. In OpenSCAD an operation
wraps the shape it changes; in KupCAD the shape comes first and the operation follows with a
dot.

| OpenSCAD | KupCAD |
|---|---|
| `translate([10, 0, 5]) cube(20);` | `cube(20).translate(10, 0, 5)` |
| `rotate([0, 0, 45]) cube(20);` | `cube(20).rotate(45)` |
| `difference() { a; b; }` | `a - b` |
| `union() { a; b; }` | `a + b`, or `union([a, b])` |
| `intersection() { a; b; }` | `a & b` |
| `linear_extrude(5) square(10);` | `square(10).extrude(5)` |
| `rotate_extrude() ...` | `sketch.revolve` |
| `for (i = [0:3]) ...` | `(0..3).map { \|i\| ... }` |
| `module post(h) { ... }` | `def post(h) ... end` |
| `function f(x) = x * 2;` | `def f(x) = x * 2` |
| `$fn = 96;` | `CAD.config(resolution: { segments: 96 })` |
| `echo(x);` | `puts x` |
| `x = 5; // a parameter` | `x = param(:x, default: 5)` |
| `hull() { a; b; }` | `hull([a, b])` |
| `minkowski() { a; b; }` | `a.minkowski(b)` |

Two differences in kind:

- **Variables are variables.** OpenSCAD's are set once per scope; KupCAD's can be reassigned,
  and a method can read the script's.
- **A shape is a value.** You can keep it in a variable, put it in an array, measure it
  (`volume`, `bbox`) and give it a name and a colour. Nothing is drawn until the script's last
  value.

## From Ruby

KupCAD reads like Ruby and mostly is Ruby. The differences are deliberate, and each has a
reason.

| In Ruby | In KupCAD | Why |
|---|---|---|
| Integers and floats | One kind of number; `10 / 4` is `2.5` | Sizes are measurements |
| `lambda`, `proc`, `f.()`, `f[x]` | `->(x) { }` only, called with `.call` | One way to do it |
| `return` in a block leaves the method | Leaves the block only | A block is a small lambda |
| `\|a, b\|` unpacks an array | Write `\|(a, b)\|` | Explicit is clearer |
| `&:name` | `{ \|v\| v.name }` | One way to do it |
| A bare `name` may call a method | Inside a class, call your own methods with `self.` | A name is a variable |
| `private` changes the methods after it | `private def name` on each method | Visibility is read where the method is |
| Reopen `String`, subclass `Array` | Built-in classes are sealed | A script's built-ins mean one thing |
| `arr[99]` is `nil` | `IndexError` | A wrong index is a bug |
| `and`, `or` at low precedence | Same as `&&`, `\|\|` | One precedence to remember |

The full list is [Differences from Ruby](/reference/language/ruby-differences/).

## Next

[Making parts](/guides/parts/solids/) builds a mug and a gearbox with what this guide covered.
[The reference](/reference/) has every method.
