---
title: Imports and exports
description: Splitting a model over files with import and export, how each file's scope works, and where import paths point.
sidebar:
  order: 9
---

A script can use another `.kup` file's functions, classes and values, and read data, meshes,
drawings and fonts, with `import`. A file makes names available with `export`. Both belong at
the top level of a file: inside a method, class or block they are the compile error
`misplaced-import`.

## import

```kupcad frame="none"
import { name, other as alias } from "path"
import name from "path"
import name, other from "./module.kup"
import name from "path" with { type: "json" }
```

From a `.kup` module, `import { ... }` binds the names it lists, each under its own name or the
one after `as`. `import name from "./module.kup"`, without braces, is the same as
`import { name } from ...`. A name the module doesn't export is a `NameError` that lists the
names it does export. An imported name that is also a variable of the importing file is the
compile error `import-collision`.

From any other file, the import gives the file's one value, named without braces:
`import gears from "./gears.json"` (see [File imports](#file-imports)).

```kupcad frame="none"
# hardware.kup
thread_pitch = 1.5                 # private to hardware.kup

def pitch = thread_pitch           # reads hardware.kup's thread_pitch
def bolt(len) = cylinder(r: 1.5, h: len)

class Washer
  def initialize(d) = (@d = d)
end

export bolt, pitch, Washer
```

```kupcad frame="none"
# main.kup
import { bolt, pitch, Washer } from "./hardware.kup"

thread_pitch = 99                  # another variable: pitch still gives 1.5
puts pitch                         # 1.5
puts thread_pitch                  # 99
bolt(10)
```

## export

```kupcad frame="none"
export name, Other
export { name, other as alias }
export { name as alias } from "path"
export value from "./data.json"
```

`export` lists the variables, functions, classes and constants of the file that importers may
use, each under its own name or the one after `as`. Only exported names reach other files.

`export ... from "path"` passes another file's exports on, so a library's entry file can gather
its parts. It binds nothing in the file that writes it: that file's own variable of the same
name, if it has one, is neither exported nor used. A file is re-exported as it is imported: a
module's names in braces, or a data file's value under one bare name.

## Scope

Every file runs in its own top-level scope:

- Its variables, `def`s and classes are private to it, except the names it exports.
- An exported function or class keeps using its own file's variables, wherever it is called
  from.
- A module sees the built-ins, but not the importing file's variables. Two libraries can use
  the same top-level name without clashing.
- A module runs once per build, however many files import it. Two modules that import each
  other are an `ImportError` (`Circular dependency detected`).

Each file starts with the engine settings the build started with, and the settings a module
puts in force with `CAD.config` end with it (see
[Engine settings](/reference/geometry/engine-settings/)).

## Paths

| Path | Names |
|---|---|
| `"./hardware.kup"`, `"../lib/units.kup"`, `"./logo.stl"` | A file relative to the file that imports it |
| `"hardware"` | The package with that alias in `kupcad.json`: its `main.kup` |
| `"hardware/screws.kup"` | Another file of that package |

A relative path is resolved from the importing file, so `kupcad build parts/main.kup` and the
files it imports agree on where `./` is. Imports stay inside the project, the directory
`kupcad` runs in or the folder the editor opened: a path that climbs out of it is refused with
an `ImportError`. A path in single quotes is read the same as in double quotes. See
[Packages](/reference/inputs/packages/) for installing packages.

## File imports

An import whose path ends in one of these extensions (in any case) reads the file as a value
instead of running it as a module:

| Extension | Gives | See |
|---|---|---|
| `.json` | The file's data: a JsonObject, an Array or a scalar | [Data files](/reference/inputs/data-files/) |
| `.stl`, `.obj`, `.3mf`, `.step`, `.stp` | A Solid | [Meshes and STEP](/reference/inputs/meshes/) |
| `.dxf`, `.svg` | A Sketch | [Drawings](/reference/inputs/drawings/) |
| `.ttf`, `.otf` | A Font | [Fonts](/reference/inputs/fonts/) |

`import logo from "./logo.stl"` is the same as `logo = import_stl(...)` with the path resolved
from the importing file; the `import_*` functions read from the project's directory instead.

`with { type: ... }` says what a file is when its name doesn't, and wins over the extension.
The type is `"kup"` (a module), `"stl"`, `"obj"`, `"3mf"`, `"step"`, `"json"`, `"font"`,
`"dxf"` or `"svg"`, as a String or a Symbol; it may go on the next line.

```kupcad frame="none"
import scan from "./scan.bin" with { type: "stl" }
import machine from "./machine.data" with { type: :json }
import { bolt } from "./bolt.txt" with { type: "kup" }
```

`with { }` takes no other key (`with { version: 2 }` is the compile error `import-attribute`).
A file gives one value, so naming it in braces is the compile error `file-import-names`, except
for a JSON file, whose object's keys can be imported by name:
`import { name, gears } from "./machine.json"`.
