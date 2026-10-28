---
title: Operators
description: Every operator, its precedence, and what it does to numbers, strings, collections and shapes.
sidebar:
  order: 3
---

## Precedence

From the tightest binding to the loosest. Operators on one row bind equally and group left to
right, unless the row says otherwise.

| Operators | Kind |
|---|---|
| `.` `&.` `::` `(...)` `[...]` | Method call, safe call, scope, call arguments, index |
| `**` | Power, grouping right to left: `2 ** 3 ** 2` is `512` |
| `!` `not` `-` `+` `~` | Unary |
| `*` `/` `%` | Multiplicative |
| `+` `-` | Additive |
| `..` `...` | Range |
| `<<` `>>` | Shift |
| `&` | Bitwise and, shape intersection |
| `\|` `^` | Bitwise or, exclusive or |
| `<` `<=` `>` `>=` `<=>` | Comparison |
| `==` `!=` | Equality |
| `&&` `and` | Logical and |
| `\|\|` `or` | Logical or |
| `? :` | Conditional, grouping right to left |
| `rescue` | Rescue modifier (see [Errors](/reference/language/errors/#the-rescue-modifier)) |
| `=` `+=` `-=` `*=` `/=` `%=` `**=` `&=` `\|=` `^=` `<<=` `>>=` `\|\|=` `&&=` | Assignment, grouping right to left |

Unlike Ruby, `and`, `or` and `not` are the same operators as `&&`, `||` and `!`, at the same
precedence: `x = true and false` assigns `false`, and `not a == b` is `(not a) == b`.

A minus written against a number is part of the number, so `-2.abs` is `2`; only `**` binds
tighter, so `-2 ** 2` is `-4`. Parentheses group as usual.

```kupcad
puts 1 + 2 * 3     # 7
puts (1 + 2) * 3   # 9
puts 2 ** 3 ** 2   # 512
puts -2 ** 2       # -4
puts -2.abs        # 2
```

## Arithmetic

Every number is a 64-bit float.

| Operator | On Numbers | Also on |
|---|---|---|
| `a + b` | Sum | Strings: joined. Arrays: concatenated. Shapes: union. Paths: joined end to start |
| `a - b` | Difference | Shapes: difference |
| `a * b` | Product | |
| `a / b` | Quotient, never truncated: `10 / 4` is `2.5` | |
| `a % b` | Remainder, floored as in Ruby: `7 % -3` is `-2` | Strings: format (see [String](/reference/stdlib/string/)) |
| `a ** b` | Power | |
| `-a`, `+a` | Negation, the number itself | |

- Dividing by zero is a `ZeroDivisionError`.
- A result beyond ±1.8e308 is a `RangeError` (`2 ** 1024`), and a result that is no number is a
  `MathError` (`(-1) ** 0.5`). Arithmetic never produces infinity or NaN; write
  `Number::INFINITY` or `Number::NAN` to use one.
- Operands of other kinds are a `TypeError`: `"a" + 1`, `"ab" * 3` and `[1] * 2` are all errors.
  Convert first: `"a" + 1.to_s`.

```kupcad
puts 10 / 4        # 2.5
puts 7 % -3        # -2
puts "M" + 3.to_s  # M3
puts [1, 2] + [3]  # [1, 2, 3]
```

## Comparison

`<`, `<=`, `>` and `>=` compare Numbers; any other operand is a `TypeError`, Strings included.
`<=` and `>=` are `false` against `Number::NAN`, as `<` and `>` are.

`a <=> b` is `-1`, `0` or `1` for two Numbers or two Strings, and `nil` for values it can't
order.

```kupcad
puts 1 < 2             # true
puts 1 <=> 2           # -1
puts "a" <=> "b"       # -1
puts (1 <=> "a").inspect # nil
```

## Equality

`==` and `!=` compare Numbers, Strings, Symbols, `true`, `false` and `nil` by value, and
Arrays, Maps and Ranges by content, nested ones included; a Map's order doesn't matter.
Values of different kinds are unequal (`1 == "1"` is `false`). Other objects, shapes and
instances of your classes included, are equal only to themselves.

```kupcad
puts [1, [2]] == [1, [2]]             # true
puts({ a: 1, b: 2 } == { b: 2, a: 1 }) # true
puts (1..3) == (1..3)                 # true
puts 1 == "1"                         # false
```

`.include?`, and `case`/`when` against a value, compare the same way.

## Logical

`a && b` is `a` when `a` is falsy, else `b`; `a || b` is `a` when `a` is truthy, else `b`. The
right operand is evaluated only when needed. `!a` and `not a` are `true` when `a` is `nil` or
`false`. Only `nil` and `false` are falsy.

```kupcad
puts nil || 5  # 5
puts (1 && 2)  # 2
puts !nil      # true
```

## Bitwise

`&`, `|`, `^`, `<<`, `>>` and unary `~` work on whole numbers. A fraction is truncated toward
zero first (`~2.9` is `-3`), and a value outside 64-bit integers is a `RangeError`.

```kupcad
puts 6 & 3   # 2
puts 6 | 3   # 7
puts 6 ^ 3   # 5
puts 1 << 4  # 16
puts ~5      # -6
```

## Operators on shapes

Two Solids, or two Sketches, combine with `+` (union), `-` (difference) and `&`
(intersection), as their `union`, `difference` and `intersection` methods do. Two Paths join
with `+`, the second starting where the first ends. Shapes of different kinds don't combine:
`cube(1) + square(1)` is a `TypeError`. See
[Booleans and hulls](/reference/geometry/booleans/) and [Paths](/reference/geometry/paths/).

```kupcad
box = cube(10)
hole = cylinder(r: 2, h: 20).translate(5, 5, -5)
overlap = cube(10) & cube(10).translate(5, 0, 0)
puts overlap.volume # 500
box - hole
```

## Ranges

`a..b` includes `b`; `a...b` leaves it out. See [Range](/reference/stdlib/range/).

## Conditional

`cond ? a : b` is `a` when `cond` is truthy, else `b`; only the chosen branch is evaluated.

```kupcad
holes = 4
puts holes == 4 ? "square" : "pair" # square
```

## Safe call

`a&.m` calls `m` only when `a` isn't `nil`, and is `nil` otherwise. It skips that one call:
unlike Ruby, the calls chained after it still run, so `a&.m.n` calls `n` on `nil` when `a` is
`nil`.

```kupcad
part_name = nil
puts part_name&.length.inspect # nil
puts "bolt"&.length            # 4
```

## defined?

`defined?(x)` is `true` when `x` names a variable, a constant, a method or a built-in that
exists here, and `nil` otherwise. `defined?(@x)` asks about the current object's field. Unlike
Ruby's, it gives `true` rather than a description.

```kupcad
width = 10
puts defined?(width).inspect  # true
puts defined?(height).inspect # nil
```
