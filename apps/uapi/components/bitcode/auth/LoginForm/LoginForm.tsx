/* eslint-disable react/no-multi-comp */
"use client"

import React, { Suspense } from 'react'
import Image from 'next/image'

// Static icon imports so they bundle correctly (files currently live in
// app/components/icons).  Using StaticImport lets us feed them directly to
// next/image.
import AppleIcon from '@/components/bitcode/icons/social/Apple.svg'
import MicrosoftIcon from '@/components/bitcode/icons/social/Microsoft.svg'
import BitbucketIcon from '@/components/bitcode/icons/social/Bitbucket.svg'
import FacebookIcon from '@/components/bitcode/icons/social/Facebook.svg'
import FigmaIcon from '@/components/bitcode/icons/social/Figma.svg'
import NotionIcon from '@/components/bitcode/icons/social/Notion.svg'
import GitlabIcon from '@/components/bitcode/icons/social/Gitlab.svg'
import TwitterIcon from '@/components/bitcode/icons/social/Twitter.svg'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import ExecuteButton from '@/components/bitcode/pipeline/ExecuteButton/ExecuteButton'
import { createClient } from '@bitcode/supabase/ssr/client'
import SocialLoginButton from '@/components/bitcode/auth/SocialLoginButton/SocialLoginButton'

// ---------------------------------------------------------------------------
// Helper to place SSO "planets" precisely on the glowing inner orbital ring.
// We read the CSS custom property --ring-inner declared globally so the
// planets always lock onto the exact radius regardless of viewport or future
// design tweaks.
// ---------------------------------------------------------------------------

const PLANET_SIZE = 64 // px diameter, fixed

// Capture separate horizontal and vertical radii so we can plot the planets on
// an *elliptical* path that exactly matches the glowing orbital ring.  Using a
// single circular radius (the previous width/2 implementation) works only
// when the ring renders as a perfect circle – any future responsive tweaks
// that stretch it into an oval throw the planets way off course.  Storing
// both radii fixes the previously reported orbital misalignment.

interface OrbitData {
  cx: number
  cy: number
  rx: number // horizontal radius (width / 2)
  ry: number // vertical   radius (height / 2)
}

function useOrbitData(ringIndex: number = 1): OrbitData | null {
  const [data, setData] = React.useState<OrbitData | null>(null)

  React.useLayoutEffect(() => {
    const selector = `.orbital-system-background.login-background-glow .orbital-ring:nth-child(${ringIndex})`

    function measure(ring: HTMLElement) {
      const rect = ring.getBoundingClientRect()
      setData({
        cx: window.innerWidth / 2,
        cy: window.innerHeight / 2,
        rx: rect.width / 2,
        ry: rect.height / 2,
      })
    }

    let resizeObs: ResizeObserver | null = null
    let mo: MutationObserver | null = null

    function attachResizeObserver(ring: HTMLElement) {
      resizeObs = new ResizeObserver(() => measure(ring))
      resizeObs.observe(ring)
    }

    const initialRing = document.querySelector(selector) as HTMLElement | null
    if (initialRing) {
      measure(initialRing)
      attachResizeObserver(initialRing)
    } else {
      // Wait until the ring mounts
      mo = new MutationObserver(() => {
        const el = document.querySelector(selector) as HTMLElement | null
        if (el) {
          measure(el)
          attachResizeObserver(el)
          if (mo) mo.disconnect()
          mo = null
        }
      })
      mo.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      resizeObs?.disconnect()
      mo?.disconnect()
    }
  }, [])

  return data
}

// Extend generic planet component so it can target additional rings (by index)
// and optionally render arbitrary children instead of a SocialLoginButton.
interface OrbitPlanetProps {
  angleDeg: number
  /** Which orbital ring to lock onto (1 = innermost as used previously). */
  ringIndex?: number
  /** Optional OAuth provider icon+button (inner ring planets). */
  provider?: 'github' | 'google' | 'chatgpt' | 'metamask' | 'apple'
  /** Appearance delay (seconds) */
  delay?: number
  /** Custom content for outer decorative circles */
  children?: React.ReactNode
}

