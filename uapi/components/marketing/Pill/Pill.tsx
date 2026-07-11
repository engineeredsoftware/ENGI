import type { PropsWithChildren } from 'react';

export default function Pill({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-current/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1 ring-current/20 ${className}`}
    >
      {children}
    </span>
  );
}
