# Fixtures for the examples

The files the reference's examples read, put beside each example as `check:examples` runs it:
`machine.json` (Data files, JsonObject), the fonts (Fonts, Font: Roboto Mono from the core, and
the core's Noto Sans Arabic test subset, under the SIL Open Font License, standing in for a
Naskh font), a `hardware` package as `kupcad pkg install` would link it (Packages), and the
project's `kupcad.json`. The meshes (`scan.stl`, `parts/bracket.obj`, `scan.bin`, `plate.data`)
and the drawings (`bracket.dxf` with `cut` and `holes` layers, `box.svg`) are built by the kupcad
binary as the check starts, so no binary file is kept here.
