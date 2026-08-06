"use client";

import React from 'react';
import { cn } from '@bitcode/styling';

export interface PageHeaderSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Optional experience identifier for diagnostics (e.g., 'asset-pack', 'orbitals') */
  experience?: 'asset-pack' | 'measure' | 'marketing' | 'orbitals' | 'orbital' | 'conversations' | string;
  /** Render an actions area aligned to the right (e.g., buttons) */
  actions?: React.ReactNode;
  /** Optional top meta area (badges, breadcrumbs) */
  meta?: React.ReactNode;
}

/**
 * PageHeaderSection – Structured shell for experience headers with optional slots.
 *
 * - Neutral by default (no padding/margins) to avoid visual change when adopted.
 * - Consumers pass their existing content as children; optional `meta`/`actions` can be used gradually.
 */
export function PageHeaderSection({
  className,
  experience,
  actions,
  meta,
  children,
  ...rest
}: PageHeaderSectionProps) {
  return (
    <section data-experience={experience} className={cn(className)} {...rest}>
      {meta ? (
        <div className="w-full flex items-center justify-between">
          <div className="min-w-0">{meta}</div>
          {actions ? <div className="ml-4 shrink-0">{actions}</div> : null}
        </div>
      ) : actions ? (
        <div className="w-full flex items-center justify-end">{actions}</div>
      ) : null}
      {children}
    </section>
  );
}

/**
 * Sub-elements for consistent structure when desired. Optional for incremental adoption.
 */
export const PageHeaderTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className={cn('font-bold tracking-tight', className)} {...props} />
);

export const PageHeaderSubtitle = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);
