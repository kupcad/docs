---
title: 9. Tooling
description: Checking, formatting and watching scripts, the editor's help, and reading an error.
sidebar:
  order: 9
---

## Check

```sh
kupcad check part.kup
kupcad check .
```

Reports syntax errors, compile errors and lint findings, each with its file, line and rule:

```text
part.kup:3:1: W: Unused variable 'x'. Prefix with '_' if intentional. [unused-variable]
```

Errors fail the command; warnings don't, unless you ask with `--max-warnings 0`. A finding you
mean to keep is silenced on its line:

```kupcad frame="none"
x = 1 # kupcad:disable-line unused-variable
```

## Format

```sh
kupcad fmt --write .
kupcad fmt --check .
```

One style for every script, so a diff shows only what changed. The editor formats on save.

## Watch

```sh
kupcad watch part.kup -o part.stl
```

Rebuilds whenever the script, a file it imports or a data file it reads changes, and writes the
export each time, for a slicer or viewer that reloads the file.

## The editor

In VS Code, the IDE and the desktop app, the language server marks problems as you type, shows
what a method takes when you hover, completes names, and jumps to a definition. The viewer
beside the script shows the model, its parameters and the run's output; a problem in the list
under it takes you to the line.

## Reading an error

```text
error(vm): ValueError: cube expects x to be a finite number greater than zero, got -1
error(vm):     from script:3:5:in 'script'
```

The first line says what and why; the second where: line 3, column 5 of the script. A call
made inside a method lists the method too, innermost first.

## In the reference

[Command line](/reference/tooling/cli/) · [Lint rules](/reference/tooling/lint-rules/) ·
[Formatter](/reference/tooling/formatter/) · [Language server](/reference/tooling/language-server/)

Next: [Coming from Ruby or OpenSCAD](/guides/language/coming-from/).
