/**
 * ChromeMenu — shared nav chrome menu surface for account + notifications.
 *
 * Single presentation stack for enter/exit, squared glass panel, positioning,
 * and focus/dismiss behavior (`modal={false}` so body scroll never locks).
 * Domain widgets supply only the trigger and body content.
 */

'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import classNames from 'classnames';

import styles from './chrome-menu.module.css';

export type ChromeMenuSize = 'narrow' | 'wide';

export interface ChromeMenuProps {
  /** Square icon / avatar trigger (rendered as Popover.Trigger). */
  trigger: React.ReactElement;
  children: React.ReactNode;
  /** narrow = account menu; wide = notifications panel. */
  size?: ChromeMenuSize;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  alignOffset?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  contentId?: string;
  /** Accessible name for the panel (e.g. Notifications, Account). */
  contentLabel?: string;
  /**
   * When true, opening does not move focus into the panel (better for
   * notification lists where the trigger remains the primary control).
   */
  preventOpenAutoFocus?: boolean;
}

export function ChromeMenu({
  trigger,
  children,
  size = 'narrow',
  align = 'end',
  side = 'bottom',
  sideOffset = 8,
  alignOffset = -4,
  open,
  defaultOpen,
  onOpenChange,
  contentClassName,
  contentId,
  contentLabel,
  preventOpenAutoFocus = false,
}: ChromeMenuProps) {
  return (
    <Popover.Root
      modal={false}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          id={contentId}
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          collisionPadding={12}
          aria-label={contentLabel}
          className={classNames(
            styles.panel,
            size === 'wide' ? styles.panelWide : styles.panelNarrow,
            contentClassName,
          )}
          style={{ borderRadius: 0 }}
          onOpenAutoFocus={
            preventOpenAutoFocus
              ? (event) => {
                  event.preventDefault();
                }
              : undefined
          }
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export interface ChromeMenuHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Small uppercase eyebrow above the title (account menus). */
  eyebrow?: React.ReactNode;
  leading?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function ChromeMenuHeader({
  title,
  description,
  eyebrow,
  leading,
  action,
  className,
}: ChromeMenuHeaderProps) {
  return (
    <div className={classNames(styles.header, className)}>
      <div className={styles.headerMain}>
        {leading}
        <div className={styles.headerText}>
          {eyebrow ? <p className={styles.headerEyebrow}>{eyebrow}</p> : null}
          <h3 className={styles.headerTitle}>{title}</h3>
          {description ? (
            <p className={styles.headerDescription}>{description}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function ChromeMenuBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={classNames(styles.body, className)}>{children}</div>;
}

export interface ChromeMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean;
}

export const ChromeMenuItem = React.forwardRef<HTMLButtonElement, ChromeMenuItemProps>(
  function ChromeMenuItem({ danger, className, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={classNames(styles.item, danger && styles.itemDanger, className)}
        {...props}
      />
    );
  },
);

export function ChromeMenuEmpty({
  children,
  icon,
  className,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={classNames(styles.empty, className)}>
      {icon}
      {typeof children === 'string' || typeof children === 'number' ? (
        <p>{children}</p>
      ) : (
        children
      )}
    </div>
  );
}

export const chromeMenuItemDangerIconClass = styles.itemDangerIcon;
export const chromeMenuHeaderActionClass = styles.headerAction;
