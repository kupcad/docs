---
title: Variables and scope
description: Local, instance, class and file variables, constants, and the assignment forms.
sidebar:
  order: 2
---

A variable comes into being when an assignment to it runs. Reading one that hasn't been
assigned is a `NameError`, also when its assignment sits in a branch that didn't run.

```kupcad
width = 20
height = width / 2
puts height # 10
```

## Scopes

A script's top level, each `def`, each block or lambda, and each class or module body is a
scope. `if`, `while`, `for`, `case` and `begin` bodies open none: what they assign is still
there after them.

**Methods read top-level variables.** A `def` sees the variables of the file's top level, so
a parametric script's values are visible in every method. Assigning inside a `def`, or inside
a block within one, never changes a top-level variable: it makes a local (or updates one the
method already has), so a helper's scratch variable never overwrites a top-level one.

```kupcad
width = 20

def plate_width
  margin = 2       # local to plate_width
  width - margin   # reads the top-level width
end

def scratch
  width = 0        # a new local
  width
end

puts plate_width # 18
puts scratch     # 0
puts width       # 20
```

**Blocks and lambdas see the scope they are written in**, and update its variables. One
written at the top level updates top-level variables:

```kupcad
total = 0
[1, 2, 3].each { |v| total += v }
add = ->(v) { total += v }
add.call(10)
puts total # 16
```

**Each file has its own top level.** An imported file's variables are its own; see
[Imports and exports](/reference/language/imports/).

## Instance and class variables

`@name` is a field of the current object, `self`. One that was never assigned reads as `nil`.
`@@name` is a class variable: it belongs to the class whose code first assigns it and is
shared with its subclasses. See [Classes and modules](/reference/language/classes-and-modules/).

## Dollar variables

A name that starts with `$` is a variable of its file's top level that a method can assign as
well as read: `$count += 1` inside a `def` changes the file's `$count`, where `count += 1`
would make a local. It is not shared with other files, and there are no special variables
such as Ruby's `$0` or `$stdout`. A `$` that starts no name is the compile error
`unexpected-character`.

```kupcad
$built = 0

def build_part
  $built += 1
  cube(5)
end

build_part
build_part
puts $built # 2
```

## Constants

A name that starts with an upper-case letter is a constant: a class, a module, or a value
assigned to one. A constant assigned in a class or module body is read from outside with
`::`, and by its plain name inside.

```kupcad
module Fasteners
  PITCH = 0.5
end

class Gear
  TEETH = 20
  def teeth = TEETH
end

puts Fasteners::PITCH # 0.5
puts Gear::TEETH      # 20
puts Gear.new.teeth   # 20
```

## Assignment

| Form | Meaning |
|---|---|
| `x = 1` | Assigns `x`; the assignment's value is `1`, so `x = y = 3` assigns both |
| `a, b = 1, 2` | Assigns each name its value, in order |
| `a, b = [1, 2]` | Spreads an Array over the names; missing values are `nil` |
| `a, *rest = [1, 2, 3]` | One name, marked `*`, takes the rest as an Array |
| `a, = [1, 2]` | A lone name with a comma takes the first element |
| `a, b = b, a` | Swaps: the right side is evaluated first |
| `obj.size = 2`, `list[0] = 2` | Calls the attribute writer or sets the element |

```kupcad
a, b = 1, 2
c, *rest = [1, 2, 3]
d, e = [5]
a, b = b, a
puts [a, b].inspect    # [2, 1]
puts [c, rest].inspect # [1, [2, 3]]
puts e.inspect         # nil
```

Assigning to a call (`f() = 1`) is the compile error `invalid-assignment`.

## Compound assignment

`x op= v` is `x = x op v` for `+ - * / % ** & | ^ << >>`. It works on local, instance, class
and `$` variables, attributes (`obj.n += 1`) and elements (`a[i] *= 3`).

| Form | Assigns |
|---|---|
| `x ||= v` | `v` only when `x` is `nil` or `false`; `v` is evaluated only then |
| `x &&= v` | `v` only when `x` is neither `nil` nor `false` |

```kupcad
sizes = [1, 2]
sizes[0] += 5
z = nil
z ||= 4
z ||= 9
n = 10
n **= 2
puts sizes.inspect # [6, 2]
puts z             # 4
puts n             # 100
```

Several names with an operator other than `=` (`a, b += 1`) are the compile error
`invalid-assignment`: give each its own.
