---
title: Build and check in CI
description: Lint, build and export a project's parts, with the parts list, on every push.
sidebar:
  order: 4
---

Every `kupcad` command exits 0 on success and 1 on any failure, so each is a CI step. A project
with its scripts in `parts/`:

```yaml title=".github/workflows/build.yml"
name: Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - name: Install KupCAD
        env:
          GH_TOKEN: ${{ github.token }}
          VERSION: '0.1.5'
        run: |
          gh release download "v$VERSION" --repo kupcad/kupcad --pattern "kupcad_${VERSION}_linux_amd64.tar.gz"
          tar xzf "kupcad_${VERSION}_linux_amd64.tar.gz"
          echo "$PWD" >> "$GITHUB_PATH"
      - run: kupcad fmt --check .
      - run: kupcad check --max-warnings 0 .
      - run: kupcad build parts/bracket.kup -o out/bracket.3mf --bom out/bracket.json
      - run: kupcad build parts/bracket.kup --split out/parts/
      - uses: actions/upload-artifact@v7
        with:
          name: parts
          path: out/
```

- `fmt --check` fails on a script that isn't formatted; `check --max-warnings 0` fails on any
  lint finding.
- `--bom` writes the parts list as JSON: each part's name, count, volume, size and mass.
- `--split` writes each part to its own STL, named after it, for printing.
- A parameter set differs per build: `-p width=50`, or `-P sizes.json` for several.

Pin the version, as above, so a build is the same next month. The
[releases](https://github.com/kupcad/kupcad/releases) have archives for Linux, macOS and
Windows, with `checksums.txt` to verify them.

[Command line](/reference/tooling/cli/) · [Parts lists](/reference/geometry/assemblies/#parts-lists)
