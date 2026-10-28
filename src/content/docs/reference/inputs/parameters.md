---
title: Parameters
description: Declare the values a host can set without editing the script, with their kinds, rules and labels.
sidebar:
  order: 1
---

A parameter is a value that a host sets without editing the script: `kupcad build -p`, a JSON
file, the editor's parameter panel, the desktop app or a web page. The script declares each one
with `param`, which gives its default, its rules and how a control should show it. Each run
then reads the host's value, or the default when the host gives none.

```kupcad
width = param(:width, default: 40, validate: { min: 20, max: 120 }, step: 0.5, unit: "mm", group: "Size", title: "Width")
thread = param(:thread, default: :m3, validate: { in: [:m3, :m4] }, group: "Size")
hollow = param(:hollow, default: false, title: "Hollow")

bore = thread == :m3 ? 3.4 : 4.5
plate = cube(x: width, y: 30, z: 4)
plate = plate.difference(cube(x: width - 8, y: 22, z: 3).translate(4, 4, 1)) if hollow
plate.difference(cylinder(d: bore, h: 10).translate(width / 2, 15, -1))
```

```sh
kupcad build plate.kup -p width=60 -p thread=m4 -p hollow=true -o plate.stl
```

## param

```kupcad frame="none"
param(name, default: value, type: kind, validate: rules, step: n, unit: s, group: s, title: s, description: s)
param(name)
```

