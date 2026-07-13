# Bitcode V26 Product Guide

This document is a current, non-canonical operator guide for the shipping V26 repository. Canonical truth remains `BITCODE_SPEC.txt` -> `BITCODE_SPEC_V26.md`; this file must not introduce product concepts that are absent from the V26 spec family.

## Product Shape

Bitcode V26 is the first commercial promotion of the source-to-shares system:

- `protocol-demonstration/` is the deterministic protocol witness and proof substrate.
- `uapi/app/application/*` is the Bitcode Terminal route for deposit, read, review, fit, settlement, and reread.
- `packages/api/*`, `uapi/app/api/*`, `packages/orm/*`, and Supabase schemas carry Bitcode Exchange state.
- `packages/asset-packs-pipelines/domain/*` carries Read-satisfaction AssetPack synthesis and Finish delivery.
- MCP, ChatGPT App, GitHub/VCS, webhooks, and other connections are admitted interfaces, not separate product owners.

## Terminal

The Terminal centers one activity ledger and three operator experiences:

- master-detail Bitcode activity under `/application`,
- conversations as rich-input ingress and fullscreen continuation,
- auxillaries for Profile, Connects, Interfaces, and `$BTD`.

Activity compatibility page lives under `/executions`.
Transactions write-space lives under `/application`.
Auxillaries live under `/auxillaries/*`.
Shared execution update carrier: `uapi/components/base/bitcode/execution/WorkUpdatePanel.tsx`.

The main operator actions are `give` and `read`. Repository choice, Read review, fit review, transaction readiness, proof follow-through, and closure rereads must all resolve through Bitcode-owned state rather than shell-only side effects.

## Exchange

The Exchange stores and rereads:

- source/provider connections and repository scope,
- conversations, attachments, and normalized rich input,
- execution rows, events, phases, and activity history,
- Read review and fit-quality receipts,
- AssetPack synthesis artifacts, written assets, Shippables, and delivery-mechanism evidence,
- settlement, proof, and operational telemetry.

Some storage table or column names still preserve compatibility vocabulary. Product language must read those rows as AssetPack evidence, Bitcode activity, BTD holding reads, or bounded storage carriers.

## AssetPack Pipeline

The current phased pipeline is SDIVF:

- Setup
- Discovery
- Implementation
- Validation
- Finish

Finish records evidence and can deliver the V26 Shippable through a GitHub pull request. Other delivery mechanisms are later-version design space unless admitted by the spec.

## Economics

BTC pays fees. `$BTD` is not a fungible checkout credit or spendable currency token. `$BTD` is a non-fungible AssetPack share/read-right and measured Bitcode content amount.

V26 reads `$BTD` holdings and BTC fee posture; V27 owns full `$BTD` tokenomics. V27+ issuance must respect the 21,000,000 `$BTD` mintable ceiling recorded in `packages/btd`.

## Interfaces

Admitted interfaces must return write-admission metadata and fail closed without readiness:

- MCP API for Exchange-facing execution and activity operations,
- ChatGPT App for confirmed connected-interface writes,
- GitHub/VCS providers for repository scope and pull-request delivery,
- webhooks and external-realization routes for bounded ingress.

Interfaces can submit, continue, or deliver Bitcode work. They do not own separate state machines.

## Version Staging

- V27: `$BTD` tokenomics.
- V28: Terminal.
- V29: Exchange.
- V30: external connections and interfaces.
- V31: Proven Protocol across specification, demonstration minimal product, commercial product rails, testnet/mainnet workability, telemetry, and alerts.
