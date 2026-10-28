---
title: String
description: Text values, indexed by character, with case, splitting, padding, search and conversion methods and %-formatting.
sidebar:
  order: 4
---

A `String` is UTF-8 text. Strings are values that never change: every method returns a new
String. For how strings are written (quotes, escapes, interpolation with `"#{...}"`, heredocs
and `%q()`), see [Syntax](/reference/language/syntax/).

## Indexing and operators

A String is indexed by character, as an Array is by item: `s[0]` is the first character,
`s[-1]` the last, and `s[1..2]` the substring from the second to the third. An index past the
end is an `IndexError`.

`+` joins two Strings; anything else must be converted first or interpolated (`"#{n} mm"`).
`==` and `!=` compare by content, and `<=>` gives `-1`, `0` or `1` by byte order (`nil` against
a value that isn't a String). `<` and `>` aren't defined for Strings, and there is no `*`.

```kupcad
s = "héllo"
puts s[1]          # é
puts s[-1]         # o
puts s[1..3]       # éll
puts "M" + "3"     # M3
puts("a" <=> "b")  # -1
```

## String.new

```kupcad frame="none"
String.new(text = "")
```

The String `text`, or an empty one. **Returns:** `String`.

## Measuring

### length

```kupcad frame="none"
s.length
s.size
```

The number of characters (not bytes): `"héllo".length` is `5`. **Returns:** `Number`.

### include?

```kupcad frame="none"
s.include?(other)
```

Whether `other` occurs in the String. **Returns:** `Boolean`.

### starts_with?

```kupcad frame="none"
s.starts_with?(prefix)
s.start_with?(prefix)
```

Whether the String begins with `prefix`. **Returns:** `Boolean`.

### ends_with?

```kupcad frame="none"
s.ends_with?(suffix)
s.end_with?(suffix)
```

Whether the String ends with `suffix`. **Returns:** `Boolean`.

```kupcad
name = "bracket_left.kup"
puts name.length                # 16
puts name.include?("left")      # true
puts name.starts_with?("brack") # true
puts name.end_with?(".kup")     # true
```

## Changing

### upcase

```kupcad frame="none"
s.upcase
s.downcase
```

The String with its ASCII letters in upper case, or lower case. Other characters are kept as
they are: `"ÉCOLE".downcase` is `"École"`. **Returns:** `String`.

### reverse

```kupcad frame="none"
s.reverse
```

The characters in the opposite order. **Returns:** `String`.

### replace

```kupcad frame="none"
s.replace(target, replacement)
```

The String with every occurrence of `target` replaced by `replacement`. An empty `target` is
found before each character and at the end, as in Ruby: `"abc".replace("", "-")` is
`"-a-b-c-"`. (Ruby's `replace` swaps the whole content; this one is closer to Ruby's `gsub`
with a plain string.)

**Returns:** `String`.

### trim

```kupcad frame="none"
s.trim
s.strip
```

The String without the spaces, tabs, carriage returns and line feeds at its ends.
**Returns:** `String`.

### rjust

```kupcad frame="none"
s.rjust(width, pad = " ")
s.ljust(width, pad = " ")
```

The String padded to `width` characters: `rjust` puts the padding before it (right-justifying
it), `ljust` after. The padding repeats `pad`, cut to fit. A String already `width` long or
longer is returned as it is.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `width` | Number | — | The length to reach, in characters; a fraction is dropped. |
| `pad` | String | `" "` | What to fill with; not empty. |

**Returns:** `String`.

**Raises:** `ArgumentError` for an empty `pad` or a width that isn't finite; `RangeError` when
more than 1,000,000 characters would be added.

```kupcad
puts "7".rjust(3, "0")     # 007
puts "ab".ljust(5, "-.")   # ab-.-
puts "M3 bolt".replace("bolt", "screw")  # M3 screw
puts "  lid \n".trim.inspect             # "lid"
puts "Bracket".upcase                    # BRACKET
```

## Splitting

### split

```kupcad frame="none"
s.split(delimiter)
```

The pieces of the String between occurrences of `delimiter`, empty pieces included.
`split("")` gives the characters. The delimiter is required.

**Returns:** `Array` of Strings.

### chars

```kupcad frame="none"
s.chars
```

The characters, each a String (the same as `split("")`). **Returns:** `Array`.

**Raises:** `ValueError` when the String isn't valid UTF-8.

```kupcad
puts "a,b,,c".split(",").inspect   # ["a", "b", "", "c"]
puts "abc".chars.inspect           # ["a", "b", "c"]
```

## Converting

### to_f

```kupcad frame="none"
s.to_f
```

The String read as a number (`"2.5"`, `"-4"`, `"1e3"`), or `nil` when the whole String isn't
one: `"2.5mm".to_f` and `" 3".to_f` are `nil`, where Ruby reads what it can.

**Returns:** `Number` or `nil`.

### to_i

```kupcad frame="none"
s.to_i
```

The String read as a whole number in decimal digits (`"12"`, `"-5"`), or `nil` when the whole
String isn't one: `"3.5".to_i` is `nil`.

**Returns:** `Number` or `nil`.

### to_sym

```kupcad frame="none"
s.to_sym
```

The Symbol of that name: `"m3".to_sym` is `:m3`. **Returns:** `Symbol`.

### to_s

```kupcad frame="none"
s.to_s
```

The String itself. **Returns:** `String`.

```kupcad
puts "12".to_i + 1            # 13
puts "2.5".to_f * 2           # 5
puts "2.5mm".to_f.inspect     # nil
puts "m3".to_sym.inspect      # :m3
```

## Formatting

```kupcad frame="none"
format % value
format % [value1, value2, ...]
```

`%` fills in the directives of the format String from its right operand, as Ruby's `format`
does: from an Array's items in order, or from the one value. A directive is `%`, then optional
flags, a width and a precision (`.2`), and a conversion.

| Conversion | Writes |
|---|---|
| `%d`, `%i` | A whole number, the value truncated toward zero. |
| `%f` | A number with a fixed number of decimals (6 unless a precision is given). |
| `%e` | A number in scientific notation: `1.234568e+04`. |
| `%g` | A number as `%e` when its exponent is below -4 or at least the precision (6 by default), else as `%f`; trailing zeros dropped unless `#`. |
| `%x`, `%o`, `%b` | A whole number in hexadecimal, octal or binary. |
| `%s` | The value as `puts` shows it (a precision cuts it to that many characters). |
| `%p` | The value as `inspect` shows it. |
| `%%` | A `%` sign. |

| Flag | Effect |
|---|---|
| `-` | Left-justifies within the width. |
| `0` | Pads a number with zeros instead of spaces. |
| `+` | Writes a `+` before a positive number. |
| space | Writes a space before a positive number. |
| `#` | Writes the base's prefix (`0x`, `0`, `0b`), or keeps the point of a `%f` with no decimals. |

`%f` rounds the decimal digits the number prints with, halves away from zero, so
`"%.2f" % 2.675` is `"2.68"` (C's `printf` gives `2.67`).

**Returns:** `String`.

**Raises:** `ArgumentError` when the format has more directives than there are arguments, or
fewer (Ruby ignores extra arguments), or an unknown directive (`%c`).

```kupcad
puts "%05.1f mm" % 3.14159              # 003.1 mm
puts "%s x %d" % ["M3 bolt", 4]         # M3 bolt x 4
puts "%-6s|%6.2f|" % ["lid", 2.5]       # lid   |  2.50|
puts "%#x %b" % [255, 5]                # 0xff 101
puts "%d%%" % 50                        # 50%
```
