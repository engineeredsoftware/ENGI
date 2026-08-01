'use client';

/**
 * Below-fold waitlist — full main width after audience (not under scroll cue).
 * Parent page wraps whileInView for scroll entrance. Soft gate: Sell / Buy /
 * Exchange stay; optional multi-select roles (no "Both").
 */

import React, { memo, useCallback, useId, useState } from 'react';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import {
  isWaitlistRole,
  validateWaitlistSubmit,
  type WaitlistRole,
} from '@/components/marketing/MarketingLandingWaitlist/marketing-waitlist-validate';

const copy = BITCODE_PUBLIC_COPY.waitlist;

const ROLE_ACTIVE: Record<WaitlistRole, string> = {
  seller:
    'border-fuchsia-300/55 bg-fuchsia-500/20 text-fuchsia-50 shadow-[0_0_18px_rgba(232,121,249,0.22)]',
  buyer:
    'border-orange-300/55 bg-orange-400/20 text-orange-50 shadow-[0_0_18px_rgba(251,146,60,0.22)]',
  builder:
    'border-cyan-300/50 bg-cyan-400/16 text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.2)]',
};

type FormStatus = 'idle' | 'loading' | 'success' | 'already' | 'error';

function toggleRole(current: WaitlistRole[], id: WaitlistRole): WaitlistRole[] {
  if (current.includes(id)) {
    return current.filter((role) => role !== id);
  }
  return [...current, id];
}

export const MarketingLandingWaitlist = memo(function MarketingLandingWaitlist() {
  const formId = useId();
  const emailId = `${formId}-email`;
  const statusId = `${formId}-status`;

  const [roles, setRoles] = useState<WaitlistRole[]>([]);
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setErrorMessage(null);

      const validated = validateWaitlistSubmit({
        email,
        roles,
        website: honeypot,
      });
      if (!validated.ok) {
        if (validated.reason === 'honeypot') {
          setStatus('success');
          return;
        }
        setStatus('error');
        if (validated.reason === 'invalid_email') {
          setErrorMessage(copy.errorInvalidEmail);
        } else {
          setErrorMessage(copy.errorGeneric);
        }
        return;
      }

      setStatus('loading');
      try {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: validated.email,
            roles: validated.roles,
            source: 'landing',
            website: honeypot,
          }),
        });
        const payload = (await res.json().catch(() => null)) as {
          ok?: boolean;
          alreadyJoined?: boolean;
          error?: string;
        } | null;

        if (res.ok && payload?.ok) {
          setStatus(payload.alreadyJoined ? 'already' : 'success');
          return;
        }
        setStatus('error');
        if (payload?.error === 'invalid_email') {
          setErrorMessage(copy.errorInvalidEmail);
        } else if (payload?.error === 'email_send_failed') {
          setErrorMessage(copy.errorEmailSend);
        } else {
          setErrorMessage(copy.errorGeneric);
        }
      } catch {
        setStatus('error');
        setErrorMessage(copy.errorGeneric);
      }
    },
    [email, honeypot, roles],
  );

  if (status === 'success' || status === 'already') {
    const title = status === 'already' ? copy.alreadyJoinedTitle : copy.successTitle;
    const body = status === 'already' ? copy.alreadyJoinedBody : copy.successBody;
    const roleLabels = roles
      .map((id) => copy.roles.find((entry) => entry.id === id)?.label ?? id)
      .join(' · ');

    return (
      <div
        id="waitlist"
        data-testid="landing-waitlist"
        data-status={status}
        className="relative w-full min-w-0 border border-emerald-300/22 bg-emerald-300/[0.06] px-4 py-4 phone:px-5 tablet:px-6"
        role="status"
        aria-live="polite"
      >
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent"
          aria-hidden
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200/75">
          {copy.eyebrow}
        </p>
        <p className="mt-2 text-base font-semibold text-white">{title}</p>
        <p className="mt-1.5 text-sm leading-6 text-neutral-300">{body}</p>
        {roleLabels ? (
          <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-emerald-100/70">
            {roleLabels}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <section
      id="waitlist"
      data-testid="landing-waitlist"
      data-status={status}
      className="relative w-full min-w-0 overflow-hidden border border-emerald-300/18 bg-emerald-300/[0.045] px-4 py-4 phone:px-5 tablet:px-6"
      aria-labelledby={`${formId}-title`}
    >
      <div
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent"
        aria-hidden
      />

      {/*
        Laptop+: copy left, compact form right (no full-band email bar).
        Phone: stack copy → form.
      */}
      <div className="grid min-w-0 gap-4 laptop:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] laptop:items-center laptop:gap-8">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
            {copy.eyebrow}
          </p>
          <h2
            id={`${formId}-title`}
            className="mt-2 text-base font-semibold tracking-[-0.01em] text-white phone:text-[1.05rem]"
          >
            {copy.title}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-300/95">{copy.subcopy}</p>
          <p className="mt-1 max-w-xl text-sm leading-6 text-neutral-400/90">{copy.subcopyLine2}</p>
        </div>

        <form className="min-w-0 w-full" onSubmit={onSubmit} noValidate>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Waitlist roles (optional multi-select)"
          >
            {copy.roles.map((entry) => {
              const id = entry.id as WaitlistRole;
              if (!isWaitlistRole(id)) return null;
              const active = roles.includes(id);
              return (
                <button
                  key={entry.id}
                  type="button"
                  data-testid={`landing-waitlist-role-${entry.id}`}
                  aria-pressed={active}
                  disabled={status === 'loading'}
                  onClick={() => {
                    setRoles((current) => toggleRole(current, id));
                    if (status === 'error') {
                      setStatus('idle');
                      setErrorMessage(null);
                    }
                  }}
                  className={`rounded-none border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                    active
                      ? ROLE_ACTIVE[id]
                      : 'border-white/10 bg-black/25 text-neutral-300 hover:border-white/20 hover:text-white'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>

          <label htmlFor={emailId} className="sr-only">
            {copy.emailLabel}
          </label>
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
            <label htmlFor={`${formId}-website`}>Website</label>
            <input
              id={`${formId}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="mt-2.5 flex min-w-0 flex-col gap-2 phone:flex-row phone:items-stretch">
            <input
              id={emailId}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              disabled={status === 'loading'}
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') {
                  setStatus('idle');
                  setErrorMessage(null);
                }
              }}
              aria-invalid={status === 'error'}
              aria-describedby={errorMessage ? statusId : undefined}
              data-testid="landing-waitlist-email"
              className="min-w-0 flex-1 rounded-none border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-emerald-300/45 focus:ring-1 focus:ring-emerald-300/25 disabled:opacity-60"
            />
            <button
              type="submit"
              data-testid="landing-waitlist-submit"
              disabled={status === 'loading'}
              className="shrink-0 rounded-none border border-emerald-300/40 bg-emerald-300/14 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-50 transition hover:border-emerald-200/55 hover:bg-emerald-300/22 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {status === 'loading' ? copy.ctaLoadingLabel : copy.ctaLabel}
            </button>
          </div>

          {errorMessage ? (
            <p
              id={statusId}
              role="alert"
              data-testid="landing-waitlist-error"
              className="mt-2 border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-xs leading-5 text-rose-100/95"
            >
              {errorMessage}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
});
