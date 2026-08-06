"use client"

import React from 'react'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import Image from 'next/image'
import ChatGPTIcon from '@/components/bitcode/icons/social/ChatGPTIcon/ChatGPTIcon';
import MetamaskIcon from '@/components/bitcode/icons/social/MetamaskIcon/MetamaskIcon';
import AppleIcon from '@/components/bitcode/icons/social/Apple.svg'
import MicrosoftIcon from '@/components/bitcode/icons/social/Microsoft.svg'
import { buildSupabaseAuthCallbackRedirect } from '@bitcode/auth/supabase-auth-redirect'
import BitbucketIcon from '@/components/bitcode/icons/social/Bitbucket.svg'
import FacebookIcon from '@/components/bitcode/icons/social/Facebook.svg'
import FigmaIcon from '@/components/bitcode/icons/social/Figma.svg'
import NotionIcon from '@/components/bitcode/icons/social/Notion.svg'
import GitlabIcon from '@/components/bitcode/icons/social/Gitlab.svg'
import TwitterIcon from '@/components/bitcode/icons/social/Twitter.svg'

type SocialProvider =
  | 'github'
  | 'google'
  | 'chatgpt'
  | 'metamask'
  | 'apple'
  | 'microsoft'
  | 'bitbucket'
  | 'facebook'
  | 'figma'
  | 'notion'
  | 'gitlab'
  | 'twitter'

interface SocialLoginButtonProps {
  provider: SocialProvider
  /** Render icon-only circle button */
  iconOnly?: boolean
  /** Preserve `next` query param when redirecting */
  nextPath?: string
  /** Button style variant for connect flow or default login */
  variant?: 'default' | 'signup' | 'icon-square'
  /** Force disabled state (overrides internal provider-based logic) */
  disabled?: boolean
}

