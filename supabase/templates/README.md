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
| Confirm signup | `confirm.html` |
| Invite user | `invite.html` |
| Change email | `email_change.html` |
| Reset password | `password_recovery.html` |
| OTP / reauth | `otp.html` |

Variables follow Supabase Go templates: `{{ .Email }}`, `{{ .Token }}`, `{{ .ConfirmationURL }}`, `{{ .Year }}`, `{{ .SiteURL }}`, `{{ index .Data "…" }}`.

## App mail (`sendEmail({ template, vars })`)

| Template | Use |
| --- | --- |
| `welcome` | After profile email verification |
| `team_invite` | Auxillaries team invite |
| `btd_transfer`, `low_btd_reminder`, `out_of_btd` | Balance notices |
| `asset_pack_*` | Pipeline lifecycle |
| `generic_notification`, `newsletter`, `contact_request` | Misc |

Placeholders are `{{name}}` style (not Go dots). `year` is injected by senders.
