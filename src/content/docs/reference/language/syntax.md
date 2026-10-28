---
title: Syntax
description: How KupCAD source is read, from comments, statements, names and keywords to literals.
sidebar:
  order: 1
---

A KupCAD script is a `.kup` file of statements. Every statement is an expression with a value,
and the value of the script's last statement is its model.

## Source files

Source files are UTF-8. A file that isn't is reported as a syntax error
(`invalid-utf8`) at its first bad byte.

## Comments

`#` starts a comment that runs to the end of the line. There are no block comments: `=begin`
and `/* */` are not comments.

```kupcad
width = 40 # the plate's width
```

A comment whose text starts with `@` is a doc comment. `kupcad doc` reads a script's
`# @title`, `# @description` and `# @author` lines into its metadata (see
[Parameters](/reference/inputs/parameters/) and [Command line](/reference/tooling/cli/)).
Comments that start with `kupcad:` hide lint findings (see
[Lint rules](/reference/tooling/lint-rules/)).

```kupcad
# @title Mounting plate
# @description A plate with four bolt holes.
# @author KupCAD
cube(x: 40, y: 30, z: 4)
```

## Statements and lines

A statement ends at the end of its line. Several statements can share a line, separated by
`;`. Two statements side by side with no `;` (`puts 1 2`) are a syntax error.

```kupcad
a = 1; b = 2
puts a + b # 3
```

A statement goes on to the next line when:

- the line ends inside parentheses, brackets or braces;
- the line ends with a binary operator (`total = 10 -` then `4` is `10 - 4`) or a comma;
- the next line starts with `.`, which continues a chain of calls.

```kupcad
total = 10 -
  4
puts total # 6

r = [1, 2, 3]
  .map { |v| v * 2 }
  .sum
puts r # 12
```

A block's closing word ends the statement before it, so `if ok then 1 else 2 end` fits on one
line.

## Names

| Form | Example | Is |
|---|---|---|
| Lower case or `_` first | `width`, `_spare`, `empty?` | A local variable or a method |
| Upper case first | `Gear`, `TEETH` | A constant: a class, a module or a value |
| `@` first | `@teeth` | An instance variable |
| `@@` first | `@@count` | A class variable |
| `$` first | `$total` | A variable of the file, which methods can assign too |

A name is letters, digits and `_`, after a first character that isn't a digit. Letters outside
ASCII count (`café`). A name may contain `?` and `!`; by convention they end a method that
answers a question (`empty?`) or one that changes its receiver. See
[Variables and scope](/reference/language/variables/) for what each kind of name can see.

The names of built-ins (`cube`, `puts`, `text`, `params`, `Solid`, `Math` and the rest) can't
be assigned or redefined: `cube = 5` is the compile error `builtin-redefined`.

## Keywords

These words are reserved and can't name a variable or a method:

```kupcad frame="none"
and     as      begin   break   case    class   def     do
else    elsif   end     ensure  export  false   for     from
if      import  module  next    nil     not     or      private
public  rescue  return  self    super   then    true    unless
until   when    while   with    yield
```

`in` is reserved only after `for`'s variables, so `in:` still works as a keyword argument.
`defined?`, `block_given?` and `raise` are built in to the language too. Ruby's `loop`,
`retry`, `alias`, `lambda`, `proc` and `__method__` don't exist (see
[Differences from Ruby](/reference/language/ruby-differences/)).

## Numbers

Every number is a 64-bit float; whole numbers print without a decimal point. Lengths are in
millimetres; `2.cm`, `1.inch` and the other unit methods convert (see
[Number](/reference/stdlib/number/)).

| Literal | Value |
|---|---|
| `42`, `3.5`, `.5` | Decimal |
| `1_000_000` | `_` separates digits anywhere |
| `1.5e-3`, `2E3` | Exponent |
| `0xff`, `0b1010`, `0o17` | Hexadecimal, binary, octal |

A number beyond the largest float (`1e999`) is the compile error `invalid-number`. A minus
written against a number is part of it: `-2.abs` is `2`, while `-2 ** 2` is still `-4`.

```kupcad
puts 0xff      # 255
puts 1_000_000 # 1000000
puts 1.5e-3    # 0.0015
puts 10 / 4    # 2.5
```

## Strings

| Form | Interpolation | Escapes |
|---|---|---|
| `"..."` | `#{...}` | All of the table below |
| `'...'` | None | Only `\\` and `\'` |
| `%Q(...)` | `#{...}` | As `"..."` |
| `%q(...)` | None | Only `\\` and the closing delimiter |

`#{...}` evaluates the expression and inserts it as `puts` shows it. A `%q` or `%Q` literal takes
any punctuation as its delimiter; `(`, `[`, `{` and `<` pair with their closers and nest.

| Escape | Character |
|---|---|
| `\n`, `\t`, `\r`, `\f`, `\v`, `\b`, `\a`, `\e`, `\0` | Line feed, tab, carriage return, form feed, vertical tab, backspace, bell, escape, NUL |
| `\u00e9` | The code point in four hex digits |
| `\u{1F600}` | The code point in one to six hex digits |
| `\"`, `\\`, `\#`, `\ ` | A backslash before punctuation or a space stands for it |

