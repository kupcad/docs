---
title: JsonObject
description: The read-only object a JSON file's objects become, found by a String or a Symbol key, with fetch and dig that name the place in the file.
sidebar:
  order: 13
---

A `JsonObject` is a JSON object read from a file with `import_json` or an `import` of a
`.json` file (see [Data files](/reference/inputs/data-files/)). The file's other values become
ordinary values: arrays Arrays, numbers Numbers, strings Strings, `true` and `false` Booleans,
`null` `nil`. The objects inside it, at any depth, are JsonObjects too.

A JsonObject is read-only, finds each key by its String or by the Symbol of the same name, and
names the place in its file when a key is missing.

```json title="machine.json"
{"name": "braider", "gears": [{"module": 1.5, "teeth": 12}, {"module": 2, "teeth": 20}]}
```

```kupcad
machine = import_json("machine.json")
machine[:name]                     # "braider"
machine["name"]                    # "braider": the same entry
machine.dig(:gears, 0, :teeth)     # 12
machine.fetch(:plate, nil)         # nil: the file has no plate
machine.dig(:gears, 1, :pitch)     # KeyError: machine.json: gears[1] has no key "pitch" (its keys: module, teeth)
```

## Reading

`obj[key]` is the value under `key`, a String or a Symbol, or `nil` when the object has no
such key, as a Map's `[]` is. There is no dot access (`machine.gears` is a `NoMethodError`),
since a key named `size` or `keys` would be hidden by the method.

`obj[key] = value` is a `TypeError`: the object is read-only. [`to_h`](#to_h) gives a Map that
can change.

`==` compares two JsonObjects by content. A JsonObject prints as a Map does, its keys Strings.

### fetch

```kupcad frame="none"
obj.fetch(key)
obj.fetch(key, default)
```

The value under `key`. Without one, `default` when it is given (`nil` too), else a `KeyError`
naming the key, where the object is in its file, and the keys it has.

**Returns:** the value.

**Raises:** `KeyError` for a missing key without a default.

### dig

```kupcad frame="none"
obj.dig(key, *more)
```

What the keys lead to: each step a String or a Symbol into a JsonObject, or a whole number
into an Array (negative from the end). Where a step finds nothing it raises, naming the place
in the file, where a Map's `dig` gives `nil`: a `nil` from a data file would only surface later,
as an error far from the file.

**Returns:** the value.

**Raises:** `KeyError` for a missing key, `IndexError` past an Array's end, `TypeError` for a
step into a Number, a String or another value without entries.

### key?

```kupcad frame="none"
obj.key?(key)
```

Whether the object has `key`, by String or Symbol. **Returns:** `Boolean`.

## Contents

### keys

```kupcad frame="none"
obj.keys
obj.values
```

The keys, Strings in the file's order, or the values in the same order. **Returns:** `Array`.

### size

```kupcad frame="none"
obj.size
obj.length
```

How many keys the object has. **Returns:** `Number`. `obj.empty?` tells whether it has none.

### each

```kupcad frame="none"
obj.each { |key, value| ... }
```

Calls the block with each key (a String) and its value, in the file's order. A `for` loop
does the same: `for key, value in obj`. A `break value` ends it with that value.

**Returns:** the object.

### to_h

```kupcad frame="none"
obj.to_h
```

A Map of the object that a script can change: its objects Maps and its Arrays copies, all the
way down, keyed by the file's Strings. Changing it changes nothing the file gave.
`.symbolize_keys` turns its own keys into Symbols.

**Returns:** `Map`.

```kupcad
machine = import_json("machine.json")
machine.keys                       # ["name", "gears"]
machine.each { |key, value| puts key }
gears = machine.to_h["gears"]      # an Array of Maps, free to change
gears.push({ "module" => 1, "teeth" => 30 })
```
