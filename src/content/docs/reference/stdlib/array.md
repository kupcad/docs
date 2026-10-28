---
title: Array
description: Ordered lists, with indexing, adding and removing, iteration, search, sorting and reduction.
sidebar:
  order: 6
---

An `Array` is an ordered list of values of any kind: `[1, 2, 3]`, `[cube(1), sphere(2)]`,
`[[0, 0], [10, 5]]`. `%w[a b]` is `["a", "b"]` and `%i[a b]` is `[:a, :b]`. Unlike Strings
and shapes, an Array can change: `push`, `pop`, `shift`, `unshift` and index assignment change
it in place, and every variable holding it sees the change. Every other method returns a new
value and leaves the Array as it was.

A list of shapes can be given to the booleans whole: `base.union([boss, rib].compact)`, see
[Booleans and hulls](/reference/geometry/booleans/).

## Indexing and operators

`a[i]` is the item at `i`, counting from 0; a negative index counts from the end (`a[-1]` is
the last). An index past either end is an `IndexError`, where Ruby gives `nil`. A Range gives
the items it covers, as [`slice`](#slice) does: `a[1..2]`, `a[1...3]`, `a[1..-1]`.

`a[i] = value` replaces an item. The index must already exist: assigning past the end is an
`IndexError` (Ruby pads with `nil`); use [`push`](#push) to add.

`+` joins two Arrays into a new one. `==` and `!=` compare by content, nested Arrays and Maps
included, and so do `include?`, `count(x)`, `uniq` and `case`/`when`. There is no `-`, `*`,
`&`, `|` or `<<`.

```kupcad
a = [10, 20, 30, 40]
puts a[0]                 # 10
puts a[-1]                # 40
puts a[1..2].inspect      # [20, 30]
a[0] = 5
puts (a + [50]).inspect   # [5, 20, 30, 40, 50]
puts [1, [2, 3]] == [1, [2, 3]]   # true
```

## Array.new

```kupcad frame="none"
Array.new(size = 0, fill = nil)
```

An Array of `size` items, each `fill`. Every item is the same `fill` value, so with
`Array.new(3, [])` a push to one inner Array shows in all three; build distinct ones with
`(0...3).map { [] }`.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `size` | Number | `0` | A whole number from 0 to 10,000,000. |
| `fill` | any | `nil` | The value of every item. |

**Returns:** `Array`.

**Raises:** `ValueError` for a size that isn't a whole number in that range.

```kupcad
puts Array.new(3, 0).inspect   # [0, 0, 0]
```

## Access

### first

```kupcad frame="none"
a.first
a.last
```

The first item, or the last; `nil` for an empty Array. They take no count: `a.take(2)` is the
first two. **Returns:** the item.

### length

```kupcad frame="none"
a.length
a.size
```

How many items the Array has. **Returns:** `Number`.

### slice

```kupcad frame="none"
a.slice(start, length)
```

The `length` items from `start`, as Ruby's `a[start, length]`: a negative `start` counts from
the end, and the length is cut to the items there are. A `start` past the end, or a negative
length, gives `nil`; a `start` just at the end gives `[]`. Fractions are dropped.

**Returns:** `Array` or `nil`.

### take

```kupcad frame="none"
a.take(n)
a.drop(n)
```

The first `n` items, or the items after the first `n`. An `n` past the length takes all of
them, or drops all of them.

**Returns:** `Array`.

**Raises:** `ArgumentError` when `n` isn't a whole number of 0 or more.

```kupcad
a = [10, 20, 30, 40]
puts a.last                    # 40
puts a.slice(1, 2).inspect     # [20, 30]
puts a.slice(-2, 9).inspect    # [30, 40]
puts a.take(2).inspect         # [10, 20]
puts a.drop(3).inspect         # [40]
```

## Adding and removing

These change the Array in place.

### push

```kupcad frame="none"
a.push(*values)
```

Appends each value at the end. `a.push(*more)` appends the items of `more`.
**Returns:** the Array.

### pop

```kupcad frame="none"
a.pop
```

Removes the last item. **Returns:** the item, or `nil` for an empty Array.

### shift

```kupcad frame="none"
a.shift
```

Removes the first item. **Returns:** the item, or `nil` for an empty Array.

### unshift

```kupcad frame="none"
a.unshift(value)
```

Puts one value before the first item. **Returns:** the Array.

```kupcad
holes = [1, 2]
holes.push(3, 4)
puts holes.pop             # 4
puts holes.shift           # 1
holes.unshift(0)
puts holes.inspect         # [0, 2, 3]
```

## Iteration

Each of these calls its block with the items in order, reading the Array afresh at each step,
so items the block pushes are visited too. A `break value` in the block ends the iteration and
becomes the method's result. Block parameters don't take an item apart on their own: write
`|(x, y)|` to destructure a pair (see
[Blocks and lambdas](/reference/language/blocks-and-lambdas/)).

### each

```kupcad frame="none"
a.each { |item| ... }
```

Calls the block with each item. **Returns:** the Array.

### each_with_index

```kupcad frame="none"
a.each_with_index { |item, index| ... }
a.each_with_index
```

Calls the block with each item and its index. Without a block it gives the pairs
`[item, index]` as an Array, which `map` and the rest take from there (there is no
Enumerator).

**Returns:** the Array, or the pairs without a block.

### each_cons

```kupcad frame="none"
a.each_cons(n) { |window| ... }
a.each_cons(n)
```

Every run of `n` consecutive items, each an Array: the segments of a polyline are
`points.each_cons(2)`. Without a block it gives them as an Array.

**Returns:** the Array, or the windows without a block.

**Raises:** `ArgumentError` when `n` isn't a whole number of 1 or more.

### each_slice

```kupcad frame="none"
a.each_slice(n) { |slice| ... }
a.each_slice(n)
```

The items `n` at a time, the last slice holding the rest. Without a block it gives them as an
Array.

**Returns:** the Array, or the slices without a block.

**Raises:** `ArgumentError` when `n` isn't a whole number of 1 or more.

### map

```kupcad frame="none"
a.map { |item| ... }
```

The block's result for each item. **Returns:** `Array`.

### flat_map

```kupcad frame="none"
a.flat_map { |item| ... }
```

The block's results in one Array, an Array result's items in its place (one level).
**Returns:** `Array`.

```kupcad
pts = [[0, 0], [30, 0], [30, 40]]
lengths = pts.each_cons(2).map { |(a, b)| Math.hypot(b[0] - a[0], b[1] - a[1]) }
puts lengths.inspect          # [30, 40]
[:a, :b].each_with_index { |name, i| puts "#{i}: #{name}" }
puts [1, 2, 3, 4, 5].each_slice(2).inspect   # [[1, 2], [3, 4], [5]]
puts [1, 2].flat_map { |x| [x, x * 10] }.inspect   # [1, 10, 2, 20]
pegs = (0...4).map { |i| cylinder(r: 2, h: 10).translate(x: i * 8) }
```

## Searching

### include?

```kupcad frame="none"
a.include?(value)
a.contains?(value)
```

Whether an item is equal (`==`) to `value`. **Returns:** `Boolean`.

### find

```kupcad frame="none"
a.find { |item| ... }
```

The first item the block is truthy for. **Returns:** the item, or `nil`.

### any?

```kupcad frame="none"
a.any?
a.any? { |item| ... }
a.all?
a.all? { |item| ... }
a.none?
a.none? { |item| ... }
```

Whether any item, every item, or no item is truthy, or makes the block truthy. Each stops at
the first item that settles the answer. `all?` of an empty Array is `true`.

**Returns:** `Boolean`.

### count

```kupcad frame="none"
a.count
a.count(value)
a.count { |item| ... }
```

How many items there are, how many equal `value`, or how many make the block truthy.
**Returns:** `Number`.

```kupcad
sizes = [3, 4, 5, 4]
puts sizes.include?(5)               # true
puts sizes.find { |s| s > 3 }        # 4
puts sizes.all? { |s| s >= 3 }       # true
puts sizes.count(4)                  # 2
puts sizes.count { |s| s.odd? }      # 2
```

## Transforming

### filter

```kupcad frame="none"
a.filter { |item| ... }
a.reject { |item| ... }
```

The items the block is truthy for, or (`reject`) the items it is `false` or `nil` for. Ruby's
`select` is `filter` here. **Returns:** `Array`.

### compact

```kupcad frame="none"
a.compact
```

The items without the `nil`s (`false` stays): for a list of optional parts,
`base.union([boss, rib].compact)`. **Returns:** `Array`.

### flatten

```kupcad frame="none"
a.flatten(depth = nil)
```

Every nested Array replaced by its items, as deep as they go, or `depth` levels deep.
**Returns:** `Array`.

**Raises:** `ArgumentError` for a negative depth, or an Array that holds itself.

### reverse

```kupcad frame="none"
a.reverse
```

The items, last first. **Returns:** `Array`.

### uniq

```kupcad frame="none"
a.uniq
a.uniq { |item| ... }
```

The items without those equal (`==`) to an earlier one, or whose block result equals an
earlier one's, in their order. **Returns:** `Array`.

### zip

```kupcad frame="none"
a.zip(*others)
```

An Array as long as `a`, each element `[item, other1_item, ...]`: the items at the same index
of each Array, `nil` past one's end. **Returns:** `Array`.

**Raises:** `TypeError` for an argument that isn't an Array.

### group_by

```kupcad frame="none"
a.group_by { |item| ... }
```

A Map from each key the block gives to the items that gave it, in their order. Keys compare as
a Map's do, so equal pairs `[x, y]` group together. **Returns:** `Map`.

### to_h

```kupcad frame="none"
a.to_h
a.to_h { |item| [key, value] }
```

A Map of `[key, value]` pairs: the items, or what the block gives for each
(`names.to_h { |n| [n, n.length] }`). **Returns:** `Map`.

**Raises:** `ArgumentError` when an item, or the block's result, isn't an Array of two.

```kupcad
parts = [1, nil, 2, nil]
puts parts.compact.inspect                         # [1, 2]
puts [1, [2, [3, [4]]]].flatten.inspect            # [1, 2, 3, 4]
puts [1, [2, [3, [4]]]].flatten(1).inspect         # [1, 2, [3, [4]]]
puts [1, 2, 3, 4].filter { |x| x.even? }.inspect   # [2, 4]
puts [1, 2].zip([3, 4], [5]).inspect               # [[1, 3, 5], [2, 4, nil]]
puts [1, 2, 3, 4].group_by { |x| x.odd? }.inspect  # {true => [1, 3], false => [2, 4]}
puts [[:m3, 3], [:m4, 4]].to_h.inspect             # {m3: 3, m4: 4}
```

## Sorting

### sort

```kupcad frame="none"
a.sort
a.sort { |x, y| ... }
```

A sorted copy. Without a block the items must be all Numbers or all Strings (Strings in byte
order). With a block, any items, ordered by the block's result: a negative Number when `x`
goes first, a positive one when `y` does, 0 when they tie (`x <=> y`).

**Returns:** `Array`.

**Raises:** `TypeError` for items of mixed or other kinds without a block, or a block result
that isn't a Number; `MathError` for a `NaN`.

### sort_by

```kupcad frame="none"
a.sort_by { |item| ... }
```

A copy ordered by each item's key, the block's result (Numbers or Strings). The block is
called once per item, and items with equal keys keep their order. **Returns:** `Array`.

### min_by

```kupcad frame="none"
a.min_by { |item| ... }
a.max_by { |item| ... }
```

The item with the least, or the greatest, key; the first of equal ones. **Returns:** the item,
or `nil` for an empty Array.

```kupcad
puts [3, 1, 2].sort.inspect                          # [1, 2, 3]
puts [3, 1, 2].sort { |x, y| y <=> x }.inspect       # [3, 2, 1]
names = ["bb", "a", "ccc"]
puts names.sort_by { |s| s.length }.inspect          # ["a", "bb", "ccc"]
puts names.max_by { |s| s.length }                   # ccc
```

## Reducing

### sum

```kupcad frame="none"
a.sum
a.sum { |item| ... }
```

The items added up, or what the block gives for each; `0` for an empty Array.

**Returns:** `Number`.

**Raises:** `TypeError` for an item, or a block result, that isn't a Number (it isn't skipped);
`RangeError` when the total is past the largest Number.

### max

```kupcad frame="none"
a.max
a.min
```

The greatest item, or the least: all Numbers or all Strings. **Returns:** the item, or `nil`
for an empty Array.

**Raises:** `TypeError` for items of mixed or other kinds; `MathError` for a `NaN`;
`ArgumentError` for a block, which Ruby takes as a comparator: use [`max_by`](#min_by) or
[`sort`](#sort) with a block instead.

### reduce

```kupcad frame="none"
a.reduce(initial) { |acc, item| ... }
a.reduce { |acc, item| ... }
```

Folds the items into one value: the block gets the value so far and the next item, and
returns the next value. Without `initial`, the first item starts and the block gets the rest.
Ruby's `inject` is `reduce` here, and it takes no Symbol (`reduce(:+)`).

**Returns:** the last value, or `nil` for an empty Array without `initial`.

**Raises:** `ArgumentError` without a block.

```kupcad
puts [3, 1, 2].sum                              # 6
puts [cube(2), cube(3)].sum { |c| c.volume }    # 35
puts [3, 1, 2].max                              # 3
puts [].max.inspect                             # nil
puts [1, 2, 3].reduce(10) { |acc, x| acc + x }  # 16
volume = [cube(2), cube(3)].reduce(0) { |acc, c| acc + c.volume }   # 35
```

## Conversion

### join

```kupcad frame="none"
a.join(separator = "")
```

The items as `puts` shows them, with `separator` between them; without one, run together.
**Returns:** `String`.

```kupcad
puts [1, 2, 3].join(", ")   # 1, 2, 3
puts [:m, 3].join           # m3
```

An Array has no `to_s`; `puts`, interpolation and `inspect` show it as `[1, 2, 3]`.
