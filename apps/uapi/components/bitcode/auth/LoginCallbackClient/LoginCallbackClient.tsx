"use client";

/**
 * Auth callback shell — one fullscreen page after OAuth / OTP return.
 *
 * OAuth (wallet, social): single center phrase rotates through a 3-step
 * sequence as session work progresses; no kicker/header/subtitle.
 * OTP: large green code + copy only.
 */

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import QuantumEffect from '@/components/bitcode/effects/QuantumEffect/QuantumEffect';
import { consumeAuthNextPath } from '@bitcode/auth/supabase-auth-redirect';

interface LoginCallbackClientProps {
  code: string;
  codeKind?: 'oauth_code' | 'token_hash' | 'none';
  /** Where to redirect after session established ("/" by default) */
  nextPath?: string;
}

/** Three center phrases — same style, one page; map to auth progress. */
const OAUTH_STAGE_PHRASES = [
  'Confirming proof…',
  'Sealing session…',
  'Opening workspace…',
] as const;

type OauthStageIndex = 0 | 1 | 2;

const CENTER_PHRASE_CLASS =
  'text-center text-5xl font-light tracking-tight text-[rgba(103,254,183,0.9)] super-shiny-text laptop:text-7xl';

/**
 * Client-side interactive UI for the login callback route.
 */