With keywords, `param` declares the parameter `name` and returns its value: the host's, read
and checked by the parameter's rules, or else the default. With only a name, it returns the
value of a parameter declared earlier in the run.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `name` | Symbol or String | — | The parameter's name, as hosts give it (`-p width=40`). |
| `default:` | value | `nil` | The value when the host gives none. A number, a String, `true` or `false`, a Symbol, an Array or a Map; see [Kinds](#kinds). |
| `type:` | Symbol | from the default | The kind: `:number`, `:string`, `:boolean`, `:symbol`, `:array` or `:map`. |
| `validate:` | Map | — | The rules a value must meet; see [Rules](#rules). |
| `step:` | Number | — | A number's increment, for a slider. Greater than 0. |
| `unit:` | String | — | What a number is in, such as `"mm"`. |
| `group:` | String | — | The heading the control goes under. |
| `title:` | String | the name | The control's label. |
| `description:` | String | — | A line shown with the control. |

`step:`, `unit:`, `group:`, `title:` and `description:` are for a host's controls. `param` checks
them (`step:` above 0, `step:` and `unit:` only on a parameter that holds numbers) but doesn't
apply them: a host's value that is off the step is kept as given.

**Returns:** the parameter's value. `nil` when it has no default and the host gives none; a
`nil` is never checked against the rules.

**Raises:** `ArgumentError` when the declaration is wrong ([Errors](#errors)); `TypeError` or
`ValueError` when the host's value breaks the rules; `NameError` for `param(name)` before the
parameter is declared.

Declare parameters at the top level of the script, before they are read. `kupcad doc` and the
editor's controls read them from the script's text without running it, and the
[`param-order`](/reference/tooling/lint-rules/) lint rule reports one declared inside a method
or read before its declaration.

## Kinds

A parameter's kind decides how a host's text is read. It is the first of:

1. its `type:`;
2. what its `validate:` implies: `items:` or `tuple:` make an Array, `fields:` a Map;
3. its default's kind;
4. the kind of its `in:` choices, when they are all of one kind;
5. a String.

| Kind | `type:` | `-p` text read as | Example |
|---|---|---|---|
| Number | `:number` | a number | `-p width=40` |
| String | `:string` | the text itself | `-p label=Hello` |
| Boolean | `:boolean` | `true` or `false` | `-p hollow=true` |
| Symbol | `:symbol` | a Symbol of the text | `-p thread=m4` gives `:m4` |
| Array | `:array` | JSON | `-p 'holes=[[0, 0], [10, 0]]'` |
| Map | `:map` | JSON | `-p 'origin={"x": 5, "y": 0}'` |

A parameter needs no default. Each of these is `nil` until a host gives it a value:

```kupcad
label = param(:label, title: "Label")
note = param(:note, default: nil)
count = param(:count, type: :number)
size = param(:size, validate: { in: [:m3, :m4] })
```

## Rules

`validate:` is a Map of rules. A list's or a tuple's elements and a Map's fields have rules of
their own, written as a Map of the same keys, or as just the kind's name when the kind is all
there is (`items: :number`).

| Rule | For | Meaning |
|---|---|---|
| `min:` | a number | The least value. |
| `max:` | a number | The greatest value. |
| `in:` | a scalar | The values it may be. |
| `items:` | an Array | Every element's rules: a list of any length. |
| `min_items:` | an Array | The fewest elements. |
| `max_items:` | an Array | The most elements. |
| `tuple:` | an Array | One rule per place: an Array of exactly that many elements. |
| `fields:` | a Map | Each field's rules, by its name. |

A nested rule, for an element or a field, also takes `type:`, `title:` and, for a number,
`unit:` and `step:`. The parameter's own `unit:` and `step:` apply to every number in it that
has none of its own.

```kupcad
thicknesses = param(:thicknesses, default: [5, 10, 15], validate: { items: { type: :number, min: 0, max: 100 }, min_items: 1, max_items: 10 })
position = param(:position, default: [0, 0, 0], validate: { tuple: [{ type: :number, title: "X" }, { type: :number, title: "Y" }, { type: :number, min: 0, max: 200, title: "Z" }] })
origin = param(:origin, default: { x: 0, y: 0 })
counts = param(:counts, default: [1, 2], validate: { items: :number })
```

A Map parameter's keys are Symbols, in the order of its fields, whatever its host's JSON keys
them by.

### Nesting

A value nests at most two deep: a list or a tuple of scalars, of lists or tuples of scalars, or
of Maps. A Map's fields are scalars.

```kupcad
points = param(:points, default: [[0, 0], [50, 0], [50, 50]], validate: { min_items: 3, items: { tuple: [{ type: :number, min: -200, max: 200 }, { type: :number, min: -200, max: 200 }] } })
cutouts = param(:cutouts, default: [{ type: "slot", depth: 5 }], validate: { items: { fields: { type: { type: :string, in: ["slot", "hole"] }, depth: { type: :number, min: 0.1, max: 50 } } } })
```

Deeper data belongs in a data file: see [Data files](/reference/inputs/data-files/).

### Rules from the default

What `validate:` leaves out comes from the default:

| Default | Its rules |
|---|---|
| `[5, 10]` | A list of numbers. |
| `[[0, 0], [10, 0]]` | A list of tuples of two numbers. |
| `[{ type: "slot", depth: 5 }]` | A list of Maps with the fields `type` (a String) and `depth` (a number). |
| `{ x: 0 }` | A Map with the field `x`, a number. |
| `[0, 0, 0]` | A list of numbers, not a tuple; write `tuple:` for one. |

A default whose elements differ (`[1, "a"]`, points of two lengths, Maps with other fields)
needs its rules written out.

## Errors

A declaration that can't hold is an `ArgumentError` when `param` runs, naming what is wrong:

- a rule the value can't have: `min:` on a list, an Array in a Map's field, nesting past two
  deep, both `items:` and `tuple:`, a key no rule takes;
- a `type:` the default isn't;
- a default made of anything but numbers, Strings, Booleans, Symbols, Arrays and Maps (a Solid,
  a Range, `nil` inside a list);
- a default its own rules refuse;
- `step:` or `unit:` on a parameter that holds no numbers. A `step:` of 0 or less is a
  `ValueError`.

```kupcad frame="none"
param(:a, default: 500, validate: { max: 100 })
# ArgumentError: parameter :a's default doesn't meet its rules: :a expects a number at most 100, got 500
param(:a, default: 5, validate: { mn: 0 })
# ArgumentError: parameter :a's validate: takes no mn: (it takes min:, max:, in:, items:, tuple:, fields:, min_items:, max_items:)
```

A host's value that the rules refuse is a `TypeError` (a value of another kind) or a
`ValueError` (a value that breaks a rule). The message names the place in the value, as
`[index]` for an element and `[:field]` for a field:

```text
TypeError: parameter :width expects a number, got "wide"
ValueError: parameter :width expects a number at most 100, got 200
ValueError: parameter :size expects one of :m3, :m4, got :m5
ValueError: parameter :points[1][0] expects a number at most 200, got 250
ValueError: parameter :cutouts[0][:depth] expects a number at least 0.1, got 0
ValueError: parameter :position expects 3 items, got 2
```

A host that shows controls (the editor, the desktop app) is told which parameter, and which
place in it, refused the value, so it can mark that control.

## Giving values

A host gives values by name. Each is read as the parameter's kind and checked by its rules.

- **`-p name=value`** (`--param`) on `kupcad build`, `run` and `watch`, repeatable. The text
  after `=` is read as the kind (see [Kinds](#kinds)); text that no value of the kind reads as
  (`-p width=wide`) is a `TypeError`.
- **`-P file.json`** (`--params`), repeatable: a JSON object of names and values, such as
  `{"width": 40, "thread": "m4", "holes": [[0, 0], [10, 0]]}`. A string in it is read as `-p`'s
  text is. `null` gives the parameter no value, so it takes its default (or an earlier
  option's value). Values nested deeper than two are refused.
- **The editor and the desktop app** send the values from their parameter panel.
- **WebAssembly**: `build_model_wasm` takes the same JSON object as `-P`; a refusal's message
  starts with `parameters:`.

Of two values for one parameter, the later one on the command line wins: with
`-P bracket.json -p width=50` the width is 50, and with `-p width=50 -P bracket.json` it is the
file's.

## params

```kupcad frame="none"
params[name]
```

`params` is a Map of the values the host gave, keyed by Symbols, as given and unchecked: `-p`
text is a String (`params[:width]` is `"40"` for `-p width=40`) and a `-P` file's values are as
the JSON has them. A parameter the host gave no value is missing from it. Read parameters with
`param`, which checks them and falls back to the default.

## Script metadata

Comments at the top of a script, each a tag and its text, describe the script to a host:

```kupcad
# @title Heavy duty bracket
# @description A parametric L-bracket for 3D printing.
# @author Ada Lovelace

width = param(:width, default: 20.0, validate: { min: 10.0, max: 100.0 })
cube(x: width, y: 50, z: 5)
```

`@title`, `@description` and `@author` are read, each its own line's text.

## kupcad doc

`kupcad doc part.kup` prints the script's metadata and parameters as JSON without running it, for
a host to build its controls from. The WebAssembly module's `extract_params_wasm` gives the same
JSON.

```json
{
  "meta": { "title": "Heavy duty bracket", "description": "A parametric L-bracket for 3D printing.", "author": "Ada Lovelace" },
  "parameters": [
    {
      "name": "width",
      "type": "number",
      "min": 10, "max": 100, "in": null,
      "items": null, "tuple": null, "fields": null, "min_items": null, "max_items": null,
      "title": null, "unit": null, "step": null,
      "default_value": 20,
      "group": null,
      "description": null
    }
  ]
}
```

Each parameter has its `name`, its `type` (`number`, `string`, `boolean`, `array` or `map`; a
Symbol parameter is a `string` with its choices in `in`), its rules, its `default_value`, and the
labels written as literals. `items` and `tuple` hold nested rules of the same shape, and
`fields` a list of them, each with its `name`. A value only the run can compute (a default
or a choice list made by an expression) is `null`.
