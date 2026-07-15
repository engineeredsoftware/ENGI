# Deployment Configuration

See `.docs/BITCODE_CONNECTED_SERVICES.md` for connected-service notes. This guide focuses on environment variables and external settings (OAuth callbacks, webhooks, allowed return URLs) required to deploy Bitcode.

## V35 Testnet Rollout Readiness

V35 Gate 7 adds `TestnetRolloutReadinessGuide` as the package-owned source of
truth for source-safe rollout guidance. Generate it with
`pnpm run generate:v35-testnet-rollout-readiness-guide` and validate it with
`pnpm run check:v35-gate7`.

The guide distinguishes local, staging-testnet, public testnet,
mainnet-ready dry run, and visible blocked value-bearing mainnet posture. It
covers contributor onboarding, local development, operator use, enterprise
reader flows, depositor flows, interface consumers, environment lanes,
wallet/settlement caveats, known blockers, and rehearsal evidence without
including secret values, wallet private material, protected source, raw
protected prompts, or unpaid AssetPack source.

## Case Sensitivity (Linux/Vercel) and Casing Fix Scripts

Linux (and Vercel) run on case-sensitive filesystems. macOS defaults to case-insensitive, which can hide casing problems in filenames and import paths. To avoid CI/deploy breakage:

- All PromptPart filenames under `packages/prompts/src/raw_promptparts/**` MUST be lowercase.
- All import specifiers MUST match the actual path casing (especially relative paths).

### One-time Lowercase Enforcer (safe on macOS)

Use the two-step rename script to force Git to record case-only renames:

```bash
# Lists and fixes ALL uppercase paths under raw_promptparts (two-step git mv)
./scripts/fix-raw-promptparts-case.sh

# Then review + commit yourself
git add -A && git commit -m "fix(prompts): lowercase raw_promptparts paths"
```

### Detect and Fix Import Casing

```bash
# Detect only (resolves tsconfig paths, @bitcode/* aliases, and relative imports)
./scripts/check-import-casing.sh

# Auto-fix relative import specifiers to canonical casing
./scripts/check-import-casing.sh --fix

# Commit your changes
git add -A && git commit -m "fix(imports): normalize relative import casing"
```

Notes:
- The import fixer preserves alias prefixes and only corrects relative specs.
- Alias-preserving auto-fix can be extended if needed; detection already resolves tsconfig paths.

### Quick Verification

```bash
# Confirm no uppercase filenames remain
./scripts/find-uppercase-raw-promptparts.sh

# Confirm no import casing mismatches
./scripts/check-import-casing.sh
```


## Complete Environment Variables

### Full .env Example
```bash
# ============================================
# CORE SUPABASE CONFIGURATION (REQUIRED)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-dashboard

# ============================================
# SSO OAUTH PROVIDERS (REQUIRED FOR SSO)
# ============================================
SUPABASE_AUTH_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
SUPABASE_AUTH_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
SUPABASE_AUTH_GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
SUPABASE_AUTH_GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET

# ============================================
# GITHUB APP INTEGRATION (REQUIRED FOR REPO ACCESS)
# ============================================
GITHUB_OAUTH_CLIENT_ID=YOUR_GITHUB_OAUTH_CLIENT_ID
GITHUB_OAUTH_CLIENT_SECRET=YOUR_GITHUB_OAUTH_CLIENT_SECRET
GITHUB_APP_ID=YOUR_GITHUB_APP_ID
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nYOUR_GITHUB_PRIVATE_KEY\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=YOUR_GITHUB_WEBHOOK_SECRET

# ============================================
# AI PROVIDERS (REQUIRED)
# ============================================
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY

# ============================================
# SETTLEMENT (V48 — BTC-testnet)
# ============================================
# Settlement money is BTC (testnet4 by default); $BTD is non-fungible
# share/read-right language. Configure wallet auth (BITCODE_BITCOIN_OAUTH_*)
# and NEXT_PUBLIC_BITCODE_BITCOIN_NETWORK=testnet4 — see .env.example.

# ============================================
# MONITORING & ANALYTICS (OPTIONAL)
# ============================================
SENTRY_DSN=https://1234567890@o123456.ingest.sentry.io/1234567
VERCEL_ANALYTICS_ID=prj_1234567890abcdef
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# ============================================
# EMAIL CONFIGURATION (OPTIONAL)
# ============================================
EMAIL_SMTP_URL=smtp://user:pass@smtp.sendgrid.net:587
CONTACT_SUPPORT_EMAIL=support@bitcode.example

# ============================================
# MOCK FLAGS — production: all false / unset
# ============================================
NODE_ENV=production
NEXT_PUBLIC_MASTER_MOCK_MODE=false
NEXT_PUBLIC_ENABLE_MOCKS=false
NEXT_PUBLIC_MOCK_USER_AUXILLARIES=false
NEXT_PUBLIC_MOCK_CHAT_STREAM=false
NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS=false
NEXT_PUBLIC_MOCK_GITHUB_REPOS=false
NEXT_PUBLIC_MOCK_GITHUB_BRANCHES=false
NEXT_PUBLIC_MOCK_GITHUB_COMMITS=false
# Feature mocks only apply when ENABLE_MOCKS (or MASTER) is true.
```

