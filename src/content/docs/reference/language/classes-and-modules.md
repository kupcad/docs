---
title: Classes and modules
description: Defining classes, their fields, methods and inheritance, class-level state, and modules as namespaces and mixins.
sidebar:
  order: 7
---

## class

```kupcad frame="none"
class Name
  ...
end

class Name < Superclass
  ...
end
```

`Name.new(args)` makes an instance and calls its `initialize` method with the arguments, which
it checks as any method does. Writing `class Name` again for a class of your own adds to it.

```kupcad
class Gear
  def initialize(teeth, module_size: 1)
    @teeth = teeth
    @module_size = module_size
  end

  def pitch_diameter = @module_size * @teeth
end

puts Gear.new(20, module_size: 1.5).pitch_diameter # 30
```

## Instance variables

`@name` is a field of the object a method runs on. Each instance has its own; one never
assigned reads as `nil`, also where a method has its name. Fields are reached from outside only
through methods.

### Attribute methods

In a class body, `attr_reader :a, :b` defines methods that read the fields `@a` and `@b`,
`attr_writer` methods that assign them (`obj.a = 1`), and `attr_accessor` both. Compound
assignment works through them: `obj.a += 1`.

```kupcad
class Plate
  attr_reader :width
  attr_accessor :thickness

  def initialize(width)
    @width = width
    @thickness = 2
  end
end

p = Plate.new(40)
p.thickness += 1
puts [p.width, p.thickness].inspect # [40, 3]
```

## Methods and self

