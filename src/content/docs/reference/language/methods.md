---
title: Methods
description: Defining methods with def, their parameters, calling them, spreading arguments, and visibility.
sidebar:
  order: 5
---

## def

```kupcad frame="none"
def name(params)
  body
end

def name params      # parentheses are optional
  body
end

def name(params) = expression
```

A method's value is the value of the last statement it runs, or the value given to `return`.
`return a, b` returns the Array `[a, b]`. The one-line form, `def name(params) = expression`,
needs no `end`.

A `def` at the top level defines a function that any later code, and any method, can call by
name. A `def` inside a class defines an instance method, and `def self.name` a class method
(see [Classes and modules](/reference/language/classes-and-modules/)). Defining a method again
replaces it, for calls already written too. A method's body can take `rescue` and `ensure`
clauses without a `begin` (see [Errors](/reference/language/errors/)).

```kupcad
def twice(x) = x * 2

def classify(gap)
  return "tight" if gap < 0.1
  "free"
end

def safe_ratio(a, b)
  a / b
rescue ZeroDivisionError
  0
end

puts twice(4)          # 8
puts classify(0.05)    # tight
puts safe_ratio(1, 0)  # 0
```

## Parameters

Parameters come in this order:

| Parameter | Takes |
|---|---|
| `a` | A required positional argument |
| `a = default` | An optional positional argument |
| `*rest` | Any further positional arguments, as an Array |
| `k:` | A required keyword argument |
| `k: default` | An optional keyword argument |
| `**opts` | The keywords no other parameter names, as a Map (`{}` for none); with it, any keyword is accepted |
| `&blk` | The block, as a value (`nil` when none is given) |

A default is evaluated when the call needs it and may use the parameters before it. `nil`
given for an optional parameter, positional or keyword, takes its default, so a value passed on
may be absent. A Map passed as a positional argument stays a positional argument; only
`key: value` arguments reach keyword parameters. A parameter can't be an `@`, `@@` or `$` name
(the compile error `invalid-parameter`), and a method takes at most 255 parameters.

```kupcad
def frame(w, h = w / 2, *extra, depth: 3, label:, **opts, &blk)
  [w, h, extra, depth, label, opts].inspect
end

puts frame(10, label: "A")                     # [10, 5, [], 3, "A", {}]
puts frame(10, nil, 1, 2, label: "B", tag: 7)  # [10, 5, [1, 2], 3, "B", {tag: 7}]
```

## Arity

A method takes exactly the arguments it declares. Each of these is an `ArgumentError`:

| Call | Message |
|---|---|
| Too many or too few positional arguments | `twice takes 1 argument, got 2` |
| A keyword it doesn't declare (without `**opts`) | `plate does not take a keyword 'thicknes' (it accepts: thickness)` |
| Keywords to a method with no keyword parameters | `plain takes no keyword arguments` |
| A required keyword left out | `need needs the keyword 'width'` |

Blocks and lambdas are lenient instead: see
[Blocks and lambdas](/reference/language/blocks-and-lambdas/#arguments).

## Calling

A method is called by name, with or without parentheses. A name with no arguments and no
parentheses is a call when no variable of that name is in scope: `plate_width` and `cube` are
the same as `plate_width()` and `cube()`.

```kupcad
def plate_width = 40
def twice(x) = x * 2
puts plate_width # 40
puts twice 4     # 8
cube
```

Inside a method of a class, call the object's other methods through `self.`: a bare
`plate` there is read as a variable, and is a `NameError`. Top-level functions and built-ins
are called by name from anywhere.

```kupcad
class Bracket
  def plate = cube(x: 40, y: 20, z: 3)
  def holes = cylinder(r: 2, h: 10).translate(x: 10, y: 10)
  def build = self.plate.difference(self.holes)
end

Bracket.new.build
```

How a name followed by a space, `-`, `[` or `(` is read is set out in
[Syntax](/reference/language/syntax/#what-follows-a-name).

## Spreading arguments

Any call (to a method, a lambda's `.call`, `super` or `yield`) can spread its arguments:

| Argument | Passes |
|---|---|
| `*array` | The Array's elements as positional arguments |
| `**map` | The Map's entries as keyword arguments |
| `&f` | The lambda `f` as the block (`nil` for none) |

A lambda passed as an ordinary argument stays an argument, even in last position. A call takes
at most 255 arguments.

```kupcad
def box(x, y, z, center: false)
  cube(x: x, y: y, z: z, center: center)
end

size = [10, 20, 5]
opts = { center: true }
double = ->(v) { v * 2 }

box(*size)
box(*size, **opts)
puts [1, 2, 3].map(&double).inspect # [2, 4, 6]
```

## Visibility

A method is public unless it is defined with `private def`. A private method can be called
through `self.` from inside its class or a subclass, on another instance of the class, and
from a block inside such a method, but not from outside: there it is a `NoMethodError`.
`public def` states the default. Visibility is set per method: there are no `private` lines
that change the methods after them, and there is no `protected`.

```kupcad
class Bracket
  def width = self.margin * 10

  private def margin = 2
end

puts Bracket.new.width # 20
begin
  Bracket.new.margin
rescue NoMethodError => e
  puts e.message # private method 'margin' called.
end
```

## Recursion

A method may call itself up to 100,000 calls deep, and up to 200 calls nested inside built-ins
(a method that a block given to `map` or `each` calls again). Past either, the run stops with
`Call stack overflow`, which `rescue` doesn't catch.