## Environment Variable Documentation

### Core Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Required**: Yes
- **Description**: Your Supabase project URL
- **Example**: `https://your-project.supabase.co`
- **Where to find**: Supabase Dashboard → Settings → API → Project URL

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Required**: Yes
- **Description**: Public anonymous key for client-side Supabase access
- **Example**: `YOUR_SUPABASE_ANON_KEY`
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → anon/public

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Required**: Yes (server-side)
- **Description**: Service role key for admin operations
- **Security**: ⚠️ NEVER expose client-side
- **Example**: `YOUR_SUPABASE_SERVICE_ROLE_KEY`
- **Where to find**: Supabase Dashboard → Settings → API → Project API keys → service_role

#### `SUPABASE_JWT_SECRET`
- **Required**: Yes
- **Description**: JWT secret for token verification
- **Security**: ⚠️ Keep secret
- **Where to find**: Supabase Dashboard → Settings → API → JWT Settings → JWT Secret

### SSO OAuth Providers

#### Google OAuth

##### `SUPABASE_AUTH_GOOGLE_CLIENT_ID`
- **Required**: For Google SSO
- **Description**: Google OAuth 2.0 Client ID
- **Example**: `123456789012-abcdefghijklmnop.apps.googleusercontent.com`
- **Setup**:
 1. Go to [Google Cloud Console](https://console.cloud.google.com)
 2. Create/select project
 3. Enable Google+ API
 4. Create OAuth 2.0 credentials
 5. Add authorized redirect: `https://[YOUR_SUPABASE_URL]/auth/v1/callback`

##### `SUPABASE_AUTH_GOOGLE_CLIENT_SECRET`
- **Required**: For Google SSO
- **Description**: Google OAuth 2.0 Client Secret
- **Security**: ⚠️ Keep secret
- **Example**: `GOCSPX-1234567890abcdefghijk`
- **Where to find**: Same OAuth 2.0 credentials page

#### GitHub OAuth

##### `SUPABASE_AUTH_GITHUB_CLIENT_ID`
- **Required**: For GitHub SSO
- **Description**: GitHub OAuth App Client ID
- **Example**: `Iv1.8a61f19b2f3c4d5e`
- **Setup**:
 1. Go to GitHub Settings → Developer settings → OAuth Apps
 2. Create "New OAuth App"
 3. Set Authorization callback: `https://[YOUR_SUPABASE_URL]/auth/v1/callback`
 4. This is DIFFERENT from GitHub App

##### `SUPABASE_AUTH_GITHUB_CLIENT_SECRET`
- **Required**: For GitHub SSO
- **Description**: GitHub OAuth App Client Secret
- **Security**: ⚠️ Keep secret
- **Example**: `1234567890abcdef1234567890abcdef12345678`
- **Where to find**: OAuth App settings page

### GitHub App Integration (Repository Access)

#### `GITHUB_OAUTH_CLIENT_ID`
- **Required**: For GitHub App installation
- **Description**: GitHub App's OAuth Client ID (NOT the OAuth App)
- **Example**: `Iv1.9b72e20c3d4e5f6g`
- **Setup**: GitHub App settings → OAuth credentials

#### `GITHUB_OAUTH_CLIENT_SECRET`
- **Required**: For GitHub App installation
- **Description**: GitHub App's OAuth Client Secret
- **Security**: ⚠️ Keep secret
- **Example**: `abcdef1234567890abcdef1234567890abcdef12`

#### `GITHUB_APP_ID`
- **Required**: For GitHub App
- **Description**: App ID for the **single** shared Bitcode GitHub App
  [`bitcode-github-auxiliary`](https://github.com/apps/bitcode-github-auxiliary)
  (same app for local, preview, staging, and production — do not run a separate
  staging registration).
- **Example**: `123456`
- **Where to find**: GitHub App settings → About → App ID

#### `GITHUB_PRIVATE_KEY`
- **Required**: For GitHub App API access
- **Description**: RSA private key for the same `bitcode-github-auxiliary` app
- **Format**: PEM format with newlines as `\n`
- **Security**: ⚠️ Highly sensitive
- **Generation**: GitHub App settings → Private keys → Generate

#### `NEXT_PUBLIC_GITHUB_APP_PUBLIC_URL`
- **Required**: No (code fallback is the shared app)
- **Default**: `https://github.com/apps/bitcode-github-auxiliary`
- **Description**: Public install link shown in Auxillaries Externals. Keep this
  on the single shared app for every environment.

#### `GITHUB_WEBHOOK_SECRET`
- **Required**: For webhook verification
- **Description**: Secret for verifying GitHub webhook payloads
- **Security**: ⚠️ Keep secret
- **Setup**: Set in GitHub App webhook configuration

### AI Provider Keys

#### `OPENAI_API_KEY`
- **Required**: Yes
- **Description**: OpenAI API key for GPT models
- **Format**: `sk-proj-[alphanumeric]`
- **Where to find**: [OpenAI Platform](https://platform.openai.com/api-keys)

#### `ANTHROPIC_API_KEY`
- **Required**: For Claude models
- **Description**: Anthropic API key
- **Format**: `sk-ant-api03-[alphanumeric]`
- **Where to find**: [Anthropic Console](https://console.anthropic.com)

#### `DEEPSEEK_API_KEY`
- **Required**: For DeepSeek models
- **Description**: DeepSeek API key
- **Format**: `sk-[alphanumeric]`

### Settlement (V48 — BTC-testnet)

| Concern | V48 truth |
| --- | --- |
| Settlement money | **BTC-testnet** (`NEXT_PUBLIC_BITCODE_BITCOIN_NETWORK=testnet4`) |
| Rights / shares | **$BTD** (non-fungible share / read-right language on the ledger) |
| Wallet auth | `BITCODE_BITCOIN_OAUTH_*` + wallet authorize under `/tps/wallet/*` |
| Mainnet value | **Blocked** until future canon admits it |

## Third‑Party Service External Settings (Callbacks/Webhooks)

Configure these in provider dashboards. Replace `https://app.example.com` with your production domain.

- Supabase (OTP/OAuth overlay)
 - Bitcode UI callback: `https://app.example.com/tps/supabase/callback`
 - Email OTP links use `NEXT_PUBLIC_APP_URL` to construct the above.
 - Supabase Auth → Providers (Google/GitHub): authorized redirect is Supabase’s default `https://<your-supabase-domain>/auth/v1/callback`.

- Bitcoin wallet (TPS)
 - Wallet authorize / OAuth return under `/tps/wallet/*` (see `apps/uapi/app/tps/`)
 - Network default: testnet4

- GitHub App (VCS)
 - OAuth callback: `https://app.example.com/api/vcs/github/callback`
 - Webhook secret: set in GitHub App; point webhook to your infra endpoint (if used).

- Notion Integration
 - OAuth redirect URI: `https://app.example.com/api/integrations/notion/callback`

- Twilio (SMS)
 - Messaging webhook (POST): `https://app.example.com/api/chat/sms`
 - Viewer link sent to users: `https://app.example.com/tps/twilio/sms/<runId>?token=...`

- Google OAuth (via Supabase)
 - Authorized redirect: `https://<your-supabase-domain>/auth/v1/callback`

- GitLab / Bitbucket (if using OAuth)
 - Expected callbacks (if enabled):
 - GitLab: `https://app.example.com/api/vcs/gitlab/callback`
 - Bitbucket: `https://app.example.com/api/vcs/bitbucket/callback`

## Third‑Party Services Deployment Checklist

Use this quick checklist when promoting an environment.

- Supabase (Auth/UI)
 - [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
 - [ ] `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_JWT_SECRET` set (server)
 - [ ] UI callback allowed: `https://<app-domain>/tps/supabase/callback`
 - [ ] Providers (Google/GitHub) configured in Supabase; redirect: `https://<supabase-domain>/auth/v1/callback`

- Settlement / wallet
 - [ ] `BITCODE_BITCOIN_OAUTH_*` and `NEXT_PUBLIC_BITCODE_BITCOIN_NETWORK=testnet4` set
 - [ ] Wallet authorize callbacks under `/tps/wallet/*` allow-listed as needed

- GitHub App (VCS)
 - [ ] `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY`, client creds set
 - [ ] OAuth callback: `https://<app-domain>/api/vcs/github/callback`
 - [ ] Webhook secret set (if webhooks used)

- Notion (Integrations)
 - [ ] OAuth client id/secret stored
 - [ ] Redirect URI: `https://<app-domain>/api/integrations/notion/callback`

- Twilio (SMS)
 - [ ] `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` set
 - [ ] Messaging webhook: `https://<app-domain>/api/chat/sms`

- Google OAuth (via Supabase)
 - [ ] Authorized redirect: `https://<supabase-domain>/auth/v1/callback`

- GitLab / Bitbucket (optional)
 - [ ] Callbacks: `/api/vcs/gitlab/callback` and `/api/vcs/bitbucket/callback`

- Former UI alias redirects (for safety)
 - [ ] `/login/callback` → `/tps/supabase/callback`
 - [ ] `/github/callback` → `/tps/github/app-install` (if retained)

## Deployment Checklist

### Pre-Deployment
- [ ] All required environment variables set
- [ ] Supabase project configured with OAuth providers
- [ ] GitHub OAuth App created (for SSO)
- [ ] GitHub App created (for repo access)
- [ ] Google OAuth credentials configured
- [ ] Wallet / BTC-testnet settlement posture configured
- [ ] Database migrations run

### Security Verification
- [ ] No secrets in code repository
- [ ] Service role key only on server
- [ ] JWT secret is unique and secure
- [ ] OAuth secrets are protected
- [ ] GitHub private key is properly formatted
- [ ] Webhook secrets are configured

### Post-Deployment Testing
- [ ] Email/OTP login works
- [ ] Google SSO works
- [ ] GitHub SSO works
- [ ] GitHub App installation works
- [ ] Wallet auth / BTC-testnet settlement path works
- [ ] GitHub App / provider webhooks are received (if used)

## Common Issues

### SSO Not Working
1. Check OAuth app callback URLs match Supabase URL
2. Verify environment variables are set correctly
3. Ensure Supabase dashboard has providers enabled
4. Check browser console for specific errors

### GitHub App vs OAuth App Confusion
- OAuth App: For user authentication (SSO)
- GitHub App: For repository access and webhooks
- They are DIFFERENT and both may be needed

### Environment Variable Not Loading
1. Check variable names match exactly
2. Verify `.env.local` file in correct location
3. Restart development server after changes
4. Check for quotes around multi-line values

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use different keys** for development/staging/production
3. **Rotate secrets regularly**
4. **Monitor for exposed keys** using GitHub secret scanning
5. **Use environment-specific** Supabase projects
6. **Implement rate limiting** on API endpoints
7. **Audit OAuth app permissions** regularly
## CI/CD (orientation)

Maintained workflows live under `.github/workflows/` (gate quality, canon quality,
version promotion, application CI). Prefer current `bitcode-gate-quality` /
`bitcode-canon-quality` and app package scripts over historical `v26.yml`
folklore. See [`CONTRIBUTING.md`](../CONTRIBUTING.md) §8.
