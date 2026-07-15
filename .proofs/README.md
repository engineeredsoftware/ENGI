# Proof artifacts

Versioned proof/report outputs live under `.proofs/<version>/`.

Examples:
- `.proofs/v48/promotion-readiness-report.json`
- `.proofs/v42/depositing-shortest-path.json`

Unversioned / cross-version proofs live under `.proofs/_shared/`.

Runtime pipeline host working directories use `.proofs/pipeline-host` (sandbox /
local host runs), not a version folder.
