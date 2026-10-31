---
title: 2. Honeycomb wall
description: A tile of the Honeycomb Storage Wall, its cells placed by arithmetic, with a hook that plugs into it.
sidebar:
  order: 2
---

The Honeycomb Storage Wall is a hexagonal pegboard that many printed tool holders are made for:
20 mm cells, 1.8 mm walls, 8 mm deep. This build makes a tile of it and a hook to plug in. The
interesting part is the grid: a method works out where each cell goes, and the tile's outline is
measured from the cells rather than the other way round.

## What's new

- [`def`](/reference/language/methods/): small methods for geometry and for arithmetic.
- [`flat_map`](/reference/stdlib/array/#flat_map), `|(x, y)|` destructuring in a block, and
  [`reduce`](/reference/stdlib/array/#reduce) to join a list of sketches.
- Sizing a part from its contents with [`bbox`](/reference/geometry/inspection/#bbox).
- Two parts that fit: a clearance, and an [assembly](/reference/geometry/assemblies/).

## Let's go

### 1. One cell

A cell is measured across its flats. `circle(sides: 6)` draws a hexagon by its corner radius,
which is the across-flats size over √3; `rotate(30)` stands it on a corner, so rows run along x
flat to flat.

```kupcad
cell = 20

def hexagon(across)
  circle(r: across / Math.sqrt(3), sides: 6).rotate(30)
end

hexagon(cell)
```

The method is worth having because the hook needs hexagons too, slightly smaller and larger.

### 2. Where a cell goes

In a honeycomb, cells in a row are a cell and a wall apart. Every other row is shifted half
that, and rows are three quarters of a corner-to-corner height apart:

```kupcad
cell = 20
web = 1.8

pitch = cell + web
corner_r = pitch / Math.sqrt(3)
row_step = corner_r * 1.5

def cell_at(column, row)
  [column * pitch + (row.odd? ? pitch / 2 : 0), row * row_step]
end

puts cell_at(1, 0).map { |v| v.round(1) }.inspect   # [21.8, 0]
puts cell_at(1, 1).map { |v| v.round(1) }.inspect   # [32.7, 18.9]
```

`cell_at` returns an Array of two numbers, a position. `row.odd? ? pitch / 2 : 0` is the
shift: half a pitch on odd rows, nothing on even ones. Methods can use the variables above
them, so `pitch` and `row_step` needn't be passed in.

### 3. Every position

```kupcad
columns = 5
rows = 4
cell = 20
web = 1.8

pitch = cell + web
corner_r = pitch / Math.sqrt(3)
row_step = corner_r * 1.5

def cell_at(column, row)
  [column * pitch + (row.odd? ? pitch / 2 : 0), row * row_step]
end

positions = (0...rows).to_a.flat_map do |row|
  (0...(row.odd? ? columns - 1 : columns)).map { |column| cell_at(column, row) }
end
puts positions.length   # 18
```

For each row, a list of positions; `flat_map` joins the rows' lists into one. Odd rows, being
shifted right, get one cell fewer so the tile's sides stay straight: 5 + 4 + 5 + 4 = 18.

### 4. The cells as one sketch

```kupcad
columns = 5
rows = 4
cell = 20
web = 1.8

pitch = cell + web
corner_r = pitch / Math.sqrt(3)
row_step = corner_r * 1.5

def hexagon(across)
  circle(r: across / Math.sqrt(3), sides: 6).rotate(30)
end

def cell_at(column, row)
  [column * pitch + (row.odd? ? pitch / 2 : 0), row * row_step]
end

positions = (0...rows).to_a.flat_map do |row|
  (0...(row.odd? ? columns - 1 : columns)).map { |column| cell_at(column, row) }
end
hexagons = positions.map { |(x, y)| hexagon(cell).translate(x, y) }
hexagons.reduce { |all, one| all + one }
```

`|(x, y)|` takes each position apart into its two numbers. `reduce` folds the list of
hexagons into one sketch with `+`: `all` is the sum so far, `one` the next hexagon. The
free-standing `union(list)` does the same for solids; for sketches, `reduce` is the way.

### 5. The tile

The outline is the cells' bounding box plus a web all round, so the border is as thick as the
walls between cells. The cells come out of it, and the sketch is extruded to the depth:

```kupcad
columns = 5
rows = 4
cell = 20
web = 1.8
depth = 8

pitch = cell + web
corner_r = pitch / Math.sqrt(3)
row_step = corner_r * 1.5

def hexagon(across)
  circle(r: across / Math.sqrt(3), sides: 6).rotate(30)
end

def cell_at(column, row)
  [column * pitch + (row.odd? ? pitch / 2 : 0), row * row_step]
end

positions = (0...rows).to_a.flat_map do |row|
  (0...(row.odd? ? columns - 1 : columns)).map { |column| cell_at(column, row) }
end
hexagons = positions.map { |(x, y)| hexagon(cell).translate(x, y) }
cells = hexagons.reduce { |all, one| all + one }
box = cells.bbox
outline = square([box.x_size + 2 * web, box.y_size + 2 * web], center: true, round_r: web)
  .translate(box.x_size / 2 + box.min[0], box.y_size / 2 + box.min[1])

(outline - cells).extrude(depth)
```

`square(..., center: true)` is drawn about the origin, so it is moved to the box's centre:
half its size past the box's minimum corner. Measuring the contents and drawing round them is
the habit to take from this build: change `columns`, `rows` or `cell`, and the tile follows.

### 6. The hook

An insert has three parts: a plug that fits a cell, a flange that rests on the web round it, and
whatever it carries — here an arm that turns up into a hook. The plug is a hexagon the clearance
smaller than a cell; the flange a hexagon a web larger:

```kupcad
cell = 20
web = 1.8
depth = 8
clearance = 0.3

def hexagon(across)
  circle(r: across / Math.sqrt(3), sides: 6).rotate(30)
end

plug = hexagon(cell - clearance).extrude(depth)
flange = hexagon(cell + web).extrude(2).translate(z: depth)
arm = cube(x: 6, y: 5, z: 25, round_r: 1).translate(-3, -cell / 2 + 1, depth)
tip = cube(x: 6, y: 12, z: 5, round_r: 1).translate(-3, -cell / 2 + 1, depth + 20)

plug + flange + arm + tip
```

The `hexagon` method pays for itself here: three hexagons, three sizes, one definition.

### 7. Together

```kupcad
columns = 5
rows = 4
cell = 20
web = 1.8
depth = 8
clearance = 0.3

pitch = cell + web
corner_r = pitch / Math.sqrt(3)
row_step = corner_r * 1.5

def hexagon(across)
  circle(r: across / Math.sqrt(3), sides: 6).rotate(30)
end

def cell_at(column, row)
  [column * pitch + (row.odd? ? pitch / 2 : 0), row * row_step]
end

positions = (0...rows).to_a.flat_map do |row|
  (0...(row.odd? ? columns - 1 : columns)).map { |column| cell_at(column, row) }
end
hexagons = positions.map { |(x, y)| hexagon(cell).translate(x, y) }
cells = hexagons.reduce { |all, one| all + one }
box = cells.bbox
outline = square([box.x_size + 2 * web, box.y_size + 2 * web], center: true, round_r: web)
  .translate(box.x_size / 2 + box.min[0], box.y_size / 2 + box.min[1])
wall = (outline - cells).extrude(depth).named("wall").material(color: "#4A4E69")

plug = hexagon(cell - clearance).extrude(depth)
flange = hexagon(cell + web).extrude(2).translate(z: depth)
arm = cube(x: 6, y: 5, z: 25, round_r: 1).translate(-3, -cell / 2 + 1, depth)
tip = cube(x: 6, y: 12, z: 5, round_r: 1).translate(-3, -cell / 2 + 1, depth + 20)
hook = (plug + flange + arm + tip).named("hook").material(color: "#F2A541")

home = cell_at(1, 1)
assemble(name: "Honeycomb wall", parts: [wall, hook.translate(home[0], home[1])])
```

`cell_at` places the hook as it placed the cells, so it lands in a cell exactly. An assembly
keeps the two parts separate, each with its name and colour: a 3MF export holds both,
`--split` writes each to its own file, and the parts list counts them.

### 8. Parameters

The whole script makes the counts, the cell size, the web, the depth and the clearance
sliders. The cell defaults are the Storage Wall's, so inserts made for it fit this tile, and
this hook fits a real wall.

## Printing tips

Print the tile flat as it lies. Print the hook on its back, arm up, or lying on its side; the
flange is its widest face either way. 0.3 mm of clearance gives a plug that pushes in by hand
and stays; if yours drops out, try 0.2. A tile larger than your bed is two tiles: screw holes
go through a cell's corners, into the web.

## Make it yours

- A cup: a plug and flange carrying `cylinder(d: 30, h: 40) - cylinder(d: 27, h: 40).translate(z: 2)`.
- Screw holes in the tile: a countersunk hole ([recipe](/recipes/countersunk-holes/)) at
  `cell_at(0, 0)`, `cell_at(columns - 1, 0)` and the top corners, cut from the web.
- A sloped tile for a shelf: cut the extruded tile with a rotated `cube`.

## The whole script

```kupcad
# @title Honeycomb wall
# @description A tile of the Honeycomb Storage Wall, the hexagonal pegboard many printed tools hang from, with a hook to plug into it

columns = param(:columns, default: 5, validate: { min: 1, max: 20 }, step: 1, title: "Columns")
rows = param(:rows, default: 4, validate: { min: 1, max: 20 }, step: 1, title: "Rows")
cell = param(
  :cell,
  default: 20,
  validate: { min: 10, max: 40 },
  unit: "mm",
  title: "Cell size",
  description: "Across the flats; 20 fits Honeycomb Storage Wall inserts",
)
web = param(
  :web,
  default: 1.8,
  validate: { min: 1, max: 4 },
  step: 0.1,
  unit: "mm",
  title: "Web",
  description: "The wall between cells",
)
depth = param(:depth, default: 8, validate: { min: 4, max: 15 }, unit: "mm", title: "Depth")
clearance = param(
  :clearance,
  default: 0.3,
  validate: { min: 0, max: 0.8 },
  step: 0.05,
  unit: "mm",
  title: "Plug clearance",
)

# Hexagons stand on a corner, so a row is a run of flats: a cell and a web apart along x, and
# every other row shifted half that. Rows are three quarters of a corner-to-corner height apart.
pitch = cell + web
corner_r = pitch / Math.sqrt(3)
row_step = corner_r * 1.5

def hexagon(across)
  circle(r: across / Math.sqrt(3), sides: 6).rotate(30)
end

def cell_at(column, row)
  [column * pitch + (row.odd? ? pitch / 2 : 0), row * row_step]
end

# Odd rows are a cell short, so the tile's sides stay straight
positions = (0...rows)
  .to_a
  .flat_map do |row|
    (0...(row.odd? ? columns - 1 : columns)).map { |column| cell_at(column, row) }
  end
hexagons = positions.map { |(x, y)| hexagon(cell).translate(x, y) }
cells = hexagons.reduce { |all, one| all + one }
box = cells.bbox
outline = square([box.x_size + 2 * web, box.y_size + 2 * web], center: true, round_r: web)
  .translate(box.x_size / 2 + box.min[0], box.y_size / 2 + box.min[1])
wall = (outline - cells).extrude(depth).named("wall").material(color: "#4A4E69")

# A hook: a plug that fits a cell, a flange that rests on the web, and an arm that turns up
plug = hexagon(cell - clearance).extrude(depth)
flange = hexagon(cell + web).extrude(2).translate(z: depth)
arm = cube(x: 6, y: 5, z: 25, round_r: 1).translate(-3, -cell / 2 + 1, depth)
tip = cube(x: 6, y: 12, z: 5, round_r: 1).translate(-3, -cell / 2 + 1, depth + 20)
hook = (plug + flange + arm + tip).named("hook").material(color: "#F2A541")

home = cell_at(1, 1)
assemble(name: "Honeycomb wall", parts: [wall, hook.translate(home[0], home[1])])
```

[Methods](/reference/language/methods/) · [Array](/reference/stdlib/array/) ·
[bbox](/reference/geometry/inspection/#bbox) · [assemble](/reference/geometry/assemblies/) ·
[Blocks and lambdas](/reference/language/blocks-and-lambdas/)

Next: [Hinge](/mastering/hinge/).
