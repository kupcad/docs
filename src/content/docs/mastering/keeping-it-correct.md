---
title: 11. Keeping it correct
description: The tools that catch a wrong model before it is printed — lint, the formatter, assertions and warnings, errors you can rescue, the debugger, and scripts that test scripts.
sidebar:
  order: 11
---

A CAD script can be wrong in ways a program can't: it runs, it exports, and the part doesn't
fit. KupCAD gives a script several ways to say what must be true of the model and to find out
when it isn't.

## Lint

`kupcad check` reads a script without running it and reports what is likely a mistake: a size
of zero or less, a variable never read, a shape subtracted from itself, a parameter declared
after it is used, a `segments:` where `sides:` was meant. The editor shows the same findings
as you type, with a fix where there is one.

```sh
kupcad check .                       # every script under the folder
kupcad check --max-warnings 0 .      # fail on any finding, for CI
kupcad check --format json part.kup  # for tools
```

A finding that is deliberate is hidden with a comment naming the rule, and a reason:

```kupcad
# kupcad:disable-next-line unused-variable -- kept for the next revision
spare = cube(5)
cube(2)
```

A directive that hides nothing is itself reported, so they don't pile up. Rules can be turned
up, down or off per project in `.kupcad.json`. [Lint rules](/reference/tooling/lint-rules/)
lists them all.

## Format

`kupcad fmt --write .` lays scripts out one way: argument lists that don't fit on a line are
broken one per line, method chains one call per line, trailing commas in. `kupcad fmt --check`
exits 1 when a file isn't formatted, which keeps a repository tidy without anyone arguing.
Every script in this section is formatted that way; the long `param` calls are what that
looks like. [Formatter](/reference/tooling/formatter/) has the settings.

## Assertions

An assertion is a sentence about the model that must be true, checked when the script runs:

```kupcad
wall = 1.2
diameter = 30
height = 40

assert(wall >= 0.9) { "a wall of #{wall} mm is thinner than two lines" }
assert(diameter > 2 * wall + 5) { "no room inside a #{diameter} mm cup" }

cup = cylinder(d: diameter, h: height) - cylinder(d: diameter - 2 * wall, h: height).translate(z: wall)
assert(cup.bbox.z_max <= 250) { "taller than the printer" }

cup
```

A failed assertion stops the script with the message; the editor shows it on the line,
`kupcad build` prints it and exits 1. The block is only run when the assertion fails, so a
message can do arithmetic freely. Assert what the geometry must get right — a gap, a wall, a
size, a volume — as [Designing for the printer](/mastering/designing-for-the-printer/) shows
with `min_gap` and `intersects?`.

## Warnings

Some things are worth saying but not worth stopping for:

```kupcad
wall = 1.2
warn("a wall of #{wall} mm prints as two lines; 1.35 is cleaner") if wall < 1.35
cube(x: 20, y: 20, z: wall)
```

`warn` writes `[Warning] ...` to the console and the script goes on. The editor shows warnings
with the output; `kupcad build` prints them to stderr. Use them for advice the person at the
sliders should hear and may ignore.

## Errors you can rescue

An operation that can't be done raises an error with a class and a message: an empty boolean
is a `GeometryError`, an import that doesn't exist an `ImportError`, a parameter out of its
range a `ValueError`. A script can catch what it knows how to handle:

```kupcad
label_font = begin
  import_font("./fonts/Missing.ttf")
rescue ImportError
  "sans-bold"
end

text("OK", size: 8, font: label_font).extrude(1)
```

Rescue only what you have an answer for; anything else should stop the build, loudly.
[Errors](/reference/language/errors/) has the classes and `begin`/`rescue`/`ensure`.

## The debugger

`debugger()` on a line pauses a `kupcad build` or `kupcad watch` run from a terminal and gives
a prompt: evaluate an expression, list the locals, step to the next line, continue. Anywhere no
one could answer — the editor, the playground, `kupcad run`, a pipe — it does nothing, so a
forgotten `debugger()` never stalls a build. For the editor, `puts` and `.inspect` are the
tools: `puts section.bbox.inspect` after a suspicious line says what the sketch has become.

## Scripts as tests

A script that asserts and exports nothing is a test. Keep one beside a library and run it in
CI:

```kupcad
import { bolt } from "hardware"

shank = bolt(10)
assert(shank.bbox.z_size == 10) { "bolt(10) must be 10 mm long" }
assert(shank.contains?([0, 0, 5])) { "bolt(10) must be solid on its axis" }
puts "hardware: ok"   # hardware: ok
```

`kupcad run tests.kup` exits 1 if any assertion fails. The step fits next to `check` and
`fmt --check` in [the CI recipe](/recipes/parts-list-in-ci/). Test what the users of the
library depend on: that a hole goes through, that a thread's major diameter is what the
parameter says, that a gear's pitch radius matches its module and teeth.

## Reading an error

An error names its class, says what was wrong in plain words and points at the line:

```text
error(vm): TypeError: translate expects a number for x, got Array
error(vm):     from script:53:38:in 'script'
```

The message says what it expected and what it got; the second line is where. In the editor the
line is underlined and the hover carries a link to the error's page in this documentation.
[Errors](/reference/language/errors/#compile-error-codes) lists the compile errors.

[kupcad check](/reference/tooling/cli/#kupcad-check) · [Lint rules](/reference/tooling/lint-rules/) ·
[Formatter](/reference/tooling/formatter/) · [assert, warn](/reference/stdlib/kernel/) ·
[Errors](/reference/language/errors/) · [debugger](/reference/stdlib/kernel/#debugger) ·
[Language server](/reference/tooling/language-server/)

Next: [Where next](/mastering/where-next/).
