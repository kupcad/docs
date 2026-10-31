---
title: Introduction
description: Six real parts built step by step, then the craft around them — designing for the printer, structuring a big script, data, performance and quality — for people who already know the basics.
sidebar:
  order: 0
---

The guides teach KupCAD one idea at a time. This section is for when you know the ideas and
want to make things with them. It has two halves.

The first half is six builds, each a real object, made from the first line to the last with a
picture at every step: a fan wheel, a honeycomb storage wall with an insert for it, a hinge that
prints in one piece, a parabolic dish, a spiral staircase, and a jar with a screw-on lid. They
get harder as they go, and each one introduces something the ones before didn't need: trimming
with an intersection, positions computed by a method, print-in-place clearances, geometry from a
formula, sweeps along points, threads.

The second half is about the craft: how to design a part so it prints, how to keep a script
readable when it grows past a screen, how to drive a model from data and build it in CI, how
to keep it fast, and how to keep it correct.

## How a build goes

- **What's new** — what the build uses for the first time, each a link into the reference.
- **Let's go** — the build in numbered steps. Every step is a complete script: run it, look at
  the picture, change a number. Each step adds to the one before, so the scripts repeat
  themselves; that is deliberate, so you can run any step on its own.
- **Printing tips** — how to get the part off the printer right.
- **Make it yours** — a few changes to try on your own.
- **The whole script** — the finished, parametric version, which is also in the
  [examples folder](https://github.com/kupcad/kupcad/tree/main/examples) that ships with
  KupCAD. Press *Edit here* to open it on the page.

## What you should know

Everything in [The language](/guides/language/first-script/) and
[Making parts](/guides/parts/solids/): variables, methods, blocks, parameters, the basic solids
and sketches, booleans, extrude and revolve, assemblies. These pages don't explain those again.
They do say what every new thing is and link to its page in the reference.

Somewhere to run scripts: the [playground](https://kupcad.org/playground/), the
[IDE](https://kupcad.dev/), or the [`kupcad` command](/start/install/). The *Edit here* button
under a script runs it on the page.

## Contents

| | | |
|---|---|---|
| 1 | [Fan wheel](/mastering/fan-wheel/) | Leaning a shape about its own middle, trimming with `&`, copies round a circle |
| 2 | [Honeycomb wall](/mastering/honeycomb-wall/) | Methods, positions from arithmetic, `flat_map` and `reduce`, sizing from a bounding box, an insert that fits |
| 3 | [Hinge](/mastering/hinge/) | Print-in-place: clearances, alternating parts, measuring the gap, one file or many |
| 4 | [Parabolic dish](/mastering/parabolic-dish/) | A curve from a formula, lambdas, a section from two point lists, revolve |
| 5 | [Spiral staircase](/mastering/spiral-staircase/) | Resolution, sketch intersections, copies placed by index, a sweep along points |
| 6 | [Screw-top jar](/mastering/screw-top-jar/) | A turned body with an even wall, threads that fit, a twisted grip, mass, parameter groups |
| 7 | [Designing for the printer](/mastering/designing-for-the-printer/) | Orientation, overhangs, clearances, walls, cutting through, checking fits in the script |
| 8 | [Structuring a script](/mastering/structuring-a-script/) | From a script to methods, classes, files and packages, and when each is worth it |
| 9 | [Data-driven models](/mastering/data-driven-models/) | Structured parameters, JSON in and out, parts lists, building in CI |
| 10 | [Performance](/mastering/performance/) | Resolution, slices, fewer booleans, lazy geometry, measuring, memory, the engines |
| 11 | [Keeping it correct](/mastering/keeping-it-correct/) | Lint, format, assertions, errors, the debugger, scripts as tests |
| | [Where next](/mastering/where-next/) | What these pages left out, and where it is |

Next: [Fan wheel](/mastering/fan-wheel/).
