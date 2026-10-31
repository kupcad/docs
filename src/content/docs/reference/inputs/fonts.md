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

## Symbols

A character the font has no glyph for is drawn from KupCAD's symbol font, at the same size and on
the same baseline, whichever font the text is in, an imported one too. It has the symbols of
drawings, panels and labels that text fonts lack:

| Group | Symbols |
|---|---|
| Dimensions and tolerances | `⌀ ⌖ ⏥ ⏤ ○ ⌭ ⌒ ⌓ ∥ ⊥ ∠ ◎ ⌯ ↗ ⌰ ⌴ ⌵ ↧ ⌲ ⌳ ⌢ □ Ⓜ Ⓛ Ⓟ Ⓕ Ⓣ Ⓢ Ⓤ` |
| Math | `± ∓ × ÷ ° ′ ″ ≈ ≠ ≤ ≥ ∞ √ ∅ ∆ π ∑ Ω` |
| Arrows | `← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙ ⇄ ⇅ ↺ ↻ ⟲ ⟳ ⇐ ⇒` |
| Electrical | `⏚ ⏻ ⏼ ⏽ ⭘ ⚡ ⎓ ∿ ⏦ ⌁` |
| Signs | `✓ ✔ ✗ ✘ ★ ☆ ⚠ ♻ ☢ ☣ ⚙ ⌘ ⏏ ⏎ ⇧ ⌫ ⌥ ⌃ ⏵ ⏸ ⏹ ⏺ ☀ ❄ ♨` |
| Shapes | `■ □ ▲ △ ▼ ▽ ● ○ ◆ ◇ ◉` |

A character the font has comes from the font, so `±` in `"sans"` is Roboto's, and only a font
without it takes the symbol font's. The symbols are a subset of Noto Sans Math, Noto Sans Symbols
and Noto Sans Symbols 2, under the SIL Open Font License.

```kupcad
hole_note = text("4× ⌀3.4 ⌴ ⌀6 ↧3", size: 4)
panel = text("⏻ POWER", size: 6, font: "sans-bold")
```

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

- Text is one line, shaped as the font says: kerned (by its GPOS table, or its `kern` table for a
  font without GPOS kerning), with its ligatures, its letters joined and reordered as their script
  writes them, and its marks placed.
- A right-to-left script (Arabic, Hebrew) runs from right to left, and a line mixing directions is
  ordered as Unicode's bidirectional algorithm says: in a left-to-right line, a Hebrew word reads
  from its right end.
- A variable font draws its default style.
- A character the font has no glyph for comes from the [symbol font](#symbols). One neither has is
  a `ValueError` naming it (`"中"` in a Latin font, an emoji, a line break).
- A symbol isn't kerned against its neighbours, which are another font's.

## Scripts

The embedded fonts draw Latin, Greek and Cyrillic. For another script, import a font that has it:
Arabic, Hebrew, Devanagari and the other scripts whose letters join or change places are shaped by
the font's own rules, and CJK fonts draw too.

```kupcad
import naskh from "./fonts/NotoNaskhArabic-Regular.ttf"

sign = text("مرحبا", size: 12, font: naskh, halign: :center)
```
