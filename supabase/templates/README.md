# Bitcode email templates

HTML templates for **Supabase Auth** (Go template vars) and **app mail** (`@bitcode/notifications` `{{var}}` interpolation).

## Brand

- **Logo:** Bitcode operator mark (emerald `#67FEB7`) — never purple legacy engi marks
- **Primary:** emerald greens (`#067a4f` buttons, `#67FEB7` accents)
- **Subtle violet** only on secondary panel borders (`#a78bfa`)
- **Footer:** `© … Bitcode · Source-bearing value exchange` (not Advanced Engineered Software)

## Supabase Auth (dashboard → Authentication → Email templates)

Copy the matching file body into each Auth email type:

| Supabase type | File |
| --- | --- |
| Magic Link | `magic_link.html` |
| Confirm signup | `confirm.html` (also used by marketing waitlist Request access) |
| Invite user | `invite.html` |
| Change email | `email_change.html` |
| Reset password | `password_recovery.html` |
| OTP / reauth | `otp.html` |

Variables follow Supabase Go templates: `{{ .Email }}`, `{{ .Token }}`, `{{ .ConfirmationURL }}`, `{{ .Year }}`, `{{ .SiteURL }}`, `{{ index .Data "…" }}`.

### Waitlist → Resend Edge Function (option A)

1. **SSOT HTML:** `waitlist.html` (app-mail `{{email}}`, `{{siteUrl}}`, `{{rolesBlock}}`, `{{year}}`).
2. **Render in uapi:** `POST /api/waitlist` loads the file via `renderSupabaseEmailTemplate`, interpolates vars.
3. **Send:** Edge Function `resend` receives raw `{ kind: "waitlist", to, subject, html }` and posts to Resend (`RESEND_WAITLIST_FROM_EMAIL`).

Auth `confirm.html` is **not** used for waitlist. See `.docs/SUPABASE.md` §3.4.1.

## App mail (`sendEmail({ template, vars })`)

| Template | Use |
| --- | --- |
| `waitlist` | Landing Request access (via Resend Edge, not nodemailer) |
| `welcome` | After profile email verification |
| `team_invite` | Auxillaries team invite |
| `btd_transfer`, `low_btd_reminder`, `out_of_btd` | Balance notices |
| `asset_pack_*` | Pipeline lifecycle |
| `generic_notification`, `newsletter`, `contact_request` | Misc |

Placeholders are `{{name}}` style (not Go dots). `year` is injected by senders.
