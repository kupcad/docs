---
title: 4. Parabolic dish
description: A dish whose curve comes from the parabola's formula — a lambda, two lists of points, a section, a revolve — with a receiver at its focus.
sidebar:
  order: 4
---

Some shapes have no primitive: they are a formula. A parabolic dish focuses whatever hits it
onto one point, and its profile is y = x² / 4f, where f is the focal length. This build turns
that formula into points, the points into a section, and the section into a dish, with a
receiver on a stalk at the focus to prove it.

## What's new

- A [lambda](/reference/language/blocks-and-lambdas/) as a formula, called with `.call`.
- Points from a [Range](/reference/stdlib/range/): `(0..steps).map`.
- [`polyline`](/reference/geometry/paths/#polyline) to see a curve, and
  [`polygon`](/reference/geometry/sketches/#polygon) from joined point lists.
- [`revolve`](/reference/geometry/sweeps/#revolve) of a computed section.

## Let's go

### 1. The formula

```kupcad
diameter = 120
focus = 40
radius = diameter / 2

height = ->(x) { x * x / (4 * focus) }
puts height.call(0)        # 0
puts height.call(radius)   # 22.5
```

`height` is a lambda: a small function kept in a variable. `height.call(x)` is the curve's
height at distance `x` from the centre. With the focus 40 mm up, the dish is 22.5 mm deep at
its 60 mm rim. A lambda is the right tool when a formula is used in several places and
belongs to the numbers around it: it sees `focus` without being told.

### 2. The curve as points

```kupcad
diameter = 120
focus = 40
radius = diameter / 2
steps = 60

height = ->(x) { x * x / (4 * focus) }
xs = ->(start) { (0..steps).map { |i| start + (radius - start) * i / steps } }
inside = xs.call(0).map { |x| [x, height.call(x)] }

polyline(inside)
```

`xs` makes a list of 61 evenly spaced distances from `start` out to the rim; `inside` pairs each
with its height. `polyline` draws the points as a path, which is the quickest way to look at a
list of points: here, the inside of the dish from the centre (left) to the rim.

### 3. The section

A solid dish has an outside too: the same curve, a wall lower. The section runs up the inside
from the centre to the rim, down the outside from the rim to a foot, then across the foot to
the axis:

```kupcad
diameter = 120
focus = 40
wall = 2
radius = diameter / 2
foot_d = 30
foot_h = 4
steps = 60

height = ->(x) { x * x / (4 * focus) }
xs = ->(start) { (0..steps).map { |i| start + (radius - start) * i / steps } }
inside = xs.call(0).map { |x| [x, height.call(x)] }
outside = xs.call(foot_d / 2).map { |x| [x, height.call(x) - wall] }.reverse

polygon(inside + outside + [[foot_d / 2, -foot_h], [0, -foot_h]])
```

The outside list starts at the foot's edge and runs out to the rim, so it is reversed to go
back the other way; `+` joins the lists. The last two points are the foot's outer corner and
the point on the axis under it, and `polygon` closes back to the first point. One list of
points, read round the outline in order: that is the whole method for shapes from formulas.

### 4. Revolved

```kupcad
diameter = 120
focus = 40
wall = 2
radius = diameter / 2
foot_d = 30
foot_h = 4
steps = 60

height = ->(x) { x * x / (4 * focus) }
xs = ->(start) { (0..steps).map { |i| start + (radius - start) * i / steps } }
inside = xs.call(0).map { |x| [x, height.call(x)] }
outside = xs.call(foot_d / 2).map { |x| [x, height.call(x) - wall] }.reverse
section = polygon(inside + outside + [[foot_d / 2, -foot_h], [0, -foot_h]])

section.revolve.translate(z: wall)
```

`revolve` turns the section about the sketch's y axis, which becomes z. The section's x was the
distance from the axis all along, so it needs nothing else. The dish is lifted by the wall so
its foot's underside is at z = 0.

### 5. The receiver

```kupcad
diameter = 120
focus = 40
wall = 2
radius = diameter / 2
foot_d = 30
foot_h = 4
steps = 60

height = ->(x) { x * x / (4 * focus) }
xs = ->(start) { (0..steps).map { |i| start + (radius - start) * i / steps } }
inside = xs.call(0).map { |x| [x, height.call(x)] }
outside = xs.call(foot_d / 2).map { |x| [x, height.call(x) - wall] }.reverse
section = polygon(inside + outside + [[foot_d / 2, -foot_h], [0, -foot_h]])
dish = section.revolve.translate(z: wall).named("dish").material(color: "#D8DEE9")

stalk = cylinder(d: 3, h: focus + wall)
ball = sphere(d: 8).translate(z: focus + wall)
receiver = (stalk + ball).named("receiver").material(color: "#BF616A")

assemble(name: "Parabolic dish", parts: [dish, receiver])
```

The ball sits `focus` above the dish's centre, which is `wall` above the origin: that is the
focus, where rays parallel to the axis meet after bouncing off the curve. Change `focus` and
the dish gets deeper or shallower and the ball moves with it.

### 6. Parameters

The whole script adds sliders and a switch to show the dish alone. The switch uses `? :`
to make the model an assembly or a single part.

## Printing tips

Print it upside down, rim on the bed: that way the outside is a dome that closes gently
towards the top, and nothing overhangs. Print it the right way up and the curve's shallow centre
overhangs badly. For a smooth reflecting surface, use `steps: 120` or more, 0.1 mm layers, and
sand; the stalk's hole can be drilled after. With `show_receiver=false` the export is the dish
alone:

```sh
kupcad build parabolic_dish.kup -p show_receiver=false -o dish.stl
```

## Make it yours

- A different curve: a sphere's cap `->(x) { r - Math.sqrt(r * r - x * x) }`, or a cone; only
  the lambda changes.
- A feed horn instead of a ball: a short cone from `cylinder(r1:, r2:)`.
- An offset dish: a parabola with its axis to one side, by starting `xs` at a distance from 0
  and leaving out the foot.

## The whole script

```kupcad
# @title Parabolic dish
# @description A dish whose curve comes from the parabola's formula, with a receiver held at its focus

diameter = param(
  :diameter,
  default: 120,
  validate: { min: 40, max: 300 },
  unit: "mm",
  title: "Diameter",
)
focus = param(
  :focus,
  default: 40,
  validate: { min: 15, max: 200 },
  unit: "mm",
  title: "Focal length",
  description: "How far above the dish's centre the focus sits",
)
wall = param(:wall, default: 2, validate: { min: 1, max: 6 }, step: 0.5, unit: "mm", title: "Wall")
show_receiver = param(:show_receiver, default: true, title: "Show the receiver")

foot_d = 30
foot_h = 4
radius = diameter / 2
steps = 60

# A parabola with its focus `focus` above its vertex is y = x² / (4 focus): the dish's inside.
# Its height at the rim is the dish's depth.
height = ->(x) { x * x / (4 * focus) }
puts("Depth #{height.call(radius).round(1)} mm at the rim")   # Depth 22.5 mm at the rim

# The section to turn: up the inside from the centre to the rim, over the rim, then back down
# the outside, the same curve `wall` lower, as far as the foot
xs = ->(start) { (0..steps).map { |i| start + (radius - start) * i / steps } }
inside = xs.call(0).map { |x| [x, height.call(x)] }
outside = xs.call(foot_d / 2).map { |x| [x, height.call(x) - wall] }.reverse
section = polygon(inside + outside + [[foot_d / 2, -foot_h], [0, -foot_h]])
dish = section.revolve.translate(z: wall).named("dish").material(color: "#D8DEE9")

# The receiver: a ball at the focus on a stalk up from the centre
stalk = cylinder(d: 3, h: focus + wall)
ball = sphere(d: 8).translate(z: focus + wall)
receiver = (stalk + ball).named("receiver").material(color: "#BF616A")

show_receiver ? assemble(name: "Parabolic dish", parts: [dish, receiver]) : dish
```

[Blocks and lambdas](/reference/language/blocks-and-lambdas/) · [Range](/reference/stdlib/range/) ·
[polygon](/reference/geometry/sketches/#polygon) · [polyline](/reference/geometry/paths/#polyline) ·
[revolve](/reference/geometry/sweeps/#revolve) · [Math](/reference/stdlib/math/)

Next: [Spiral staircase](/mastering/spiral-staircase/).
