---
title: Map
description: Key-value tables in insertion order, keyed by Symbols, Strings or any value, with lookup, iteration and transformation methods.
sidebar:
  order: 7
---

A `Map` holds values under keys, in the order the keys were first put in. It is KupCAD's name
for Ruby's Hash.

```kupcad
bolts = { m3: 3.4, m4: 4.5 }     # keyed by the Symbols :m3 and :m4
names = { "lid" => 1, "base" => 2 }
width = 40
size = { width: }                # { width: width }
```

## Keys

`{ width: 10 }` keys by the Symbol `:width`. `{ "w" => 10 }`, `{ k => 10 }` and
`{ part.name => 10 }` key by the value before `=>`, whatever it is. A Symbol key and a String
key are different keys: `m[:a]` and `m["a"]` are two entries. (A JSON file's objects are
[JsonObjects](/reference/stdlib/json-object/), which find a key by either.)

A key is found as `==` compares it: an Array, a Map or a Range by what it holds, so
`{ [1, 2] => :a }[[1, 2]]` is `:a`. An Array changed after it keys an entry no longer finds
it. Numbers are one type, so `1` and `1.0` are the same key.

## Reading and writing

`m[key]` is the value under `key`, or `nil` when there is none. `m[key] = value` puts a value
in, at the end for a new key and in its place for one already there. `==` compares two Maps by
their entries, in any order.

```kupcad
m = { m3: 3, m4: 4 }
puts m[:m3]               # 3
puts m[:m5].inspect       # nil
m[:m5] = 5
puts m.inspect            # {m3: 3, m4: 4, m5: 5}
puts({ a: 1, b: 2 } == { b: 2, a: 1 })   # true
```

## Map.new

```kupcad frame="none"
Map.new
```

An empty Map, the same as `{}`. **Returns:** `Map`.

## Lookup

### fetch

```kupcad frame="none"
m.fetch(key)
m.fetch(key, default)
```

The value under `key`. Without one, `default` when it is given (`nil` too), else a `KeyError`
naming the key and the keys the Map has.

**Returns:** the value.

**Raises:** `KeyError` for a missing key without a default.

### get

```kupcad frame="none"
m.get(key, default)
```

The value under `key`, or `default` when there is none. Both arguments are required.
**Returns:** the value.

### dig

```kupcad frame="none"
m.dig(key, *more)
```

What the keys lead to, through nested Maps and Arrays: each step is a key into a Map (a String
or a Symbol into a JsonObject) or a whole number into an Array (negative from the end). Where a
step finds nothing the result is `nil`, as in Ruby. (A JsonObject's `dig` raises there
instead.)

**Returns:** the value, or `nil`.

**Raises:** `TypeError` for a step into a value that has no entries (a Number, a String).

### key?

```kupcad frame="none"
m.key?(key)
```

Whether the Map has an entry under `key`. **Returns:** `Boolean`.

```kupcad
holes = { m3: 3.4, m4: 4.5 }
puts holes.fetch(:m3)           # 3.4
puts holes.fetch(:m5, 5.5)      # 5.5
puts holes.get(:m6, 0)          # 0
puts holes.key?(:m4)            # true
spec = { bolts: [{ d: 3, len: 10 }] }
puts spec.dig(:bolts, 0, :len)  # 10
puts spec.dig(:nuts, 0).inspect # nil
```

## Size and contents

### size

```kupcad frame="none"
m.size
m.length
```

How many entries the Map holds. **Returns:** `Number`.

### empty?

```kupcad frame="none"
m.empty?
```

Whether it holds no entries. **Returns:** `Boolean`.

### keys

```kupcad frame="none"
m.keys
m.values
```

The keys, or the values, in insertion order. **Returns:** `Array`.

### to_a

```kupcad frame="none"
m.to_a
```

The entries as `[key, value]` pairs, in order. **Returns:** `Array`.

## Changing

### delete

```kupcad frame="none"
m.delete(key)
```

Removes the entry under `key`. The other entries keep their order, and a key put in again
afterwards goes last. It takes the same time however big the Map is.

**Returns:** the removed value, or `nil` when there was none.

### merge

```kupcad frame="none"
m.merge(other)
```

A new Map of `m`'s entries and then `other`'s, a value of `other` replacing `m`'s under the
same key (in `m`'s place). `m` is left as it was. **Returns:** `Map`.

### symbolize_keys

```kupcad frame="none"
m.symbolize_keys
m.stringify_keys
```

A new Map whose String keys are Symbols, or whose Symbol keys are Strings. Only the Map's own
keys change, not those of the Maps in it. **Returns:** `Map`.

```kupcad
defaults = { width: 20, depth: 10 }
spec = defaults.merge({ width: 40 })
puts spec.inspect                   # {width: 40, depth: 10}
spec.delete(:depth)
puts spec.keys.inspect              # [:width]
puts({ "w" => 1 }.symbolize_keys.inspect)   # {w: 1}
```

## Iteration

A block given the entries gets the key and the value as two parameters, `|key, value|`. It is
given the entries there when it began, each with its value when its turn comes: one the block
deletes before its turn isn't given, and one it adds isn't either. A `for` loop over a Map does
the same: `for key, value in m`. A `break value` in the block ends the iteration with that
value.

### each

```kupcad frame="none"
m.each { |key, value| ... }
```

Calls the block with each entry. **Returns:** the Map.

### map

```kupcad frame="none"
m.map { |key, value| ... }
m.map
```

The block's result for each entry, or the `[key, value]` pairs without a block.
**Returns:** `Array`.

### filter

```kupcad frame="none"
m.filter { |key, value| ... }
m.reject { |key, value| ... }
```

A new Map of the entries the block is truthy for, or (`reject`) false or `nil` for.
**Returns:** `Map`.

### transform_values

```kupcad frame="none"
m.transform_values { |value| ... }
```

A new Map of the same keys, each with the block's result for its value. **Returns:** `Map`.

```kupcad
clearance = { m3: 3.4, m4: 4.5, m5: 5.5 }
clearance.each { |size, d| puts "#{size}: #{d} mm" }
puts clearance.filter { |size, d| d < 5 }.keys.inspect       # [:m3, :m4]
puts clearance.transform_values { |d| d + 0.2 }.inspect      # {m3: 3.6, m4: 4.7, m5: 5.7}
labels = clearance.map { |size, d| "#{size}=#{d}" }
puts labels.inspect                                          # ["m3=3.4", "m4=4.5", "m5=5.5"]
```
