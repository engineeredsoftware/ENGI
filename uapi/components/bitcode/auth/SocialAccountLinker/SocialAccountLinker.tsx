"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@bitcode/supabase/ssr/client'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import ChatGPTIcon from '@/components/bitcode/icons/social/ChatGPTIcon/ChatGPTIcon'
import MetamaskIcon from '@/components/bitcode/icons/social/MetamaskIcon/MetamaskIcon'
import { toast } from '@/components/shadcn/Sonner/Sonner'
import { buildSupabaseAuthCallbackRedirect } from '@bitcode/auth/supabase-auth-redirect'
import dynamic from 'next/dynamic'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

// Lazy load ConfirmModal to avoid adding framer-motion earlier than needed
const ConfirmModal = dynamic(() => import('../overlays/ConfirmModal'))

const providerLabels = {
  github: 'GitHub',
  google: 'Google',
  chatgpt: 'ChatGPT',
  metamask: 'MetaMask',
} as const

interface SocialAccountLinkerProps {
  provider: 'github' | 'google' | 'chatgpt' | 'metamask'
  /** Compact renders just icon + status */
  compact?: boolean
}

const oauthLinkableProviders = new Set<SocialAccountLinkerProps['provider']>(['github', 'google'])

type SupabaseIdentity = {
  id?: string
  provider?: string
}

function resolveIdentity(
  identities: SupabaseIdentity[] | undefined,
  provider: SocialAccountLinkerProps['provider'],
) {
  return (identities || []).find((identity) => identity.provider === provider) ?? null
}

export default function SocialAccountLinker({ provider, compact = false }: SocialAccountLinkerProps) {
  const supabase = createClient()
  const [linked, setLinked] = useState<boolean | null>(null) // null = loading
  const [identityId, setIdentityId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const providerLabel = providerLabels[provider]
  const isSupported = oauthLinkableProviders.has(provider)

  // Fetch current identities once
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser()
      const match = resolveIdentity(data.user?.identities, provider)
      setLinked(Boolean(match))
      setIdentityId(match?.id ?? null)
    })()
  }, [provider, supabase])

  // Refresh identities when auth session changes (e.g., after linking)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((
      _evt: AuthChangeEvent,
      _session: Session | null,
    ) => {
      supabase.auth.getUser().then(({ data }: { data: { user: { identities?: SupabaseIdentity[] } | null } }) => {
        const match = resolveIdentity(data.user?.identities, provider)
        setLinked(Boolean(match))
        setIdentityId(match?.id ?? null)
      })
    })
    return () => sub.subscription.unsubscribe()
  }, [provider, supabase])

  const handleLink = async () => {
    if (!isSupported) {
      toast.error(
        provider === 'metamask'
          ? 'Wallet-provider verification remains staged through Profile and is not yet available as direct account linking'
          : `${providerLabel} account linking is not yet available in the active Bitcode surface`,
      )
      return
    }
    setLoading(true)
    try {
      const authAny = supabase.auth as any
      const redirectTo = buildSupabaseAuthCallbackRedirect(window.location.pathname)
      // Build OAuth options; include offline/consent for Google to get refresh tokens
      const oauthOptions: any = { redirectTo };
      if (provider === 'google') {
        oauthOptions.queryParams = { access_type: 'offline', prompt: 'consent' };
      }
      if (typeof authAny.linkWithOAuth === 'function') {
        await authAny.linkWithOAuth({ provider, options: oauthOptions })
      } else {
        await supabase.auth.signInWithOAuth({ provider, options: oauthOptions })
      }
      // UI will refresh after callback; optimistically mark as linked
      setLinked(true)
    } catch (err: any) {
      toast.error(err?.message || 'Unable to link account')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlink = async () => {
    if (!identityId) return
    setLoading(true)
    try {
      const authAny = supabase.auth as any
      if (typeof authAny.unlinkIdentity === 'function') {
        await authAny.unlinkIdentity(identityId)
      } else {
        const response = await fetch('/api/auth/unlink', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider }),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || 'Failed to disconnect account')
        }
      }
      toast.success('Account disconnected')
      setLinked(false)
      setIdentityId(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to disconnect')
    } finally {
      setLoading(false)
    }
  }
  const openConfirm = () => setShowConfirm(true)
  const closeConfirm = () => setShowConfirm(false)

  const icons = {
    github: <FaGithub className="h-5 w-5" />,
    google: <FcGoogle className="h-5 w-5" />,
    chatgpt: <ChatGPTIcon className="h-5 w-5" />,
    metamask: <MetamaskIcon className="h-5 w-5" />,
  }

  const statusBadge = linked ? (
    <span className="text-green-500 text-xs">Connected</span>
  ) : !isSupported ? (
    <span className="text-white/45 text-xs uppercase tracking-[0.18em]">Unavailable</span>
  ) : (
    <span className="text-muted-foreground text-xs">Not connected</span>
  )

  if (linked === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icons[provider]}
        Checking…
      </div>
    )
  }

  const confirmModal = (
    <ConfirmModal
      open={showConfirm}
      onCancel={closeConfirm}
      onConfirm={() => {
        closeConfirm()
        handleUnlink()
      }}
      title={`Disconnect ${providerLabel}?`}
      description="You’ll no longer be able to sign in with this provider until you connect it again."
      confirmLabel="Disconnect"
      variant="danger"
    />
  )

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2">
          {icons[provider]}
          {statusBadge}
          {linked ? (
            <button
              type="button"
              onClick={openConfirm}
              className="text-xs text-destructive hover:underline"
            >
              Disconnect
            </button>
          ) : !isSupported ? (
            <span className="text-xs text-white/45">Unavailable</span>
          ) : (
            <button
              type="button"
              onClick={handleLink}
              disabled={loading}
              className="text-xs text-primary hover:underline disabled:opacity-50"
            >
              {loading ? '…' : 'Connect'}
            </button>
          )}
        </div>
        {confirmModal}
      </>
    )
  }

  return (
    <>
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 shadow-[0_14px_36px_rgba(0,0,0,0.18)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80">
          {icons[provider]}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-white">{providerLabel}</div>
          <div className="text-xs text-white/58">
            {linked
              ? 'Connected to your Bitcode account'
              : isSupported
              ? 'Available for sign-in and account linking'
              : provider === 'metamask'
                ? 'Wallet-provider verification remains staged through Profile'
                : 'Not yet available from this orbital surface'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {linked ? (
          <button
            type="button"
            onClick={openConfirm}
            disabled={loading}
            className="rounded-md border px-3 py-1 text-sm hover:bg-destructive/10 text-destructive disabled:opacity-50"
          >
            {loading ? 'Removing…' : 'Disconnect'}
          </button>
        ) : !isSupported ? (
          <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/45">
            Unavailable
          </span>
        ) : (
          <button
            type="button"
            onClick={handleLink}
            disabled={loading}
            className="rounded-md border px-3 py-1 text-sm hover:bg-secondary disabled:opacity-50"
          >
            {loading ? 'Connecting…' : 'Connect'}
          </button>
        )}
      </div>
    </div>
    {confirmModal}
    </>
  )
}
