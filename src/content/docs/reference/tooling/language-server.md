---
title: Language server
description: What kupcad lsp gives an editor, from diagnostics and hovers to the live preview.
sidebar:
  order: 5
---

`kupcad lsp` is a Language Server Protocol server for `.kup` files. The VS Code extension and
the desktop app run it; any editor with an LSP client can. It talks on stdin and stdout.

```sh
kupcad lsp --stdio
```

## Features

| Feature | What it gives |
|---|---|
| Diagnostics | Syntax errors, compile errors and [lint findings](/reference/tooling/lint-rules/), after every keystroke, with their codes; and the warnings of the document's last preview run (a material the B-Rep engine can't keep, a mended mesh), from the call to the end of its line. |
| Hover | What running the document gives a variable: a solid's size, volume, surface area, and vertex and face counts; a sketch's size and area. |
| Go to definition | A variable to its first assignment (or the `def`, lambda or block it is a parameter of), a method call to its `def` (in the call's class first), a class to its `class`, an imported name to its `import`, an import's path to its file. |
| Inlay hints | The name of each positional argument of a built-in (`cube(5)` shows `size:`), and the class a variable gets from a built-in's result (`s = part.slice(1)` shows `: Sketch`). A method's hints show where the script shows that its receiver is a solid or a sketch. |
| Completion | After a dot, the methods of solids, sketches and assemblies; elsewhere, the built-in classes and global functions. |
| Document symbols | The document's methods, classes, modules and variables, for an outline. |
| Code actions | Each finding's fix as a quick fix, the safe ones preferred, and "Disable `<rule>` for this line" for every lint finding. |
| Formatting | The whole document, as [`kupcad fmt`](/reference/tooling/formatter/) formats it. |

Settings come from the [`.kupcad.json`](/reference/tooling/configuration/) nearest each
document, so the editor lints and formats as `kupcad check` and `kupcad fmt` do.

## Running documents

Hovers and the preview read a run of the document. Every run:

- happens in a worker process, so a crash in the geometry kernel ends the worker, not the
  server: the editor gets a warning, and the next edit starts a new worker;
- reads files through a read-only view: open documents as the editor has them (unsaved edits
  included), then the workspace on disk. Writes (`export_*`) are discarded, so opening a script
  can't change the disk;
- stops after 100 million instructions and at 1 GiB of script memory, unless the project's
  `vm_memory_limit` says otherwise, so a script that loops forever can't hang the editor;
- sees [`CAD.preview?`](/reference/geometry/engine-settings/) as `true`, so a script can leave out
  detail only an export needs;
- treats `debugger()` as a no-op.

A hover runs the document once, and every hover reads that run until the document is edited.
The preview runs once typing pauses (for 200 ms). An edit, or a request such as a hover, cancels
a preview run that is still going; it runs again once the editor is quiet.

## The preview

The server sends the previewed document's model to the viewport (the VS Code webview, the desktop
app's window) as a frame: its kind (`3d`, `2d` or `none`), its parts, the run's warnings with
their lines, what it printed (the first 64 KiB), its parameters and the values the run took, why
it failed and where, and its timings, followed by the model as GLB or, for sketches and paths, as
SVG. A document that doesn't parse, compile or run, or that imports one that fails, gets a frame
saying why.

The preview is of the document last edited, until a front end picks one with the
`kupcad.preview` command. That document is shown from then on, until it is closed, and runs again
when a module it imports is edited, so editing a library shows the model that uses it.

### Commands

Front ends send these with `workspace/executeCommand`. Arguments of another shape are refused
with `InvalidParams`.

| Command | Argument | Does |
|---|---|---|
| `kupcad.preview` | `{"uri": "file:///.../part.kup"}` | Shows that document in the viewport, and sends its frame even if it was sent before (how a viewer just opened gets one). |
| `kupcad.setParams` | `{"uri": "file:///.../part.kup", "values": {"width": 40}}` | Runs the document with those [parameter](/reference/inputs/parameters/) values (as `-P` reads them) from then on, for its preview and its hovers, until another call replaces them or the document is closed. The frame gives the values taken, or names the one refused. |

## Files

- **Imports between open documents** follow their unsaved text: a document that imports another
  runs with the edit once it is previewed again.
- **Modules not open in the editor** are read from disk, and read again when they change there
  (a `git pull`, another editor).
- **Data files** a run read (`import_json`, `import_stl` and the rest) are watched: the server
  asks the editor to watch exactly those, and saving, creating or deleting one runs the documents
  that read it again. An editor that can't watch files by relative path updates on the next edit
  instead.
- **Closing a document** clears its diagnostics and drops it from the session.

## The viewport socket

The viewport connects to the server over a WebSocket on `127.0.0.1`, at `KUPCAD_VIEWPORT_PORT`
(default `9001`), or a free port when that one is taken. The server tells the editor the port it
bound, with the protocol version of what it sends, in a `kupcad/viewportReady` notification:

```json
{"port": 9001, "protocolVersion": 1}
```

It admits VS Code's webviews and, with `kupcad lsp --viewport-origin <origin>`, that one origin
exactly (the desktop app passes `tauri://localhost`), so no other web page can read the models.
It takes up to 8 connections, and closes one that hasn't completed its handshake within 5
seconds.

## Logging

The server logs to stderr, which editors show in an output panel: failures of the viewport as
warnings and its own faults as errors. A script that doesn't parse or run isn't a server fault and
isn't logged as one.
