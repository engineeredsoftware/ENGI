# LLM call-site prompt composition

**SSOT:** [`.docs/PROMPTING.md`](../../.docs/PROMPTING.md)

This file is a short pointer. Implementation:

| Concern | Package |
| --- | --- |
| Compose / apply / EE tree walk | `@bitcode/execution-generics` |
| Pipeline / phase attach | `@bitcode/pipelines-generics` |
| Failsafe/thinking role filter | `@bitcode/agent-generics` (thin) |
| PromptPart content | `@bitcode/prompts` `raw_promptparts/` |
