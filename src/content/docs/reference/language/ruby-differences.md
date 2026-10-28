---
title: Differences from Ruby
description: Where KupCAD's Ruby-like syntax deliberately behaves differently from Ruby, with links to the details.
sidebar:
  order: 10
---

KupCAD borrows Ruby's syntax but keeps a simpler model. These differences are design choices,
not missing pieces.

## Calls and callables

- **Lambdas are the only callable values**, and they are called with `.call`: `f.call(3)`.
  There is no `proc`, `Proc.new` or `lambda { }`, and no `f.()` or `f[3]`; `f(3)` is a
  `TypeError`. See [Lambdas](/reference/language/blocks-and-lambdas/#lambdas).
- **A lambda behaves exactly like a block.** `return` and `next` leave only the block or
  lambda, never the method around it; `break` is how a block stops an iteration with a result.
  Both are lenient about arguments: missing ones are `nil` and extras are dropped. See
  [break, next and return](/reference/language/blocks-and-lambdas/#break-next-and-return).
- **Block parameters don't unpack an Array by themselves**: write `|(a, b)|`. Map iterators
  still pass the key and value separately. See
  [Arguments](/reference/language/blocks-and-lambdas/#arguments).
- **No `&:name`** shorthand: write `{ |v| v.name }`.
- **No Enumerator**: `each_with_index`, `each_cons` and `each_slice` without a block give an
  Array. See [Array](/reference/stdlib/array/).
- **An object's own methods are called through `self.`** inside a class: a bare name is a
  variable. See [Calling](/reference/language/methods/#calling).
- **Visibility is declared per method**, with `private def` (or `public def`). There are no
  `private` lines that change the methods after them, and no `protected`. See
  [Visibility](/reference/language/methods/#visibility).

## Variables

- **Methods read top-level variables**, which Ruby's can't; assigning inside a method still
  makes a local. See [Scopes](/reference/language/variables/#scopes).
- **`$name` is a variable of its file** that methods can assign, not a process-wide global,
  and there are no special variables like `$0`. See
  [Dollar variables](/reference/language/variables/#dollar-variables).
- **A variable exists once its assignment has run.** One assigned only in a branch that didn't
  run is a `NameError` when read, where Ruby gives `nil`.

## Values and operators

- **Every number is a float**: `10 / 4` is `2.5`, and there are no separate Integer and Float
  classes. See [Numbers](/reference/language/syntax/#numbers).
- **`and`, `or` and `not` are `&&`, `||` and `!`**, at the same precedence: `x = true and false`
  assigns `false`. See [Precedence](/reference/language/operators/#precedence).
- **`<`, `<=`, `>` and `>=` compare Numbers only**; `<=>` also orders Strings.
- **No `String * n`, `Array * n` or `Array - Array`**: they are `TypeError`s.
- **`a&.m.n` calls `n` on `nil`** when `a` is `nil`: `&.` skips only its own call. See
  [Safe call](/reference/language/operators/#safe-call).
- **`defined?` gives `true` or `nil`**, not a description.
- **A quoted key before `:` is a String**: `{ "a": 1 }` and `{ "a b": 1 }` key by the Strings
  `"a"` and `"a b"`, where Ruby makes Symbols. Write `{ :"a b" => 1 }` for a Symbol. See
  [Maps](/reference/language/syntax/#maps).
- **Heredocs aren't interpolated**, and `%W` and `%I` read as `%w` and `%i`. See
  [Heredocs](/reference/language/syntax/#heredocs).
- **No endless or beginless ranges** (`1..`).

## Control flow

- **A loop header ends at the line break**: `for x in xs do` and `while c do` are the compile
  error `misplaced-do`.
- **`begin ... end while cond` checks the condition first**, like any `while` modifier.
- **No `loop do ... end`**: write `while true`.

See [Control flow](/reference/language/control-flow/).

## Classes and errors

- **Built-in classes are sealed**: `Solid`, `Number`, `Array` and the rest can't be reopened
  or subclassed. Only the error classes can be subclassed. See
  [Built-in classes are sealed](/reference/language/classes-and-modules/#built-in-classes-are-sealed).
- **Operator methods can't be defined** (`def ==(other)`), and instances are equal only to
  themselves.
- **No `extend` or `module_function`**; `include` takes a module in a class body.
- **An index out of bounds is an `IndexError`** (`[1, 2][5]`), where Ruby gives `nil`.
- **`NoMethodError` is not a kind of `NameError`.** See
  [Error classes](/reference/language/errors/#error-classes).
- **`rescue` has no `else` clause, and a bare `raise` doesn't raise again**: write `raise e`.
- **Recursion has fixed limits**: 100,000 calls deep, 200 nested inside built-ins. Past either,
  `Call stack overflow` stops the run and can't be rescued. See
  [Recursion](/reference/language/methods/#recursion).
- **No `retry`, `alias` or `__method__`.** A script is deterministic, so a `retry` with nothing
  changed would fail again forever: write the fallback in the `rescue` clause. For a second
  name, define it: `def d = self.diameter`. All three read as undefined variables, so they fail
  when the line runs, not when the script is checked.
