---
title: Math
description: Constants, trigonometry in radians and degrees, roots and logarithms, rounding, and modelling helpers such as polar, snap, remap and close?.
sidebar:
  order: 11
---

`Math` holds the mathematical functions, called as `Math.name(...)`, and three constants, read
with `::`. Every function takes Numbers and returns a Number unless its entry says otherwise.

A function given finite numbers never returns `NaN` or infinity: it raises a `MathError` when
the result has no real value (`Math.sqrt(-1)`, `Math.acos(2)`, `Math.tand(90)`) and a
`RangeError` when it is infinite (`Math.log(0)`, `Math.exp(1000)`). An argument that isn't a
Number is a `TypeError`.

```kupcad
r = 25
puts Math::PI * r ** 2            # 1963.4954084936207
puts Math.cosd(90)                # 0
puts Math.hypot(3, 4)             # 5
centres = (0...4).map { |i| Math.polar(30, i * 90) }
puts centres.inspect              # [[30, 0], [0, 30], [-30, 0], [0, -30]]
```

## Constants

| Constant | Value |
|---|---|
| `Math::PI` | π, 3.141592653589793 |
| `Math::TAU` | 2π, 6.283185307179586: a full turn in radians |
| `Math::E` | e, 2.718281828459045 |

## Trigonometry in degrees

CAD angles are degrees, so each trigonometric function has a degree version. These are exact at
the angles where the result is 0, ±½ or ±1: `Math.cosd(90)` is `0`, where
`Math.cos(Math::PI / 2)` is `6.123233995736766e-17`.

```kupcad frame="none"
Math.sind(deg)
Math.cosd(deg)
Math.tand(deg)
Math.asind(x)
Math.acosd(x)
Math.atand(x)
Math.atan2d(y, x)
```

| Function | Gives |
|---|---|
| `sind`, `cosd`, `tand` | The sine, cosine and tangent of an angle in degrees. `tand` at ±90° (and the like) has no value: a `MathError`. |
| `asind`, `acosd`, `atand` | The angle in degrees whose sine, cosine or tangent is `x`. |
| `atan2d(y, x)` | The direction of the point `(x, y)` from the origin, in degrees from +x, in (-180, 180]; exact along the axes and diagonals. |

```kupcad
puts Math.sind(30)        # 0.5
puts Math.tand(45)        # 1
puts Math.acosd(0.5)      # 60
puts Math.atan2d(1, -1)   # 135
```

## Trigonometry in radians

```kupcad frame="none"
Math.sin(rad)
Math.cos(rad)
Math.tan(rad)
Math.asin(x)
Math.acos(x)
Math.atan(x)
Math.atan2(y, x)
```

The same functions with angles in radians. `atan2(y, x)` is the direction of `(x, y)` in
(-π, π].

### deg2rad

```kupcad frame="none"
Math.deg2rad(deg)
Math.rad2deg(rad)
```

An angle converted from degrees to radians, or back.

## Roots, powers and logarithms

```kupcad frame="none"
Math.sqrt(x)
Math.cbrt(x)
Math.exp(x)
Math.log(x)
Math.log(x, base)
Math.log2(x)
Math.log10(x)
```

| Function | Gives |
|---|---|
| `sqrt` | The square root. A negative `x` is a `MathError`. |
| `cbrt` | The cube root, of a negative number too. |
| `exp` | e to the power `x`. |
| `log` | The natural logarithm, or with `base` the logarithm in that base. |
| `log2`, `log10` | The logarithm in base 2, or base 10. |

For other powers, use the `**` operator: `2 ** 0.5`.

```kupcad
puts Math.sqrt(16)        # 4
puts Math.cbrt(-27)       # -3
puts Math.log(8, 2)       # 3
puts Math.log10(1000)     # 3
```

## Rounding

```kupcad frame="none"
Math.round(x)
Math.ceil(x)
Math.floor(x)
Math.abs(x)
Math.sign(x)
```

