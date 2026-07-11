"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import classNames from "classnames";
import menuStyles from '../menus/glassy-menu.module.css';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { AuxillariesSolarIcon } from './auxillaries-solar-icon';
import {
  OPEN_AUXILLARIES_FULLSCREEN_LABEL,
  AUXILLARIES_LIST_COMPACT_LABEL,
} from '@/app/auxillaries/components/auxillary-pane-meta';

interface UserMenuProps {
  /** Supabase user object */
  user: import("@supabase/supabase-js").User;
  /** Callback when the user selects “Auxillaries” */
  onOpenAuxillaries?: () => void;
  /** Callback when the user selects “Sign out” */
  onSignOut: () => void;
}

// ---------------------------------------------------------------------------
// Radically improved styling matching the rest of the “neo-quantum” design.
// ---------------------------------------------------------------------------
// We lean heavily on Tailwind’s utility classes instead of ad-hoc CSS so that the
// menu automatically inherits future design-tokens (colours, radius, shadows).

/* --------------------------------------------------------------------------
 * Menu container
 * --------------------------------------------------------------------------
 * 1. 90 % viewport width cap on mobile and sensible max-height.
 * 2. Frosted-glass background with subtle gradient so it blends with the nav
 *    bar which already uses a similar treatment (`nav-scrolled-bg`).
 * 3. Border + ring layers deliver a crisp edge on both light & dark themes.
 * 4. Large radius + thick shadow echo the marketing modals throughout the app.
 */
const contentStyles = `${menuStyles.menu}`;

/* --------------------------------------------------------------------------
 * Menu item
 * --------------------------------------------------------------------------
 * Increased padding, smooth colour transitions and active/hover feedback that
 * follow the emerald accent used across interactive elements.
 */
export function UserMenu({ user, onOpenAuxillaries, onSignOut }: UserMenuProps) {
  const avatarUrl =
    (user.user_metadata && (user.user_metadata.avatar_url as string)) || "";

  // Use the first letter of the email as the fallback.
  const fallbackLabel = (user.email || "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="User menu"
          aria-haspopup="menu"
          className="relative w-9 h-9 flex items-center justify-center rounded-full overflow-hidden cursor-pointer text-neutral-300 transition-shadow transition-colors duration-300 ease-out focus:outline-none focus-visible:outline-none focus:ring-0 border border-emerald-400/30 shadow-[0_0_6px_rgba(101,254,183,0.2)] hover:shadow-[0_0_10px_rgba(101,254,183,0.3)] hover:border-emerald-400/50 hover:text-white"
        >
          <Avatar.Root className="w-full h-full rounded-full">
            {avatarUrl ? (
              <Avatar.Image
                src={avatarUrl}
                alt="User avatar"
                className="object-cover w-full h-full"
              />
            ) : null}
            <Avatar.Fallback
              delayMs={avatarUrl ? 200 : 0}
              className="flex items-center justify-center w-full h-full text-neutral-300 font-semibold text-sm"
            >
              {fallbackLabel}
            </Avatar.Fallback>
          </Avatar.Root>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          alignOffset={-4}
          align="end"
          className={contentStyles}
        >
          {/* User info header */}
          <div className="p-4 flex items-center gap-3 border-b border-white/5">
            <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden border border-emerald-400/30 shadow-[0_0_6px_rgba(101,254,183,0.2)] transition-shadow transition-colors duration-300 ease-out hover:shadow-[0_0_10px_rgba(101,254,183,0.3)] hover:border-emerald-400/50">
              <Avatar.Root className="w-full h-full rounded-full overflow-hidden">
                {avatarUrl ? (
                  <Avatar.Image
                    src={avatarUrl}
                    alt="User avatar"
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : null}
                <Avatar.Fallback
                  delayMs={avatarUrl ? 200 : 0}
                  className="flex items-center justify-center w-full h-full text-neutral-300 font-semibold text-sm"
                >
                  {fallbackLabel}
                </Avatar.Fallback>
              </Avatar.Root>
            </div>
          <div className="min-w-0">
            <p className="text-[0.58rem] uppercase tracking-[0.22em] text-emerald-300/70">
              Bitcode account
            </p>
            <p className="truncate font-medium text-neutral-100">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col">
            {onOpenAuxillaries && (
              <DropdownMenu.Item
                onSelect={(e) => {
                  e.preventDefault();
                  onOpenAuxillaries();
                }}
                className={`${menuStyles.item}`}
              >
                <AuxillariesSolarIcon className="mr-2" />
                <div className="min-w-0">
                  <span className="block">{OPEN_AUXILLARIES_FULLSCREEN_LABEL}</span>
                  <span className="mt-0.5 block text-[0.64rem] uppercase tracking-[0.18em] text-emerald-200/60">
                    {AUXILLARIES_LIST_COMPACT_LABEL}
                  </span>
                </div>
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                onSignOut();
              }}
              className={classNames(menuStyles.item, menuStyles.danger)}
            >
              <ArrowRightOnRectangleIcon className={classNames("h-5 w-5 flex-shrink-0 mr-2", menuStyles.dangerIcon)} aria-hidden="true" />
              <div className="min-w-0">
                <span className="block">Sign out</span>
                <span className="mt-0.5 block text-[0.64rem] uppercase tracking-[0.18em] text-red-200/60">
                  Leave the current Bitcode session
                </span>
              </div>
            </DropdownMenu.Item>
          </div>

        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
