---
title: Command line
description: Every kupcad command and its options.
sidebar:
  order: 1
---

`kupcad` is one executable: it runs scripts, exports models, checks and formats code, manages
packages and serves editors.

```sh
kupcad build part.kup -o part.stl                  # export
kupcad build part.kup -p width=50 -o part.step     # with a parameter
kupcad check .                                     # lint every script under here
kupcad fmt --write .                               # format them
```

| Command | Does |
|---|---|
| [`build`](#kupcad-build) | Runs a script and exports its model. |
| [`run`](#kupcad-run) | Runs a script for what it prints, writing no model. |
| [`watch`](#kupcad-watch) | Rebuilds a script whenever it, or a file it reads, changes. |
| [`check`](#kupcad-check) | Reports syntax errors, compile errors and lint findings. |
| [`fmt`](#kupcad-fmt) | Formats scripts. |
| [`doc`](#kupcad-doc) | Prints a script's parameters and metadata as JSON. |
| [`pkg`](#kupcad-pkg) | Manages dependencies. |
| [`lsp`](#kupcad-lsp) | Starts the language server. |
| [`version`](#kupcad-version) | Prints the version. |
| [`dev`](#kupcad-dev) | Compiler and VM tools. |

## Common behaviour

- **Exit status.** Every command exits 0 on success and 1 on any failure: bad arguments, an
  unreadable file, a syntax or runtime error, a failed export, a lint error. Each is safe as a CI
  step.
- **Help.** `kupcad --help` lists the commands. Every command explains its options with `--help`
  (or `-h`) wherever it appears: `kupcad build --help`, `kupcad check part.kup -h`. An option a
  command doesn't take is an error that prints its usage.
- **Version.** `kupcad --version` (or `-V`) prints the version.
- **Colour.** Output is coloured only on a terminal; piped or redirected output is plain.
  `NO_COLOR=1` turns colours off everywhere, and `CLICOLOR_FORCE=1` keeps them when redirected.
- **Errors.** A syntax or compile error is printed with its file, line and column and a code in
  brackets (`part.kup:2:1: E: 'cube' is a built-in and can't be assigned [builtin-redefined]`).
  An uncaught runtime error is printed once with its class and where it was raised. See
  [Errors](/reference/language/errors/).

## kupcad build

```sh
kupcad build <file.kup> [options]
```

Runs a script and exports its model, the script's last value. Without `-o`, it writes a `.glb`
file next to the script, named after it (`-f` picks another format).

| Option | Description |
|---|---|
| `-o`, `--output <file>` | The output path; its extension picks the format: `.stl`, `.glb`, `.gltf`, `.step`, `.stp`, `.3mf`, `.obj`, `.svg`, `.dxf`. Repeatable: the script runs once and is written to each. |
| `-f`, `--format <name>` | `stl`, `glb`, `gltf`, `step`, `3mf`, `obj`, `svg` or `dxf`. With a single `-o`; an extension it contradicts is an error. |
| `-d`, `--draco` | Compress glb and gltf meshes with Draco. |
| `--draco-bits <n>` | Quantize Draco positions to `n` bits, 1 to 30 (default 14: an error of a part's size / 16384). Finer files are larger. |
| `--stroke-width <mm>` | An SVG's outline width (default 0.1), such as a laser's hairline. |
| `--mtl` | Also write an OBJ's materials as a library beside it (`<output>.mtl`; `materials.mtl` with `--split`). |
| `--bom <file.json>` | Also write the model's parts list: each part, its count, volume, size and mass. |
| `--split <dir>` | Write each part to its own file in `<dir>`, as made and not placed, named after it; STL unless `-f` names another format. |
| `-p`, `--param <name=value>` | A parameter's value, read as its kind (an Array's or a Map's as JSON). Repeatable. |
| `-P`, `--params <file.json>` | Parameter values from a JSON object. Repeatable. |

```sh
kupcad build part.kup -o part.stl -o part.glb          # one run, two files
kupcad build part.kup -f 3mf                           # part.3mf beside the script
kupcad build part.kup -o part.glb --draco --draco-bits 12
kupcad build part.kup --bom bom.json -o part.3mf
kupcad build part.kup --split parts/                   # parts/plate.stl, parts/M3 bolt.stl, ...
kupcad build part.kup -P bracket.json -p width=50      # the later value wins
```

`--draco`, `--mtl` and `--stroke-width` apply to the outputs they fit, and each must fit one:
`--mtl` without an `.obj` output is an error. A `.step` output is built on the exact B-Rep
engine, so it is a build of its own. What each format holds, and what a model must be for it, is
on [Export formats](/reference/geometry/export/). The `--bom` file is
`{"parts": [...]}`, each part as [`bom`](/reference/geometry/assemblies/) gives it, with `null`
for what a part has none of. Parameter values are described on
[Parameters](/reference/inputs/parameters/#giving-values).

### Files a script can read and write

A build reads and writes files from its script's root: the working directory when the script is
under it; otherwise the nearest folder above the script that holds a `kupcad.json` or
`.kupcad.json`; otherwise the script's own folder. Imports and `import_*` calls can't reach
outside it, through `..` or through a symbolic link. A script's `export_*` methods write only
files named for their format (`export_stl` a `.stl`), so neither a script nor a package it
imports can write over the project's scripts or settings.

## kupcad run

```sh
kupcad run <file.kup> [-p name=value]... [-P file.json]...
```

Runs a script and writes no model. What it prints and the errors it raises are the result, for a
script that computes or checks rather than models. The model, the script's last value, is still
evaluated by the geometry kernel, so a kernel error in it (a `polyhedron` that isn't closed) fails
the run as it would a build; a shape the model doesn't use isn't evaluated. The script can still
write files itself with `export_*`. Takes `-p` and `-P` as `build` does.

## kupcad watch

```sh
kupcad watch <file.kup> [options]
```

Builds a script, then rebuilds it whenever it, a module it imports or a file it reads as data
changes; a file restored to an older version counts as a change, and a data file that was missing
is watched until it appears. It takes `build`'s options. With an export option (`-o`, `-f`,
`--split`, `--bom`, ...), each build that succeeds writes its files, for a slicer or viewer that
reloads them; without one it writes nothing. A failed build is reported as `build` reports it, and
watching goes on until the fix.

A watched run stops after 100 million instructions and, unless the project sets
`vm_memory_limit`, at 1 GiB of script memory, so a script that loops forever can't hang it.

## kupcad check

```sh
kupcad check [--fix] [--format text|json|sarif] [--max-warnings <n>] [--config <file>] <file|dir>...
```

Reports syntax errors, compile errors and lint findings, without running the scripts.

| Option | Description |
|---|---|
| `--fix` | Apply the fixes that keep the model the same, rewrite the files, then report what is left. |
| `--format <kind>` | `text` (the default), `json`, or `sarif` for code scanning. JSON and SARIF write one document to stdout. |
| `--max-warnings <n>` | Fail when there are more than `n` warnings; `0` fails on any. |
| `--config <file>` | Read lint settings from `<file>` instead of `.kupcad.json`. |

Errors fail the check; warnings and infos alone don't, unless `--max-warnings` says so. Given a
directory, `check` takes every `.kup` file under it except in hidden directories (`.git`,
`.kupcad`); a hidden path named outright is still taken. `kupcad check --help` lists the rules.
See [Lint rules](/reference/tooling/lint-rules/).

## kupcad fmt

```sh
kupcad fmt [--check | --write] [--config <file>] <file|dir>...
kupcad fmt --stdin [--check] [--config <file>]
```

Prints the files formatted. `--write` rewrites the ones that change, in place; `--check` lists
the ones that aren't formatted and fails if there are any; `--stdin` formats the source piped in.
Directories are walked as `check` walks them. See [Formatter](/reference/tooling/formatter/).

## kupcad doc

```sh
kupcad doc <file.kup>
```

Prints the script's `# @title`, `# @description` and `# @author` comments and its parameters as
JSON, without running it, for a host to build controls from. See
[Parameters](/reference/inputs/parameters/#kupcad-doc).

## kupcad pkg

```sh
kupcad pkg init
kupcad pkg add <alias>=<source>
kupcad pkg install
kupcad pkg prune [--force]
kupcad pkg doctor
```

Manages a project's dependencies (`kupcad.json`, `kupcad.lock`) and the shared package store.
See [Packages](/reference/inputs/packages/).

## kupcad lsp

```sh
kupcad lsp [--stdio] [--viewport-origin <origin>]
```

Starts the language server on stdin and stdout, the only transport (`--stdio`, which language
clients pass, is accepted). Editors start it themselves. `--viewport-origin` lets the page at
`<origin>` (`scheme://host[:port]`, such as `tauri://localhost`) read the viewport socket,
besides VS Code's webviews. See [Language server](/reference/tooling/language-server/).

## kupcad version

```sh
kupcad version [--json]
```

Prints the version, as `--version` does. With `--json` it prints a JSON object with the protocol
version front ends check and the platform the binary was built for:

```json
{"version": "0.1.0", "protocolVersion": 1, "os": "macos", "arch": "aarch64"}
```

## kupcad dev

```sh
kupcad dev ast-dump <file>
kupcad dev disasm <file>
kupcad dev lex-dump <file>
kupcad dev bench <file> [--repeat <n>] [--no-profile] [--no-eval] [--json]
kupcad dev crash panic|abort
```

Tools for working on KupCAD itself.

| Subcommand | Does |
|---|---|
| `ast-dump` | Writes the syntax tree (`.dump`). |
| `disasm` | Writes the compiled bytecode (`.disasm`). |
| `lex-dump` | Writes the token stream (`.lex`). |
| `bench` | Times parse, compile, the VM run and the geometry's evaluation, each from cold, and prints the median of `--repeat` runs (5 by default). A further run with the profiler gives a table per function (`--no-profile` skips it); `--no-eval` skips the geometry; `--json` prints the medians as JSON. The script's own output isn't shown. |
| `crash` | Ends the process with a panic or an abort, to check that crash reports are written. |

## Crash reports

With `KUPCAD_CRASH_DIR` set to a directory, a crash of any command (a panic, or a fatal signal
such as an abort in the geometry kernel) writes `kupcad-crash-<seconds>-<pid>.txt` there and says
so on stderr. The report holds the version, the platform and build mode, the subcommand, what
happened and, for a panic, the stack, but nothing of the script: not its text, its path or its
other arguments. Without the variable nothing is written. Linux and macOS.
