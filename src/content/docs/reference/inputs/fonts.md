---
title: Fonts
description: Draw text in the embedded fonts, or import a TrueType or OpenType font.
sidebar:
  order: 5
---

`text()` draws in one of the fonts built into KupCAD, chosen by name, or in a font file the
script imports. See [Sketches](/reference/geometry/sketches/) for `text()` itself.

```kupcad
import label from "./fonts/RobotoSerif-Regular.ttf"

puts label   # Roboto Serif 20pt Regular
plate = cube(x: 60, y: 20, z: 2)
plate - text("KupCAD", size: 8, font: label, halign: "center", valign: "center").extrude(1).translate(x: 30, y: 10, z: 1)
```

## Embedded fonts

`font:` takes a name as a String or a Symbol. Any other name is an `ArgumentError` listing these.

| Name | Font | Also |
|---|---|---|
| `"sans"` | Roboto (the default) | `"default"` |
| `"sans-bold"` | Roboto Bold: strokes half again as thick, for text printed small | `:sans_bold` |
| `"mono"` | Roboto Mono | `"monospace"` |
| `"serif"` | Roboto Serif | |
| `"stencil"` | Allerta Stencil | |

## import_font

```kupcad frame="none"
import_font(path)
import name from "./file.ttf"
import name from "./file.otf"
import name from "./file.bin" with { type: "font" }
```

Reads a TrueType or OpenType font file, to pass to `text()` as `font:`. An import's path is
relative to the importing file; `import_font`'s is from the project's directory.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `path` | String | — | The `.ttf` or `.otf` file. |

**Returns:** `Font`.

**Raises:** `ImportError` for a file that isn't a font, one with no outlines `text()` can draw
(TrueType or CFF; a CFF2 variable font's and a bitmap font's aren't read), one that maps no
characters, and one larger than 32 MiB.

A Font can be a module's export, so a project can keep its label font in one place.

## Font

`label.name`, `puts label` and `"#{label}"` give the font's full name from its own name table
(`Roboto Serif 20pt Regular`), or the file's name for a font that has none. `inspect` gives
`#<Font Roboto Serif 20pt Regular>`. See [Font](/reference/stdlib/font/).

## Drawing text

- Text is one line, its glyphs kerned as the font says: by its GPOS table, or its `kern` table
  for a font without GPOS kerning.
- A variable font draws its default style.
- A character the font has no glyph for is a `ValueError` naming it (`"中"` in a Latin font, an
  emoji, a line break). No embedded font has the diameter sign `⌀`; write `Ø`, as drawings do,
  and the error says so.

## Not yet supported

Right-to-left scripts and scripts whose letters change shape with their neighbours (Arabic,
Hebrew, the Indic scripts) need text shaping, which `text()` doesn't do. CJK fonts draw, glyph by
glyph.
