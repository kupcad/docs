---
title: 5. Choices and errors
description: if, unless and case; stopping a bad script with assert; raising and rescuing errors.
sidebar:
  order: 5
---

## if

```kupcad
holes = 4

if holes == 4
  puts "four corners"
elsif holes == 2
  puts "two ends"
else
  puts "something else"
end
```

`==` compares; `!=`, `<`, `<=`, `>`, `>=` as usual; `&&` is and, `||` is or, `!` is not.

A short condition can follow the statement it guards:

```kupcad
lid = true
puts "with a lid" if lid
puts "open" unless lid
```

`unless` is `if not`. The one-line choice `cond ? a : b` picks a value:

```kupcad
holes = 2
spots = holes == 4 ? [[5, 5], [35, 5], [5, 25], [35, 25]] : [[5, 15], [35, 15]]
puts spots.size   # 2
```

## case

```kupcad
def layer_height(quality)
  case quality
  when :draft then 0.3
  when :fine then 0.1
  else 0.2
  end
end

puts layer_height(:fine)   # 0.1
```

`case` tries each `when` in turn. A `when` can also name a range (`when 0..10`) or a class
(`when Solid`).

## Stopping a bad script

A parameter's range catches most bad values. For a rule between two values, `assert`:

```kupcad
diameter = 50
wall = 6
assert(diameter > 4 * wall) { "a #{wall} mm wall leaves no room inside a #{diameter} mm mug" }
cylinder(d: diameter, h: 10)
```

If the condition fails, the script stops and the message is shown with the line it came from.
The block builds the message only when needed. For something worth saying that isn't fatal,
`warn("...")` prints a warning and goes on.

## Errors

A method that is given something it can't use raises an error: `cube(-1)` is a `ValueError`,
`cube("a")` a `TypeError`. An error nobody handles stops the script with its message and line.

To raise your own: `raise "no room for a handle"`. To handle one:

```kupcad
def safe_ratio(a, b)
  a / b
rescue ZeroDivisionError
  0
end

puts safe_ratio(1, 0)   # 0
```

`rescue` names the error class it handles; `rescue => e` handles any, with `e.message` the
text. Most scripts need no `rescue`: a stopped script with a clear message is the right
outcome for a value that makes no sense.

## In the reference

[Control flow](/reference/language/control-flow/) · [Errors](/reference/language/errors/) ·
[assert, warn](/reference/stdlib/kernel/#assert)

Next: [Classes](/guides/language/classes/).
