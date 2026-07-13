# TODO — Bitcode ChatGPT App

1. **Harden DevOps adapters**
   - Replace the AWS/Vercel placeholder responses with recorded fixtures or live SDK integrations.
   - Document credential requirements and confirmation flows in `README.md`.

2. **Improve `code_design` output**
   - Funnel generated patch stubs into an automated diff synthesiser so demos can show realistic edits.
   - Add regression checks that the tool always references `.ai/PRODUCT.md` sections it implements.

3. **Author reusable design assets**
   - Capture a canonical Yapper wireframe (PNG + base64 snippet) for `depict_design_asset`.
   - Store the asset pointer in `DEMO.md` so every run references the same visual.

4. **Scripted verification**
   - Build a lightweight CLI harness that runs each tool with the sample payloads from `DEMO.md`.
   - Output results as markdown so the demo team can sanity-check before recording.

5. **App Store polish**
   - Align ChatGPT App metadata, screenshots, and teaser copy with the ten canonical tools.
   - Confirm negative-prompt refusals match OpenAI UX guidelines.

6. **Digest alignment**
   - Wire `design_code` to lean on `@bitcode/digest` primitives for first PRODUCT.md drafts.
   - Prototype digest-to-AGENTS.md scaffolding so behaviour guidance inherits pattern metadata.
