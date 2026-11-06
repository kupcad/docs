---
title: Configuration
description: The .kupcad.json settings file, and the environment variables kupcad reads.
sidebar:
  order: 2
---

A project's settings live in `.kupcad.json`: the lint rules' levels, the formatter's widths and
the memory limits. `kupcad check`, `kupcad fmt`, `kupcad build` and the editor all read the same
file.

```json
{
  "lint": { "unused-variable": "off", "self-subtraction": "error" },
  "fmt": { "line_width": 120 },
  "vm_memory_limit": 2000000000
}
```

## Where it is found

The `.kupcad.json` that applies to a script is the one in the script's folder or the nearest
folder above it, as git finds a repository, so a project's settings hold in every folder of it
whatever directory a command starts in. The editor looks the same way from each document's
folder, so it lints and formats as `kupcad check` and `kupcad fmt` do.

`kupcad check --config <file>` and `kupcad fmt --config <file>` read the settings from `<file>`
instead.

## Settings

| Key | Type | Default | Description |
|---|---|---|---|
| `lint` | object | every rule at its default | Each [lint rule](/reference/tooling/lint-rules/)'s level, by its id: `"off"`, `"info"`, `"warning"` or `"error"`. |
| `fmt.line_width` | integer | `100` | The longest line the [formatter](/reference/tooling/formatter/) keeps a call, list or chain on. |
| `fmt.indent_width` | integer | `2` | Spaces per indentation level. |
| `fmt.sort_imports` | boolean | `true` | Sort a run of imports by path. |
| `vm_memory_limit` | integer | none | The most script memory a run may hold, in bytes. See [Memory limits](#memory-limits). |
| `compiler_memory_limit` | integer | none | The most memory `kupcad check` may use to parse one file, in bytes. |

A key the file doesn't have, or a value it can't take, is an error that gives its line and
column, so a mistyped rule is never silently ignored:

```text
Error: .kupcad.json:1:30: unknown setting (see the lint rules with `kupcad check --help`)
Error: .kupcad.json:1:38: unknown value (a lint rule's level is off, info, warning or error)
```

A rule set to `"error"` fails `kupcad check`, which makes it a CI gate.

## Memory limits

`vm_memory_limit` caps the script's own memory: strings, arrays, maps, instances, the text a
built-in writes as it grows (an interpolated or `%`-formatted String, an `inspect`, what `puts`
and `warn` print), and the tables of the geometry graph it builds (a loop of transforms adds a
node each). The geometry kernel's
meshes aren't counted. Garbage is collected before a new object would cross the limit, so what
the script no longer holds doesn't count.

Each value is counted at what it takes, the memory kupcad keeps for it besides its own, so the
process stays near the limit: within about 1.5 times it for a script of millions of short strings,
and closer for larger values. The geometry kernel's meshes come on top of that.

A run that needs more raises an `OutOfMemoryError` naming the limit and, where it is known, what
couldn't grow:

```text
OutOfMemoryError: the script exceeded its memory limit of 2000000 bytes (Array#push)
```

The script can rescue it; memory comes back once nothing holds it. The error is built in a 64 KB
reserve past the limit, so it can be raised however full the memory is, but a script that keeps
the errors it rescues uses the reserve up and then stops.

| Command | Memory limit | Instruction limit |
|---|---|---|
| `kupcad build`, `kupcad run` | `--memory-limit`, `KUPCAD_MEMORY_LIMIT`, `vm_memory_limit`, or none | none |
| `kupcad watch`, the language server | `--memory-limit`, `KUPCAD_MEMORY_LIMIT`, `vm_memory_limit`, or 1 GiB | 100 million |

The limit comes from the first of these that is set: the `--memory-limit` option of `build`,
`run`, `watch` and `lsp`; the `KUPCAD_MEMORY_LIMIT` environment variable; the project's
`vm_memory_limit`. The option and the variable take a whole number with a unit, `512MB` or
`8GB` (`KB` and `B` too, 1024-based), or bytes alone. They are for whoever runs a project they
didn't write: the desktop app and the VS Code extension pass their memory limit setting (8 GB
by default) as the option, for the preview and an export alike, and a CI job sets the
variable once for every command. A project's `vm_memory_limit` can't lift them, as a
parameter's default can't override `-p`.

```sh
kupcad build part.kup -o part.stl --memory-limit 2GB
KUPCAD_MEMORY_LIMIT=2GB kupcad run check.kup
```

## Environment variables

| Variable | Description |
|---|---|
| `KUPCAD_MEMORY_LIMIT` | The most script memory a run may hold, as `512MB` or `8GB`, when `--memory-limit` isn't given; it wins over the project's `vm_memory_limit`. Empty counts as unset. See [Memory limits](#memory-limits). |
| `KUPCAD_HOME` | The package store, an absolute path. Default `~/.kupcad`; empty counts as unset, and a relative path is an error. See [Packages](/reference/inputs/packages/#the-store). |
| `KUPCAD_VIEWPORT_PORT` | The port the language server's viewport socket prefers. Default `9001`; when it is taken, a free port is used and reported to the editor. |
| `KUPCAD_CRASH_DIR` | A directory to write crash reports to. Unset, none are written. See [Crash reports](/reference/tooling/cli/#crash-reports). |
| `NO_COLOR` | Set and not empty, turns coloured output off. |
| `CLICOLOR_FORCE` | Set and not empty, keeps coloured output when it is piped or redirected. |
