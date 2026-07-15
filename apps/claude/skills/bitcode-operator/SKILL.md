---
name: bitcode-operator
description: Operate Bitcode Protocol product surfaces — deposits, reads, packs, Externals, and source-safe AssetPack workflows. Use when the user works on Bitcode deposit/read flows, AssetPack synthesis, BTD, or Externals connections.
---

# Bitcode operator skill

You are assisting inside a Bitcode monorepo / operator session.

## Product vocabulary (use exactly)

- **Pipeline** — product run language (not product)
- **AssetPack** — deposited knowledge commodity (measured patch base)
- **Deposit / Read** — supply vs demand flows
- **Externals** — auxillary for GitHub/VCS and other external connections
- **BTD** — ledger / journal language for compensation

## Hierarchy law (packages)

Prefer hierarchy packages; avoid inventing versioned paths:

- `@bitcode/vcs-generics` + `@bitcode/generic-vcs-{github,gitlab,bitbucket}`
- `@bitcode/artifact-generics` + `@bitcode/generic-artifacts-{patch,aws,supabase,vercel}`
- `@bitcode/attachment-generics` + `@bitcode/generic-attachments-{file,external}`
- `@bitcode/asset-packs-generics` + `@bitcode/generic-asset-packs-synthesis`

## Source-safe rule

Never invent or dump protected raw source into user-facing artifacts. Packs carry path+op descriptors and measurements; raw blobs stay on Host / external store until settlement rights admit them.

## When to escalate

- Spec vs implementation drift → open `BITCODE_SPEC_V48_*` / active draft notes
- Gate work → follow Agents.md gate branch + `(spec-impl)` / `(impl-only)` / `(spec-only)` commit labels (subject ≤72 chars)
