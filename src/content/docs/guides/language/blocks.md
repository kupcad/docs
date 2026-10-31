---
title: 4. Blocks
description: Doing something for each item — each, map and times — and lambdas, code kept as a value.
sidebar:
  order: 4
---

A block is code handed to a method, which runs it once per item. It is how KupCAD repeats
things: four holes, twelve teeth, three planets.

## each and map

```kupcad
[10, 20, 30].each { |size| puts size }
```

`each` runs the block for every item; `size` is the item, named between the bars. `map` does
the same and collects the results:

```kupcad
posts = [10, 20, 30].map { |x| cylinder(d: 4, h: 8).translate(x: x) }
union(posts)
```

Three posts, one per position, joined with `union`. A block that doesn't fit on a line goes
between `do` and `end`:

```kupcad
posts = [10, 20, 30].map do |x|
  post = cylinder(d: 4, h: 8)
  post.translate(x: x)
end
union(posts)
```

## Pairs

A block gets each item as one value. For an item that is a pair, name both parts in
parentheses:

```kupcad
spots = [[5, 5], [35, 5], [5, 25]]
pegs = spots.map { |(x, y)| cylinder(d: 3, h: 6).translate(x, y, 0) }
union(pegs)
```

## Counting

```kupcad
pegs = (0...6).map { |i| cylinder(d: 3, h: 6).translate(x: i * 10) }
union(pegs)
```

`(0...6)` counts 0 to 5. `6.times { |i| ... }` does the same with `each`-like behaviour, and
`each_with_index` gives an item and its position together.

## Picking and summing

```kupcad
sizes = [3, 8, 12, 20]
puts sizes.filter { |s| s > 5 }.inspect   # [8, 12, 20]
puts sizes.sum                            # 43
puts sizes.map { |s| s * 2 }.max          # 40
```

## Lambdas

A lambda is a block kept as a value, to call later or pass around:

```kupcad
at = ->(r, angle) { [r * Math.cosd(angle), r * Math.sind(angle)] }
puts at.call(10, 90).inspect   # [0, 10]
```

`->(params) { body }` makes one; `.call` runs it. That is the only way to call a lambda.

## Leaving a block

`next` skips to the next item, `break` stops the loop. `return` inside a block leaves the block
only, not the method around it; this is one place KupCAD differs from Ruby.

## In the reference

[Blocks and lambdas](/reference/language/blocks-and-lambdas/) · [Array](/reference/stdlib/array/)
· [Range](/reference/stdlib/range/)

Next: [Choices and errors](/guides/language/choices/).
