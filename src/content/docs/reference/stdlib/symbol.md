---
title: Symbol
description: Interned names such as :width, used for parameter names, map keys and options.
sidebar:
  order: 5
---

A `Symbol` is a name: `:width`, `:m3`, `:round`. Two Symbols of the same name are the same
value, so they compare quickly and make good keys. Symbols name parameters
(`param(:width, ...)`), key Maps (`{ width: 10 }` is keyed by `:width`) and choose options
(`stroke(1, cap: :round)`).

A Symbol is written `:name`, or quoted for a name that isn't an identifier: `:"a b"`. A
double-quoted Symbol decodes its escapes and interpolates (`:"part_#{i}"`), a single-quoted one
doesn't. `%i[m3 m4]` is the Array `[:m3, :m4]`. See [Syntax](/reference/language/syntax/).

As in Ruby, a Symbol reads as its name (`puts`, interpolation and `join` give `m3`) and
inspects with its colon (`:m3`). One that `:name` couldn't read back inspects quoted. A Symbol
is never equal to a String: `:m3 == "m3"` is `false`.

```kupcad
size = :m3
puts size                  # m3
puts "thread #{size}"      # thread m3
puts size.inspect          # :m3
puts :"a b".inspect        # :"a b"
i = 2
puts :"part_#{i}".inspect  # :part_2
puts size == :m3           # true
```

## to_s

```kupcad frame="none"
sym.to_s
```

The Symbol's name. **Returns:** `String`.

## to_sym

```kupcad frame="none"
sym.to_sym
```

The Symbol itself (a String's `to_sym` makes one). **Returns:** `Symbol`.

```kupcad
puts :m3.to_s.inspect      # "m3"
puts "m4".to_sym.inspect   # :m4
```