`round` rounds to the nearest whole number, halves away from zero; it takes no number of
digits (use `x.round(2)`, see [Number](/reference/stdlib/number/#round)). `ceil` and `floor`
round up and down, `abs` drops the sign, and `sign` is `-1`, `0` or `1`.

## Comparing

### min

```kupcad frame="none"
Math.min(*xs)
Math.max(*xs)
```

The least, or the greatest, of any number of Numbers; `nil` for none. For an Array, use its own
[`min`](/reference/stdlib/array/#max) and `max`, or spread it: `Math.max(*sizes)`.

**Returns:** `Number` or `nil`.

### clamp

```kupcad frame="none"
Math.clamp(v, lo, hi)
```

`v` kept within `lo..hi`. **Raises:** `ArgumentError` when `lo` is greater than `hi`.

### close?

```kupcad frame="none"
Math.close?(a, b, tolerance = 1e-9)
```

Whether `a` and `b` differ by at most `tolerance`: for comparing measurements, which floating
point rarely makes exactly equal.

**Returns:** `Boolean`.

**Raises:** `ValueError` for a negative tolerance.

```kupcad
puts Math.max(3, 8, 5)                     # 8
puts Math.clamp(15, 0, 10)                 # 10
puts 0.1 + 0.2 == 0.3                      # false
puts Math.close?(0.1 + 0.2, 0.3)           # true
puts Math.close?(cube(10).volume, 1000, 0.001)   # true
```

## Modelling helpers

### hypot

```kupcad frame="none"
Math.hypot(*components)
```

The length of a vector of any number of components: `Math.hypot(dx, dy)` is a 2D distance and
`Math.hypot(dx, dy, dz)` a 3D one (Ruby's takes exactly two). `0` for none.

### polar

```kupcad frame="none"
Math.polar(r, deg)
```

The point `[x, y]` at distance `r` from the origin, `deg` degrees counter-clockwise from +x;
exact where `cosd` and `sind` are. A bolt circle's centres are
`(0...n).map { |i| Math.polar(r, i * 360 / n) }`.

**Returns:** `Array` of two Numbers.

### lerp

```kupcad frame="none"
Math.lerp(a, b, t)
```

The value a fraction `t` of the way from `a` to `b`: `a + (b - a) * t`. `t` outside 0..1
extrapolates.

### remap

```kupcad frame="none"
Math.remap(x, from_lo, from_hi, to_lo, to_hi)
```

`x`'s place in the range `from_lo..from_hi`, carried to the same place in `to_lo..to_hi`. Not
clamped: a value outside the first range lands outside the second.

**Raises:** `ValueError` when `from_lo` equals `from_hi`.

### smoothstep

```kupcad frame="none"
Math.smoothstep(edge0, edge1, x)
```

0 at or before `edge0`, 1 at or past `edge1`, and an S-curve between them (3t² − 2t³), for
blending profiles and fillets.

**Raises:** `ValueError` when the edges are equal.

### snap

```kupcad frame="none"
Math.snap(x, step)
```

`x` rounded to the nearest multiple of `step`: a grid, a hole pitch.

**Raises:** `ValueError` unless `step` is a finite number greater than 0.

### gcd

```kupcad frame="none"
Math.gcd(a, b)
Math.lcm(a, b)
```

The greatest common divisor, or the least common multiple, of two whole numbers: gear tooth
counts, pitches.

**Raises:** `ValueError` for a number that isn't whole.

```kupcad
puts Math.hypot(1, 2, 2)                  # 3
puts Math.polar(10, 90).inspect           # [0, 10]
puts Math.lerp(0, 10, 0.25)               # 2.5
puts Math.remap(5, 0, 10, 100, 200)       # 150
puts Math.smoothstep(0, 10, 5)            # 0.5
puts Math.snap(7.3, 2.5)                  # 7.5
puts Math.gcd(12, 18)                     # 6
puts Math.lcm(12, 18)                     # 36
```