export default function SocialLoginButton({ provider, iconOnly = false, nextPath, variant = 'default', disabled: disabledProp }: SocialLoginButtonProps) {
  // Click handler: open Supabase OAuth authorize endpoint in popup
  type IconElement = React.ReactElement<{ className?: string }>

  const cloneIconWithClassName = (element: React.ReactElement, className: string) =>
    React.cloneElement(element as IconElement, { className })

  const readIconClassName = (element: React.ReactElement) =>
    typeof (element.props as { className?: unknown }).className === 'string'
      ? ((element.props as { className?: string }).className ?? '')
      : ''

  const activeProviders = new Set<SocialProvider>(['github', 'google'])
  const stagedProviders = new Set<SocialProvider>(['metamask'])
  const isActiveProvider = activeProviders.has(provider)
  const isStagedProvider = stagedProviders.has(provider)
  const disabled = disabledProp ?? !isActiveProvider
  const handleClick = () => {
    if (disabled) return // no-op when disabled
    // Preserve `next` via origin-local storage; redirect_to must stay
    // query-free or GoTrue's allow-list match fails and the auth code falls
    // back to the Site URL origin, away from the PKCE verifier.
    let np = nextPath
    try {
      if (!np) np = new URLSearchParams(window.location.search).get('next') || undefined
    } catch {}
    const redirectTo = buildSupabaseAuthCallbackRedirect(np)

    // Build the OAuth authorize URL
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '')
    const params = new URLSearchParams({ provider, redirect_to: redirectTo })
    if (provider === 'google') {
      params.set('access_type', 'offline')
      params.set('prompt', 'consent')
    }
    const url = `${supabaseUrl}/auth/v1/authorize?${params.toString()}`

    // Open in new tab (fallback to open again if blocked)
    // Open a centred popup so we can close it programmatically afterwards.
    const h = 620;
    const w = 480;
    const y = window.top?.outerHeight ? Math.max(0, (window.top.outerHeight - h) / 2) : 0;
    const x = window.top?.outerWidth ? Math.max(0, (window.top.outerWidth - w) / 2) : 0;
    const features = `width=${w},height=${h},left=${x},top=${y}`;
    const popup = window.open(url, '_blank', features);
    if (!popup) window.open(url, '_blank');
  }

  const config = {
    github: {
      label: 'Continue with GitHub',
      shortLabel: 'GitHub',
      icon: <FaGithub className="h-8 w-8" />, 
      className: 'text-gray-800 border-gray-800 hover:bg-gray-100',
    },
    google: {
      label: 'Continue with Google',
      shortLabel: 'Google',
      icon: <FcGoogle className="h-8 w-8" />, 
      className: 'text-gray-700 border-gray-300 hover:bg-gray-100',
    },
    chatgpt: {
      label: 'Continue with ChatGPT',
      shortLabel: 'ChatGPT',
      icon: <ChatGPTIcon className="h-8 w-8 text-green-500" />,
      className: 'text-green-600 border-green-500 hover:bg-green-50',
    },
    metamask: {
      label: 'Continue with MetaMask',
      shortLabel: 'MetaMask',
      icon: <MetamaskIcon className="h-8 w-8 text-orange-500" />,
      className: 'text-orange-600 border-orange-500 hover:bg-orange-50',
    },
    apple: {
      label: 'Continue with Apple',
      shortLabel: 'Apple',
      icon: <Image src={AppleIcon} alt="Apple" width={32} height={32} className="h-8 w-8" />,
      className: 'text-gray-800 border-gray-800 hover:bg-gray-100',
    },
    microsoft: {
      label: 'Continue with Microsoft',
      shortLabel: 'Microsoft',
      icon: <Image src={MicrosoftIcon} alt="Microsoft" width={32} height={32} className="h-8 w-8" />,
      className: 'text-blue-600 border-blue-500 hover:bg-blue-50',
    },
    bitbucket: {
      label: 'Continue with Bitbucket',
      shortLabel: 'Bitbucket',
      icon: <Image src={BitbucketIcon} alt="Bitbucket" width={32} height={32} className="h-8 w-8" />,
      className: 'text-blue-700 border-blue-600 hover:bg-blue-50',
    },
    facebook: {
      label: 'Continue with Facebook',
      shortLabel: 'Facebook',
      icon: <Image src={FacebookIcon} alt="Facebook" width={32} height={32} className="h-8 w-8" />,
      className: 'text-blue-600 border-blue-500 hover:bg-blue-50',
    },
    figma: {
      label: 'Continue with Figma',
      shortLabel: 'Figma',
      icon: <Image src={FigmaIcon} alt="Figma" width={32} height={32} className="h-8 w-8" />,
      className: 'text-purple-600 border-purple-500 hover:bg-purple-50',
    },
    notion: {
      label: 'Continue with Notion',
      shortLabel: 'Notion',
      icon: <Image src={NotionIcon} alt="Notion" width={32} height={32} className="h-8 w-8" />,
      className: 'text-gray-800 border-gray-800 hover:bg-gray-100',
    },
    gitlab: {
      label: 'Continue with GitLab',
      shortLabel: 'GitLab',
      icon: <Image src={GitlabIcon} alt="GitLab" width={32} height={32} className="h-8 w-8" />,
      className: 'text-orange-600 border-orange-500 hover:bg-orange-50',
    },
    twitter: {
      label: 'Continue with Twitter',
      shortLabel: 'Twitter',
      icon: <Image src={TwitterIcon} alt="Twitter" width={32} height={32} className="h-8 w-8" />,
      className: 'text-blue-400 border-blue-400 hover:bg-blue-50',
    },
  } as const

  const { label, shortLabel, icon, className: providerClass } = config[provider]
  const inactiveLabel = isStagedProvider ? 'Wallet staged' : `${shortLabel} unavailable`
  const displayLabel = disabled
    ? inactiveLabel
    : variant === 'signup'
    ? shortLabel
    : label
  const disabledReason = isStagedProvider
    ? 'Wallet-provider verification remains staged in Profile; direct wallet connect is not yet active here'
    : `${shortLabel} is not active in the current Bitcode surface`
  // Icon element, override size/color for iconOnly
  let iconElement = icon
  if (iconOnly && React.isValidElement(icon)) {
    const sizeClass = 'h-8 w-8';
    const base = disabled ? `${sizeClass} opacity-50 grayscale` : sizeClass
    switch (provider) {
      case 'github':
        iconElement = cloneIconWithClassName(icon, `${base} text-white`);
        break;
      case 'chatgpt':
        iconElement = cloneIconWithClassName(icon, `${base} invert brightness-200`);
        break;
      default:
        iconElement = cloneIconWithClassName(icon, base);
    }
  }

  // For full-width buttons, apply grayscale/opacity when disabled
  if (!iconOnly && disabled && React.isValidElement(icon)) {
    iconElement = cloneIconWithClassName(
      icon,
      `${readIconClassName(icon)} opacity-60 grayscale`.trim(),
    )
  }
  // button classes
  let baseClass: string
  if (iconOnly) {
    baseClass = `absolute inset-0 flex items-center justify-center rounded-full text-white backdrop-blur-lg ${disabled ? 'bg-white/5 pointer-events-none cursor-not-allowed opacity-50' : 'bg-white/10 hover:bg-white/20'}`
  } else if (variant === 'icon-square') {
    // Square icon-only buttons for profile pane
    if (disabled) {
      baseClass = `flex items-center justify-center rounded-none h-12 w-full bg-white/5 text-white/60 cursor-not-allowed pointer-events-none opacity-50`
    } else {
      baseClass = `flex items-center justify-center rounded-none h-12 w-full
        bg-gradient-to-r from-emerald-400/90 to-teal-400/90
        transition-all ease-in-out
        shadow-md hover:shadow-lg hover:from-emerald-400 hover:to-teal-400`
    }
  } else if (variant === 'signup') {
    if (disabled) {
      baseClass = `flex w-full items-center justify-center gap-2 rounded-none h-14 px-6 bg-white/5 text-white/60 cursor-not-allowed pointer-events-none`
    } else {
      baseClass = `flex w-full items-center justify-center gap-2 rounded-none h-14 px-6
        bg-gradient-to-r from-emerald-400 to-teal-400
        text-slate-900 font-semibold transition-all ease-in-out
        shadow-lg hover:shadow-xl`
    }
  } else {
    baseClass = `flex w-full items-center justify-center gap-2 rounded-none border px-4 py-3 font-medium ${providerClass} ${disabled ? 'opacity-60 cursor-not-allowed pointer-events-none grayscale' : ''}`
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={baseClass}
      aria-disabled={disabled}
      title={disabled ? disabledReason : label}
    >
      {iconElement}
      {!iconOnly && variant !== 'icon-square' && (
        <span className={variant === 'signup' ? 'text-base font-semibold' : 'text-sm font-medium'}>
          {displayLabel}
        </span>
      )}
    </button>
  )
}
