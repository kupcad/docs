---
title: Global functions
description: puts, print, inspect, warn, assert, benchmark and debugger, and where the other global functions are documented.
sidebar:
  order: 1
---

These functions are called by name from anywhere in a script, with or without parentheses. Each
is also a class method of `Kernel`: `Kernel.puts("x")` is `puts("x")`.

**Where output goes.** Under `kupcad build`, `kupcad run` and `kupcad watch`, what these
functions print goes to stderr, so it never mixes with a model written to stdout. A preview's
run (in the editor, the desktop app or the playground) keeps it instead, for the console beside
the model: the first 64 KiB of it.

## puts

```kupcad frame="none"
puts(*values)
```

Writes each value on a line of its own. A String or a Symbol is written bare, an instance by
its class's `to_s` when it defines one (which must return a String), and anything else as
`inspect` shows it, an Array on one line. `nil` is written as `nil`. With no arguments, `puts`
writes nothing.

**Returns:** `nil`.

```kupcad
puts "Generating parts..."
puts 1, [2, [3]], :m3, nil
```

```text title="stderr"
Generating parts...
1
[2, [3]]
m3
nil
```

## print

```kupcad frame="none"
print(*values)
```

Writes each value as `puts` does, one after another with nothing between them and no line
break after the last.

**Returns:** `nil`.

```kupcad
print "width: ", 40, "\n"
```

## inspect

```kupcad frame="none"
inspect(*values)
```

Writes each value on a line of its own as `.inspect` shows it (Strings quoted, Symbols with
their colon), after the line and column of the call. An instance is shown by its class's
`inspect`, or by its `to_s` when the class defines only that.

**Returns:** its last argument, or `nil` with none. A value can be inspected where it is used:
`w = inspect(width * 2)` prints it and still assigns it.

```kupcad
width = 20
w = inspect(width * 2)   # prints [line 2, col 5] 40
inspect("bolt", :m3)     # prints [line 3, col 1] "bolt", then [line 3, col 1] :m3
```

## warn

```kupcad frame="none"
warn(*values)
```

Writes `[Warning] ` and then its values, each as `puts` shows a built-in value, with nothing
between them and a line break after. The script goes on: to stop it, `raise` or `assert`.

**Returns:** `nil`.

```kupcad
wall = 1.2
warn("the wall is ", wall, " mm, under 1.5 mm") if wall < 1.5
# [Warning] the wall is 1.2 mm, under 1.5 mm
```

## assert

```kupcad frame="none"
assert(condition, message = "Assertion failed.", error_class = AssertionError)
assert(condition) { message }
```

Raises when `condition` is `false` or `nil`, and does nothing otherwise.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `condition` | any | — | What must hold. Only `false` and `nil` fail. |
| `message` | String | `"Assertion failed."` | The error's message. |
| `error_class` | Class | `AssertionError` | The class of the error raised. |
| block | — | — | Builds the message, called only when the assertion fails. It must return a String. |

**Returns:** `nil`.

**Raises:** `AssertionError` (or `error_class`) when the condition fails; `TypeError` when the
message isn't a String. A `break` in its block is an `ArgumentError`.

```kupcad
thickness = 3
assert(thickness > 0, "Thickness must be positive")
assert(thickness < 10, "too thick", ValueError)
assert(thickness.integer?) { "thickness #{thickness} isn't whole" }
```

## benchmark

```kupcad frame="none"
benchmark(label = "Execution") { ... }
```

Runs its block, writes `[Benchmark] label: 1.234 ms` with the time it took, and returns what
the block returned. The geometry kernel runs an operation on shapes when a shape is measured or
exported, not when the operation is called, so the time includes the kernel's work only when
the block measures a shape (`.volume`, `.bbox`). A `break` in its block is an `ArgumentError`.

**Returns:** the block's value.

```kupcad
n = benchmark("totals") { (1..1000).map { |i| i * i }.sum }   # [Benchmark] totals: 0.123 ms
puts n                                                         # 333833500
```

## debugger

```kupcad frame="none"
debugger()
```

Pauses the script and opens an interactive prompt on stderr, when `kupcad build` or
`kupcad watch` runs from a terminal. Anywhere no one could answer it (piped input, `kupcad run`,
the language server, the viewport, the browser) it does nothing, so a forgotten breakpoint
never stalls a build or an editor.

At the prompt, an expression is evaluated in place, and these commands are available:

| Command | Short | Does |
|---|---|---|
| `.step` | `.s` | Runs to the next line and stops again. |
| `.continue` | `.c` | Resumes the script. Ctrl+D does the same. |
| `.locals` | `.l` | Shows the local variables. |
| `.stack` | `.st` | Shows the call stack. |
| `.globals` | `.g` | Shows the top-level variables. |
| `.help` | `.h` | Lists the commands. |
| `.quit` | `.q`, `.exit` | Stops the run, which then fails. Ctrl+C does the same. |

**Returns:** `nil`.

## Other global functions

| Functions | Documented in |
|---|---|
| `cube`, `cylinder`, `sphere`, `torus`, `polyhedron` | [Solids](/reference/geometry/solids/) |
| `square`, `circle`, `regular_polygon`, `polygon`, `text` | [Sketches](/reference/geometry/sketches/) |
| `line`, `polyline`, `arc` | [Paths](/reference/geometry/paths/) |
| `union`, `batch_hull` | [Booleans and hulls](/reference/geometry/booleans/) |
| `assemble` | [Assemblies and parts lists](/reference/geometry/assemblies/) |
| `ghost`, `highlight` | [Materials, names and display](/reference/geometry/appearance/) |
| `param`, `params` | [Parameters](/reference/inputs/parameters/) |
| `import_json` | [Data files](/reference/inputs/data-files/) |
| `import_stl`, `import_obj`, `import_3mf`, `import_step` | [Meshes and STEP](/reference/inputs/meshes/) |
| `import_dxf`, `import_svg` | [Drawings](/reference/inputs/drawings/) |
| `import_font` | [Fonts](/reference/inputs/fonts/) |
| `raise` | [Errors](/reference/language/errors/) |
| `yield`, `block_given?` | [Blocks and lambdas](/reference/language/blocks-and-lambdas/) |

The built-in names can't be assigned or redefined: `cube = 5` is the compile error
`builtin-redefined`.
