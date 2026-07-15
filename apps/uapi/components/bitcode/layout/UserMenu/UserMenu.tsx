/**
 * Account chrome menu — profile trigger + Auxillaries / Disconnect actions.
 * Presentation (panel, enter/exit, dismiss) is owned by ChromeMenu.
 */

"use client";

import * as React from "react";
import * as Avatar from "@radix-ui/react-avatar";
import classNames from "classnames";
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { AuxillariesSolarIcon } from '@/components/bitcode/layout/AuxillariesSolarIcon/AuxillariesSolarIcon';
import {
  ChromeMenu,
  ChromeMenuBody,
  ChromeMenuHeader,
  ChromeMenuItem,
  chromeMenuItemDangerIconClass,
} from '@/components/bitcode/menus/ChromeMenu/ChromeMenu';
import {
  OPEN_AUXILLARIES_FULLSCREEN_LABEL,
  AUXILLARIES_LIST_COMPACT_LABEL,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

interface UserMenuProps {
  /** Supabase user object */
  user: import("@supabase/supabase-js").User;
  /** Callback when the user selects “Auxillaries” */
  onOpenAuxillaries?: () => void;
  /** Callback when the user selects “Disconnect” */
  onDisconnect: () => void;
}

export function UserMenu({ user, onOpenAuxillaries, onDisconnect }: UserMenuProps) {
  const [open, setOpen] = React.useState(false);
  const avatarUrl =
    (user.user_metadata && (user.user_metadata.avatar_url as string)) || "";
  const fallbackLabel = (user.email || "?").charAt(0).toUpperCase();

  const avatar = (
    <div className="w-8 h-8 shrink-0 overflow-hidden rounded-none border border-emerald-400/30 shadow-[0_0_6px_rgba(101,254,183,0.2)]">
      <Avatar.Root className="h-full w-full overflow-hidden rounded-none">
        {avatarUrl ? (
          <Avatar.Image
            src={avatarUrl}
            alt="User avatar"
            className="h-full w-full rounded-none object-cover"
          />
        ) : null}
        <Avatar.Fallback
          delayMs={avatarUrl ? 200 : 0}
          className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-300"
        >
          {fallbackLabel}
        </Avatar.Fallback>
      </Avatar.Root>
    </div>
  );

  const trigger = (
    <button
      type="button"
      aria-label="User menu"
      aria-haspopup="dialog"
      className="relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-none border border-emerald-400/30 text-neutral-300 shadow-[0_0_6px_rgba(101,254,183,0.2)] transition-colors transition-shadow duration-300 ease-out hover:border-emerald-400/50 hover:text-white hover:shadow-[0_0_10px_rgba(101,254,183,0.3)] focus:outline-none focus:ring-0 focus-visible:outline-none"
    >
      <Avatar.Root className="h-full w-full rounded-none">
        {avatarUrl ? (
          <Avatar.Image
            src={avatarUrl}
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        ) : null}
        <Avatar.Fallback
          delayMs={avatarUrl ? 200 : 0}
          className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-300"
        >
          {fallbackLabel}
        </Avatar.Fallback>
      </Avatar.Root>
    </button>
  );

  return (
    <ChromeMenu
      trigger={trigger}
      size="narrow"
      open={open}
      onOpenChange={setOpen}
      contentLabel="Bitcode account"
    >
      <ChromeMenuHeader
        leading={avatar}
        eyebrow="Bitcode account"
        title={user.email || 'Connected'}
      />
      <ChromeMenuBody>
        {onOpenAuxillaries ? (
          <ChromeMenuItem
            onClick={() => {
              setOpen(false);
              onOpenAuxillaries();
            }}
          >
            <AuxillariesSolarIcon className="mr-2" />
            <div className="min-w-0">
              <span className="block">{OPEN_AUXILLARIES_FULLSCREEN_LABEL}</span>
              <span className="mt-0.5 block text-[0.64rem] uppercase tracking-[0.18em] text-emerald-200/60">
                {AUXILLARIES_LIST_COMPACT_LABEL}
              </span>
            </div>
          </ChromeMenuItem>
        ) : null}

        <ChromeMenuItem
          danger
          onClick={() => {
            setOpen(false);
            onDisconnect();
          }}
        >
          <ArrowRightOnRectangleIcon
            className={classNames('mr-2 h-5 w-5 flex-shrink-0', chromeMenuItemDangerIconClass)}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <span className="block">Disconnect</span>
            <span className="mt-0.5 block text-[0.64rem] uppercase tracking-[0.18em] text-red-200/60">
              Leave the current Bitcode session
            </span>
          </div>
        </ChromeMenuItem>
      </ChromeMenuBody>
    </ChromeMenu>
  );
}
