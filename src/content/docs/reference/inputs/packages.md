---
title: Packages
description: Depend on KupCAD libraries from git hosts or archives, with kupcad.json, kupcad.lock and kupcad pkg.
sidebar:
  order: 6
---

A package is a folder of KupCAD files, usually a git repository, that a project imports by an
alias. A project lists its dependencies in `kupcad.json`; `kupcad pkg install` downloads them,
pins each in `kupcad.lock`, and links them into the project's `.kupcad/pkg/`.

```sh
kupcad pkg init
kupcad pkg add hardware=github.com/kupcad-libs/hardware@^1.2
```

```kupcad
import { bolt } from "hardware"                # the package's main.kup
import { LENGTHS } from "hardware/screws.kup"  # another of its files

bolt(LENGTHS[0])
```

## kupcad.json

```json
{
  "name": "bracket",
  "version": "0.1.0",
  "dependencies": {
    "hardware": "github.com/kupcad-libs/hardware@^1.2",
    "fonts": "gitlab:git.example.com/team/fonts@main"
  }
}
```

| Key | Description |
|---|---|
| `name` | The project's name. Required. |
| `version` | The project's version. Required. |
| `dependencies` | Each dependency's alias and where it comes from. |

The file may hold other keys (a `description`, a `license`); `kupcad pkg add` keeps them where
they are and writes the dependencies sorted by alias.

An alias is up to 64 letters, digits, `_`, `.` and `-`, not starting with `.` or `-`.

## Importing a package

An import path that doesn't start with `./` or `../` names a package by its alias:

- `import { Screw } from "hardware"` runs the package's `main.kup`;
- `import { Screw } from "hardware/screws.kup"` runs another of its files;
- `import data from "hardware/screws.json"` reads one of its data files.

A package's files are those of its repository. A package's own `kupcad.json` dependencies are
installed with it, but a downloaded package may only depend on packages from public git hosts,
not on a `file:` path, an archive URL or a self-hosted server. See
[Imports and exports](/reference/language/imports/) for the import syntax.

## Dependency sources

| Source | Form |
|---|---|
| A public git host | `<host>/<user>/<repo>[@ref]` on `github.com`, `gitlab.com`, `codeberg.org` or `gitea.com` |
| A self-hosted GitLab | `gitlab:<host>/<user>/<repo>[@ref]` |
| A self-hosted Gitea | `gitea:<host>/<user>/<repo>[@ref]` |
| An archive on disk | `file:<path>`, a `.tar.gz` file |
| An archive on the web | an `http://` or `https://` URL of a `.tar.gz` file |

An unknown host without a `gitlab:` or `gitea:` prefix is an error, since its API can't be told
from its name. Only gzipped tarballs are installed; a `.zip` URL is refused with that reason.

A git host wraps its archives in a top folder (`repo-<sha>/`), which is stripped, so the
repository's files are the package's. A `file:` or web archive is the package as it is, so make
it from inside the package's folder:

```sh
tar czf part.tar.gz -C part .
```

### Refs and versions

`@ref` picks what to install from a git host. Without one it is `main`.

| Ref | Means |
|---|---|
| `@main`, `@v1.2.3`, `@3f9c2e1` | A branch, a tag or a commit. A bare version is that tag. |
| `@^1.2` | The highest version tag with the same left-most non-zero part: `1.x.y` from 1.2 up. |
| `@~1.4` | The highest version tag with the same major and minor: `1.4.x`. |
| `@>=2.0` | The highest version tag from 2.0 up. |
| `@=1.2.3` | Exactly that version's tag. |

Version tags are `v1.4.2` or `1.4.2`. Tags that aren't versions, pre-releases included, are
skipped, and the newest thousand or so tags are searched. `kupcad.lock` keeps the commit a range
resolved to until the range in `kupcad.json` changes.

## kupcad.lock

`kupcad pkg install` writes `kupcad.lock` beside `kupcad.json`. It pins each dependency to a
commit (or, for an archive, a content hash) and an `integrity` hash of the package's files:

```json
{
  "version": "1.0.0",
  "packages": {
    "github.com-kupcad-libs-hardware-1a2b3c4d": {
      "resolved": "9f3c2e1b...",
      "ref": "^1.2",
      "integrity": "sha256-..."
    }
  }
}
```

- An entry is keyed by the package at its ref, so one repository at two refs is two entries.
  Entries no install visits are dropped when the file is saved.
- Every install verifies both cached and downloaded packages against the integrity hash, and
  fails on a mismatch. An entry without an integrity hash is refused.
- The lockfile format is `1.0.0`. Any `1.x` file is read and saved back as `1.0.0`; another major
  version, or none, is refused: upgrade kupcad or delete `kupcad.lock`.
- The file isn't written when resolving, verifying or linking fails.

Commit `kupcad.lock` with the project, so every checkout installs the same files.

## The store

Packages are kept once for every project, in `~/.kupcad`, or in `KUPCAD_HOME` when it is set (an
absolute path; empty counts as unset). Each file is stored by its content and hard-linked into
the projects that use it (copied where the store is on another device), as
`.kupcad/pkg/<alias>`.

The store is shared by every project and every `kupcad` process: a write to its index waits up to
5 seconds for another process's lock rather than failing.

## kupcad pkg

```sh
kupcad pkg init
kupcad pkg add <alias>=<source>
kupcad pkg install
kupcad pkg prune [--force]
kupcad pkg doctor
```

| Command | Does |
|---|---|
| `init` | Writes a new `kupcad.json` in the current directory. Where one exists, it changes nothing and fails. |
| `add <alias>=<source>` | Installs the dependency and links it, then adds it to `kupcad.json`. A failed `add` leaves the project as it was. |
| `install` | Installs every dependency of `kupcad.json`, as pinned by `kupcad.lock`, and links them into `.kupcad/pkg/`. Re-resolves only refs that aren't locked or that `kupcad.json` changed. |
| `prune` | Removes from the store what no project uses. A file stays while a project links it, or while it, or a package an install used, is less than 7 days old. `--force` drops the age rule. |
| `doctor` | Checks the store: hashes each file against its name, removes a changed one, and indexes stray files that are named for their own content. |

An install prunes the store on its own, at most once a week. Where the store is on another
device than the project, the project holds copies, so only the store's index can tell that a
package is in use.

## Downloads

- Redirects: at most 5, and never to a less trusted place: not from `https` to `http`, and not
  from a public host to a private one (loopback, an IP address, an intranet name).
- A request that receives nothing for 30 seconds is abandoned, from its start until its body
  begins and then between any two parts of its body. A slow download that keeps coming takes as
  long as it needs.
- An archive's symbolic and hard links are skipped, and entries with absolute paths, `..`, or
  two names for one file on a case-insensitive disk are refused.

| Limit | Value |
|---|---|
| An archive, downloaded | 256 MiB |
| An archive, extracted | 1 GiB |
| Files in an archive | 50,000 |
