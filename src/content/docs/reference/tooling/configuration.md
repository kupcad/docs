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

`vm_memory_limit` caps the script's own memory: strings, arrays, maps, instances, and the tables
of the geometry graph it builds (a loop of transforms adds a node each). The geometry kernel's
meshes aren't counted. Garbage is collected before a new object would cross the limit, so what
the script no longer holds doesn't count.

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
| `kupcad build`, `kupcad run` | `vm_memory_limit`, or none | none |
| `kupcad watch`, the language server | `vm_memory_limit`, or 1 GiB | 100 million |

## Environment variables

| Variable | Description |
|---|---|
| `KUPCAD_HOME` | The package store, an absolute path. Default `~/.kupcad`; empty counts as unset, and a relative path is an error. See [Packages](/reference/inputs/packages/#the-store). |
| `KUPCAD_VIEWPORT_PORT` | The port the language server's viewport socket prefers. Default `9001`; when it is taken, a free port is used and reported to the editor. |
| `KUPCAD_CRASH_DIR` | A directory to write crash reports to. Unset, none are written. See [Crash reports](/reference/tooling/cli/#crash-reports). |
| `NO_COLOR` | Set and not empty, turns coloured output off. |
| `CLICOLOR_FORCE` | Set and not empty, keeps coloured output when it is piped or redirected. |
