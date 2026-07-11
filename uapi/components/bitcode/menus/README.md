Glassy Menus

Purpose
- A reusable purple-glassy dropdown surface that unifies menus across the app while keeping the Evidence Document inline template selector unchanged.

Usage
- Import CSS module and apply to the container surface.
  - Radix DropdownMenu: pass className to Content.
  - Custom popovers: wrap content with a div using `.menu`.

File
- glassy-menu.module.css
  - `.menu`: container surface with blur, gradient and subtle purple ring.
  - `.item`: interactive row styling with gradient border on hover.
  - `.danger`/`.dangerIcon`: red variant for destructive actions.
  - `.pickerSurface`: surface for Big‑O pickers.

Notes
- Keep the Evidence Document inline template selector unmodified.
- Use reduced motion where applicable for animated menus.
