---
title: Text on a face
description: Raised or engraved text on a part, centred, in one of the built-in fonts or your own.
sidebar:
  order: 2
---

`text` makes a sketch of a string. Extrude it and add it to a face for raised text, or take it
out of the face to engrave.

```kupcad
# @title Name plate
label = param(:label, default: "KupCAD", title: "Label")
raised = param(:raised, default: true, title: "Raised, not engraved")

plate = cube(x: 60, y: 20, z: 3, round_r: 2)
letters = text(label, size: 8, font: "sans-bold", halign: :center, valign: :center)
  .extrude(1)
  .translate(x: 30, y: 10, z: raised ? 3 : 2)

raised ? plate + letters : plate - letters
```

- `halign: :center, valign: :center` put the text's middle on the origin, so one `translate`
  puts it in the middle of the plate.
- Raised, the letters stand on the top face (`z: 3`); engraved, they start 1 mm down and are
  taken out.
- The built-in fonts are `"sans"`, `"sans-bold"`, `"serif"`, `"mono"` and `"stencil"`; a
  symbol font covers signs such as ⏻. For another, import a `.ttf`:
  `import label_font from "./fonts/MyFont.ttf"` and `font: label_font`.

Letters 1 mm high print well raised; engraved, make them at least 0.6 mm deep and the strokes
wider than your nozzle.

[text](/reference/geometry/sketches/#text) · [Fonts](/reference/inputs/fonts/)
