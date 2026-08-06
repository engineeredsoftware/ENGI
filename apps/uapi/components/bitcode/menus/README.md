# Bitcode menus

## ChromeMenu (nav chrome — required for account + notifications)

Shared presentation stack for nav right-chrome panels:

- Squared glass surface
- Enter / exit motion
- `modal={false}` (no body-scroll lock / page shift)
- Header, body, item, empty slots

**Use this** for `UserMenu`, `NotificationsWidget`, and any peer nav chrome menu.

```tsx
import {
  ChromeMenu,
  ChromeMenuHeader,
  ChromeMenuBody,
  ChromeMenuItem,
} from '@/components/bitcode/menus/ChromeMenu/ChromeMenu';

<ChromeMenu trigger={<button type="button">…</button>} size="narrow" contentLabel="Account">
  <ChromeMenuHeader title="…" />
  <ChromeMenuBody>…</ChromeMenuBody>
</ChromeMenu>
```

- `size="narrow"` — account menu
- `size="wide"` — notifications panel

Files:

- `ChromeMenu/ChromeMenu.tsx`
- `ChromeMenu/chrome-menu.module.css`

## GlassyMenu (legacy surface tokens)

CSS module used by non-chrome pickers (Conversations attachment, team management). Prefer **ChromeMenu** for nav account/notifications so enter/exit/presentation stay unified.

- `GlassyMenu/glassy-menu.module.css` — `.menu`, `.item`, `.danger`, `.pickerSurface`
