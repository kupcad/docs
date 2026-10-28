---
title: GC
description: The garbage collector of a script's memory, to run a collection or read how much it holds.
sidebar:
  order: 15
---

`GC` is the garbage collector of the script's memory: the strings, arrays, maps and instances
it makes. It collects on its own, and before memory would cross the project's
`vm_memory_limit` (see [Configuration](/reference/tooling/configuration/)), so a script rarely
needs it. The geometry kernel's meshes aren't script memory.

## collect

```kupcad frame="none"
GC.collect
```

Runs a collection now, freeing what the script no longer holds. **Returns:** `nil`.

## bytes_allocated

```kupcad frame="none"
GC.bytes_allocated
```

How many bytes of script memory the collector holds now. **Returns:** `Number`.

```kupcad
before = GC.bytes_allocated
scratch = (0...10000).map { |i| [i, i * 2] }
scratch = nil
GC.collect
puts GC.bytes_allocated <= before + 100_000   # true
```