export default function LoginCallbackClient({
  code,
  codeKind = 'none',
  nextPath = '/',
}: LoginCallbackClientProps) {
  const [copied, setCopied] = useState(false);
  const [oauthStage, setOauthStage] = useState<OauthStageIndex>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackStartedRef = useRef(false);

  const isOtpFlow = codeKind === 'token_hash' && Boolean(code && code.trim().length > 0);

  const resolveNextPath = () =>
    nextPath && nextPath !== '/' ? nextPath : consumeAuthNextPath() ?? nextPath ?? '/';

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const handleMouse = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      mx.set(e.clientX - (rect.left + rect.width / 2));
      my.set(e.clientY - (rect.top + rect.height / 2));
    };
    node.addEventListener('mousemove', handleMouse);
    return () => node.removeEventListener('mousemove', handleMouse);
  }, [mx, my]);

  /* Focus trap */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const focusRoot = root;
    focusRoot.tabIndex = -1;
    focusRoot.focus({ preventScroll: true });

    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const focusable = focusRoot.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    focusRoot.addEventListener('keydown', handleKey);
    return () => focusRoot.removeEventListener('keydown', handleKey);
  }, []);

  /* OAuth: exchange / wait for session, then hand off */
  useEffect(() => {
    if (isOtpFlow) return;
    if (callbackStartedRef.current) return;
    callbackStartedRef.current = true;

    let cleanup: (() => void) | undefined;
    let stageEnteredAt = Date.now();
    const STAGE_MIN_MS = 520;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const enterStage = async (next: OauthStageIndex) => {
      const elapsed = Date.now() - stageEnteredAt;
      if (elapsed < STAGE_MIN_MS) {
        await sleep(STAGE_MIN_MS - elapsed);
      }
      setOauthStage(next);
      stageEnteredAt = Date.now();
    };

    (async () => {
      const { createClient } = await import('@bitcode/supabase/ssr/client');
      const supabase = createClient();

      let finished = false;

      const complete = async () => {
        if (finished) return;
        finished = true;
        await enterStage(2);
        // Hold the final phrase long enough to read before leaving.
        await sleep(900);
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'oauth-connect-complete' }, '*');
          }
        } catch {
          /* ignore */
        }
        window.close();
        window.location.href = resolveNextPath();
      };

      const callbackKey =
        codeKind === 'oauth_code' && code
          ? `bitcode.supabase.callback.exchanged.${code.slice(0, 80)}`
          : null;

      const completeIfSessionExists = async () => {
        let session;
        try {
          const { data } = await supabase.auth.getSession();
          session = data.session;
        } catch {
          session = null;
        }
        if (!session) return false;
        if (callbackKey) {
          try {
            window.sessionStorage.setItem(callbackKey, '1');
          } catch {
            /* ignore */
          }
        }
        await complete();
        return true;
      };

      // Advance to "Sealing session…" once real work starts (min dwell on proof).
      await enterStage(1);

      const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
      if (codeKind === 'oauth_code' && code) {
        if (callbackKey) {
          try {
            if (
              window.sessionStorage.getItem(callbackKey) === '1' &&
              (await completeIfSessionExists())
            ) {
              return;
            }
          } catch {
            /* ignore */
          }
        }

        try {
          const { data: exchangeData, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            const { bitcodeQaTelemetry } = await import('@bitcode/auth/qa-telemetry');
            bitcodeQaTelemetry('error', 'supabase-callback', 'exchange-code-failed', {
              message: error.message,
              name: error.name,
              status: (error as { status?: number }).status ?? null,
              codeKind,
              hasSession: Boolean(exchangeData?.session),
              origin: typeof window !== 'undefined' ? window.location.origin : null,
              href: typeof window !== 'undefined' ? window.location.href.slice(0, 240) : null,
            });
            throw error;
          }
          if (callbackKey) {
            try {
              window.sessionStorage.setItem(callbackKey, '1');
            } catch {
              /* ignore */
            }
          }
          try {
            await fetch('/api/vcs/github/connection', {
              method: 'GET',
              credentials: 'same-origin',
            });
          } catch {
            /* claim is best-effort */
          }
          await complete();
          return;
        } catch (exchangeError) {
          if (await completeIfSessionExists()) return;
          await sleep(300);
          if (await completeIfSessionExists()) return;

          const rawMessage =
            exchangeError instanceof Error ? exchangeError.message : String(exchangeError);
          const message = /unable to exchange external code/i.test(rawMessage)
            ? 'Wallet signed, but Supabase could not exchange the Bitcode OAuth code. Confirm Token/Userinfo URLs and BITCODE_BITCOIN_OAUTH_CLIENT_SECRET match the Supabase custom provider on this deploy.'
            : rawMessage;
          try {
            const { bitcodeQaTelemetry } = await import('@bitcode/auth/qa-telemetry');
            bitcodeQaTelemetry('error', 'supabase-callback', 'exchange-unrecoverable', {
              message: rawMessage,
              operatorMessage: message,
              codeKind,
            });
          } catch {
            /* ignore */
          }
          window.location.replace(
            `/?connectError=server_error&connectErrorDescription=${encodeURIComponent(message)}`,
          );
          return;
        }
      }

      if (hash.startsWith('#')) {
        const p = new URLSearchParams(hash.slice(1));
        const access_token = p.get('access_token');
        const refresh_token = p.get('refresh_token') || p.get('provider_refresh_token');
        if (access_token && refresh_token) {
          try {
            await supabase.auth.setSession({ access_token, refresh_token });
          } catch {
            /* fall through */
          }
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await complete();
      }

      const { data: listener } = supabase.auth.onAuthStateChange((event: string) => {
        if (event === 'SIGNED_IN') void complete();
      });

      const timeout = setTimeout(() => {
        void complete();
      }, 5000);

      cleanup = () => {
        listener.subscription.unsubscribe();
        clearTimeout(timeout);
      };
    })();

    return () => {
      cleanup?.();
    };
  }, [code, codeKind, nextPath, isOtpFlow]);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
  };

  useEffect(() => {
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.close();
        window.location.href = nextPath || '/';
      }
    };
    window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, [nextPath]);

  const phrase = OAUTH_STAGE_PHRASES[oauthStage];

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black backdrop-blur-md pointer-events-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      aria-busy={!isOtpFlow && oauthStage < 2}
      aria-label={isOtpFlow ? 'Account verification code' : phrase}
    >
      <QuantumEffect className="login-quantum-effect" />

      <button
        onClick={() => {
          window.close();
          window.location.href = nextPath || '/';
        }}
        aria-label="Close"
        className="absolute top-4 right-4 z-30 text-gray-400 hover:text-white focus:outline-none"
      >
        <span aria-hidden="true">×</span>
      </button>

      <div className="absolute inset-0 z-20 flex items-center justify-center select-none px-6">
        {isOtpFlow ? (
          <div className="flex flex-col items-center space-y-6">
            <h2
              onClick={handleCopy}
              className="cursor-pointer select-none text-6xl font-bold tracking-wide text-[rgba(103,254,183,0.9)] super-shiny-text laptop:text-8xl"
            >
              {code}
            </h2>
            <button
              onClick={handleCopy}
              className="rounded-lg bg-quantum-particle px-6 py-3 text-lg text-black shadow-lg transition hover:bg-brand-emerald-bright"
            >
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>
        ) : (
          <div className="relative flex min-h-[1.2em] w-full max-w-4xl items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={phrase}
                className={CENTER_PHRASE_CLASS}
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                {phrase}
              </motion.h1>
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
