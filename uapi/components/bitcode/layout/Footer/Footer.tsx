"use client";

import React from 'react'
import Link from 'next/link';



// Icons are inlined where needed to avoid pulling extra JS from icon packs.
// import "../styles/footer-animations.css";
// import ShimmerButtonDemo from '@/components/bitcode/effects/ButtonShimmer/ButtonShimmer';
// import { DisabledTooltipWrapper } from '@/components/bitcode/overlays/DisabledTooltipWrapper/DisabledTooltipWrapper';
// import AudioPlayer from './AudioPlayer';
import { FEATURE_FLAGS } from '@/config/features';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@bitcode/supabase/ssr/client';
import type { Session, User } from '@supabase/supabase-js';
import BitcodeSoftwareSvgLogo from '@/components/bitcode/branding/BitcodeSoftwareSvgLogo/BitcodeSoftwareSvgLogo';
import { openAuxillaries, prefetchAuxillaries } from '@/components/auxillaries/AuxillariesProvider/AuxillariesProvider';
import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer';
import { BITCODE_PUBLIC_EXPLAINERS } from '@/components/bitcode/layout/BitcodePublicExplainers/bitcode-public-explainers';
import { DisabledTooltipWrapper } from '@/components/bitcode/overlays/DisabledTooltipWrapper/DisabledTooltipWrapper';
import { BITCODE_GITHUB_APP_PUBLIC_URL } from '@/lib/github-app-url';

const PACKS_URL = '/packs';
const DEPOSIT_URL = '/deposits';
const READ_URL = '/reads';
const DEFAULT_OPERATOR_GUIDE_URL =
  process.env.NEXT_PUBLIC_BITCODE_OPERATOR_GUIDE_URL?.trim() || '/docs';
const CURRENT_PROTOCOL_SPEC_URL = 'https://github.com/engineeredsoftware/ENGI/blob/main/BITCODE_SPEC.txt';
const BITCODE_REPOSITORY_URL = 'https://github.com/engineeredsoftware/bitcode';
const BITCODE_X_URL = 'https://x.com/bitcode';
const BITCODE_SUPPORT_EMAIL_ADDRESS = 'support@bitcode.exchange';
const BITCODE_SUPPORT_MAILTO = `mailto:${BITCODE_SUPPORT_EMAIL_ADDRESS}`;
const DISABLED_FEATURE_TOOLTIPS = {
  packs:
    'Disabled for launch mode. When enabled, Packs opens the public activity and pack-reading surface.',
  auxillaries:
    'Disabled for launch mode. When enabled, Auxillaries opens profile, connects, interface defaults, and $BTD posture.',
} as const;

const footerNavs = [
  {
    label: "Product",
    items: [
      {
        href: BITCODE_GITHUB_APP_PUBLIC_URL,
        name: "GitHub App",
      },
      {
        href: "#pricing",
        name: "Pricing",
      },
      {
        href: "#faq",
        name: "FAQ",
      },
    ],
  },
  //{
  //label: "Company",
  //items: [
  //{
  //href: "/about",
  //name: "About Us",
  //},
  //{
  //href: "/support",
  //name: "Support",
  //},
  //{
  //href: "/contact",
  //name: "Contact",
  //},
  //],
  //},
  {
    label: "Resources",
    items: [
      //{
      //href: "/lightpaper",
      //name: "Lightpaper",
      //},
      {
        href: "/terms",
        name: "Terms",
      },
      //{
      //href: "/blog",
      //name: "Blog",
      //},
    ],
  },
  //{
  //label: "Legal",
  //items: [
  //],
  //},
];

interface FooterProps {
  showPrimaryContent?: boolean;
  className?: string;
}

