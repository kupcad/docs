---
title: Lint rules
description: The rules kupcad check applies, their levels, suppression comments, fixes and output formats.
sidebar:
  order: 3
---

`kupcad check` and the editor report three kinds of finding before a script runs: syntax
errors, compile errors (each with a code, listed on [Errors](/reference/language/errors/)), and
lint findings, each named by its rule:

```text
part.kup:3:1: W: Unused variable 'x'. Prefix with '_' if intentional. [unused-variable]
```

`E`, `W` and `I` are error, warning and info. Errors fail `kupcad check`; warnings and infos
don't, unless [`--max-warnings`](#output-and-ci) says so.

## Levels

Each rule's level is set in [`.kupcad.json`](/reference/tooling/configuration/) under `lint`, by
its id: `"off"`, `"info"`, `"warning"` or `"error"`.

```json
{ "lint": { "unused-variable": "off", "self-subtraction": "error" } }
```

| Rule | Default | Finds |
|---|---|---|
| [`nonpositive-size`](#nonpositive-size) | warning | A size written as zero or a negative number. |
| [`unused-variable`](#unused-variable) | warning | A variable assigned and never read. |
| [`unreachable-code`](#unreachable-code) | warning | Statements after one that always leaves. |
| [`self-subtraction`](#self-subtraction) | warning | A shape subtracted from itself. |
| [`param-order`](#param-order) | warning | A `param` read before it is defined, or defined where a host can't find it. |
| [`unused-param`](#unused-param) | warning | A `param` defined on its own line and never read. |
| [`unknown-keyword`](#unknown-keyword) | **error** | A keyword a built-in doesn't take. |
| [`segments-as-sides`](#segments-as-sides) | warning | `segments:` 3 to 8 on a cylinder or circle. |
| [`brep-unsupported`](#brep-unsupported) | warning | Something the B-Rep engine can't do yet, after `engine: :brep`. |
| [`shape-mismatch`](#shape-mismatch) | **error** | A method or operator used on a kind of shape that doesn't have it. |

`kupcad check --help` lists the rules too.

## Rules

### nonpositive-size

A size written as zero or a negative number: a primitive's, or a method's on a shape the script
is known to hold. Which arguments are sizes comes from each built-in's declaration, so a
coordinate such as `translate(-5)` is never flagged, and neither is an `offset(-1)`, which
shrinks a shape. A method of an object the lint can't place (an instance of the script's own
class) is left alone.

```kupcad frame="none"
cube(-5)                 # cube expects x to be greater than zero, got -5
cylinder(h: 0, r: 1)
cube(4).shell(-1)
a.min_gap(b, 0)          # when a is known to be a Solid
```

### unused-variable

A variable assigned and never read in its scope. Scopes are the language's: a `def`, a lambda, a
block, a class or a module body; an `if`, `while` or `for` body belongs to the enclosing one.

- `x += 1` reads `x`, and `export x` uses it.
- The last statement of a script, method or block hands its value back, so a model's final
  `part = box - drill` isn't reported.
- A method or constant of a class or module isn't reported: it is reached through the class.
- `@field`, `@@class_var` and `$global` aren't a scope's variables, so one set in `initialize` and
  read elsewhere isn't reported.
- A name starting with `_` is never reported.

```kupcad frame="none"
x = cube(5)              # Unused variable 'x'
cube(1)
```

**Fix:** rename it with a leading `_` (safe; `--fix` applies it).

### unreachable-code

Statements after one that always leaves: a `return`, `break`, `next` or `raise`; an `if` whose
branches all leave; a `case` with an `else` whose branches all leave; a `begin` whose body and
rescues all leave. A `return` inside a block leaves only the block, so it never ends the method
around it. Reported once, at the first dead statement.

```kupcad frame="none"
def f
  return 1
  puts "never"           # Unreachable
end
```

**Fix:** delete the code (a suggestion only: dead code is often half-finished work).

### self-subtraction

A shape taken away from itself, `part - part` or `part.difference(part)`, which leaves nothing.
A number, `n - n`, is left alone.

```kupcad frame="none"
part = cube(10)
part - part              # subtracts a shape from itself, which leaves nothing
```

### param-order

A `param` read with `param(:name)` before it is defined, or defined inside a body (a `def`, a
block, an `if`). Hosts read parameters from the script's text without running it, and only find
top-level definitions. See [Parameters](/reference/inputs/parameters/).

```kupcad frame="none"
puts param(:width)       # Parameter ':width' used before definition.
width = param(:width, default: 5)
```

### unused-param

A `param(:x, default: ...)` on a line of its own, its value dropped, and never read with
`param(:x)` or `params[:x]`: a control that changes nothing. A parameter assigned to a variable
is `unused-variable`'s to report.

```kupcad frame="none"
param(:width, default: 5)   # defined but never read
cube(1)
```

### unknown-keyword

A keyword a built-in doesn't take, with the nearest one it does take when that is clear. An
error by default, since the call raises an `ArgumentError` when it runs. A method is checked
where the script shows its receiver is a solid or a sketch (a primitive, a variable assigned one,
a chain of methods on one), since a class of the script's own may have a `translate` of its own.

```kupcad frame="none"
cube(sise: 3)               # cube doesn't take 'sise'; did you mean 'size'?
part.translate(X: 5)
```

**Fix:** use the nearest keyword (a suggestion).

### segments-as-sides

`segments:` from 3 to 8 on a `cylinder` or `circle`. That makes a polygon only on the mesh engine;
the B-Rep engine keeps the shape round. `sides:` makes the polygon on both.

```kupcad frame="none"
cylinder(r: 5, h: 2, segments: 6)   # use sides: 6 for one on both
```

**Fix:** use `sides:` (a suggestion: it changes the B-Rep model).

### brep-unsupported

After `CAD.config(engine: :brep)`, or inside `CAD.with_config(engine: :brep) do ... end`,
something the B-Rep engine can't do yet, which fails when the script runs: a call (`translate`,
`volume`, `sphere`, a cone, ...), a boolean on shapes (`box - hole`), or a call to a method of the
script whose body needs one (`plate() uses translate`). A method's body runs under the engine of
its call, so it is reported where it is called. See
[Engine settings](/reference/geometry/engine-settings/).

```kupcad frame="none"
CAD.config(engine: :brep)
cube(5).translate(x: 1)    # the brep engine can't move, turn, scale or mirror shapes yet
```

### shape-mismatch

A method, or `+`, `-` or `&`, used on a kind of shape that doesn't have it, which fails when the
script runs. An error by default. A method of the script's own on an object of its own is never
flagged.

```kupcad frame="none"
hook = line([0, 0], [10, 0])
hook.extrude(3)            # extrude isn't a Path's method: close it or stroke it first
square(2).volume
cube(2).close
```

## Suppressing findings

A comment hides findings where they are deliberate. It names the rules it hides, separated by
spaces or commas, and may give a reason after ` -- `:

```kupcad
# kupcad:disable-next-line unused-variable -- read by the next revision
spare = cube(5)
holes = cube(1) # kupcad:disable-line unused-variable
cube(2)
```

| Directive | Hides findings on |
|---|---|
| `# kupcad:disable-next-line <rules>` | the next line |
| `# kupcad:disable-line <rules>` | its own line |
| `# kupcad:disable <rules>` | the whole file |

Only lint findings can be hidden; a syntax or compile error can't. A directive that hides
nothing, or names a rule that doesn't exist, is reported itself as a `suppression` warning, so
stale ones don't pile up.

In the editor, every lint finding offers "Disable `<rule>` for this line", which adds the
`kupcad:disable-next-line` comment above it.

## Fixes

Some findings carry a fix. The editor offers each as a quick fix (Ctrl+. or Cmd+.), the safe ones
marked preferred.

`kupcad check --fix` applies the safe fixes and rewrites the files, then reports what is left.
Today that renames an unused variable `x` to `_x` everywhere it is assigned. It doesn't when the
rename would change more than the variable (a method's parameter, a `for` target, a multiple
assignment) or when `_x` is already used. Suggestions (deleting unreachable code, the nearest
keyword, `sides:` for `segments:`) are never applied by `--fix`.

Before writing anything, `--fix` runs the original script and the fixed text (their writes
discarded, under the editor's limits) and compares what they build: every shape's operations,
numbers and settings, the ghosts and the materials. A pass that would add a syntax or compile
error, or build a different model, is refused. When the original can't run, only the error
check applies. Passes repeat until nothing more applies.

## Output and CI

`--max-warnings <n>` fails the run when there are more than `n` warnings; `0` fails on any.

`--format json` writes one JSON document to stdout instead of the report: counts and a list of
findings.

```json
{
  "files": 1,
  "errors": 0,
  "warnings": 1,
  "infos": 0,
  "findings": [
    {
      "path": "part.kup",
      "line": 1, "column": 1, "endLine": 1, "endColumn": 2,
      "offset": 0, "length": 1,
      "severity": "warning",
      "rule": "unused-variable",
      "code": "unused-variable",
      "message": "Unused variable 'x'. Prefix with '_' if intentional.",
      "fix": {
        "title": "Rename 'x' to '_x'",
        "safe": true,
        "edits": [{ "line": 1, "column": 1, "endLine": 1, "endColumn": 2, "offset": 0, "length": 1, "text": "_x" }]
      }
    }
  ]
}
```

| Field | Description |
|---|---|
| `path` | The file. |
| `line`, `column`, `endLine`, `endColumn` | Where the finding starts and ends, from 1. |
| `offset`, `length` | The same span in bytes. |
| `severity` | `error`, `warning` or `info`. |
| `rule` | The lint rule's id; `null` for a syntax or compile error. |
| `code` | The rule's id, or the error's code. |
| `message` | What is wrong. |
| `fix` | `null`, or the fix: its `title`, whether it is `safe`, and its `edits`. |

`--format sarif` writes SARIF 2.1.0, which code-scanning services read: GitHub shows the findings
on a pull request when the file is uploaded with `github/codeql-action/upload-sarif`.

```sh
kupcad check --format sarif . > kupcad.sarif
```
