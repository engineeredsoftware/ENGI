# Bitcode V29 QA Ledger

## Purpose

This ledger records V29 Terminal-depth and promotion-readiness QA.
It is source-safe: environment values, tokens, database passwords, OIDC tokens,
OpenAI keys, Supabase service roles, and wallet material stay in untracked
environment files or external systems.

## Gate 10 Local And Staging Promotion Readiness QA

Gate 10 closes when `version/v29` is ready to be pull-requested into `main` and
promotion automation can advance canon without hand edits.

Required local proof:

- `pnpm run check:v29-gate10`
- `npm run promote:canon -- --version V29 --commit HEAD --dry-run`
- `pnpm run check:v29-gate9`
- `pnpm --dir apps/uapi run test:e2e:terminal-ux`
- `pnpm test:qa:v28:pipeline-readback`
- `npm --prefix protocol-demonstration test`
- `npm --prefix protocol-demonstration run test:v28-mvp-qa`

Required staging-testnet readback:

- staging Supabase project id remains `tkpyosihuouusyaxtbau`;
- staging Data API base remains `https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/`;
- staging validation must use untracked environment files or deployment
  environment variables;
- readback evidence must classify Terminal transaction rows, execution rows,
  pipeline telemetry rows, ledger/journal rows, settlement/reconciliation rows,
  AssetPack preview/unlock rows, and delivery/PR rows as present, absent, or
  explicitly blocked.

Promotion workflow evidence:

- `.github/workflows/v29-canon-promotion.yml` runs only for `version/v29` pull
  requests into `main`;
- the workflow validates V29 while `BITCODE_SPEC.txt` is `V28`;
- the workflow commits `BITCODE_SPEC.txt -> V29`, `BITCODE_SPEC_V29_PROVEN.md`,
  `.bitcode/v29-*`, runtime canon posture, and package posture/data updates;
- after the workflow commit, canon-quality and gate-quality checks validate V29
  promoted posture rather than stale V28/V29 draft posture.

Manual QA packet for staging-testnet promotion review:

1. Terminal URL and selected transaction route state.
2. Browser screenshot of the Terminal cockpit default view.
3. Browser screenshot of selected transaction detail with expanded telemetry.
4. Pipeline readback summary for ReadNeedComprehensionSynthesis and
   ReadFitsFindingSynthesis rows.
5. Ledger/database reconciliation summary.
6. AssetPack disclosure summary proving protected source remained hidden before
   settlement.
7. Delivery or blocked-delivery summary.
8. Redacted server logs and browser console output.

Gate 10 does not require committing live staging output.
It requires that the local and workflow proof surface is precise enough for
staging evidence to be attached to the promotion pull request without code
changes or secret leakage.
