---
title: 2. Values
description: Numbers, strings, symbols, arrays, maps and ranges, and what each is for.
sidebar:
  order: 2
---

## Numbers

```kupcad
puts 10 / 4        # 2.5
puts 2 ** 3        # 8
puts 7 % 3         # 1
puts (0.1 + 0.2).round(2)   # 0.3
puts Math::PI      # 3.141592653589793
puts Math.sind(30) # 0.5
```

Every number is one kind: `10 / 4` is `2.5`, not `2`. Lengths are millimetres and angles
degrees; `Math.sind`, `Math.cosd` and `Math.tand` take degrees, and `Math.sin` and friends
radians.

## Strings

```kupcad
wall = 3
puts "a #{wall} mm wall"       # a 3 mm wall
puts 'single quotes: no #{}'   # single quotes: no #{}
puts "a" + "b"                 # ab
```

Double quotes interpolate: `#{...}` runs the code inside and puts its result in the string.
Single quotes don't.

## Symbols

```kupcad
side = :left
puts side == :left   # true
```

A symbol is a name used as a value, written with a colon. Parameters are named by symbols
(`param(:width, ...)`), and so are choices from a fixed set.

## nil, true and false

`nil` is nothing. `true` and `false` are the booleans. In a condition, only `nil` and `false`
count as no; `0` and `""` count as yes.

## Arrays

```kupcad
sizes = [10, 20, 30]
puts sizes[0]        # 10
puts sizes.size      # 3
puts sizes.sum       # 60
puts sizes.max       # 30
sizes.push(40)
puts sizes.inspect   # [10, 20, 30, 40]
```

An array is an ordered list. Indexes start at 0. A pair of coordinates is an array too:
`[x, y]`.

## Maps

```kupcad
part = { name: "lid", wall: 3 }
puts part[:wall]      # 3
part[:height] = 20
puts part.inspect     # {name: "lid", wall: 3, height: 20}
```

A map goes from keys to values. `{ name: "lid" }` has the symbol `:name` as its key. Keyword
arguments to a method look like a map, and that is no accident.

## Ranges

```kupcad
puts (1..4).to_a.inspect    # [1, 2, 3, 4]
puts (1...4).to_a.inspect   # [1, 2, 3]
```

`..` includes the end, `...` leaves it out. Ranges are for counting: `(0...n)` is `n` numbers
starting at 0, which the next pages use to make `n` copies of a shape.

## Seeing a value

`puts` prints a value as text; `inspect` shows it as code, which is clearer for arrays and
maps. For a shape, neither shows its geometry: ask for `volume` or `bbox`.

## In the reference

[Syntax](/reference/language/syntax/) · [Number](/reference/stdlib/number/) ·
[String](/reference/stdlib/string/) · [Array](/reference/stdlib/array/) ·
[Map](/reference/stdlib/map/) · [Range](/reference/stdlib/range/) · [Math](/reference/stdlib/math/)

Next: [Methods](/guides/language/methods/).
