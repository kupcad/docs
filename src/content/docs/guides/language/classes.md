---
title: 6. Classes and modules
description: Keeping a part's numbers and the methods that use them together, and grouping code under a name.
sidebar:
  order: 6
---

A function is enough for most parts. A class helps when several methods share the same
numbers: a gear has a module and a tooth count, and its pitch radius, its tip radius and its
outline all follow from them.

## A class

```kupcad
class Gear
  attr_reader :teeth, :gear_module

  def initialize(teeth, gear_module)
    @teeth = teeth
    @gear_module = gear_module
  end

  def pitch_radius = @teeth * @gear_module / 2

  def tip_radius = self.pitch_radius + @gear_module

  def blank = cylinder(r: self.tip_radius, h: 8)
end

gear = Gear.new(12, 2)
puts gear.pitch_radius   # 12
gear.blank
```

- `Gear.new(12, 2)` makes a gear; `initialize` runs with the arguments.
- `@teeth` is a field of the object, read with its `@` inside the class. `attr_reader` makes
  `gear.teeth` read it from outside.
- Inside the class, a method calls another of its own with `self.`: `self.pitch_radius`. A
  bare name is always a variable, never a method call. That rule is KupCAD's, not Ruby's; it
  keeps a method and a variable from being confused.

## Private methods

```kupcad
class Gear
  def initialize(teeth) = (@teeth = teeth)

  def outline = circle(r: self.radius)

  private def radius = @teeth * 1.5
end

Gear.new(10).outline
```

`private def` makes a method for the class's own use. Visibility is declared on each method;
there is no `private` line that changes the methods after it.

## Modules

A module groups constants and functions under a name:

```kupcad
module Fasteners
  M3 = 3.4

  def self.hole(d, h) = cylinder(d: d, h: h)
end

cube(20) - Fasteners.hole(Fasteners::M3, 30).translate(10, 10, -5)
```

`Fasteners::M3` reaches a constant, `Fasteners.hole` a function defined with `def self.`. A
module in a file of its own is a small library; the next page imports one.

## What you can't do

The built-in classes (`Solid`, `Array`, `Number`...) are sealed: no reopening, no subclassing.
Your classes can subclass each other, and the error classes.

## In the reference

[Classes and modules](/reference/language/classes-and-modules/) ·
[Visibility](/reference/language/methods/#visibility)

Next: [Parameters](/guides/language/parameters/).
