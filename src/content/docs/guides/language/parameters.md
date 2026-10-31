---
title: 7. Parameters
description: Numbers, choices and switches a person sets without touching the script.
sidebar:
  order: 7
---

A parameter is a value the person using the script can set: a slider in the playground and the
apps, `-p name=value` on the command line. The script declares it with `param` and uses the
value like any variable.

## A number

```kupcad
width = param(:width, default: 40, validate: { min: 20, max: 120 }, step: 5, unit: "mm", title: "Width")
cube(x: width, y: 30, z: 4)
```

- `:width` is the name, as the command line gives it: `-p width=60`.
- `default:` is the value when none is given.
- `validate: { min:, max: }` is the range; a value outside it is refused with a message before
  the script runs.
- `step:`, `unit:` and `title:` are for the slider. `description:` adds a line under it, and
  `group:` puts several parameters under one heading.

## A switch and a choice

```kupcad
lid = param(:lid, default: true, title: "With a lid")
finish = param(:finish, default: :matte, validate: { in: [:matte, :gloss] }, title: "Finish")

box = cube(20)
box = box + cube(x: 20, y: 20, z: 2).translate(z: 20) if lid
puts finish   # matte
box
```

A `true`/`false` default makes a checkbox. A symbol default with `in:` makes a drop-down of
the choices. A string default makes a text field.

## Declare them at the top

Parameters go at the top level of the script, before they are used. The apps read them from the
script's text to build their panel, and `kupcad doc part.kup` prints them as JSON for any other
tool.

## Giving values

```sh
kupcad build box.kup -p width=60 -p lid=false -o box.stl
kupcad build box.kup -P sizes.json -o box.stl
```

`-p` sets one; `-P` reads several from a JSON file, `{"width": 60, "lid": false}`.

## In the reference

[Parameters](/reference/inputs/parameters/): every kind and rule.

Next: [Many files](/guides/language/files/).
