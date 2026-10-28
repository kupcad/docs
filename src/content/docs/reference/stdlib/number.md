---
title: Number
description: KupCAD's one number type, a 64-bit float, with its constants, units, rounding, questions and counted loops.
sidebar:
  order: 3
---

KupCAD has one number type, `Number`: a 64-bit floating-point number. `5`, `5.0`, `1_000`,
`2.5e-3` and `0x1F` are all Numbers, and a whole number is simply one with no fraction
(`5.0.integer?` is `true`). Lengths are millimetres: see [Units](#units). For the operators
(`+`, `%`, `**`, bitwise operators and comparison), see
[Operators](/reference/language/operators/).

Arithmetic on finite numbers never produces infinity or `NaN`: an operation that would raises
instead, a `RangeError` when the result is past the largest Number (`2 ** 1024`), a
`ZeroDivisionError` for a division or modulo by zero (`1 / 0`, `0 / 0`), and a `MathError` for
a result that isn't a number (`(-8) ** 0.5`).

## Printing

A Number prints in plain digits while every digit is exact, and without a decimal point when it
is whole. From 1e16 (past 2^53, where floats skip whole numbers) and below 1e-6 it prints in
scientific notation.

```kupcad
puts 2.5            # 2.5
puts 7.0            # 7
puts 2 ** 53        # 9007199254740992
puts 2 ** 60        # 1.152921504606847e18
puts 0.0000001      # 1e-7
puts 0.1 + 0.2      # 0.30000000000000004
```

A minus written against a number is part of it, as in Ruby: `-2.abs` is `2`, and `-2 ** 2` is
still `-4`.

## Constants

| Constant | Value |
|---|---|
| `Number::INFINITY` | Positive infinity. Arithmetic never produces it, so a script that needs it writes this. |
| `Number::NAN` | Not a number. `<`, `<=`, `>` and `>=` with it are false; `==` finds it equal to itself, unlike Ruby. Test for it with `nan?`. |
| `Number::EPSILON` | The gap between 1 and the next Number, 2.220446049250313e-16: a scale for tolerances. |

## Units

Every length in a model is in millimetres. These methods write a length in another unit and
give it in millimetres.

```kupcad frame="none"
n.mm
n.cm
n.m
n.inch
```

| Method | Gives |
|---|---|
| `mm` | The number itself, for a script that names its units. |
| `cm` | The number times 10. |
| `m` | The number times 1000. |
| `inch` | The number times 25.4. |

**Returns:** `Number`.

**Raises:** `RangeError` when the length in millimetres is past the largest Number.

```kupcad
puts 2.cm          # 20
puts 1.inch        # 25.4
plate = cube(x: 4.inch, y: 6.cm, z: 3.mm)
```

## Rounding and conversion

### round

```kupcad frame="none"
n.round(digits = 0)
```

The number rounded to `digits` decimal places, halves away from zero. A negative `digits`
rounds to tens, hundreds and so on. More digits than a Number holds leave it unchanged.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `digits` | Number | `0` | Decimal places to keep; negative for tens, hundreds, ... |

**Returns:** `Number`.

**Raises:** `ValueError` when `digits` isn't finite.

```kupcad
puts 2.5.round           # 3
puts -2.5.round          # -3
puts 3.14159.round(2)    # 3.14
puts 1234.round(-2)      # 1200
```

### ceil

```kupcad frame="none"
n.ceil
```

The least whole number not below `n`. **Returns:** `Number`.

### floor

```kupcad frame="none"
n.floor
```

The greatest whole number not above `n`. **Returns:** `Number`.

### abs

```kupcad frame="none"
n.abs
```

The number without its sign. **Returns:** `Number`.

### to_i

```kupcad frame="none"
n.to_i
```

The number truncated toward zero: `2.7.to_i` is `2`, `-2.7.to_i` is `-2`. **Returns:**
`Number`.

### to_f

```kupcad frame="none"
n.to_f
```

The number itself (there is only one number type). **Returns:** `Number`.

### to_s

```kupcad frame="none"
n.to_s
```

The number as `puts` prints it. **Returns:** `String`.

```kupcad
puts 2.7.ceil       # 3
puts 2.7.floor      # 2
puts -3.abs         # 3
puts 7.0.to_s.inspect  # "7"
```

## Questions

### odd?

```kupcad frame="none"
n.odd?
n.even?
```

Whether a whole number is odd, or even. **Returns:** `Boolean`.

**Raises:** `ValueError` for a number with a fraction, which has no parity (`2.5.odd?`).

### zero?

```kupcad frame="none"
n.zero?
n.positive?
n.negative?
```

Whether the number is 0, greater than 0, or less than 0. **Returns:** `Boolean`.

### integer?

```kupcad frame="none"
n.integer?
```

Whether the number is whole and finite: `5` and `5.0` are, `5.5` and `Number::INFINITY`
aren't. **Returns:** `Boolean`.

### finite?

```kupcad frame="none"
n.finite?
n.infinite?
n.nan?
```

Whether the number is finite, is positive or negative infinity, or is `Number::NAN`.
**Returns:** `Boolean`.

### between?

```kupcad frame="none"
n.between?(lo, hi)
```

Whether `lo <= n <= hi`. **Returns:** `Boolean`.

**Raises:** `ArgumentError` when `lo` is greater than `hi`.

### clamp

```kupcad frame="none"
n.clamp(lo, hi)
```

The number kept within `lo..hi`: `lo` when it is below, `hi` when it is above.
`Math.clamp(n, lo, hi)` is the same. **Returns:** `Number`.

**Raises:** `ArgumentError` when `lo` is greater than `hi`.

```kupcad
puts 4.even?               # true
puts 5.0.integer?          # true
puts 15.clamp(0, 10)       # 10
puts 5.between?(1, 10)     # true
```

## Counting

These take whole numbers and call their block with each count in turn. A `break value` in the
block ends the count and becomes the method's result; otherwise the result is the receiver.

### times

```kupcad frame="none"
n.times { |i| ... }
```

Calls the block with 0, 1, ... up to `n - 1`. A negative `n` calls it never.

**Returns:** the receiver.

**Raises:** `ValueError` when `n` isn't whole; `ArgumentError` without a block.

### upto

```kupcad frame="none"
n.upto(limit) { |i| ... }
```

Calls the block with `n`, `n + 1`, ... up to `limit` included. **Returns:** the receiver.

**Raises:** `ValueError` when either number isn't whole; `ArgumentError` without a block.

### downto

```kupcad frame="none"
n.downto(limit) { |i| ... }
```

Calls the block with `n`, `n - 1`, ... down to `limit` included. **Returns:** the receiver.

**Raises:** `ValueError` when either number isn't whole; `ArgumentError` without a block.

```kupcad
pegs = []
4.times { |i| pegs.push(cylinder(r: 2, h: 10).translate(x: i * 10)) }
1.upto(3) { |i| puts i }      # 1, 2, 3
3.downto(1) { |i| puts i }    # 3, 2, 1
```

For counts with a step or a fraction, use a [Range](/reference/stdlib/range/):
`(0..1).step(0.25).each { |t| ... }`.