Any other escape (`"\q"`, `"C:\data"`) is the compile error `invalid-escape`; write `\\` for a
backslash. In a single-quoted string every other backslash stays as written, so `'C:\data'`
is what it says.

```kupcad
x = 5
puts "x is #{x + 1}" # x is 6
puts 'x is #{x}'     # x is #{x}
puts 'C:\data'       # C:\data
puts %q(say "hi")    # say "hi"
```

Two string literals side by side are not joined: use `+`.

## Heredocs

A heredoc writes a string over several lines. Its body is the lines after the opener's line, up
to a line holding only the name.

| Opener | Body |
|---|---|
| `<<~NAME` | The indentation of the least indented line is removed from every line |
| `<<-NAME` | As written; the closing name may be indented |
| `<<NAME` | As written |

A heredoc is not interpolated: `#{...}` stays as text, while escapes are read as in a
double-quoted string. The rest of the opener's line is ordinary code, so `f(<<~EOS)` and
`<<~EOS.strip` work, and several heredocs opened on one line take their bodies in order.

```kupcad
note = <<~EOS
  first
    indented
  last
EOS
puts note.inspect # "first\n  indented\nlast\n"
```

## Symbols

A Symbol is an interned name: `:width`, `:m3`, `:empty?`, `:Foo`. A quoted symbol is read as
the string in the same quotes: `:"part_#{i}"` interpolates and `:'a b'` doesn't. There are no
operator symbols such as `:+`. See [Symbol](/reference/stdlib/symbol/).

```kupcad
i = 2
puts :"part_#{i}".inspect # :part_2
puts :"a b".inspect       # :"a b"
```

## Word lists

`%w[...]` is an Array of Strings and `%i[...]` an Array of Symbols, split at whitespace.
`%W` and `%I` read the same; neither interpolates.

```kupcad
puts %w[m3 m4 m5].inspect # ["m3", "m4", "m5"]
puts %i[m3 m4 m5].inspect # [:m3, :m4, :m5]
```

## Arrays

`[1, "two", :three]`. Elements can be any value, a trailing comma is allowed, and `*list`
spreads another Array's elements in place. See [Array](/reference/stdlib/array/).

```kupcad
size = [10, 20]
puts [*size, 5].inspect # [10, 20, 5]
```

## Maps

A Map keeps its entries in the order they were added. See [Map](/reference/stdlib/map/).

| Entry | Key |
|---|---|
| `width: 10` | The Symbol `:width` |
| `"w": 10`, `"a b": 10` | The String `"w"`, `"a b"`: a quoted key before `:` is a String, not a Symbol as in Ruby |
| `"w" => 10`, `k => 10`, `part.name => 10` | The value before `=>`, a variable's or a call's included |
| `width:` | `:width`, its value the variable `width` |
| `**other` | Every entry of the Map `other` |

```kupcad
width = 10
opts = { center: true }
puts({ width:, "w" => 2, **opts }.inspect) # {width: 10, "w" => 2, center: true}
puts({ "a b": 1 }.inspect)                 # {"a b" => 1}
```

A `{` right after a call opens a block, not a Map: write `puts({ a: 1 })`, not `puts { a: 1 }`.

## Ranges

`a..b` includes `b` and `a...b` leaves it out. Both ends are required; there are no endless or
beginless ranges. See [Range](/reference/stdlib/range/).

```kupcad
puts (1..3).to_a.inspect  # [1, 2, 3]
puts (1...3).to_a.inspect # [1, 2]
```

## nil, true and false

`nil` is the absence of a value. Only `nil` and `false` are falsy: `0`, `""` and `[]` are
truthy. See [Boolean and nil](/reference/stdlib/boolean-and-nil/).

## Lambdas

`->(x) { x * 2 }` and `->(x) do ... end` are lambdas, called with `.call`. See
[Blocks and lambdas](/reference/language/blocks-and-lambdas/).

## What follows a name

Spacing decides how a name and what follows it are read, as in Ruby:

- After a method name, `-1`, `+1`, `*xs`, `**opts`, `&blk` or `[...]` with a space before
  and none after is the first argument: `puts -1`, `extrude [0, 0, 10]`.
- After a variable (a local bound earlier, a parameter, a constant, an `@`, `@@` or `$`
  name), the same tokens are arithmetic or indexing: `x -1` is `x - 1`, `pts [0]` is
  `pts[0]`.
- A line break after an operator counts as a space before the next line, so an operator that
  ends its line is arithmetic.
- `name(` with no space holds the call's arguments. `name (` with a space only groups the
  first argument: `puts (1 + 2) * 3` prints `9`, and `f (1, 2)` is the compile error
  `spaced-parentheses`.
- A call without parentheses takes everything after it as arguments: `[f -1, 2]` is
  `[f(-1, 2)]`, so write `[f(-1), 2]`.

```kupcad
def show(*a) = a.inspect
x = 5
pts = [1, 2]
puts show -1        # [-1]
puts x -1           # 4
puts pts [0]        # 1
puts (1 + 2) * 3    # 9
puts [show(-1), 2].inspect # ["[-1]", 2]
```
