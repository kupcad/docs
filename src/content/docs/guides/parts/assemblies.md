---
title: 10. Assemblies
description: Named parts with colours, grouped for export, a parts list, and ghosts for reference.
sidebar:
  order: 10
---

A gearbox is several parts. An array shows them together; an assembly keeps them apart, named,
all the way into a file a slicer opens.

## Names and colours

```kupcad
sun = cylinder(d: 24, h: 8).named("sun gear").material(color: "#B22222")
planet = cylinder(d: 24, h: 8).named("planet gear").material(color: "#DAA520")
[sun, planet.translate(x: 30)]
```

`named` gives a part the name the viewer's parts list and the exported file use. `material`
gives it a colour, and can give it a density (`density: 1.24`, in g/cm³) for its mass.

## An assembly

```kupcad
# @title Gearbox assembly
sun = cylinder(d: 24, h: 8).named("sun gear").material(color: "#B22222")
planet = cylinder(d: 24, h: 8).named("planet gear").material(color: "#DAA520")
ring = (circle(r: 42) - circle(r: 38)).extrude(8).named("ring gear").material(color: "#708090")
planets = (0...3).map do |i|
  angle = i * 120
  planet.translate(24 * Math.cosd(angle), 24 * Math.sind(angle), 0)
end

assemble(name: "Planetary gearbox", parts: [ring, sun] + planets)
```

`assemble` takes a name and a list of solids. The difference from an array shows in the file:
a 3MF or glTF of an assembly holds each part on its own, with its name and colour, where a
union would fuse them into one lump.

## The parts list

```kupcad
sun = cylinder(d: 24, h: 8).named("sun gear")
planet = cylinder(d: 24, h: 8).named("planet gear")
planets = (0...3).map { |i| planet.translate(30 * i, 0, 0) }
gearbox = assemble(name: "Gearbox", parts: [sun] + planets)

gearbox.bom.each { |row| puts "#{row[:count]} × #{row[:name]}" }
# 1 × sun gear
# 3 × planet gear
gearbox
```

`bom` lists each distinct part once with how many copies there are. Three planets, moved but
otherwise the same, are one part with a count of 3. Each row also has the part's volume, size
and, with a density, its mass.

## Ghosts and highlights

Two things for the viewer only:

```kupcad
housing = cylinder(d: 100, h: 12).translate(z: -2)
ghost { housing }
cylinder(d: 24, h: 8).highlight
```

`ghost { ... }` shows a shape half transparent, for reference, and leaves it out of the model:
a housing the gearbox has to fit. `highlight` draws a part in the highlight colour, through
whatever is in front of it, to find it in a busy model. Neither changes the geometry.

## Export

```sh
kupcad build gearbox.kup -o gearbox.3mf
kupcad build gearbox.kup --split parts/
kupcad build gearbox.kup -o gearbox.3mf --bom gearbox.json
```

The first writes one 3MF with every part named and coloured. The second writes each part to its
own STL in `parts/`, named after it, as it is made and not placed, which is what you print.
The third also writes the parts list as JSON.

## In the reference

[Assemblies and parts lists](/reference/geometry/assemblies/) ·
[Materials, names and display](/reference/geometry/appearance/) ·
[Export formats](/reference/geometry/export/)

Next: [Drawings](/guides/parts/drawings/).
