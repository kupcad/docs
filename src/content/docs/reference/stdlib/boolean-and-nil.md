---
title: Boolean and nil
description: true, false and nil, which values count as false, and the methods each answers.
sidebar:
  order: 9
---

`true` and `false` are the two values of the class `Boolean`, and `nil`, the absence of a
value, is the one value of `NilClass`.

## Truthiness

Only `false` and `nil` count as false in a condition. Everything else is true, `0`, `""` and
`[]` included.

```kupcad
puts(0 ? "true" : "false")      # true
puts("" ? "true" : "false")     # true
puts(nil ? "true" : "false")    # false
puts(nil || 5)                  # 5
```

`!`, `&&` and `||` work on any values, `&&` and `||` giving one of their operands; see
[Operators](/reference/language/operators/). `&`, `|` and `^` aren't defined for Booleans.

## Boolean

### to_s

```kupcad frame="none"
b.to_s
b.inspect
```

`"true"` or `"false"`. **Returns:** `String`.

### to_i

```kupcad frame="none"
b.to_i
b.to_f
```

`1` for `true`, `0` for `false`: for counting what holds. **Returns:** `Number`.

### invert

```kupcad frame="none"
b.invert
```

The other Boolean, as `!b`. **Returns:** `Boolean`.

```kupcad
holes = [true, false, true]
puts holes.map { |h| h.to_i }.sum   # 2
puts true.invert                    # false
```

## nil

`nil` answers only the methods every value has ([Object](/reference/stdlib/object/)):
`nil.nil?` and `nil.empty?` are `true`, `nil.inspect` is `"nil"` and `nil.class` is
`NilClass`. It has no `to_s`, `to_a` or `to_i`.

`puts nil` prints `nil`, and so does `"#{nil}"`, where Ruby gives an empty string. Test for it
first, or give a default with `||`: `"#{label || ""}"`.

Passing `nil` for an optional parameter of a built-in leaves the parameter unset, as if it
weren't given: `slice(nil)` and `segments: nil` take their defaults. A method of your own does
the same for a parameter with a default (see [Methods](/reference/language/methods/)), so a
value passed on may be absent.

```kupcad
label = nil
puts label.nil?                     # true
puts "[#{label || "unnamed"}]"      # [unnamed]
```
