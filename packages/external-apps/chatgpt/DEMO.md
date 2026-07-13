# DEMO — Yapper Social App Script

The following conversation showcases Bitcode building the fictitious social media app **Yapper** inside ChatGPT. Every tool is invoked exactly once in a natural flow. Use this script when recording the MVP demo video.

## Format

Each step lists:
- **User Prompt** – what the human types in ChatGPT.
- **Tool Invocation** – the MCP call made by Bitcode (JSON arguments are representative; adjust tokens/usernames before filming).
- **Output Snippet** – key shape of the tool response.
- **Bitcode Reply Outline** – how Bitcode summarises the result back to the user.

---

### Step 1 — Capture product intent (`design_code`)
- **User Prompt**  
  “Bitcode, let’s build Yapper: a social app for voice-first micro-posts. Start the design doc.”
- **Tool Invocation**  
  `design_code`  
  ```json
  {
    "ideas": "Create Yapper, a voice-forward social feed.\nFeatures: record 30s yaps, follow friends, auto-transcribe audio.\nTech: Next.js app, Supabase auth, Vercel deployment.",
    "currentProductMd": ""
  }
  ```
- **Output Snippet**  
  ```
  {
    "update": "### Proposed Updates\n- Create Yapper...",
    "latest_design": "# PRODUCT.md — Bitcode ChatGPT App\n..."
  }
  ```
- **Bitcode Reply Outline**  
  Confirms `.ai/PRODUCT.md` scaffold, highlights key sections, shares next discovery questions.

---

### Step 2 — Confirm feature gap (`answer_codebase_query`)
- **User Prompt**  
  “Check whether we already have a Yapper recorder implemented.”
- **Tool Invocation**  
  `answer_codebase_query`  
  ```json
  {
    "query": "YapperRecorder",
    "cwd": "apps",
    "maxResults": 50
  }
  ```
- **Output Snippet**  
  ```
  {
    "answer": "No matches found.",
    "metadata": { "matchCount": 0 }
  }
  ```
- **Bitcode Reply Outline**  
  States no recorder exists, proposes creating new components, references relevant directories.

---

### Step 3 — Research supporting patterns (`answer_codeweb_query`)
- **User Prompt**  
  “Find an article on optimising microphone capture for web apps.”
- **Tool Invocation**  
  `answer_codeweb_query`  
  ```json
  {
    "query": "web microphone api best practices for social audio app",
    "numResults": 5
  }
  ```
- **Output Snippet**  
  ```
  {
    "answer": "1. Web Audio Recording Guide — https://example...",
    "metadata": { "total": 5, "results": [...] }
  }
  ```
- **Bitcode Reply Outline**  
  Summarises top references, notes ideas to incorporate (buffering, permission prompts), links back to design doc.

---

### Step 4 — Narrate design asset (`depict_design_asset`)
- **User Prompt**  
  “Here’s a quick Yapper wireframe—describe it with an emphasis on the compose card.”
- **Tool Invocation**  
  `depict_design_asset`  
  ```json
  {
    "assetData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", 
    "focus": "Compose card and post list",
    "notes": "Muted purple headers, voice waveform visual"
  }
  ```
- **Output Snippet**  
  ```
  {
    "depiction": "Asset depiction generated for the Bitcode ChatGPT App... Primary focus: Compose card...",
    "metadata": { "bytes": 24576 }
  }
  ```
- **Bitcode Reply Outline**  
  Relays visual summary, calls out key UI states, adds reminders to sync visuals with implementation plan.

---

### Step 5 — Draft implementation actions (`code_design`)
- **User Prompt**  
  “Translate the design into specific coding steps.”
- **Tool Invocation**  
  `code_design`  
  ```json
  {
    "update": "Implement audio recorder with waveform preview.\nPersist yaps via Supabase function.\nRender feed sorted by freshness, include mute toggle.",
    "latest_design": "<paste latest PRODUCT.md excerpt>",
    "files": [
      { "path": "apps/yapper/pages/index.tsx", "intent": "Render feed with recorder entry point" },
      { "path": "apps/yapper/lib/supabase/yaps.ts", "intent": "Persist and fetch yaps" }
    ]
  }
  ```
