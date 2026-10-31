---
title: Install
description: The ways to run KupCAD — in the browser with nothing to install, the kupcad command, VS Code and the desktop app.
sidebar:
  order: 1
---

KupCAD is one language and one core. You can run it in four places; pick the one that fits, and
change later. Scripts are the same everywhere.

## In the browser

Nothing to install.

- **[The playground](https://kupcad.org/playground/)**: one script, its model and its
  parameters. Good for trying things, and for sharing a script by its link.
- **[The IDE](https://kupcad.dev/)**: a project of scripts and files, kept in your browser. It
  works offline, and your browser can install it as an app.

Both run the core compiled to WebAssembly, in your browser. Nothing is sent anywhere.

## The command line

The `kupcad` command builds models from scripts, checks and formats them, and runs the language
server. Each [release](https://github.com/kupcad/kupcad/releases) has it for Linux (x86_64 and
arm64), macOS (Apple silicon and Intel) and Windows (x86_64 and arm64).

1. Download the archive for your system and unpack it.
2. Put the `kupcad` file somewhere on your `PATH`.
3. Check it runs:

```sh
kupcad --version
```

On macOS, if the system refuses to open it, run `xattr -d com.apple.quarantine kupcad` once.

The [Command line](/reference/tooling/cli/) page lists every command.

## VS Code

The KupCAD extension gives `.kup` files highlighting, problems as you type, hovers, go to
definition and formatting, with a viewer of the model beside the script. It downloads the
`kupcad` command for you. See
[the extension](https://github.com/kupcad/kupcad/tree/main/packages/kupcad-vscode).

## The desktop app

A window with a folder of scripts, the editor and the model. Each release has an installer for
macOS, Linux and Windows, next to the `kupcad` archives. The app keeps itself up to date.

## Next

[Your first model](/start/first-model/): a parametric plate, in ten lines.