Methods defined in a class body are instance methods; inside them, `self` is the instance. An
instance's other methods are called through `self.`: a bare name is read as a variable (see
[Methods](/reference/language/methods/#calling)). `private def` makes a method callable only
from inside the class and its subclasses (see
[Visibility](/reference/language/methods/#visibility)).

Two instances are equal (`==`) only when they are the same object. Operator methods can't be
defined: `def ==(other)` is a syntax error.

### to_s and inspect

`puts`, `print` and string interpolation show an instance by its class's `to_s` when it defines
one, which must return a String. `.inspect` gives `#<Name>` unless the class defines its own
`inspect`. The global `inspect(x)` uses the class's `inspect`, or else its `to_s`.

```kupcad
class Bolt
  def initialize(d) = (@d = d)
  def to_s = "M#{@d} bolt"
end

b = Bolt.new(3)
puts b             # M3 bolt
puts "a #{b}"      # a M3 bolt
puts b.inspect     # #<Bolt>
```

## Inheritance and super

`class B < A` makes `B` a subclass of `A`: it inherits `A`'s methods and may redefine them. The
superclass must be a class; anything else is a `TypeError`.

Inside a method, `super` calls the same method one class up, above the class whose `def`
contains the `super`:

| Form | Passes |
|---|---|
| `super` | The method's own arguments and block |
| `super()` | No arguments |
| `super(a, k: 1)` | The arguments given |

```kupcad
class Part
  def label(prefix = "part") = "#{prefix}"
end

class Bracket < Part
  def label(prefix = "bracket") = super + " (steel)"
end

class Shelf < Bracket
  def label(prefix = "shelf") = super(prefix.upcase)
end

puts Bracket.new.label # bracket (steel)
puts Shelf.new.label   # SHELF (steel)
puts Shelf.new.is_a?(Part) # true
```

In a block inside the method, `super` must be given its arguments.

## Class methods

`def self.name` in a class body defines a method of the class itself, called as
`Name.method`. `class << self ... end` defines every `def` inside it so. Class methods are
inherited by subclasses and can be private (`private def self.name`).

```kupcad
class Washer
  def self.standard(d) = Washer.new(d)

  class << self
    def sizes = [3, 4, 5]
  end

  def initialize(d) = (@d = d)
end

puts Washer.sizes.inspect # [3, 4, 5]
Washer.standard(3)
```

## Class variables

`@@name` belongs to the class whose code first assigns it and is shared with its subclasses,
never with an unrelated class. It is visible in instance methods, class methods and the class
body.

```kupcad
class Counter
  @@made = 0

  def self.make
    @@made += 1
    Counter.new
  end

  def self.made = @@made
end

Counter.make
Counter.make
puts Counter.made # 2
```

## Constants and the class body

A constant assigned in a class or module body belongs to it: plain `TEETH` inside, `Gear::TEETH`
outside. In the body, `self` is the class or module being defined, so `self.helper(...)` calls a
class method defined above it, and a block in the body sees the same `self`.

```kupcad
class Spur
  def self.default_teeth = 24
  TEETH = self.default_teeth
end

puts Spur::TEETH # 24
```

## Modules

```kupcad frame="none"
module Name
  ...
end
```

A module groups constants, classes and functions under a name, and holds methods that classes
can include. A module has no instances.

- Constants and classes defined inside are reached with `::`: `Fasteners::PITCH`,
  `Fasteners::Bolt.new(3)`.
- `def self.name` defines a function of the module, called as `Fasteners.describe(4)`.
- Plain `def`s are instance methods for classes that include the module.

`include M` in a class body adds the module's methods to the class, after the class's own and
before its superclass's. `include` takes a module and only inside a class body: anything else
is a `TypeError`.

```kupcad
module Fasteners
  PITCH = 0.5

  def self.describe(d) = "M#{d}"

  class Bolt
    def initialize(d) = (@d = d)
    def label = "bolt #{@d}"
  end
end

module Tagged
  def tag = "[#{self.label}]"
end

class Screw < Fasteners::Bolt
  include Tagged
end

puts Fasteners::PITCH          # 0.5
puts Fasteners.describe(4)     # M4
puts Screw.new(3).tag          # [bolt 3]
```

`is_a?` takes a class, not a module. Ruby's `extend` and `module_function` don't exist.

### Nesting and reopening

A class nested in a module is written inside the module's body, or declared by its path from
the top level: `class Fasteners::Nut … end` is the same as `class Nut` inside
`module Fasteners`, and `Fasteners` must already exist (else a `NameError`).

- A nested class or module is its own: `Fasteners::Nut` and a top-level `Nut` are two classes.
- Declaring a class or a module again, by either form, adds to it.
- A class or module prints by its full name: `puts Fasteners::Nut` gives `Fasteners::Nut`.
- Declaring one under a name that holds something else is a `TypeError`: `module K` after
  `class K` (`K is not a module`), or `class M` after `module M` (`M is not a class`).

```kupcad
module Fasteners
end

class Fasteners::Nut
  def size = 3
end

module Fasteners
  class Nut
    def pitch = 0.5
  end
end

class Nut
end

nut = Fasteners::Nut.new
puts [nut.size, nut.pitch].inspect      # [3, 0.5]
puts Fasteners::Nut                     # Fasteners::Nut
puts Nut.new.respond_to?(:size)         # false
```

## Built-in classes are sealed

The built-in classes (`Solid`, `Sketch`, `Path`, `Number`, `String`, `Array`, `Map` and the
rest) and modules (`Math`, `CAD`, `GC`) can't be reopened, and the classes can't be subclassed:
`class Solid` and `module Math` are the compile error `builtin-redefined`, even nested in a
module of your own, and `class Bracket < Solid` is a `TypeError`, since their values come from literals,
constructors and methods. A class of your own builds or holds a shape instead:

```kupcad
class Bracket
  def initialize(width:)
    @width = width
  end

  def solid
    cube(x: @width, y: 20, z: 4) - cylinder(d: 4, h: 10).translate(@width / 2, 10, -1)
  end
end

Bracket.new(width: 40).solid.translate(z: 5)
```

The error classes are the exception: subclass `StandardError` to raise your own (see
[Errors](/reference/language/errors/#your-own-errors)).
