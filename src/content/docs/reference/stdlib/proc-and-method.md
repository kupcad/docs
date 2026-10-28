---
title: Proc and Method
description: The callable values, lambdas and captured blocks (Proc) and bound methods (Method), and how they are called.
sidebar:
  order: 10
---

KupCAD has two kinds of callable value. A `Proc` is a lambda (`->(x) { ... }` or
`-> do ... end`) or a block captured with a `&blk` parameter. A `Method` is a method bound to
its receiver, from [`obj.method(:name)`](/reference/stdlib/object/#method). Both are values:
they are stored, passed and returned like any other, and called with `.call`. How lambdas and
blocks behave (`return`, `break`, closures) is on
[Blocks and lambdas](/reference/language/blocks-and-lambdas/).

```kupcad
double = ->(x) { x * 2 }
puts double.call(4)               # 8
puts double.class                 # Proc

round_to = 3.14159.method(:round)
puts round_to.call(2)             # 3.14
puts round_to.class               # Method
```

## call

```kupcad frame="none"
callable.call(*args, **keywords)
callable.call
```

Calls the lambda, block or method with the arguments given, which may be spread from an Array
(`*xs`) or a Map (`**opts`). Like any method call, it needs no parentheses without arguments.
The callable itself is the bare name: `f` is the value and `f(3)` is a `TypeError`. There is
no `f.()` or `f[3]`.

A Proc is lenient about its arguments, as a block is: a missing one is `nil` and an extra one
is dropped. A Method checks them as its method does: `apply(1, 2)` to a method of one
parameter is an `ArgumentError`.

**Returns:** what the callable returns.

```kupcad
plate = ->(w, h = 10, thickness: 2) { cube(x: w, y: h, z: thickness) }
a = plate.call(30)
b = plate.call(30, 20, thickness: 3)

add = ->(a, b) { [a, b] }
puts add.call(1).inspect          # [1, nil]
puts add.call(1, 2, 3).inspect    # [1, 2]
```

## Passing as a block

`&f` passes a Proc as a call's block, and a method that takes `&blk` captures its block as a
Proc. `&nil` passes no block. A Method can't be passed with `&`: wrap it in a lambda,
`&->(v) { m.call(v) }`.

```kupcad
double = ->(x) { x * 2 }
puts [1, 2, 3].map(&double).inspect   # [2, 4, 6]

def keep(&blk)
  blk
end
inc = keep { |v| v + 1 }
puts inc.call(1)                      # 2
```

## What else they answer

Besides `call`, a Proc and a Method answer only [Object](/reference/stdlib/object/)'s
methods. They have no `arity`, `parameters` or `curry`. `inspect` shows a Proc as
`<Function>` and a Method as `<Bound Method>`. Since `call` is answered by the language rather
than by a method, `respond_to?(:call)` is `false`; test `is_a?(Proc)` or `is_a?(Method)`.
