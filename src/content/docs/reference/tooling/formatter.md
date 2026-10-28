---
title: Formatter
description: What kupcad fmt changes in a script, and what it keeps as written.
sidebar:
  order: 4
---

`kupcad fmt` formats scripts from their syntax tree. It sets spacing and line breaks, keeps what
the author chose where the choice carries meaning, and never changes what a script does.

```sh
kupcad fmt part.kup             # print it formatted
kupcad fmt --write .            # rewrite every script under here that changes
kupcad fmt --check .            # list the unformatted ones; fail if there are any
kupcad fmt --stdin < part.kup   # format standard input, as an editor's format-on-save does
```

## Options

| Option | Description |
|---|---|
| (none) | Print each file formatted. |
| `--write` | Rewrite the files that change, in place and atomically. |
| `--check` | List the files that aren't formatted and exit 1 if there are any, for CI. |
| `--stdin` | Format the source piped in and print it. With `--check`, name it `<stdin>` and fail if it isn't formatted. |
| `--config <file>` | Read the settings from `<file>` instead of `.kupcad.json`. |

Given a directory, `fmt` takes every `.kup` file under it except in hidden directories (`.git`,
`.kupcad`).

## Settings

Under `"fmt"` in [`.kupcad.json`](/reference/tooling/configuration/):

| Key | Default | Description |
|---|---|---|
| `line_width` | `100` | The longest line a call, list, map or chain is kept on. |
| `indent_width` | `2` | Spaces per indentation level. |
| `sort_imports` | `true` | Sort a run of imports by path. |

## What it changes

- **Spacing within a line**: one space around `=` and operators, after commas, inside a block's
  braces. Columns lined up by hand (`width   = 10`) aren't kept.
- **Calls get their parentheses**: `puts -1` becomes `puts(-1)`. Only a call's argument loses its
  own outer pair: `f((x))` becomes `f(x)`.
- **Long constructs are laid out over lines.** A call's arguments, an array, a map or a chain
  that doesn't fit in `line_width` is broken: an item per line with a trailing comma, or a call
  per line for a chain. A single call on a receiver breaks its arguments instead
  (`cube(10).translate(...)` stays together). When a call's last argument is a list, a map or a
  lambda, it opens up in place rather than moving to a line of its own.
- **Imports**: a run of imports is sorted by path, unless a comment sits on or between them;
  the comment stays with its import.
- **`%w[...]` and `%i[...]`** become arrays: `["a", "b"]`, `[:a, :b]`. A word that `:word`
  wouldn't read back is quoted (`%i[a-b]` is `[:"a-b"]`).
- **Heredocs** become double-quoted strings, since a heredoc can't be reprinted in place.
- **Symbol map keys** are written `name:` when the name is an identifier or a constant; others
  keep their `=>` (`{ :"a b" => 1 }`, `{ :if => 1 }`).

```kupcad
plate = cube(x: 40, y: 20, z: 3).translate(x: 1, y: 2, z: 3).rotate(z: 45).difference(cylinder(r: 2, h: 10))
```

becomes

```kupcad
plate = cube(x: 40, y: 20, z: 3)
  .translate(x: 1, y: 2, z: 3)
  .rotate(z: 45)
  .difference(cylinder(r: 2, h: 10))
```

## What it keeps

- **Literals as written**: `20.0` stays `20.0`, `1_000` stays `1_000`, `"x\ty"` keeps its `\t`
  and its double quotes, `'raw'` its single quotes, `%q(say "hi")` its `%q`, `:"with space"`
  its quotes.
- **Parentheses the author wrote**: `d + (w * 2)` stays. It adds the ones the meaning needs.
- **Line breaks the author chose**: what the author broke over lines stays broken, in the
  author's rows, so a matrix written row by row keeps its rows, and calls of a chain written on
  one line stay together. An operator expression keeps the breaks after its operators, its
  continuation lines indented once.
- **Block delimiters**: `{ |x| x * 2 }` stays on one line when it fits, and `do ... end` stays
  `do ... end`.
- **Blank lines**: one blank line wherever the source had any, so a script keeps its sections.
- **Comments**, each with the statement, list row, chain call or block it belongs to.

## Safety

Before returning anything, the formatter parses its own output and checks that it is the same
program with the same comments. A formatter bug is then reported as an error instead of
rewriting the script. Its output is stable: formatting it again changes nothing.
