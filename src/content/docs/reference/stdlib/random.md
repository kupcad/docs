---
title: Random
description: Seeded random numbers, the same every run, with rand, shuffle and sample.
sidebar:
  order: 12
---

`Random.new(seed)` makes a generator of random numbers from a seed. The same seed gives the
same numbers every run, on every platform and after every upgrade, so a model made with random
numbers is the same model each time it is built. There is no unseeded `Random`: to vary a
model, make the seed a [parameter](/reference/inputs/parameters/).

The generator is SplitMix64, written in KupCAD rather than taken from a library, so a seed's
numbers don't change with the platform or a dependency.

```kupcad
seed = param(:seed, default: 42)
g = Random.new(seed)
studs = (0...8).map do
  x = g.rand(0..90)
  y = g.rand(0..40)
  cylinder(r: 2, h: 3).translate(x, y, 2)
end
cube(x: 100, y: 50, z: 2).union(studs)
```

## Random.new

```kupcad frame="none"
Random.new(seed)
```

A generator seeded with `seed`, a whole number of magnitude up to 2^53.

**Returns:** `Random`.

**Raises:** `ArgumentError` without a seed, or for one that isn't such a whole number.

## rand

```kupcad frame="none"
g.rand
g.rand(limit)
g.rand(range)
```

The next number from the generator:

| Call | Gives |
|---|---|
| `rand` | A float in [0, 1). |
| `rand(n)` | A whole number from 0 to `n - 1` for a whole `n`, else a float in [0, `n`). |
| `rand(a..b)` | A whole number from `a` to `b` for whole ends (`a...b` leaves `b` out), else a float from `a` up to `b`. |

**Returns:** `Number`.

**Raises:** `ArgumentError` for a limit of 0 or less, an empty Range or one with a step;
`TypeError` for anything but a Number or a Range.

## shuffle

```kupcad frame="none"
g.shuffle(array)
```

A copy of `array` in an order drawn from the generator; `array` itself is left as it was.

**Returns:** `Array`.

## sample

```kupcad frame="none"
g.sample(array)
```

One item of `array`, each equally likely.

**Returns:** the item, or `nil` for an empty Array.

## seed

```kupcad frame="none"
g.seed
```

The seed the generator was made with. **Returns:** `Number`.

```kupcad
g = Random.new(7)
a = g.rand(1..6)
h = Random.new(7)
puts h.rand(1..6) == a                    # true: the same seed, the same numbers
puts g.shuffle([1, 2, 3]).sort.inspect    # [1, 2, 3]
puts g.seed                               # 7
puts g.inspect                            # #<Random seed: 7>
```
