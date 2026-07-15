# Bitcode Prompt Trace Notes

Status: non-canonical internal note.

## Purpose

Prompt tracing should show how a Bitcode agent, tool, phase, or step receives its final prompt text.

Trace output should include:
- prompt owner,
- PromptParts used,
- registry keys,
- phase/agent/tool identity,
- Read or AssetPack context,
- required JSON/schema hints,
- failsafe context,
- proof or benchmark metadata where available.

## Usage Pattern

Trace package-local prompt factories rather than assembling raw strings by hand.

Preferred flow:
1. import the package-local prompt factory,
2. instantiate the Prompt,
3. inspect registry keys and PromptPart values,
4. render the composed prompt,
5. compare output against V26 Bitcode wording requirements.

## Trace Acceptance

A prompt trace is useful only if it proves:
- the prompt is Bitcode-owned,
- the prompt composes through registries,
- the prompt describes the correct Read/fit/AssetPack/Finish responsibility,
- old compatibility names do not leak into user-facing or agent-primary semantics.

