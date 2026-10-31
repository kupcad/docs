---
title: 3. Hinge
description: A hinge printed in one piece — two leaves whose knuckles alternate round a pin, with a clearance you tune for your printer, and the gap measured in the script.
sidebar:
  order: 3
---

A print-in-place hinge comes off the bed already assembled and moving. The trick is a clearance:
every surface of one leaf is a fraction of a millimetre from every surface of the other, small
enough to bridge, large enough not to fuse. This build makes the hinge, measures the gap in the
script, and exports the two leaves as two parts in one file.

## What's new

- Cylinders along x: `rotate(0, 90, 0)`.
- [`filter`](/reference/stdlib/array/#filter) with `even?` and `odd?`, and
  [`union(list)`](/reference/geometry/booleans/#union) / `difference(list)`.
- A clearance as a design parameter, and the
  [resolution](/reference/geometry/engine-settings/#resolution) that makes it real.
- [`min_gap`](/reference/geometry/inspection/#min_gap): measuring the distance between two
  solids.
- 3MF with parts against [`--split`](/reference/tooling/cli/#kupcad-build).

## Let's go

### 1. One knuckle

```kupcad
length = 60
thickness = 3
knuckles = 5
clearance = 0.3

knuckle_d = 2 * thickness + 2
segment = length / knuckles

CAD.config(resolution: { segments: 48 })

cylinder(d: knuckle_d, h: segment - clearance)
  .rotate(0, 90, 0)
  .translate(clearance / 2, 0, knuckle_d / 2)
```

A cylinder stands along z; turned 90° about y it lies along x, from the origin towards +x. The
hinge's length is divided into `knuckles` segments; each knuckle is a segment long less the
clearance, and sits half a clearance in from each end of its segment, so neighbours are a whole
clearance apart. Lifted by its radius, it rests on the bed.

`CAD.config(resolution: { segments: 48 })` matters here. By default a small circle is drawn
with only a handful of edges, and a 3 mm pin drawn as a hexagon can touch the hexagon of its
3.6 mm bore. Anything that must fit needs circles drawn round.

### 2. All of them

```kupcad
length = 60
thickness = 3
knuckles = 5
clearance = 0.3

knuckle_d = 2 * thickness + 2
segment = length / knuckles

CAD.config(resolution: { segments: 48 })

def knuckle(index)
  cylinder(d: knuckle_d, h: segment - clearance)
    .rotate(0, 90, 0)
    .translate(index * segment + clearance / 2, 0, knuckle_d / 2)
end

evens = (0...knuckles).to_a.filter { |i| i.even? }
odds = (0...knuckles).to_a.filter { |i| i.odd? }
union(evens.map { |i| knuckle(i) }) + union(odds.map { |i| knuckle(i) })
```

Knuckles 0, 2 and 4 will belong to one leaf, 1 and 3 to the other, which is why the count is
odd: the outer two are the same leaf's, and the hinge can't be pulled apart endways.
`filter` keeps the indexes the block is true for; `union(list)` joins a list of solids in one
operation. The two unions are added here only to see them all.

### 3. The pin and the bore

```kupcad
length = 60
thickness = 3
knuckles = 5
clearance = 0.3

knuckle_d = 2 * thickness + 2
pin_d = thickness
segment = length / knuckles

CAD.config(resolution: { segments: 48 })

def knuckle(index)
  cylinder(d: knuckle_d, h: segment - clearance)
    .rotate(0, 90, 0)
    .translate(index * segment + clearance / 2, 0, knuckle_d / 2)
end

bore = cylinder(d: pin_d + 2 * clearance, h: length + 2)
  .rotate(0, 90, 0)
  .translate(-1, 0, knuckle_d / 2)
pin = cylinder(d: pin_d, h: length).rotate(0, 90, 0).translate(0, 0, knuckle_d / 2)

evens = (0...knuckles).to_a.filter { |i| i.even? }
odds = (0...knuckles).to_a.filter { |i| i.odd? }
first = union(evens.map { |i| knuckle(i) }) - bore + pin
second = union(odds.map { |i| knuckle(i) }) - bore

first + second
```

Every knuckle is bored for the pin plus the clearance all round. The pin then goes back into
the first leaf's knuckles as one piece the whole length: it fills their bores exactly and turns
inside the second leaf's. Nothing of `first` touches `second`, though they show as one shape
here.

### 4. The leaves

A leaf is a plate beside the axis. It can't reach right up to the knuckles: a plate 3 mm thick
that met the 8 mm knuckles would run under the *other* leaf's knuckles too, and touch them. So
the plate stops a clearance short of the knuckles, and a neck under each of the leaf's own
knuckles joins the two:

```kupcad
length = 60
leaf = 20
thickness = 3
knuckles = 5
clearance = 0.3

knuckle_d = 2 * thickness + 2
pin_d = thickness
segment = length / knuckles
plate_from = knuckle_d / 2 + clearance

CAD.config(resolution: { segments: 48 })

def knuckle(index)
  cylinder(d: knuckle_d, h: segment - clearance)
    .rotate(0, 90, 0)
    .translate(index * segment + clearance / 2, 0, knuckle_d / 2)
end

def leaf_for(side, indexes)
  plate = cube(x: length, y: leaf, z: thickness, round_r: 2)
    .translate(0, side > 0 ? plate_from : -plate_from - leaf, 0)
  necks = indexes.map do |i|
    cube(x: segment - clearance, y: plate_from + 1, z: thickness)
      .translate(i * segment + clearance / 2, side > 0 ? 0 : -plate_from - 1, 0)
  end
  plate + union(necks) + union(indexes.map { |i| knuckle(i) })
end

bore = cylinder(d: pin_d + 2 * clearance, h: length + 2)
  .rotate(0, 90, 0)
  .translate(-1, 0, knuckle_d / 2)
pin = cylinder(d: pin_d, h: length).rotate(0, 90, 0).translate(0, 0, knuckle_d / 2)

evens = (0...knuckles).to_a.filter { |i| i.even? }
odds = (0...knuckles).to_a.filter { |i| i.odd? }
first = leaf_for(1, evens) - bore + pin
second = leaf_for(-1, odds) - bore

first + second
```

`leaf_for(1, evens)` builds the +y leaf with the even knuckles, `leaf_for(-1, odds)` the −y
leaf with the odd ones. A neck is as long as its knuckle, so it is a clearance from the
neighbouring knuckles too, and it reaches a millimetre into the plate so the two fuse. The
order of the operations matters: the leaf is built whole, then bored, then (for the first
leaf) the pin is put back. Bore after the pin, and the pin would be gone.

### 5. Screw holes

```kupcad
length = 60
leaf = 20
thickness = 3
knuckles = 5
clearance = 0.3
holes = 2

knuckle_d = 2 * thickness + 2
pin_d = thickness
segment = length / knuckles
plate_from = knuckle_d / 2 + clearance

CAD.config(resolution: { segments: 48 })

def knuckle(index)
  cylinder(d: knuckle_d, h: segment - clearance)
    .rotate(0, 90, 0)
    .translate(index * segment + clearance / 2, 0, knuckle_d / 2)
end

def leaf_for(side, indexes)
  plate = cube(x: length, y: leaf, z: thickness, round_r: 2)
    .translate(0, side > 0 ? plate_from : -plate_from - leaf, 0)
  necks = indexes.map do |i|
    cube(x: segment - clearance, y: plate_from + 1, z: thickness)
      .translate(i * segment + clearance / 2, side > 0 ? 0 : -plate_from - 1, 0)
  end
  screw_holes = (0...holes).map do |i|
    cylinder(d: 3.4, h: thickness + 2).translate(
      (i + 0.5) * length / [holes, 1].max,
      side * (plate_from + leaf / 2),
      -1,
    )
  end
  (plate + union(necks) + union(indexes.map { |i| knuckle(i) })).difference(screw_holes)
end

bore = cylinder(d: pin_d + 2 * clearance, h: length + 2)
  .rotate(0, 90, 0)
  .translate(-1, 0, knuckle_d / 2)
pin = cylinder(d: pin_d, h: length).rotate(0, 90, 0).translate(0, 0, knuckle_d / 2)

evens = (0...knuckles).to_a.filter { |i| i.even? }
odds = (0...knuckles).to_a.filter { |i| i.odd? }
first = leaf_for(1, evens) - bore + pin
second = leaf_for(-1, odds) - bore

first + second
```

`difference(list)` takes a whole list away in one operation. `(i + 0.5) * length / holes`
spaces the holes evenly with half a space at each end; `[holes, 1].max` keeps the division safe
when `holes` is 0, in which case the list is empty and nothing is cut.

### 6. Two parts, and the gap between them

```kupcad
length = 60
leaf = 20
thickness = 3
knuckles = 5
clearance = 0.3
holes = 2

knuckle_d = 2 * thickness + 2
pin_d = thickness
segment = length / knuckles
plate_from = knuckle_d / 2 + clearance

CAD.config(resolution: { segments: 48 })

def knuckle(index)
  cylinder(d: knuckle_d, h: segment - clearance)
    .rotate(0, 90, 0)
    .translate(index * segment + clearance / 2, 0, knuckle_d / 2)
end

def leaf_for(side, indexes)
  plate = cube(x: length, y: leaf, z: thickness, round_r: 2)
    .translate(0, side > 0 ? plate_from : -plate_from - leaf, 0)
  necks = indexes.map do |i|
    cube(x: segment - clearance, y: plate_from + 1, z: thickness)
      .translate(i * segment + clearance / 2, side > 0 ? 0 : -plate_from - 1, 0)
  end
  screw_holes = (0...holes).map do |i|
    cylinder(d: 3.4, h: thickness + 2).translate(
      (i + 0.5) * length / [holes, 1].max,
      side * (plate_from + leaf / 2),
      -1,
    )
  end
  (plate + union(necks) + union(indexes.map { |i| knuckle(i) })).difference(screw_holes)
end

bore = cylinder(d: pin_d + 2 * clearance, h: length + 2)
  .rotate(0, 90, 0)
  .translate(-1, 0, knuckle_d / 2)
pin = cylinder(d: pin_d, h: length).rotate(0, 90, 0).translate(0, 0, knuckle_d / 2)

evens = (0...knuckles).to_a.filter { |i| i.even? }
odds = (0...knuckles).to_a.filter { |i| i.odd? }
first = leaf_for(1, evens) - bore + pin
second = leaf_for(-1, odds) - bore

puts first.min_gap(second, 1).round(2)   # 0.3

assemble(
  name: "Hinge",
  parts: [first.named("leaf with pin").material(color: "#6B8E23"), second.named("leaf").material(color: "#9ACD32")],
)
```

`min_gap` is the shortest distance between two solids; the `1` tells it not to look further
than a millimetre, which is cheaper. It comes out as the clearance, which is the whole point:
nothing of one leaf is closer to the other than that. It is also how the neck in step 4 was
found: with the plates reaching the knuckles, the gap measured 0. Turn the check into a
guarantee with `assert(first.min_gap(second, 1) >= clearance - 0.01)`, and a change that
makes the leaves touch fails the build instead of fusing on the bed.

### 7. Parameters

The whole script makes length, leaf width, thickness, knuckle count (odd only: `step: 2` from
3), clearance and screw holes the parameters.

## Printing tips

Print it as it lies, both leaves flat, no supports: the knuckles' undersides are bridged
across a clearance-wide gap, which any printer manages. The first layer matters most: a
squished first layer narrows the gaps between knuckles and the leaves fuse there. 0.3 mm suits
most PLA printers at 0.2 mm layers; if the hinge is stiff, free it by working it, if it won't
move at all raise `clearance` to 0.4. Export it in one file to keep the leaves where they are:

```sh
kupcad build hinge.kup -o hinge.3mf        # both parts, placed, in one file
kupcad build hinge.kup --split parts/      # each leaf alone, for printing separately
```

A 3MF holds the two leaves as two objects at their positions, so the slicer can colour them
apart and still prints them together. `--split` writes each part as it was made, not placed,
which is what you want for parts printed separately, and not for this one.

## Make it yours

- A stop: a lug on one leaf that meets the other at 180°, so the hinge opens flat and no
  further.
- Countersunk screw holes: the [recipe](/recipes/countersunk-holes/) replaces the plain
  cylinder in `leaf_for`.
- A living hinge instead: no pin, one leaf, and a thin bridge of 0.6 mm between the two
  halves — a different design for a lid that flexes a few hundred times.

## The whole script

```kupcad
# @title Hinge
# @description A hinge printed in one piece: two leaves whose knuckles alternate round a pin, with a clearance to tune for your printer

length = param(:length, default: 60, validate: { min: 30, max: 150 }, unit: "mm", title: "Length")
leaf = param(:leaf, default: 20, validate: { min: 10, max: 50 }, unit: "mm", title: "Leaf width")
thickness = param(
  :thickness,
  default: 3,
  validate: { min: 2, max: 6 },
  step: 0.5,
  unit: "mm",
  title: "Leaf thickness",
)
knuckles = param(
  :knuckles,
  default: 5,
  validate: { min: 3, max: 11 },
  step: 2,
  title: "Knuckles",
  description: "An odd number: the outer ones belong to the same leaf",
)
clearance = param(
  :clearance,
  default: 0.3,
  validate: { min: 0.15, max: 0.6 },
  step: 0.05,
  unit: "mm",
  title: "Clearance",
  description: "Round the pin and between knuckles; 0.3 prints well",
)
holes = param(
  :holes,
  default: 2,
  validate: { min: 0, max: 5 },
  step: 1,
  title: "Screw holes per leaf",
)

knuckle_d = 2 * thickness + 2
pin_d = thickness
segment = length / knuckles
# Where a leaf's plate starts: clear of the other leaf's knuckles
plate_from = knuckle_d / 2 + clearance

# A 3 mm pin drawn with the default handful of edges would touch its bore: fits need round
# circles
CAD.config(resolution: { segments: 48 })

# A knuckle: a cylinder along x, as long as its segment less the clearance to its neighbours,
# bored for the pin with the clearance round it. The pin itself is the first leaf's, one piece
# through them all; the other leaf's knuckles turn round it.
def knuckle(index)
  cylinder(d: knuckle_d, h: segment - clearance)
    .rotate(0, 90, 0)
    .translate(index * segment + clearance / 2, 0, knuckle_d / 2)
end

bore = cylinder(d: pin_d + 2 * clearance, h: length + 2)
  .rotate(0, 90, 0)
  .translate(-1, 0, knuckle_d / 2)
pin = cylinder(d: pin_d, h: length).rotate(0, 90, 0).translate(0, 0, knuckle_d / 2)

# A leaf: a plate beside the axis, a neck under each of its own knuckles joining the two, its
# knuckles, and its screw holes. `side` is 1 for the +y leaf, -1 for the other.
def leaf_for(side, indexes)
  plate = cube(x: length, y: leaf, z: thickness, round_r: 2)
    .translate(0, side > 0 ? plate_from : -plate_from - leaf, 0)
  necks = indexes.map do |i|
    cube(x: segment - clearance, y: plate_from + 1, z: thickness)
      .translate(i * segment + clearance / 2, side > 0 ? 0 : -plate_from - 1, 0)
  end
  screw_holes = (0...holes).map do |i|
    cylinder(d: 3.4, h: thickness + 2).translate(
      (i + 0.5) * length / [holes, 1].max,
      side * (plate_from + leaf / 2),
      -1,
    )
  end
  (plate + union(necks) + union(indexes.map { |i| knuckle(i) })).difference(screw_holes)
end

evens = (0...knuckles).to_a.filter { |i| i.even? }
odds = (0...knuckles).to_a.filter { |i| i.odd? }
first = leaf_for(1, evens) - bore + pin
second = leaf_for(-1, odds) - bore

assemble(
  name: "Hinge",
  parts: [
    first.named("leaf with pin").material(color: "#6B8E23"),
    second.named("leaf").material(color: "#9ACD32"),
  ],
)
```

[rotate](/reference/geometry/transforms/#rotate) · [Array](/reference/stdlib/array/) ·
[Booleans](/reference/geometry/booleans/) · [Engine settings](/reference/geometry/engine-settings/) ·
[min_gap](/reference/geometry/inspection/#min_gap) · [assert](/reference/stdlib/kernel/#assert) ·
[3MF](/reference/geometry/export/#3mf) · [kupcad build](/reference/tooling/cli/#kupcad-build)

Next: [Parabolic dish](/mastering/parabolic-dish/).
