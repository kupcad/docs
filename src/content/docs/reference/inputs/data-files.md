---
title: Data files
description: Read a JSON file into a script with import_json or an import.
sidebar:
  order: 2
---

A model described by data (a machine's gears, a rack's slots) reads it from a JSON file. Data
nested deeper than a [parameter](/reference/inputs/parameters/) can hold belongs here.

```kupcad
# machine.json: {"name": "braider", "gears": [{"module": 1.5, "teeth": 12}, {"module": 2, "teeth": 20}]}
import machine from "./machine.json"

gears = machine[:gears].map { |g| cylinder(r: g[:module] * g[:teeth] / 2, h: 5) }
first = machine.dig(:gears, 0, :teeth)   # 12
plate = machine.fetch(:plate, nil)       # nil: the file has no plate
gears
```

## import_json

```kupcad frame="none"
import_json(path)
import_json(path, keys)
```

Reads the JSON file at `path` and returns its value. With `keys`, an Array of key names, it
returns the values of those keys of the file's object, in an Array in the same order.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `path` | String | — | The file, from the project's directory. |
| `keys` | Array | — | Keys of the file's top-level object, as Symbols or Strings. |

**Returns:** the file's value ([what a file becomes](#what-a-file-becomes)), or an Array of the
values of `keys`.

**Raises:** `ImportError` when the file can't be read or isn't valid JSON, or when `keys` is
given and the file isn't an object; `KeyError` for a key the object doesn't have.

```kupcad
values = import_json("data/machine.json", [:name, :gears])
puts values[0]   # braider
```

## Importing a JSON file

```kupcad frame="none"
import name from "./file.json"
import { key, other as alias } from "./file.json"
import name from "./file.data" with { type: "json" }
```

An import of a file whose name ends in `.json` reads it as data instead of running it as a
module. Its path is relative to the file that imports it, as a module's is, and a package's own
files are imported by its alias (`import screws from "hardware/screws.json"`). `import_json`
reads from the project's directory instead. `with { type: "json" }` (or `:json`) reads a file
named otherwise. See [Imports and exports](/reference/language/imports/) for the rest of the
syntax.

**Keys in braces** bind keys of the file's object to names of their own, `as` renaming one:

```kupcad
import { name, gears as gear_list } from "./machine.json"
puts "#{name}: #{gear_list.size} gears"   # braider: 2 gears
```

A key the object lacks is a `KeyError` listing the keys it has. A file that isn't an object
(a list of parts, `[...]`) is an `ImportError`: import it whole, without braces.

## What a file becomes

| JSON | KupCAD |
|---|---|
| object | [`JsonObject`](/reference/stdlib/json-object/) |
| array | `Array` |
| number | `Number` |
| string | `String` |
| `true`, `false` | `true`, `false` |
| `null` | `nil` |

This holds at any depth: the objects in an array are JsonObjects too. The file's top level may
be any of these, so a file that is a list gives an Array:

```kupcad
# gears.json: [{"teeth": 12}, {"teeth": 20}]
import gears from "./gears.json"
puts gears[1][:teeth]   # 20
```

## Reading a JsonObject

A JsonObject is read-only, and finds each key by its String or by the Symbol of the same name:
`machine["gears"]` and `machine[:gears]` are the same entry. There is no dot access
(`machine.gears`), since a key named `size` or `keys` would be hidden by the method of that name.

- `[]` gives `nil` for a key the object doesn't have, as a Map's does.
- `fetch(key)` and `dig(key, ...)` raise instead, naming the place in the file and what is
  there, so a missing key shows where it is missing rather than as a `nil` far from the file:
  `KeyError: machine.json: gears[1] has no key "pitch" (its keys: module, teeth)`.
- `fetch(key, default)` gives the default for a missing key.
- `to_h` gives a Map that can be changed, its objects Maps and its Arrays copies, all the way
  down, keyed by the file's Strings.

Assigning to a key (`machine[:name] = "x"`) is a `TypeError`. The
[JsonObject](/reference/stdlib/json-object/) page lists every method.

## Limits

Each of these is an `ImportError` naming the file and the line and column, or the place in the
data:

- a file larger than 64 MiB;
- arrays and objects nested deeper than 256 levels;
- a number past the largest (`1e400`);
- a key written twice in one object;
- anything that isn't valid JSON, such as a trailing comma.

## Rebuilds

`kupcad watch` and the editor's preview watch the data files a run read, along with its
modules: a change to one runs the scripts that read it again. A file that was missing at the
last run is watched too, so creating it rebuilds.
