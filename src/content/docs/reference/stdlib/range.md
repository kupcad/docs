---
title: Range
description: Spans of numbers, inclusive or exclusive, with an optional step, to iterate, test and turn into Arrays.
sidebar:
  order: 8
---

A `Range` is a span of numbers: `a..b` includes `b`, `a...b` leaves it out. It counts by 1
unless given a step with [`step`](#step), which may be negative or a fraction. Ranges are
values that never change.

```kupcad
puts (1..4).to_a.inspect               # [1, 2, 3, 4]
puts (1...4).to_a.inspect              # [1, 2, 3]
puts (0..1).step(0.25).to_a.inspect    # [0, 0.25, 0.5, 0.75, 1]
puts (10..0).step(-5).to_a.inspect     # [10, 5, 0]
```

A Range's ends are Numbers. Between two one-character Strings, `..` and `...` make an Array of
the characters instead: `"a".."c"` is `["a", "b", "c"]`.

Iterating with a block (`each`, a `for` loop) has no length limit, as a `while` loop has none.
Building an Array (`to_a`, the Array `map` returns) is capped at 10,000,000 values.

`==` compares two Ranges by their ends, step and exclusivity. A Range indexes an Array or a
String: `a[1..2]`.

## Iteration

### each

```kupcad frame="none"
r.each { |n| ... }
```

Calls the block with each number of the Range in turn. A `break value` ends it with that value.

**Returns:** the Range.

**Raises:** `ArgumentError` without a block.

### map

```kupcad frame="none"
r.map { |n| ... }
```

The block's result for each number. **Returns:** `Array`.

**Raises:** `ArgumentError` without a block; `ValueError` for more than 10,000,000 numbers.

### step

```kupcad frame="none"
r.step(n)
```

A Range with the same ends that counts by `n`. A negative step counts down, from the first end
to the second.

**Returns:** `Range`.

**Raises:** `ValueError` for a step of 0 or one that isn't finite.

### to_a

```kupcad frame="none"
r.to_a
```

The numbers of the Range. **Returns:** `Array`.

**Raises:** `ValueError` for more than 10,000,000 numbers; iterate with `each` instead.

```kupcad
holes = (0...6).map { |i| cylinder(r: 1.5, h: 5).translate(x: i * 10) }
for t in (0..1).step(0.5)
  puts t                     # 0, 0.5, 1
end
squares = (1..3).map { |i| i * i }
puts squares.inspect         # [1, 4, 9]
```

## Inspection

### size

```kupcad frame="none"
r.size
r.length
r.count
```

How many numbers the Range yields, worked out without iterating it. **Returns:** `Number`.

### include?

```kupcad frame="none"
r.include?(x)
r.cover?(x)
```

Whether the Number `x` lies between the ends (the second end too for `..`). `x` need not fall
on a step: `(1..4).include?(2.5)` is `true`. Anything that isn't a Number is `false`. A Range
in a `case`/`when` matches the same way.

**Returns:** `Boolean`.

### first

```kupcad frame="none"
r.first
r.last
```

The first end, or the second end as written, even for an exclusive Range (`(1...4).last` is
`4`). They take no count. **Returns:** `Number`.

### exclusive?

```kupcad frame="none"
r.exclusive?
```

Whether the Range leaves its second end out (`...`). **Returns:** `Boolean`.

### to_s

```kupcad frame="none"
r.to_s
```

The Range as `puts` prints it: `1..4`. **Returns:** `String`.

```kupcad
r = 1...4
puts r.size              # 3
puts r.include?(4)       # false
puts r.last              # 4
puts r.exclusive?        # true
puts (1..10).step(3).size   # 4
```
