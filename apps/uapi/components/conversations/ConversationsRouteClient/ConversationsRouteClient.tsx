'use client';

import React from 'react';
import Link from 'next/link';

import ConversationsOverlay from '@/components/conversations/ConversationsOverlay/ConversationsOverlay';

export default function ConversationsRouteClient() {
  const closeToTerminal = React.useCallback(() => {
    window.location.assign('/packs');
  }, []);

  return (
    <>
      <div className="min-h-[calc(100vh-9rem)] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_86%_16%,rgba(56,189,248,0.09),transparent_18%),linear-gradient(180deg,#050d15_0%,#02060d_44%,#010309_100%)] text-white">
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 phone:px-5 tablet:px-6 laptop:px-8">
          <section className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/74">
                  Conversations fullscreen
                </p>
                <h1 className="text-[1.8rem] font-semibold tracking-[-0.04em] text-white tablet:text-[2.4rem]">
                  Keep the Bitcode Terminal write path as a first-class Terminal interface mode.
                </h1>
                <p className="max-w-[48rem] text-sm leading-7 text-white/70 tablet:text-[15px]">
                  This direct route keeps the fullscreen conversations surface available without
                  treating it as a separate product. Step back into Terminal when you read
                  recent activity context, or into Exchange when you read the searchable
                  master-detail view; keep writing through rich
                  inputs, source attachments, output destinations, and agentic execution updates
                  here.
                </p>
              </div>

              <Link
                href="/packs"
                className="inline-flex items-center justify-center rounded-full border border-emerald-300/18 bg-emerald-400/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50 transition-colors hover:border-emerald-200/32 hover:bg-emerald-400/12"
              >
                Open Bitcode Terminal
              </Link>
            </div>
          </section>
        </main>
      </div>

      <ConversationsOverlay
        forceOpen
        forceFullscreen
        onCloseRequest={closeToTerminal}
        showFloatingOrb={false}
      />
    </>
  );
}