- **Output Snippet**  
  ```
  {
    "update": "### Implementation Actions\nTask 1: Implement audio recorder...\n```diff\ndiff --git a/apps/yapper/pages/index.tsx ...```",
    "metadata": { "taskCount": 3, "fileCount": 2 }
  }
  ```
- **Bitcode Reply Outline**  
  Walks through tasks, references planned file edits, flags TODO markers for manual follow-up.

---

### Step 6 — Review recent repo activity (`read_code_changes_from_vcs`)
- **User Prompt**  
  “What’s the latest on the Bitcode demo repo before we push Yapper?”
- **Tool Invocation**  
  `read_code_changes_from_vcs`  
  ```json
  {
    "accessToken": "ghp_exampleToken",
    "owner": "bitcode-demo",
    "repo": "yapper",
    "branch": "main",
    "limit": 3
  }
  ```
- **Output Snippet**  
  ```
  {
    "changes": "2a4b9c1 — chore: bootstrap repo (by Olivia)\n...",
    "metadata": { "commitCount": 3 }
  }
  ```
- **Bitcode Reply Outline**  
  Summarises top commits, confirms there’s room for the new feature branch.

---

### Step 7 — Commit starter files (`write_code_changes_to_vcs`)
- **User Prompt**  
  “Create the initial Yapper repo with a README and product doc scaffold.”
- **Tool Invocation**  
  `write_code_changes_to_vcs` *(confirmation required before executing)*  
  ```json
  {
    "operation": "createRepository",
    "confirmed": true,
    "accessToken": "ghp_exampleToken",
    "name": "yapper",
    "description": "Voice-first social feed built with Bitcode",
    "private": false
  }
  ```
- **Output Snippet**  
  ```
  {
    "result": { "html_url": "https://github.com/bitcode-demo/yapper", ... },
    "metadata": {
      "operation": "createRepository",
      "writeAdmission": {
        "interfaceSurface": "chatgpt_app",
        "permission": "explicit_user_confirmation",
        "connectedInterface": "github",
        "exchangeStateRole": "connected_interface_delivery_mechanism",
        "targetAnchor": "github:yapper"
      }
    }
  }
  ```
- **Bitcode Reply Outline**  
  Confirms repo creation, shares URL, states next steps (push patch once ready).

---

### Step 8 — Pull deployment telemetry (`use_vercel_read_external_mcp`)
- **User Prompt**  
  “Fetch the latest Vercel deployment events for Yapper.”
- **Tool Invocation**  
  `use_vercel_read_external_mcp`  
  ```json
  {
    "request": "list_deployments",
    "payload": {
      "projectId": "prj_Yapper",
      "teamId": "team_bitcode",
      "limit": 2
    }
  }
  ```
- **Output Snippet**  
  ```
  {
    "answer": {
      "projectId": "prj_Yapper",
      "teamId": "team_bitcode",
      "deployments": [
        { "id": "dpl_ready", "target": "production", "state": "READY", "url": "yapper-prod.vercel.app" },
        { "id": "dpl_preview", "target": "preview", "state": "READY", "url": "preview-yapper-git-feature.vercel.app" }
      ]
    },
    "metadata": { "provider": "vercel", "request": "list_deployments" }
  }
  ```
- **Bitcode Reply Outline**  
  Highlights the production deployment, explains the preview URL, and invites the user to choose which one to narrate in the demo.

---

### Step 9 — Check backend health (`use_aws_read_external_mcp`)
- **User Prompt**  
  “Ping the `yap-transcribe` Lambda so we know the transcription path is alive.”
- **Tool Invocation**  
  `use_aws_read_external_mcp`  
  ```json
  {
    "request": "lambda.invoke",
    "payload": {
      "functionName": "yap-transcribe-demo",
      "payload": { "sample": "hello-yapper" }
    }
  }
  ```
- **Output Snippet**  
  ```
  {
    "answer": { "ok": true, "tool": "awsLambdaInvoke", "functionName": "yap-transcribe-demo" },
    "metadata": { "provider": "aws", "request": "lambda.invoke" }
  }
  ```
