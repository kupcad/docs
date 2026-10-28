---
title: Object
description: The methods every value answers, from class and inspect to dup and tap, and what classes and modules are as values.
sidebar:
  order: 2
---

Every value is an `Object`: a number, a string, `nil`, a shape, a lambda, a class and an
instance of a class of your own all answer the methods on this page. A class can override any
of them, as `inspect` is overridden to customise how its instances print.

```kupcad
puts 5.class                  # Number
puts cube(1).is_a?(Shape)     # true
puts "abc".respond_to?(:upcase)  # true
puts [1, [2]].inspect         # [1, [2]]
```

## class

```kupcad frame="none"
value.class
```

The value's class: `Number`, `String`, `Symbol`, `Boolean`, `NilClass`, `Array`, `Map`,
`Range`, `Solid`, `Sketch`, `Path`, `Assembly`, `Proc` for a lambda or a block, `Method` for a
bound method, `Class` for a class, `Module` for a module, or a class you defined.

**Returns:** `Class`.

```kupcad
puts 2.5.class          # Number
puts nil.class          # NilClass
puts ->(x) { x }.class  # Proc
puts Number.class       # Class
```

## inspect

```kupcad frame="none"
value.inspect
```

The value as it would be written in a script. Strings are quoted, with `"`, `\` and control
characters escaped as the lexer reads them; Symbols keep their colon; a Map is written
`{x: 1}`, or `{"w" => 1}` for keys that aren't Symbols. A container that holds itself prints as
`[...]` or `{...}`. A shape is shown by its class (`#<Solid>`), not by what it measures, which
only the geometry kernel can work out. An instance of a class of your own is `#<Gear>` unless
the class defines `inspect`. A lambda is `<Function>` and a bound method `<Bound Method>`.

**Returns:** `String`.

```kupcad
puts "a\tb".inspect        # "a\tb"
puts :m3.inspect           # :m3
puts({ x: 1, "y" => 2 }.inspect)  # {x: 1, "y" => 2}
puts cube(1).inspect       # #<Solid>
```

The global [`inspect`](/reference/stdlib/kernel/#inspect) function prints a value this way
with the line it was called on.

## is_a?

```kupcad frame="none"
value.is_a?(klass)
```

Whether the value is an instance of `klass` or of a subclass of it. Every shape is a `Shape`,
so a helper that takes any shape checks `is_a?(Shape)` and one that takes a solid
`is_a?(Solid)`. A class in a `case`/`when` matches as `is_a?` does: `when Number` is
`x.is_a?(Number)`.

**Returns:** `Boolean`.

```kupcad
puts 5.is_a?(Number)            # true
puts square(2).is_a?(Shape)     # true
puts square(2).is_a?(Solid)     # false
puts ValueError.new("x").is_a?(StandardError)  # true
```

## respond_to?

```kupcad frame="none"
value.respond_to?(name)
```

Whether the value has a method named `name`, a Symbol or a String. For an instance, a field
of that name (set with `@name`) counts too, and private methods count. A shape responds to the
methods of its kind only: `cube(1).respond_to?(:extrude)` is `false`. A class responds to its
class methods and to `new`. A lambda's `.call` is answered by the language, not by a method,
so `respond_to?(:call)` is `false`: test `is_a?(Proc)` instead.

**Returns:** `Boolean`.

```kupcad
puts [1].respond_to?(:each)        # true
puts cube(1).respond_to?(:volume)  # true
puts square(1).respond_to?(:volume)  # false
```

## nil?

```kupcad frame="none"
value.nil?
```

Whether the value is `nil`.

**Returns:** `Boolean`.

## empty?

```kupcad frame="none"
value.empty?
```

Whether the value holds nothing: `nil`, an empty String, Array, Map or JsonObject, a Solid with
no volume, or a Sketch with no area. Every other value is not empty, a Number included.
Measuring a shape needs the geometry kernel; on the B-Rep engine it is a
`NotImplementedError` for now (see [Engine settings](/reference/geometry/engine-settings/)).

**Returns:** `Boolean`.

```kupcad
puts nil.empty?                       # true
puts "".empty?                        # true
puts 0.empty?                         # false
puts (cube(2) - cube(5)).empty?       # true
```

## method

```kupcad frame="none"
value.method(name)
```

The method `name` (a Symbol or a String) bound to the value, as a `Method` to store, pass and
call later with `.call`. See [Proc and Method](/reference/stdlib/proc-and-method/).

**Returns:** `Method`.

**Raises:** `NameError` when the value has no such method.

```kupcad
clamp = 12.method(:clamp)
puts clamp.call(0, 10)   # 10
```

## tap

```kupcad frame="none"
value.tap { |v| ... }
```

Calls the block with the value and returns the value, whatever the block returns: for a look
at something in the middle of a chain. Without a block it returns the value.

**Returns:** the receiver.

```kupcad
part = cube(10).tap { |c| puts c.volume }.translate(z: 5)   # prints 1000
```

## into

```kupcad frame="none"
value.into { |v| ... }
```

Calls the block with the value and returns what the block returns: a step of a chain that
isn't a method of the value (Ruby's `then`). Without a block it returns the value.

**Returns:** the block's value.

```kupcad
side = 3.into { |n| n * n + 1 }   # 10
```

## dup

```kupcad frame="none"
value.dup
value.clone
```

A shallow copy of an Array, a Map or an instance of a class of your own: a new container with
its own elements, entries or fields, which hold the same values as the original's. Every other
value is returned as it is: numbers, strings, symbols and shapes are values that never change,
so a copy would be the same. `clone` is the same method.

**Returns:** a value of the receiver's class.

```kupcad
parts = [1, [2]]
copy = parts.dup
copy.push(3)        # parts is still [1, [2]]
copy[1].push(9)     # the nested Array is shared: parts is now [1, [2, 9]]
puts parts.inspect  # [1, [2, 9]]
```

## Classes and modules as values

A class is a value of class `Class`, and a module a value of class `Module`; both answer the
methods on this page. `Gear.new(...)` makes an instance of a class of your own and calls its
`initialize`. Of the built-in classes, `Array.new`, `String.new`, `Map.new` and `Random.new`
make values; the others' values come from literals and methods, so `Number.new` is a
`NoMethodError`. A class or module has no `name`, `superclass` or `ancestors` method.

A constant assigned in a class or module body is read from outside with `::`:
`Gear::TEETH`, `Parts::Bolt::LENGTH`. See
[Classes and modules](/reference/language/classes-and-modules/).

```kupcad
class Gear
  TEETH = 12
end

puts Gear::TEETH             # 12
puts Gear.inspect            # Gear
puts Gear.new.is_a?(Gear)    # true
```
