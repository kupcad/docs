---
title: 3. Methods
description: Calling methods with keyword arguments, and writing your own with def.
sidebar:
  order: 3
---

## Calling

```kupcad
cylinder(d: 8, h: 20)
```

Arguments by name, `d:` and `h:`, say what each number is. Many methods take either: `cube(10)`
sets all three sizes, `cube(x: 10, y: 20, z: 2)` each. The reference lists the forms each method
takes.

Parentheses can be left out when a call stands alone on a line: `puts "hello"`.

## Writing one

```kupcad
def post(h)
  cylinder(d: 6, h: h)
end

post(20)
```

`def` names a method, with its parameters in parentheses. The method's value is its last line,
so `post(20)` is a cylinder. A method that fits on one line can be written so:

```kupcad
def post(h) = cylinder(d: 6, h: h)

post(20)
```

## Defaults and keywords

```kupcad
def post(h, d: 6)
  cylinder(d: d, h: h)
end

post(20) + post(30, d: 10).translate(x: 20)
```

A parameter with a default can be left out. A keyword parameter, `d:`, is given by name, so a
call says what it means.

## Returning early

```kupcad
def thickness_for(span)
  return 2 if span < 50
  return 3 if span < 100
  4
end

puts thickness_for(70)   # 3
```

`return` leaves the method with a value. `if` after a statement runs it only when the
condition holds. Without a `return`, the method's value is its last line.

## Methods see the script's variables

```kupcad
wall = 3

def box(size) = cube(size) - cube(size - 2 * wall).translate(wall, wall, wall)

box(20)
```

A method can read a variable of the script. Assigning inside the method makes a new, local
variable and leaves the script's alone.

## Names

A method that answers yes or no ends in `?`: `shape.empty?`, `n.integer?`. Names are
lower case with underscores, like variables.

## In the reference

[Methods](/reference/language/methods/) · [Scopes](/reference/language/variables/#scopes)

Next: [Blocks](/guides/language/blocks/).