- **Bitcode Reply Outline**  
  Summarises the Lambda response (or mock), clarifies next steps if the function errors, and ties the check back to the Yapper audio pipeline.

---

### Step 10 — Store demo config (`use_aws_write_external_mcp`)
- **User Prompt**  
  “Upload the Yapper demo config to S3 so the team can fetch it later—confirm first.”
- **Tool Invocation**  
  `use_aws_write_external_mcp` *(confirmation required before executing)*  
  ```json
  {
    "request": "s3.putObject",
    "confirmed": true,
    "payload": {
      "bucket": "bitcode-yapper-demo",
      "key": "config/demo-config.json",
      "body": "{ \"featureFlags\": { \"mutedFeeds\": true } }"
    }
  }
  ```
- **Output Snippet**  
  ```
  {
    "result": { "ok": true, "tool": "awsS3PutObject", "bucket": "bitcode-yapper-demo", "key": "config/demo-config.json" },
    "metadata": {
      "provider": "aws",
      "request": "s3.putObject",
      "writeAdmission": {
        "interfaceSurface": "chatgpt_app",
        "connectedInterface": "aws",
        "outputMeaning": "asset_pack_delivery_mechanism",
        "targetAnchor": "aws:s3/bitcode-yapper-demo/config/demo-config.json"
      }
    }
  }
  ```
- **Bitcode Reply Outline**  
  Acknowledges successful upload (or notes placeholder), reminds audience that real credentials are required outside the demo.

---

### Step 11 — Log deployment intent (`use_vercel_write_external_mcp`)
- **User Prompt**  
  “Capture that we plan to redeploy Yapper once QA gives the green light.”
- **Tool Invocation**  
  `use_vercel_write_external_mcp` *(confirmation required before executing)*  
  ```json
  {
    "request": "deploy_to_vercel",
    "confirmed": true,
    "payload": {
      "projectId": "prj_Yapper",
      "teamId": "team_bitcode",
      "message": "Redeploy after manual QA completes."
    }
  }
  ```
- **Output Snippet**  
  ```
  {
    "result": {
      "deploymentId": "dpl_1737060645000",
      "projectId": "prj_Yapper",
      "teamId": "team_bitcode",
      "url": "https://prj_Yapper-1737060645000.vercel.app",
      "readyState": "BUILDING",
      "note": "Redeploy after manual QA completes."
    },
    "metadata": {
      "provider": "vercel",
      "request": "deploy_to_vercel",
      "writeAdmission": {
        "interfaceSurface": "chatgpt_app",
        "connectedInterface": "vercel",
        "outputMeaning": "asset_pack_delivery_mechanism",
        "targetAnchor": "vercel:team_bitcode/prj_Yapper"
      }
    }
  }
  ```
- **Bitcode Reply Outline**  
  Explains that the deployment has been queued, reminds the user to wait for READY status, and suggests narrating the outcome in the next message.

---

### Step 12 — Capture collaboration learnings (`improve_developing_behavior`)
- **User Prompt**  
  “Note that every response in this project must cite file paths with line numbers.”
- **Tool Invocation**  
  `improve_developing_behavior`  
  ```json
  {
    "improvement_betterment": "Always cite file paths with precise line numbers when summarising code.",
    "currentAgentsMd": ""
  }
  ```
- **Output Snippet**  
  ```
  {
    "thennnowevolution": "### Behavior Evolution\nAlways cite file paths...",
    "concretelatestgreatestapproach": "# AGENTS.md — Bitcode ChatGPT App\n..."
  }
  ```
- **Bitcode Reply Outline**  
  Confirms `.ai/AGENTS.md` has been updated, reiterates the new behavioural expectation, and closes the session.

---

## Recording tips

- Keep the conversation linear—avoid side quests so each tool is showcased once.  
- Verbally call out when a confirmation prompt appears before executing write tools, and show that the actual tool payload includes `confirmed: true`.
- Swap placeholder tokens/IDs for environment-specific values immediately before filming.  
- If a tool response uses mock data (e.g. DevOps adapters), narrate that live integrations are on the TODO list.
