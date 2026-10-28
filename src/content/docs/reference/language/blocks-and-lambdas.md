---
title: Blocks and lambdas
description: Blocks, yield, lambdas and how they take arguments, see variables, and leave with break, next and return.
sidebar:
  order: 6
---

A block is code given to a call; a lambda is a block stored as a value. Both behave the same
way: the same argument rules, the same view of the variables around them, and the same
`break`, `next` and `return`.

## Blocks

```kupcad frame="none"
call { |params| ... }
call do |params|
  ...
end
```

A block follows a call's arguments, in braces or between `do` and `end`. Its parameters,
between `|` bars, take the same forms as a method's (defaults, `*rest`, keywords), plus
`(a, b)`, which destructures one argument. The block's value is its last statement's.

```kupcad
pegs = (0...3).map do |i|
  cylinder(r: 2, h: 10).translate(x: i * 10)
end
lengths = [[0, 0], [3, 4]].each_cons(2).map { |(a, b)| Math.hypot(b[0] - a[0], b[1] - a[1]) }
puts lengths.inspect # [5]
union(pegs)
```

A call takes one block: a `&blk` argument and a `do` or `{ }` block together are the compile
error `unexpected-block`.

## yield and block_given?

Inside a method, `yield(args)` runs the block the method was given and is the block's value.
It is an expression like any call: `x = yield`, `yield(v).round`, `ok ? yield : 0`.
`block_given?` tells whether the method got a block. Outside a `def`, both are the compile
error `outside-method`; `yield` given a block of its own is `unexpected-block`.

```kupcad
def each_corner(w, h)
  return [] unless block_given?
  [[0, 0], [w, 0], [w, h], [0, h]].map { |(x, y)| yield(x, y) }
end

holes = each_corner(30, 20) { |x, y| cylinder(r: 1.5, h: 5).translate(x, y, 0) }
puts holes.length # 4
```

## Taking the block as a value

A `&blk` parameter holds the block as a `Proc`, or `nil` when none was given. Call it with
`blk.call(args)`, or hand it on to another call with `&blk`.

```kupcad
def each_twice(list, &blk)
  list.map(&blk) + list.map(&blk)
end

puts each_twice([1, 2]) { |v| v * 10 }.inspect # [10, 20, 10, 20]
```

## Lambdas

```kupcad frame="none"
->(params) { ... }
->(params) do
  ...
end
-> { ... }
```

A lambda's parameters take the same forms as a method's. A lambda is a value of class `Proc`,
so it is called with `.call`, which, like any method, needs no parentheses: `f.call`,
`f.call(3)`, `f.call 3`. A bare `f` is always the value itself, so it can be stored and passed
along; `f(3)` is a `TypeError`, and Ruby's `f.()`, `f[3]`, `proc`, `Proc.new` and
`lambda { }` don't exist.

```kupcad
double = ->(x) { x * 2 }
plate = ->(w, h = 10, thickness: 2) do
  cube(x: w, y: h, z: thickness)
end

def apply(f, v)
  f.call(v)
end

puts double.call(4)    # 8
puts apply(double, 5)  # 10
plate.call(30, thickness: 3)
```

`obj.method(:name)` gives a bound method, a `Method`, which is called with `.call` too. See
[Proc and Method](/reference/stdlib/proc-and-method/).

## Arguments

Blocks and lambdas are lenient about their arguments, where methods are strict: a missing
argument is `nil` and an extra one is dropped.

Block parameters don't unpack an Array argument by themselves. `[[1, 2]].map { |a, b| ... }`
binds `a` to `[1, 2]` and `b` to `nil`; write `|(a, b)|` to destructure. A Map's iterators
pass the key and the value as two arguments, so `{ x: 1 }.each { |k, v| ... }` needs no
brackets.

```kupcad
pair = ->(a, b) { [a, b].inspect }
puts pair.call(1)              # [1, nil]
puts pair.call(1, 2, 3)        # [1, 2]
puts [[1, 2]].map { |a, b| b.inspect }.inspect   # ["nil"]
puts [[1, 2]].map { |(a, b)| a + b }.inspect     # [3]
puts({ x: 1 }.map { |k, v| "#{k}=#{v}" }.inspect) # ["x=1"]
```

Ruby's `&:name` shorthand doesn't exist: write `{ |v| v.name }`.

## Closures

A block or lambda sees the variables of the scope it is written in, and assigning to one of
them changes it there, for as long as the block lives.

```kupcad
count = 0
bump = -> { count += 1 }
bump.call
bump.call
puts count # 2
```

Inside a method, a block sees the method's context: `self`, the object's `@` variables, the
method's `yield` and `block_given?`, `super`, and its private methods, as the method's own body
does. `super` there must be given its arguments (`super(a, b)`); the bare `super` that passes
the method's own arguments on is a compile error inside a block.

## break, next and return

| Statement | In a block or lambda |
|---|---|
| `next value` | Ends this run of the block with `value`; the iteration goes on |
| `return value` | The same as `next value`: it leaves only the block or lambda |
| `break value` | Ends the call the block was given to; that call's value is `value` |

`return` in a block never returns from the method around it: `break` is the way to stop an
iteration and hand back a result. `break` leaves the call the block was given to however the
block was reached: through `yield`, handed on with `&blk`, or through `blk.call`. It is valid
only in a block given to a call: in a lambda it is the compile error `outside-loop`, and in a
block given to `highlight`, `ghost`, `benchmark` or `assert` an `ArgumentError`.

```kupcad
doubled = [1, 2, 3].map do |v|
  next 0 if v == 2
  v * 2
end
puts doubled.inspect # [2, 0, 6]

def first_over(list, limit)
  list.each { |v| return v if v > limit } # leaves only the block
  :none
end
puts first_over([1, 5, 9], 2) # none

found = [10, 20, 30].each { |v| break v if v > 15 }
puts found # 20
```

An iteration reaches the elements its block appends to the Array it walks. A Map's iterators
give the entries that were there when the iteration began.
