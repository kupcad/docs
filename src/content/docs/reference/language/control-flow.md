---
title: Control flow
description: Conditionals, case, loops, statement modifiers, and break, next and return.
sidebar:
  order: 4
---

Every control structure is an expression with a value. Only `nil` and `false` are falsy;
`0`, `""` and `[]` are truthy.

## if, elsif, else

```kupcad frame="none"
if condition [then]
  ...
elsif condition [then]
  ...
else
  ...
end
```

The value is the last value of the branch that ran, or `nil` when none did. `then` is needed
only to put a branch on the condition's line.

```kupcad
gap = 5
fit = if gap < 3
  "tight"
elsif gap < 6
  "snug"
else
  "loose"
end
puts fit # snug
puts(if gap > 1 then "ok" else "no" end) # ok
```

## unless

`unless condition` runs its body when the condition is falsy, and otherwise goes on to its
`elsif` and `else` branches as an `if` does.

```kupcad
holes = 0
label = unless holes > 0
  "solid"
else
  "drilled"
end
puts label # solid
```

## Statement modifiers

`if`, `unless`, `while` and `until` can follow a statement. The condition is evaluated first:
`begin ... end while condition` checks before the first run too, unlike Ruby's.

```kupcad
debug = true
puts "building" if debug
k = 0
k += 1 while k < 5
puts k # 5
```

An assignment under a modifier that doesn't run leaves the variable unassigned: reading it
later is a `NameError`.

## Conditional operator

`condition ? a : b` evaluates only the branch it picks. See
[Operators](/reference/language/operators/#conditional).

## case

```kupcad frame="none"
case value
when a, b [then]
  ...
when c [then]
  ...
else
  ...
end
```

Each `when` lists one or more patterns, tried in order; the first branch with a match runs.
The value is that branch's last value, the `else` branch's, or `nil`.

| Pattern | Matches when |
|---|---|
| A class (`Number`, `String`, `Solid`, a class of your own) | `value.is_a?(Class)` |
| A Range | The range includes `value` |
| Anything else | `pattern == value`, by content for Arrays, Maps and Ranges |

Without a value, `case` runs the first `when` whose condition is truthy. There is no pattern
matching with `in`.

```kupcad
size = 5
band = case size
       when 1..3 then "small"
       when 4, 5 then "medium"
       else "large"
       end
puts band # medium

kind = case "M3"
       when Number then "a size"
       when String then "a name"
       end
puts kind # a name

pick = case
       when size > 10 then "big"
       when size > 2 then "mid"
       end
puts pick # mid
```

## while and until

`while condition` runs its body while the condition is truthy; `until condition` while it is
falsy. The header ends at the line break: `do` after it is the compile error `misplaced-do`.
The value is `nil`, or the value given to `break`.

```kupcad
n = 0
while n < 3
  n += 1
end
m = 10
until m <= 7
  m -= 1
end
puts [n, m].inspect # [3, 7]
```

## for

```kupcad frame="none"
for name in iterable
  ...
end

for a, b, *rest in iterable
  ...
end
```

`for` walks an Array, a Range, a Map or a [JsonObject](/reference/stdlib/json-object/);
anything else is a `TypeError`.

- An Array is walked as it is at each step: elements pushed during the loop are visited too.
- A Range is walked exactly as `.each` walks it, steps and exclusive ends included.
- A Map (or a JsonObject) gives `[key, value]` pairs in insertion order: the entries there
  when the loop began, each with its value when its turn comes.

One variable takes each element whole; several spread it as a
[multiple assignment](/reference/language/variables/#assignment) does, and one of them may be
`*rest`. The loop opens no scope: its variables, and what the body assigns, remain after it.
The value is the iterable, or the value given to `break`. As with `while`, `do` after the
header is an error.

```kupcad
for i in 0...3
  cube(2).translate(i * 5, 0, 0)
end
puts i # 2

for x, y in [[0, 0], [10, 5]]
  puts x + y
end

for name, d in { m3: 3, m4: 4 }
  puts "#{name}: #{d}"
end
```

KupCAD has no `loop do ... end`; write `while true`.

## break, next and return

| Statement | In a loop | In a block or lambda | In a method |
|---|---|---|---|
| `break value` | Ends the loop; its value is `value` | Ends the iterating call; the call's value is `value` | Error outside a loop or block |
| `next value` | Goes on with the next element | Ends this run of the block with `value` | Error outside a loop or block |
| `return value` | Returns from the enclosing method | Ends this run of the block or lambda with `value` | Returns from the method |

`break` and `next` outside a loop or block are the compile error `outside-loop`. A `return`
inside a block leaves only the block, never the method around it; see
[Blocks and lambdas](/reference/language/blocks-and-lambdas/#break-next-and-return). A
`return` at the top level ends the script.

```kupcad
found = for v in [1, 2, 3]
  break v * 10 if v == 2
end
puts found # 20

def first_big(xs)
  for x in xs
    return x if x > 2
  end
  nil
end
puts first_big([1, 5, 9]) # 5
```