const OrbitPlanet = React.memo(function OrbitPlanet({ angleDeg, ringIndex = 1, provider, delay = 0, children }: OrbitPlanetProps) {
  // Measure the requested ring – defaults to original innermost ring (index 1)
  const orbit = useOrbitData(ringIndex)
  if (!orbit) return null
  
  // Project the planet's centre onto the ellipse described by the ring
  const rad = (angleDeg * Math.PI) / 180
  const offsetX = orbit.rx * Math.cos(rad) - PLANET_SIZE / 2
  const offsetY = orbit.ry * Math.sin(rad) - PLANET_SIZE / 2

  return (
    <motion.div
      key={provider}
      initial={{ opacity: 0, scale: 0, x: offsetX, y: offsetY }}
      animate={{ opacity: 1, scale: 1, x: offsetX, y: offsetY }}
      exit={{ opacity: 0, scale: 0, x: offsetX, y: offsetY }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      className="login-planet"
    >
      {provider ? <SocialLoginButton provider={provider as any} iconOnly /> : children}
    </motion.div>
  )
}, (prev, next) =>
  prev.angleDeg === next.angleDeg &&
  prev.ringIndex === next.ringIndex &&
  prev.provider === next.provider &&
  prev.delay === next.delay)

/** Simple decorative circle to show unsupported providers on the outer ring */
type OuterProvider = 'apple' | 'microsoft' | 'bitbucket' | 'facebook' | 'figma' | 'notion' | 'gitlab' | 'twitter'

const OuterOrbitCircle = React.memo(function OuterOrbitCircle({ angleDeg, delay = 0, provider }: { angleDeg: number; delay?: number; provider: OuterProvider }) {
  // Build icon element – using the raw SVG asset via <Image> for simplicity
  const sizeClass = 'h-8 w-8';
  const mutedStyle = 'opacity-50 grayscale';
  const forceWhite = provider === 'notion' || provider === 'twitter';

  let iconClass = `${sizeClass} ${mutedStyle}`;
  if (forceWhite) {
    iconClass = `invert brightness-200 ${sizeClass} ${mutedStyle}`;
  }

  const iconMap: Record<OuterProvider, any> = {
    apple: AppleIcon,
    microsoft: MicrosoftIcon,
    bitbucket: BitbucketIcon,
    facebook: FacebookIcon,
    figma: FigmaIcon,
    notion: NotionIcon,
    gitlab: GitlabIcon,
    twitter: TwitterIcon,
  };

  const iconSrc = iconMap[provider];

  return (
    <OrbitPlanet angleDeg={angleDeg} ringIndex={2} delay={delay}>
      {/*
       * Render a disabled, icon-only SSO button that matches the styling of
       * the interactive inner-ring planets.  Using the same absolute/inset
       * layout ensures the soft background tint fills the entire circular
       * container without the unintended padding previously visible on the
       * outer eight planets.
       */}
      <div
        className="absolute inset-0 flex items-center justify-center rounded-full text-white backdrop-blur-lg
          bg-white/5 pointer-events-none cursor-not-allowed opacity-50"
      >
        <Image
          src={iconSrc}
          alt={`${provider} logo`}
          width={32}
          height={32}
          className={iconClass}
        />
      </div>
    </OrbitPlanet>
  );
})

interface LoginFormProps {
  onClose?: () => void;
  /** Called to switch to account creation (signup) view */
  onToggle?: () => void;
  surfaceVariant?: 'default' | 'contained';
}
function LoginFormInner({ onClose, onToggle, surfaceVariant = 'default' }: LoginFormProps) {
  // Using manual fetch for OTP flows; supabase client not used
  const router = useRouter()
  // Preserve next path including any query params
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const nextParam = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const isContainedSurface = surfaceVariant === 'contained'
  const nextWorkspacePath =
    nextParam.startsWith('/auxillaries') ||
    nextParam.startsWith('/exchange') ||
    nextParam.startsWith('/exchange')
      ? nextParam
      : '/exchange'
  
  // Check for invite token / team-invite lock in URL params
  const inviteToken = searchParams.get('invite')
  const inviteEmail = searchParams.get('email')
  const isTeamInvite =
    searchParams.get('team_invite') === '1' || searchParams.get('team_invite') === 'true'
  const teamInviteRole = searchParams.get('invite_role') || ''
  const teamInviteOrg = searchParams.get('org') || ''
  const lockedInviteEmail = Boolean(
    (inviteEmail && isTeamInvite) || inviteToken,
  )

  const [stage, setStage] = React.useState<'request' | 'verify' | 'success'>('request')
  // track if user navigated back from verify to show 'forward' arrow
  const [backFromVerify, setBackFromVerify] = React.useState(false)
  const [email, setEmail] = React.useState(inviteEmail || searchParams.get('email') || '')
  const [otp, setOtp] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  // Cooldown timer (seconds) after hitting rate limit
  const [cooldown, setCooldown] = React.useState(0)
  const [inviteDetails, setInviteDetails] = React.useState<any>(null)
  const isVerificationStage = stage === 'verify'
  const containedStageTitle = isVerificationStage
    ? 'Enter the code we sent to your email'
    : 'Email is optional after wallet authentication'
  const containedStageCopy = isVerificationStage
    ? `We sent a one-time code to ${email}. Verify it here to reopen transactions, Auxillaries, and the active detail context.`
    : 'Use Profile to connect a Bitcoin wallet first. Email remains an optional notification and recovery contact.'

  // Decrease cooldown every second
  React.useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown(c => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  // Fetch invitation details if invite token is present
  React.useEffect(() => {
    if (inviteToken) {
      const fetchInviteDetails = async () => {
        try {
          const response = await fetch(`/api/invitations/accept?token=${inviteToken}`)
          const data = await response.json()
          if (response.ok) {
            setInviteDetails(data.invitation)
            setEmail(data.invitation.email)
          }
        } catch (err) {
          console.error('Error fetching invitation details:', err)
        }
      }
      fetchInviteDetails()
    }
  }, [inviteToken])

  /**
   * Request a one-time login code for the supplied email address.
   *
   * We now leverage the Supabase JS client instead of hitting the REST
   * endpoint manually.  This gives us built-in retry / error handling and –
   * most importantly – ensures that we are sending the additional
   * `shouldCreateUser: true` flag required for connect-with-OTP flows when the
   * user doesn’t already exist.
   */
  const handleRequest = async (e?: React.FormEvent | React.MouseEvent) => {
    // Allow the same handler to be used by <form onSubmit> (which passes the
    // event) and by the custom Execute Button (which currently passes *nothing*).
    if (e) e.preventDefault()

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Attempt to create the user automatically (shouldCreateUser = true).
      //
      // Supabase returns a 400 error with the message **"User already
      // registered"** when the email address already has an account.  We do
      // _not_ want to expose this information (to avoid leaking which emails
      // have accounts) so we transparently fall back to a second
      // `signInWithOtp` call **without** the `shouldCreateUser` flag.  This
      // resends a normal login code to the existing user while maintaining a
      // unified, opaque success flow for _both_ new and existing emails.
      const { error: createError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // Include a magic-link to our /tps/supabase/callback page in the OTP email
          emailRedirectTo: `${window.location.origin}/tps/supabase/callback`,
        },
      })

      if (createError && /too\s+many|rate\s+limit|429/i.test(createError.message)) {
        // Too many requests – start 30-second cooldown.
        setError('Too many attempts – wait before trying again.')
        setCooldown(30)
      } else if (createError && /already\s+registered/i.test(createError.message)) {
        // Email already has an account – resend login code without creating
        // a new user.  Ignore any secondary error to keep behaviour opaque.
        await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            // Ensure the OTP email link consistently points to our callback
            emailRedirectTo: `${window.location.origin}/tps/supabase/callback`,
          },
        })
        // Treat as success – move to OTP verification stage regardless of the
        // outcome of the fallback call.
        setStage('verify')
      } else if (createError) {
        // Other errors (network, invalid email, etc.) – present a generic
        // failure message that doesn't reveal account existence.
        setError('Failed to send login code. Please try again.')
      } else {
        // No error – OTP email sent for a brand-new account.
        setStage('verify')
      }
    } catch (err: any) {
      setError(err.message || 'Error sending code')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Verify a previously sent one-time code.
   */
  const handleVerify = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault()

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (error) {
        if (/expired|invalid/i.test(error.message)) {
          setError('Invalid or expired code – request a new one.')
        } else {
          setError(error.message || 'Error verifying code')
        }
      } else {
        setStage('success')
        // After a brief delay, handle invite acceptance or normal flow
        setTimeout(async () => {
          // If there's an invite token, try to accept the invitation
          if (inviteToken) {
            try {
              const acceptResponse = await fetch('/api/invitations/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: inviteToken }),
              })
              
              if (acceptResponse.ok) {
                const acceptData = await acceptResponse.json()
                onClose?.()
                router.push(`/dashboard?org=${acceptData.organization.slug}&welcome=true`)
                return
              }
            } catch (err) {
              console.error('Error accepting invitation:', err)
            }
          }

          // Normal flow - check onboarding status
          let completedOnboarding = false
          try {
            const res = await fetch('/api/auxillaries/data')
            if (res.ok) {
              const data = await res.json()
              completedOnboarding = Boolean(data.githubConnection && data.btdBalance > 0)
            }
          } catch {
            completedOnboarding = false
          }
          if (completedOnboarding) {
            // Return to the live Bitcode instead of the former demo route.
            onClose?.()
            try {
              router.push(nextWorkspacePath)
            } catch {
              window.location.href = nextWorkspacePath
            }
          } else {
            // Continue onboarding in-place
            onToggle?.()
          }
        }, 300)
      }
    } catch (err: any) {
      setError((err as Error).message || 'Error verifying code')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeEmail = () => {
    setStage('request');
    setBackFromVerify(true);
    setOtp('');
    // Focus email field on next tick once it exists again.
    requestAnimationFrame(() => {
      const el = document.getElementById('email');
      el?.focus();
    });
  };

  /** Navigate forward to the verify stage after going back */
  const handleGoToVerify = () => {
    setStage('verify');
  };

  return (
    <div className={`relative ${isContainedSurface ? 'login-form-surface-contained' : ''}`}>
      <form
        onSubmit={stage === 'request' ? handleRequest : handleVerify}
        className=""
      >
        <input type="hidden" name="next" value={nextParam} />

        <div className={`relative ${isContainedSurface ? 'pb-4' : 'pt-12 pb-8'}`}>
          {isContainedSurface && stage !== 'success' ? (
            <div className="orbital-login-stage-header">
              <p className="orbital-login-stage-kicker">
                {isVerificationStage ? 'Verification step' : 'Primary path'}
              </p>
              <h3 className="orbital-login-stage-title">{containedStageTitle}</h3>
              <p className="orbital-login-stage-copy">{containedStageCopy}</p>
            </div>
          ) : null}
          {/* Stage-specific content */}
          <AnimatePresence initial={false} mode="wait">
            {stage !== 'success' ? (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ willChange: 'opacity, transform' }}
                className="transform-gpu"
              >
                {stage === 'request' && (
                  <div className="flex flex-col gap-4">
                    {inviteDetails && (
                      <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-none">
                        <div className="text-sm text-emerald-300 mb-1">Team invitation</div>
                        <div className="text-white font-medium">{inviteDetails.organization.name}</div>
                        <div className="text-xs text-gray-400">
                          Role: {inviteDetails.role} • Invited by {inviteDetails.invitedBy.display_name || inviteDetails.invitedBy.username}
                        </div>
                      </div>
                    )}
                    {isTeamInvite && !inviteDetails && (
                      <div
                        className="mb-2 rounded-none border border-emerald-400/25 bg-emerald-400/10 p-3"
                        data-testid="login-team-invite-banner"
                      >
                        <div className="text-sm font-medium text-emerald-100">Team invitation</div>
                        <div className="mt-1 text-xs leading-5 text-emerald-100/75">
                          {teamInviteOrg ? (
                            <>
                              Join <span className="font-semibold text-white">{teamInviteOrg}</span>
                              {teamInviteRole ? (
                                <>
                                  {' '}
                                  as <span className="font-semibold text-white">{teamInviteRole}</span>
                                </>
                              ) : null}
                              . Your email is locked for this invite.
                            </>
                          ) : (
                            <>Create your Bitcode account with the locked invite email below.</>
                          )}
                        </div>
                      </div>
                    )}
                    <label htmlFor="email" className="form-label ml-[19px]">
                      {lockedInviteEmail ? 'Invite email (locked)' : 'Email Address'}
                    </label>
                    <input
                      data-testid="login-email-input"
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="form-input"
                      placeholder={
                        lockedInviteEmail
                          ? inviteDetails?.email || inviteEmail || 'Invite email'
                          : 'Enter your email'
                      }
                      value={email}
                      onChange={(e) => {
                        if (lockedInviteEmail) return
                        setEmail(e.target.value)
                      }}
                      disabled={lockedInviteEmail}
                      readOnly={lockedInviteEmail}
                      autoFocus={!lockedInviteEmail}
                    />
                    {lockedInviteEmail ? (
                      <p className="text-xs text-white/50 ml-[19px]">
                        This address was set by your team invite and cannot be changed during signup.
                      </p>
                    ) : null}
                  </div>
                )}
                {stage === 'verify' && (
                  <div className="flex flex-col gap-4">
                    {/* Sent to info at top */}
                    {isContainedSurface ? (
                      <p className="orbital-login-inline-meta">
                        Sent to <span className="font-medium text-white" title={email}>{email}</span>
                      </p>
                    ) : (
                      <div className="absolute top-5 inset-x-0 text-right text-xs text-gray-400 px-2">
                        Sent to <span className="font-medium text-white truncate" title={email}>{email}</span>
                      </div>
                    )}
                    <label htmlFor="otp" className="form-label ml-[19px]">Verification Code</label>
                    <input
                      data-testid="login-otp-input"
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      className="form-input"
                      placeholder="Enter code from email"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      autoFocus
                    />
                    {/* Bottom actions: Change and Resend */}
                    {isContainedSurface ? (
                      <div className="orbital-login-inline-actions">
                        <button
                          type="button"
                          onClick={handleChangeEmail}
                          className="orbital-login-inline-action"
                        >
                          Change Email
                        </button>
                        <button
                          type="button"
                          onClick={handleRequest}
                          disabled={cooldown > 0}
                          className="orbital-login-inline-action"
                        >
                          Resend Code
                        </button>
                      </div>
                    ) : (
                      <div className="absolute -bottom-6 inset-x-0 flex justify-between text-xs text-gray-400 px-2">
                        <button
                          type="button"
                          onClick={handleChangeEmail}
                          className="underline text-green-primary"
                        >
                          Change Email
                        </button>
                          <button
                          type="button"
                          onClick={handleRequest}
                            disabled={cooldown>0}
                          className="underline text-green-primary"
                        >
                          Resend Code
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                style={{ willChange: 'opacity, transform' }}
                className={`${isContainedSurface ? 'relative min-h-[14rem]' : 'fixed inset-0'} flex flex-col items-center justify-center gap-2 text-center text-green-primary transform-gpu`}
              >
                {/* Decorative success orbital particle animation */}
                {isContainedSurface ? null : (
                  <>
                    <div className="login-decor login-decor-left">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="login-decor-particle"
                          style={{ '--angle': `${i * 72}deg` } as React.CSSProperties}
                        />
                      ))}
                    </div>
                    <div className="login-decor login-decor-right">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          className="login-decor-particle"
                          style={{ '--angle': `${(360 / 7) * i}deg` } as React.CSSProperties}
                        />
                      ))}
                    </div>
                  </>
                )}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-xl font-semibold text-green-primary tracking-wide drop-shadow-glow-emerald"
                >
                  Success! Opening Bitcode…
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Forward arrow for users who went back from verify */}
          {stage === 'request' && backFromVerify && (
            <div className="absolute bottom-0 inset-x-0 flex justify-end text-xs text-gray-400 pr-2">
              <button
                type="button"
                onClick={handleGoToVerify}
                className="text-gray-400 hover:text-gray-500 p-1"
                aria-label="Return to verification"
              >
                &rarr;
              </button>
            </div>
          )}
          {/* Error message (absolute, no layout shift) */}
          <AnimatePresence initial={false} mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                data-testid="login-error"
                className={`${isContainedSurface ? 'mt-3 text-red-400 text-sm text-center' : 'absolute inset-x-0 -bottom-3 text-red-500 text-sm text-center'}`}
                style={{ willChange: 'opacity' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Animated action button */}
        <AnimatePresence initial={false} mode="wait">
          {stage !== 'success' && (
            <motion.div
              key="dobutton"
              className={`relative flex items-center justify-center ${isContainedSurface ? 'mt-2 pb-0' : 'mt-0 mb-0 pb-2'}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              style={{ willChange: 'opacity, transform' }}
            >
              <ExecuteButton
                data-testid={stage === 'request' ? 'login-send-code' : 'login-verify-code'}
                isProcessing={loading}
                onSubmit={stage === 'request' ? handleRequest : handleVerify}
                disabled={loading || (stage === 'request' && cooldown > 0)}
                label={stage === 'request'
                  ? cooldown > 0
                    ? `Wait ${cooldown}s`
                    : 'Send Connect Code'
                  : 'Verify Code'}
                processingLabel={stage === 'request' ? 'Sending…' : 'Verifying…'}
                cancelLabel="Cancel"
                allowCancel={false}
                compact
                transformOnProcessing={false}
                className="!w-max !block mx-auto rounded-none border border-emerald-300/28 bg-[linear-gradient(180deg,rgba(4,16,22,0.96),rgba(3,10,18,0.94))] text-emerald-50 shadow-[0_18px_44px_rgba(0,0,0,0.24),0_0_0_1px_rgba(101,254,183,0.08)_inset] hover:border-emerald-200/40 hover:shadow-[0_20px_48px_rgba(0,0,0,0.28),0_0_0_1px_rgba(110,231,183,0.12)_inset]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      {/* Decorative auth ring – visible only on the email entry stage */}
      {/* The ring is preserved, but only active providers remain actionable. */}
      <AnimatePresence mode="wait" initial={true}>
        {stage === 'request' && (
          <>
            <div className="mx-auto mb-6 max-w-[28rem] rounded-none border border-emerald-300/14 bg-emerald-400/[0.06] px-4 py-3 text-center text-sm leading-7 text-white/74">
              {isContainedSurface
                ? 'Bitcoin wallet identity and GitHub repository connection are the primary Bitcode prerequisites. Email code remains a fallback access path.'
                : 'Email code remains an access fallback. Bitcoin wallet identity and GitHub repository connection are the primary Bitcode prerequisites.'}
            </div>

            {isContainedSurface ? null : (
              <>
                {/* Inner ring: active providers plus primary email-code posture and staged wallet. */}
                <OrbitPlanet angleDeg={35} provider="github" delay={0.7} />
                <OrbitPlanet angleDeg={71.67} delay={0.85}>
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-full border border-emerald-300/24 bg-emerald-400/10 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/90 backdrop-blur-lg"
                    aria-hidden="true"
                  >
                    OTP
                  </div>
                </OrbitPlanet>
                <OrbitPlanet angleDeg={108.33} delay={1.0}>
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-full border border-orange-200/24 bg-orange-300/10 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-100/90 backdrop-blur-lg"
                    aria-hidden="true"
                  >
                    BTC
                  </div>
                </OrbitPlanet>

                {/* Outer ring reserved-provider carriers. */}
                <OuterOrbitCircle provider="apple" angleDeg={10} delay={1.4} />
                <OuterOrbitCircle provider="microsoft" angleDeg={32.5} delay={1.55} />
                <OuterOrbitCircle provider="bitbucket" angleDeg={55} delay={1.7} />
                <OuterOrbitCircle provider="facebook" angleDeg={77.5} delay={1.85} />
                <OuterOrbitCircle provider="figma" angleDeg={102.5} delay={2.0} />
                <OuterOrbitCircle provider="notion" angleDeg={125} delay={2.15} />
                <OuterOrbitCircle provider="gitlab" angleDeg={147.5} delay={2.3} />
                <OuterOrbitCircle provider="twitter" angleDeg={170} delay={2.45} />
              </>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LoginForm(props: LoginFormProps) {
  return (
    <Suspense fallback={null}>
      <LoginFormInner {...props} />
    </Suspense>
  );
}
