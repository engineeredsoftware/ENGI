// Base Bitcode surface style tokens (class compositions)
//
// popoverSurfaceClass — canonical classes for dark glass popover surfaces
// used by menus/tooltips/popovers. Centralizing the class string lets us
// evolve radius/shadows consistently without touching every consumer.

export const popoverSurfaceClass = [
  // Sizing
  'min-w-[230px] max-w-[90vw] max-h-[80vh] overflow-y-auto',
  // Margin controlled by trigger offset
  'm-0',
  // Glass gradient + blur
  'bg-gradient-to-br from-neutral-800/80 via-neutral-900/80 to-neutral-950/80',
  'backdrop-blur-md',
  // Ring accent; explicit border omitted so items sit flush
  'ring-1 ring-black/5 dark:ring-white/10',
  // Shape + depth (tokenized shadow)
  'rounded-lg shadow-popover',
  // Misc
  'p-0 z-[100] text-sm select-none',
].join(' ');

// Panel/card surface: subtle elevation and neutral background
export const panelSurfaceClass = [
  'bg-[rgba(15,17,26,0.40)]',
  'backdrop-blur-md',
  'border border-white/10',
  'rounded-lg',
  'shadow-surface'
].join(' ');
