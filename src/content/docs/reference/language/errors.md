---
title: Errors
description: Raising and rescuing errors, the error classes, and the codes of the errors found before a script runs.
sidebar:
  order: 8
---

A mistake is found at one of two times:

- **Before the script runs**, a syntax or compile error, such as an unclosed parenthesis or
  `cube = 5`. `kupcad check`, `kupcad build` and the editor report it with its file, line and
  column and a [code](#compile-error-codes): `part.kup:2:1: E: 'cube' is a built-in and can't
  be assigned [builtin-redefined]`. It can't be rescued.
- **While it runs**, an error raised as an instance of an [error class](#error-classes), which
  a script can rescue.

## raise

| Form | Raises |
|---|---|
| `raise "message"` | A `RuntimeError` with the message |
| `raise Klass, "message"` | `Klass.new("message")` |
| `raise Klass` | An instance of `Klass` whose message is the class's name |
| `raise error` | The error object `error`, such as one rescued earlier |

There is no bare `raise` to raise again the error being rescued: write `raise e`.

## begin, rescue and ensure

```kupcad frame="none"
begin
  ...
rescue ErrorClass, OtherClass => e
  ...
rescue => e
  ...
ensure
  ...
end
```

The `rescue` clauses are tried in order. A clause catches an error that is an instance of one
of its classes, or of a subclass; a clause with no class catches any error. `=> e` binds the
error. A class can be named by its scoped path (`rescue Parts::FitError`), or by its bare name
inside the module that defines it.

`ensure` runs however the `begin` is left: normally, after a `rescue`, by `return`, `break` or
`next`, or by an error nobody rescued, which goes on after it. An error raised inside `ensure`
replaces the one in flight. The one exception is a block's `break` that leaves a method through
`yield`: the method is abandoned at once, and `ensure` bodies pending in it don't run.

The value of `begin ... end` is its body's last value, or the rescuing clause's; `ensure`
doesn't change it. A `def` body can take `rescue` and `ensure` clauses directly, without a
`begin`. There is no `else` clause and no `retry`: a script is deterministic, so write the
fallback in the `rescue` clause.

```kupcad
width = -1
plate = begin
  cube(x: width, y: 20, z: 3)
rescue ValueError => e
  puts "bad width: #{e.message}"
  cube(x: 10, y: 20, z: 3)
end

def ratio(a, b)
  a / b
rescue ZeroDivisionError
  0
ensure
  puts "ratio done"
end

puts ratio(1, 0) # 0
plate
```

## The rescue modifier

`statement rescue fallback` evaluates `fallback` when `statement` raises. It covers the whole
statement, as Ruby's does: `parts.push make_part(spec) rescue parts.push(fallback)` pushes one
of the two, and `x = f y rescue 0` assigns either. Within brackets, it covers what is in them.

```kupcad
x = (1 / 0 rescue 0)
puts x # 0
```

## Error objects

| Method | Gives |
|---|---|
| `message`, `to_s` | The message alone, without the class |
| `class` | The error's class |
| `backtrace` | The calls the error passed through, an Array of Strings |

## Error classes

Every class below is a subclass of `StandardError`, which is a subclass of `Exception`.

| Class | Raised for |
|---|---|
| `ArgumentError` | Wrong number of arguments, a missing block, a keyword the method doesn't take (the message lists the accepted ones), more positional arguments than it takes |
| `TypeError` | A value of the wrong type: `polygon([[0, 0], [1, "x"], [0, 1]])`, `5[0]`, `"a" + 1` |
| `ValueError` | A value of the right type that is out of range or not finite: `cube(-1)`, `segments: 1e9` |
| `IndexError` | An Array or String index out of bounds: `[1, 2][5]` (Ruby gives `nil`) |
| `KeyError` | A key that a JsonObject's `fetch` or `dig` doesn't find |
| `RangeError` | A number outside what can be represented: `2 ** 1024`, a bitwise operand beyond 64 bits |
| `ZeroDivisionError` | Division by zero |
| `MathError` | An operation whose result is no number: `(-1) ** 0.5`, `Math.sqrt(-1)` |
| `NameError` | An undefined variable, constant or member |
| `NoMethodError` | An unknown method, or a private one called from outside |
| `ImportError` | A module, data file, mesh, font or drawing that can't be read, parsed or compiled; a circular import |
| `NotImplementedError` | A feature the active geometry engine doesn't support yet |
| `GeometryError` | The geometry kernel failed an operation or produced an invalid solid |
| `OutOfMemoryError` | The script's heap went past its memory limit (see [Configuration](/reference/tooling/configuration/)) |
| `AssertionError` | A failed `assert` |
| `RuntimeError` | `raise "message"`, and other failures at run time |

`NoMethodError` is not a subclass of `NameError`, as it is in Ruby: rescue each by its name.

A built-in never ignores what it is given: an extra argument, a keyword it doesn't take, or a
`nil` where a shape belongs is an error, not dropped. `nil` for an optional parameter leaves it
unset, as if it weren't passed.

## Your own errors

Subclass `StandardError` (the built-in error classes are the only built-in classes that can be
subclassed). `raise Klass, "message"` passes the message to `initialize`; a class with its own
`initialize` passes a message on with `super(message)`.

```kupcad
class FitError < StandardError
  def initialize(gap)
    super("a gap of #{gap} mm is too tight")
    @gap = gap
  end

  def gap = @gap
end

begin
  raise FitError.new(0.05)
rescue FitError => e
  puts e.message # a gap of 0.05 mm is too tight
  puts e.gap     # 0.05
end
```

## Uncaught errors

An error nobody rescues stops the script. It is printed once, with its class, its message and
the calls it passed through (the main script is `script`, an imported file by its name), and
the command exits with status 1:

```text
error(vm): ValueError: cube expects x to be a finite number greater than zero, got -1
error(vm):     from script:3:5:in 'script'
```

A recursion deeper than the limits (see [Methods](/reference/language/methods/#recursion))
stops the run with `Call stack overflow`, which `rescue` doesn't catch.

## Compile error codes

A compile error's message may be reworded in any release; its code stays, so match or search
for the code. The editor gets it as the diagnostic's code, `kupcad check --format json` as
`code`, and SARIF as the `ruleId`.

| Code | Means |
|---|---|
| `invalid-utf8` | The source isn't valid UTF-8. |
| `unexpected-character` | A character that starts no token, outside a string or comment (`x = $`). |
| `unterminated-string` | A string, symbol or `%`-literal never closed before the end of the file. |
| `unterminated-heredoc` | A heredoc whose closing line never comes. |
| `runs-into-heredoc` | A line that runs on into the body of a heredoc it opened. |
| `invalid-escape` | A backslash in a string that starts no escape (`"\q"`), or a `\u` escape that names no character. |
| `invalid-number` | A malformed number, or one beyond the largest (`1e999`). |
| `unexpected-token` | Something other than what the syntax needs here, such as an unclosed parenthesis (`cube(1`). |
| `invalid-expression` | A token that can't start an expression (`x = )`). |
| `invalid-assignment` | An assignment to a call (`f() = 1`), or to several names with an operator other than `=` (`a, b += 1`). |
| `nesting-too-deep` | Code, or interpolation in a string, nested deeper than the limit. |
| `misplaced-import` | An `import` or `export` inside a method, class or block; they belong at the top level. |
| `import-without-from` | An `import` without its `from` path. |
| `import-attribute` | An import's `with { }` with a key other than `type`, or a type that names nothing an import reads. |
| `file-import-names` | An import of a mesh or a font in braces, or of any file naming more than one variable without braces. |
| `misplaced-do` | A `do` after a `while`, `until` or `for` header, which ends at the line break. |
| `spaced-parentheses` | Several arguments in parentheses with a space before them (`f (1, 2)`). |
| `invalid-parameter` | A parameter that can't be one: an `@`, `@@` or `$` name, a second splat, a block for a block parameter. |
| `unexpected-block` | A call given two blocks (a `&block` argument and a `do` or `{ }` block), or `yield` given one. |
| `misplaced-splat` | A `*` or `**` outside an array, a map or a call's arguments. |
| `outside-loop` | A `break` or `next` outside a loop or block, or a `break` in a lambda. |
| `outside-method` | A `yield`, `block_given?` or `super` outside a method. |
| `builtin-redefined` | A built-in, such as `cube`, assigned or redefined. |
| `import-collision` | An import named like a variable of the file. |
| `too-many-parameters` | A method or block with more than 255 parameters. |
| `too-many-arguments` | A call with more than 255 arguments. |
| `too-many-variables` | A function with more than 65,535 variables, or more than 255 captured from outside. |
| `too-many-constants` | A function with more than 65,535 literals and names, or a map literal with more than 32,767 entries. |
| `too-many-calls` | A script with more than 65,536 method calls. |
| `too-many-global-uses` | A script with more than 65,536 uses of top-level variables. |
| `out-of-memory` | Memory ran out while compiling. |
| `internal-error` | A bug in KupCAD's compiler; please report it with the script. |

Lint findings, which `kupcad check` also reports, have rules rather than codes: see
[Lint rules](/reference/tooling/lint-rules/).
