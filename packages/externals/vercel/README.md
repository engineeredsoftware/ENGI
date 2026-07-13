# @bitcode/vercel

Fixture-driven helpers used by the Bitcode ChatGPT App to simulate Vercel’s MCP responses in the demo experience. The functions mirror the structure of Vercel’s official tools so transcripts feel authentic even when we are offline.

## Exported helpers

- `listTeams` – Enumerate teams tied to the token.
- `listProjects` / `getProject` – Summarise project metadata, frameworks, domains, and env vars.
- `listDeployments` / `getDeployment` – Provide deployment history and detail snapshots.
- `getDeploymentEvents` / `getDeploymentBuildLogs` – Return timelines and representative build logs.
- `searchDocumentation` – Surface curated documentation snippets for a given topic.
- `checkDomainAvailability` / `buyDomain` – Demo-friendly domain availability + purchase flows.
- `deployToVercel` – Simulate a deployment request with a BUILDING status response.

Each helper is an async function that returns plain JSON. They are intentionally deterministic so the demo script can show consistent output on every run.

## Usage

```typescript
import {
  listDeployments,
  getDeployment,
  deployToVercel
} from '@bitcode/vercel';

const deployments = await listDeployments({ projectId: 'prj_Yapper', teamId: 'team_bitcode' });
const latest = await getDeployment({ idOrUrl: deployments.deployments[0].id, teamId: 'team_bitcode' });

const preview = await deployToVercel({
  projectId: 'prj_Yapper',
  teamId: 'team_bitcode',
  message: 'Preview deploy triggered by Bitcode demo'
});
```

Downstream packages (`@bitcode/generic-tools-mcps-vercel`, `@bitcode/chatgptapp`) wrap these helpers in the `Tool` primitive so they can be exposed over MCP.
