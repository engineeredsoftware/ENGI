# Bitcode ChatGPT App Interface Notes

Status: non-canonical internal note.

## Purpose

The ChatGPT App is an admitted connected interface over Bitcode Exchange state.

It can:
- gather Read/Deposit context,
- show source and evidence summaries,
- request Read measurement,
- present Read review state,
- show fit qualities,
- deliver AssetPack receipts,
- emit connected-interface write-admission receipts.

It must not:
- own Exchange state,
- bypass Terminal/Exchange proof requirements,
- write unconfirmed connected-interface changes,
- write connected-interface changes without owner-read or licensed-read registry evidence for the relevant AssetPack,
- use generic work-board examples as Bitcode product semantics.

## Gate 6 Read-Access Admission

Write-capable ChatGPT App tools require two independent admission facts:

- `confirmed: true` from the user interaction.
- `readAccess` evidence with AssetPack id, wallet id, decision, access-policy hash, and reason.

The only admitted write decisions are `owner_read` and `licensed_read`. A balance,
organization total, or generic account role is not enough to write through a
connected interface.

## Requirements For SPEC Promotion

- tool names must be Bitcode-specific,
- output payloads must normalize to Read, fit, AssetPack, proof, settlement, or delivery evidence,
- UI components must distinguish model-visible content from component-only hydration data,
- authentication and authorization must fail closed for user-specific or write-capable data.
