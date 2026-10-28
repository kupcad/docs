---
title: Font
description: A TrueType or OpenType font a script imported, to pass to text() as font:.
sidebar:
  order: 14
---

A `Font` is a TrueType or OpenType file a script imported, with `import_font` or an `import` of
a `.ttf` or `.otf` file (see [Fonts](/reference/inputs/fonts/)), to draw text in:
`text("KupCAD", size: 8, font: label)`. The embedded fonts need no Font: `text()` takes them by
name (`font: "sans"`), see [Sketches](/reference/geometry/sketches/).

A Font can be a module's export, so a project can keep its label font in one place.

`puts` and interpolation show a Font by its name, and `inspect` as `#<Font Roboto Mono>`.

## name

```kupcad frame="none"
font.name
```

The font's full name, as its own name table gives it (`"Roboto Mono"`), or the file's name for
a font that gives none.

**Returns:** `String`.

```kupcad
import label from "./fonts/RobotoMono-Regular.ttf"

puts label.name      # Roboto Mono
puts label.inspect   # #<Font Roboto Mono>
tag = text("KupCAD", size: 8, font: label).extrude(1)
```
