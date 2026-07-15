# Specifications

**All Bitcode specification documents live in this directory.**

| Kind | Pattern / file |
| --- | --- |
| Active pointer | `BITCODE_SPEC.txt` |
| Specifying law | `BITCODE_SPECIFYING.md` |
| Template guide | `BITCODE_SPEC_TEMPLATEGUIDE.md` |
| Version roadmap | `SPECIFICATIONS_ROADMAP.md` |
| Version family | `BITCODE_SPEC_VNN.md`, `_DELTA`, `_NOTES`, `_PARITY_MATRIX`, `_PROVEN` |

Do not place living SPEC family markdown at the monorepo root. Agents and scripts
resolve paths under `.specifications/` (see `scripts/bitcode-spec-paths.mjs` and
`scripts/specifying` path helpers).

Executable specifying machinery remains under `scripts/specifying/` (`@bitcode/specifying`).