export default function Footer({ showPrimaryContent = true, className = '' }: FooterProps) {
  // Supabase client and user state for authentication CTA
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);
  const footerCtaLabel = user
    ? BITCODE_PUBLIC_COPY.footer.userCta
    : BITCODE_PUBLIC_COPY.footer.guestCta;
  const footerLinks = useMemo(() => [
    {
      ariaLabel: BITCODE_PUBLIC_COPY.footer.links.network,
      label: BITCODE_PUBLIC_COPY.footer.links.network,
      meta: 'Pack activity',
      href: PACKS_URL,
      explainer: BITCODE_PUBLIC_EXPLAINERS.network,
      hoverClassName:
        'hover:border-emerald-300/30 hover:bg-emerald-400/[0.08] hover:text-emerald-50 dark:hover:text-emerald-100',
      labelHoverClassName: 'hover:text-emerald-100',
      icon: (
        <span
          className="inline-flex items-center justify-center"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(103,254,183,0.66)) drop-shadow(0 0 15px rgba(103,254,183,0.33))',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-[15px] w-[15px] text-emerald-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="8.5" />
            <path d="M6.5 12h11" />
            <path d="M12 6.5c2.8 2.4 2.8 8.6 0 11" />
            <path d="M12 6.5c-2.8 2.4-2.8 8.6 0 11" />
          </svg>
        </span>
      ),
    },
    {
      ariaLabel: BITCODE_PUBLIC_COPY.footer.links.deposit,
      label: BITCODE_PUBLIC_COPY.footer.links.deposit,
      meta: 'Depositing flow',
      href: DEPOSIT_URL,
      explainer: BITCODE_PUBLIC_EXPLAINERS.deposit,
      hoverClassName:
        'hover:border-fuchsia-300/30 hover:bg-fuchsia-400/[0.08] hover:text-fuchsia-50 dark:hover:text-fuchsia-100',
      labelHoverClassName: 'hover:text-fuchsia-100',
      icon: (
        <span
          className="inline-flex items-center justify-center"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(232,121,249,0.7)) drop-shadow(0 0 15px rgba(192,132,252,0.35))',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-[15px] w-[15px] text-fuchsia-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Z" />
            <path d="M4 12.5 12 17l8-4.5" />
            <path d="M4 17.5 12 22l8-4.5" />
          </svg>
        </span>
      ),
    },
    {
      ariaLabel: BITCODE_PUBLIC_COPY.footer.links.read,
      label: BITCODE_PUBLIC_COPY.footer.links.read,
      meta: 'Reading flow',
      href: READ_URL,
      explainer: BITCODE_PUBLIC_EXPLAINERS.read,
      hoverClassName:
        'hover:border-orange-300/30 hover:bg-orange-400/[0.08] hover:text-orange-50 dark:hover:text-orange-100',
      labelHoverClassName: 'hover:text-orange-100',
      icon: (
        <span
          className="inline-flex items-center justify-center"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(251,146,60,0.7)) drop-shadow(0 0 15px rgba(251,191,36,0.35))',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-[15px] w-[15px] text-orange-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 6.5h9" />
            <path d="M5 11.5h14" />
            <path d="M5 16.5h8" />
            <path d="m16 15 2 2 3-4" />
          </svg>
        </span>
      ),
    },
    {
      ariaLabel: 'Docs',
      label: BITCODE_PUBLIC_COPY.footer.links.docs,
      meta: 'Docs hub',
      href: DEFAULT_OPERATOR_GUIDE_URL,
      explainer: BITCODE_PUBLIC_EXPLAINERS.docs,
      // White tone needs higher border opacity than color accents or it vanishes on the dark card.
      hoverClassName:
        'hover:border-white/55 hover:bg-white/[0.1] hover:text-white dark:hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_0_22px_rgba(255,255,255,0.08)]',
      labelHoverClassName: 'hover:text-white',
      icon: (
        <span
          className="inline-flex items-center justify-center"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.65)) drop-shadow(0 0 15px rgba(255,255,255,0.32))',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-[15px] w-[15px] text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="8.5" />
            <path d="M10 8.8v6.4l5-3.2-5-3.2Z" fill="currentColor" stroke="none" />
          </svg>
        </span>
      ),
    },
    {
      ariaLabel: 'Bitcode on GitHub',
      label: BITCODE_PUBLIC_COPY.footer.links.github,
      meta: 'GitHub',
      href: BITCODE_REPOSITORY_URL,
      hoverClassName:
        'hover:border-slate-300/25 hover:bg-slate-400/[0.08] hover:text-slate-100 dark:hover:text-slate-100',
      labelHoverClassName: 'hover:text-slate-100',
      icon: (
        <span
          className="inline-flex items-center justify-center"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(148,163,184,0.66)) drop-shadow(0 0 15px rgba(148,163,184,0.33))',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-[14px] w-[14px] text-slate-200"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.58 2 12.2c0 4.42 2.87 8.16 6.84 9.49.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.36 1.11 2.94.85.09-.67.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.74 0 0 .84-.27 2.75 1.05A9.33 9.33 0 0 1 12 6.84c.85 0 1.71.12 2.51.36 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.48.1 2.74.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.8-4.59 5.05.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.6.69.49A10.21 10.21 0 0 0 22 12.2C22 6.58 17.52 2 12 2Z" />
          </svg>
        </span>
      ),
    },
  ], []);
  const isExternalHref = (href: string) => href.startsWith('http');
  const disableAuxillaries = Boolean(FEATURE_FLAGS.DISABLE_AUXILLARIES);
  const disablePacksLink = Boolean(FEATURE_FLAGS.DISABLE_EXCHANGE_LINK);

  return (
    <>
      <footer className={`w-full border-t ${showPrimaryContent ? 'mt-10 px-4 tablet:px-6 laptop:px-8 desktop:px-12 wide:px-16' : 'mt-0'} ${className}`}>
        <div className={showPrimaryContent ? 'mx-auto w-full max-w-7xl' : 'w-full px-4 tablet:px-6 laptop:px-8 desktop:px-12 wide:px-16'}>
          {showPrimaryContent && (
            <div className="flex flex-col gap-10 p-4 py-12 tablet:gap-12 tablet:pb-16 laptop:flex-row laptop:justify-between">
              <div className="flex max-w-lg flex-col gap-4">
                <Link href="/" className="flex items-center gap-8">
                  <BitcodeSoftwareSvgLogo
                    width="115px"
                    height="auto"
                    softwareOffsetY="-4px"
                  />
                </Link>
                <div className="max-w-lg">
                  <div className="z-10 mt-2 flex w-full flex-col items-start text-left">
                    <ol className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm tablet:text-base">
                      {BITCODE_PUBLIC_COPY.footer.steps.map((step, index) => (
                        <li key={step} className="step-item">
                          {index < 2 ? (
                            <>
                              <span className="text-green-primary step-number">{index + 1}.</span>
                              <span className="step-text">{step}</span>
                            </>
                          ) : (
                            <>
                              <span className="flask-icon inline-block [filter:drop-shadow(0_0_6px_rgba(101,254,183,0.66))_drop-shadow(0_0_15px_rgba(101,254,183,0.33))]">🧪</span>
                              <span className="relative inline-block">
                                <span className="relative z-10 bitcode-text">{step}</span>
                                <span className="absolute left-0 top-0 z-0 bitcode-text-glow">{step}</span>
                              </span>
                            </>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                {(FEATURE_FLAGS.DISABLE_USING || disableAuxillaries) && !user ? (
                  <div className="w-full max-w-xs">
                    <DisabledTooltipWrapper tooltip={DISABLED_FEATURE_TOOLTIPS.auxillaries} className="block w-full">
                      <button
                        disabled
                        aria-disabled="true"
                        className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-1 rounded-none border border-white/10 bg-white/[0.03] px-4 py-2 text-neutral-400 opacity-65 filter grayscale"
                      >
                        {BITCODE_PUBLIC_COPY.footer.guestCta}
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-1 size-4"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </DisabledTooltipWrapper>
                  </div>
                ) : (
                  <button
                    type="button"
                    onMouseEnter={() => prefetchAuxillaries()}
                    onClick={() => openAuxillaries(user ? 'auxillaries' : 'connect', user ? 'profile' : undefined)}
                    className="mt-3 inline-flex w-full max-w-xs items-center justify-center gap-1 rounded-none border border-emerald-300/24 bg-emerald-400/10 px-4 py-2 font-medium text-emerald-50 transition hover:border-emerald-300/42 hover:bg-emerald-400/16"
                  >
                    {footerCtaLabel}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2 tablet:gap-6 laptop:min-w-[16rem]">
                {footerNavs.map((nav) => (
                  <div key={nav.label}>
                    <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                      {nav.label}
                    </h2>
                    <ul className="grid gap-2">
                      {nav.items.map((item) => {
                        const isDisabled = item.name === 'Terms';
                        return (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={
                                isDisabled
                                  ? 'inline-flex items-center justify-start gap-1 text-gray-400 dark:text-gray-400 opacity-50 cursor-default pointer-events-none'
                                  : 'group inline-flex cursor-pointer items-center justify-start gap-1 text-gray-400 duration-200 hover:text-gray-600 hover:opacity-90 dark:text-gray-400 dark:hover:text-gray-200'
                              }
                              target={item.href.startsWith('http') ? '_blank' : undefined}
                              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            >
                              {item.name}
                              {!isDisabled && (
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100"
                                >
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              )}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`${showPrimaryContent ? 'border-t' : ''} w-full py-4`}>
            <div className="flex w-full flex-col gap-4 tablet:gap-5">
              {/* One row from laptop up (5 product/surface links). */}
              <div className="grid w-full grid-cols-1 gap-2 phone:grid-cols-2 laptop:grid-cols-5">
                {footerLinks.map((social) => {
                  const isDisabledRoute = social.href === PACKS_URL && disablePacksLink;
                  const explainerButton = social.explainer ? (
                    <BitcodeInlineExplainer
                      explainer={social.explainer}
                      side="top"
                      triggerClassName="h-4.5 w-4.5 shrink-0 border-white/8 bg-white/[0.03] text-[0.58rem] text-gray-400 hover:border-emerald-300/30 hover:bg-emerald-400/10 hover:text-emerald-100"
                    />
                  ) : null;

                  const cardClassName = `group inline-flex min-h-[4.25rem] w-full items-start gap-3 rounded-none border border-white/8 bg-white/[0.03] px-3.5 py-3 text-left text-sm text-gray-500 transition-colors dark:text-gray-400 ${social.hoverClassName}`;

                  return isExternalHref(social.href) ? (
                    <a
                      key={social.ariaLabel}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className={cardClassName}
                    >
                      {social.icon}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="whitespace-nowrap">{social.label}</span>
                        <span aria-hidden="true" className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-500/70 dark:text-gray-500/80">
                          {social.meta}
                        </span>
                      </span>
                    </a>
                  ) : isDisabledRoute ? (
                    <span key={social.ariaLabel} className="block w-full">
                      <DisabledTooltipWrapper
                        tooltip={DISABLED_FEATURE_TOOLTIPS.packs}
                        className="w-full"
                      >
                        <span
                          role="link"
                          aria-disabled="true"
                          aria-label={social.ariaLabel}
                          className="group inline-flex min-h-[4.25rem] w-full cursor-not-allowed items-start gap-3 rounded-none border border-white/8 bg-white/[0.02] px-3.5 py-3 text-left text-sm text-gray-500 opacity-65 grayscale"
                        >
                          {social.icon}
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="flex min-w-0 items-start justify-between gap-2">
                              <span className="min-w-0 whitespace-nowrap">{social.label}</span>
                              {explainerButton}
                            </span>
                            <span aria-hidden="true" className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-500/70 dark:text-gray-500/80">
                              {social.meta}
                            </span>
                          </span>
                        </span>
                      </DisabledTooltipWrapper>
                    </span>
                  ) : (
                    <span
                      key={social.ariaLabel}
                      className={cardClassName}
                    >
                      {social.icon}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="flex min-w-0 items-start justify-between gap-2">
                          <Link
                            href={social.href}
                            aria-label={social.ariaLabel}
                            className={`min-w-0 whitespace-nowrap transition-colors ${social.labelHoverClassName}`}
                          >
                            {social.label}
                          </Link>
                          {explainerButton}
                        </span>
                        <span aria-hidden="true" className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-500/70 dark:text-gray-500/80">
                          {social.meta}
                        </span>
                      </span>
                    </span>
                  );
                })}
                {/* FEATURE_FLAGS.FOOTER_MUSIC_PLAYER && (
                  <AudioPlayer
                    src="/audio/footer-vibe.mp3"
                    songName="Right Right Right (Paris) * Nils Frahm"
                  />
                ) */}
              </div>
              {/*
                Footer chrome rows:
                1) copyright (left) + Bitcode mark (right)
                2) X + email (left) + version + protocol spec (right)
              */}
              <div className="flex w-full flex-col gap-3">
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="flex min-w-0 items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-block shrink-0 [filter:drop-shadow(0_0_6px_rgba(101,254,183,0.66))_drop-shadow(0_0_15px_rgba(101,254,183,0.33))]">
                      🧪
                    </span>
                    <span className="min-w-0">
                      Bitcode by Advanced Engineered Software, Inc.{' '}
                      <span className="font-light">{new Date().getFullYear()}</span>
                    </span>
                  </span>
                  <Link href="/" className="shrink-0 cursor-pointer">
                    <BitcodeSoftwareSvgLogo
                      width="50px"
                      height="auto"
                      className="-mb-0.5"
                      softwareClassName="ml-0.5 font-light text-xs tracking-wide bg-gradient-to-r from-[#65FEB7] via-white to-[#65FEB7] text-transparent bg-clip-text"
                      softwareOffsetY="-2px"
                    />
                  </Link>
                </div>

                <div className="flex w-full items-center justify-between gap-4">
                  <span className="inline-flex shrink-0 items-center gap-2 text-[12px]">
                    <a
                      href={BITCODE_X_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Bitcode on X"
                      className="inline-flex items-center justify-center rounded-none border border-white/8 bg-white/[0.03] p-1.5 text-gray-400 transition-colors hover:border-emerald-300/25 hover:bg-emerald-400/[0.06] hover:text-emerald-100"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                        fill="currentColor"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                      </svg>
                    </a>
                    <a
                      href={BITCODE_SUPPORT_MAILTO}
                      aria-label={`Email ${BITCODE_SUPPORT_EMAIL_ADDRESS}`}
                      className="pointer-events-auto relative z-10 inline-flex cursor-pointer items-center gap-1.5 rounded-none border border-white/8 bg-white/[0.03] px-2.5 py-1 text-gray-400 underline-offset-2 transition-colors hover:border-emerald-300/25 hover:bg-emerald-400/[0.06] hover:text-emerald-100 hover:underline"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="1.5" />
                        <path d="m4 7 8 6 8-6" />
                      </svg>
                      <span>{BITCODE_SUPPORT_EMAIL_ADDRESS}</span>
                    </a>
                  </span>

                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-[11px] text-gray-400/80">
                    {process.env.NEXT_PUBLIC_APP_VERSION && (
                      <span className="select-none rounded-none border border-white/8 bg-white/[0.03] px-2.5 py-1">
                        v{process.env.NEXT_PUBLIC_APP_VERSION}
                        {process.env.NEXT_PUBLIC_APP_VERSION_DATE && (
                          <>
                            {' '}
                            (
                            {new Date(process.env.NEXT_PUBLIC_APP_VERSION_DATE).toLocaleDateString(
                              undefined,
                              {
                                year: '2-digit',
                                month: 'short',
                                day: 'numeric',
                              },
                            )}
                            )
                          </>
                        )}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-none border border-white/8 bg-white/[0.03] px-2.5 py-1">
                      <a
                        href={CURRENT_PROTOCOL_SPEC_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300/90 transition-colors hover:text-white"
                      >
                        Protocol spec
                      </a>
                      <BitcodeInlineExplainer
                        explainer={BITCODE_PUBLIC_EXPLAINERS.protocolSpec}
                        side="top"
                        triggerClassName="h-4.5 w-4.5 border-white/8 bg-white/[0.03] text-[0.58rem] text-gray-400 hover:border-emerald-300/30 hover:bg-emerald-400/10 hover:text-emerald-100"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Styles moved to global CSS for better caching */}
    </>
  );
}
