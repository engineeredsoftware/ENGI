# Doc-Comments – Next Steps for Real Benchmarking

Context: All Prompts and PromptParts now have 0.50.0 PBV and baseline benchmark blocks. To move from static metadata to actionable benchmarking:

- Add a doc-comment dependency injector (TODO):
 - Parse each Prompt’s `.set(path, Part)` calls at build time.
 - Extract the Part symbol and resolve the source file to compute a dependency graph.
 - Inject a canonical `dependencies: { PartName: "0.50.0" }` object into the prompt’s doc-comment.
 - Flag dangling or missing dependencies in CI.

- Benchmark harness (TODO):
 - Add a script to load Prompts from the renderer and run a configurable set of LLM evaluations (unit-style and integration-style), recording pass/fail and scores.
 - Write per-prompt/per-part results to a central store (JSON/CSV) with rolling aggregates.

- PBV automation (TODO):
 - When benchmarks improve, auto-bump PBV in doc-comments (e.g., `generation`/`variant` fields), and emit a patch summary for review.

- CI wiring (TODO):
 - Gate merges on doc-comment validation and a minimal benchmark baseline.

Scripts in place now:
- `scripts/normalize-all-promptparts.mjs` – Normalize PBV and ensure benchmark blocks.
- `scripts/enrich-doc-intents.mjs` – Replace placeholder intents with filename-derived titles.
- `scripts/normalize-all-prompts.mjs` – Normalize PBV + benchmarks for Prompts.
- `scripts/validate-doc-comments.mjs` – Validate coverage (PBV, benchmarks, intents) repo-wide.
- `scripts/render-prompts.mjs` – Render Prompts (DataPack compatibility execution/generic-agents/generic-tools) to master docs.

Suggested implementation approach (Tx 1–2):
- Build a simple AST walker to identify `Prompt.set('path', SYMBOL)` calls and map SYMBOL to its source file.
- Maintain a `dependencies` JSON for each prompt that can be injected in the doc-comment or kept in a sidecar file.
