---
title: 5. Spiral staircase
description: A model staircase winding up a column — one step cut from a ring with a sector, placed fourteen times by its index, and a handrail swept along a helix of points.
sidebar:
  order: 5
---

A staircase is one step, placed many times, and a handrail that follows them. The step is a
wedge of a ring, cut by an intersection; the flight is the step turned and raised by its index;
the handrail is a circle swept along points on a helix. It is also the first build with many
parts in one assembly, and a parts list that counts them.

## What's new

- [`CAD.config`](/reference/geometry/engine-settings/) to set the resolution.
- `&` on sketches, and a sector from trigonometry.
- Copies placed by index: `map` over a Range with `rotate` and `translate`.
- [`sweep`](/reference/geometry/sweeps/#sweep) along a list of points.
- An [assembly](/reference/geometry/assemblies/) of a list, and its parts list.

## Let's go

### 1. One step, flat

```kupcad
turn = 25
radius = 80
column_d = 20

CAD.config(resolution: { segments: 64 })

wedge = circle(r: radius) - circle(d: column_d - 2)
sector = polygon([
  [0, 0],
  [radius + 1, 0],
  [(radius + 1) * Math.cosd(turn), (radius + 1) * Math.sind(turn)],
])

wedge & sector
```

The ring is a circle with the column's hole in it, a millimetre smaller than the column so the
step sinks into it. The sector is a triangle from the centre, a little longer than the radius,
`turn` degrees wide; the intersection of ring and triangle is the step. With `segments: 64`
the outer edge is drawn with 64 edges round a full circle, so a 25° step gets four or five:
smooth enough, and fourteen steps don't get heavy.

### 2. With its post

```kupcad
turn = 25
radius = 80
column_d = 20
tread = 6
post_d = 3
rail_height = 55

CAD.config(resolution: { segments: 64 })

wedge = circle(r: radius) - circle(d: column_d - 2)
sector = polygon([
  [0, 0],
  [radius + 1, 0],
  [(radius + 1) * Math.cosd(turn), (radius + 1) * Math.sind(turn)],
])
step = (wedge & sector).extrude(tread)
post = cylinder(d: post_d, h: rail_height).translate(
  (radius - post_d) * Math.cosd(turn / 2),
  (radius - post_d) * Math.sind(turn / 2),
  tread,
)

step + post
```

The post stands at the middle of the step's outer edge, a post's width in from it, on top of
the tread. `cosd` and `sind` of half the turn give that point.

### 3. The flight

```kupcad
steps = 14
rise = 18
turn = 25
radius = 80
column_d = 20
tread = 6
post_d = 3
rail_height = 55

CAD.config(resolution: { segments: 64 })

wedge = circle(r: radius) - circle(d: column_d - 2)
sector = polygon([
  [0, 0],
  [radius + 1, 0],
  [(radius + 1) * Math.cosd(turn), (radius + 1) * Math.sind(turn)],
])
step = (wedge & sector).extrude(tread)
post = cylinder(d: post_d, h: rail_height).translate(
  (radius - post_d) * Math.cosd(turn / 2),
  (radius - post_d) * Math.sind(turn / 2),
  tread,
)
step_with_post = (step + post).named("step").material(color: "#C8A165")

flight = (0...steps).map do |i|
  step_with_post.rotate(i * turn).translate(z: i * rise)
end

assemble(name: "Flight", parts: flight)
```

Step `i` is turned `i` turns and raised `i` rises. `(0...steps).map` gives a list of the
fourteen placed steps, and `assemble` takes the list. Because every step is the same shape with
the same name and material, moved, the parts list counts them as fourteen of one part; a union
would have fused them into one.

### 4. The column

```kupcad
steps = 14
rise = 18
turn = 25
radius = 80
column_d = 20
tread = 6
post_d = 3
rail_height = 55

CAD.config(resolution: { segments: 64 })

wedge = circle(r: radius) - circle(d: column_d - 2)
sector = polygon([
  [0, 0],
  [radius + 1, 0],
  [(radius + 1) * Math.cosd(turn), (radius + 1) * Math.sind(turn)],
])
step = (wedge & sector).extrude(tread)
post = cylinder(d: post_d, h: rail_height).translate(
  (radius - post_d) * Math.cosd(turn / 2),
  (radius - post_d) * Math.sind(turn / 2),
  tread,
)
step_with_post = (step + post).named("step").material(color: "#C8A165")
flight = (0...steps).map do |i|
  step_with_post.rotate(i * turn).translate(z: i * rise)
end

height = steps * rise
column = cylinder(d: column_d, h: height + tread).named("column").material(color: "#555B6E")

assemble(name: "Spiral staircase", parts: [column] + flight)
```

`[column] + flight` is a list of fifteen parts. Lists add with `+`, which is how an assembly
of fixed parts and computed ones is written.

### 5. The handrail

The handrail passes through every post's top. Those tops lie on a helix: each is `turn`
degrees round and `rise` up from the last. Four points per step make a smooth curve, and
`sweep` carries a circle along them:

```kupcad
steps = 14
rise = 18
turn = 25
radius = 80
post_d = 3
rail_d = 4
rail_height = 55
tread = 6

CAD.config(resolution: { segments: 64 })

handrail_points = (0..(steps - 1) * 4).map do |k|
  angle = turn / 2 + k * turn / 4.0
  [
    (radius - post_d) * Math.cosd(angle),
    (radius - post_d) * Math.sind(angle),
    k * rise / 4.0 + tread + rail_height,
  ]
end

circle(d: rail_d).sweep(handrail_points)
```

Point `k` is a quarter turn and a quarter rise past the one before, starting at the first
post. A point list is the general way to sweep along anything you can compute; for a plain
helix, [`helix`](/reference/geometry/sweeps/#helix) does it in one call, but it starts at the
origin and the rail must start where the first post is.

### 6. Together

The whole script below joins the three. `[column, handrail] + flight` lists sixteen parts.
Build it with `--bom` and the parts list says so:

```sh
kupcad build spiral_staircase.kup -o staircase.3mf --bom staircase.json
```

```json
{"parts": [{"name": "column", "count": 1, ...}, {"name": "handrail", "count": 1, ...}, {"name": "step", "count": 14, ...}]}
```

### 7. Parameters

Steps, rise, turn, radius and column diameter are the sliders. The handrail follows whatever
they say, because its points are computed from the same numbers as the posts.

## Printing tips

As a model, print it in parts: `--split parts/` writes the column, one step and the handrail as
three files; print fourteen steps and glue them on, or print the whole assembly at once from the
3MF with supports under the steps. For a staircase that stands up on its own, make `tread`
thicker and `post_d` at least 3 mm, which they are. Scale it in the slicer, or add a `scale`
parameter and multiply the sizes.

## Make it yours

- A landing: a larger sector at the top, from the same `wedge`.
- Balusters between posts: a second, thinner post at each step's inner corner.
- A helical ramp instead of steps: one `sweep` of the step's section along the handrail's kind
  of points.

## The whole script

```kupcad
# @title Spiral staircase
# @description A model staircase winding up a column, its steps placed by arithmetic and its handrail swept along a helix

steps = param(:steps, default: 14, validate: { min: 4, max: 40 }, step: 1, title: "Steps")
rise = param(:rise, default: 18, validate: { min: 8, max: 40 }, unit: "mm", title: "Rise per step")
turn = param(
  :turn,
  default: 25,
  validate: { min: 10, max: 45 },
  step: 1,
  unit: "°",
  title: "Turn per step",
)
radius = param(:radius, default: 80, validate: { min: 40, max: 200 }, unit: "mm", title: "Radius")
column_d = param(
  :column_d,
  default: 20,
  validate: { min: 8, max: 60 },
  unit: "mm",
  title: "Column diameter",
)

tread = 6
post_d = 3
rail_d = 4
rail_height = 55

CAD.config(resolution: { segments: 64 })

# One step: a wedge from the column out to the radius, `turn` degrees wide, with a post at its
# outer corner for the handrail
wedge = circle(r: radius) - circle(d: column_d - 2)
sector = polygon([
  [0, 0],
  [radius + 1, 0],
  [(radius + 1) * Math.cosd(turn), (radius + 1) * Math.sind(turn)],
])
step = (wedge & sector).extrude(tread)
post = cylinder(d: post_d, h: rail_height).translate(
  (radius - post_d) * Math.cosd(turn / 2),
  (radius - post_d) * Math.sind(turn / 2),
  tread,
)
step_with_post = (step + post).named("step").material(color: "#C8A165")

# Each step turned and raised by its place in the flight
flight = (0...steps).map do |i|
  step_with_post.rotate(i * turn).translate(z: i * rise)
end

height = steps * rise
column = cylinder(d: column_d, h: height + tread).named("column").material(color: "#555B6E")

# The handrail: a circle swept along a helix through the posts' tops, a point every few degrees
handrail_points = (0..(steps - 1) * 4).map do |k|
  angle = turn / 2 + k * turn / 4.0
  [
    (radius - post_d) * Math.cosd(angle),
    (radius - post_d) * Math.sind(angle),
    k * rise / 4.0 + tread + rail_height,
  ]
end
handrail = circle(d: rail_d).sweep(handrail_points).named("handrail").material(color: "#8B5E3C")

assemble(name: "Spiral staircase", parts: [column, handrail] + flight)
```

[Engine settings](/reference/geometry/engine-settings/) · [Booleans](/reference/geometry/booleans/) ·
[sweep, helix](/reference/geometry/sweeps/) · [assemble](/reference/geometry/assemblies/) ·
[Parts lists](/reference/geometry/assemblies/#parts-lists) · [Range](/reference/stdlib/range/)

Next: [Screw-top jar](/mastering/screw-top-jar/).
