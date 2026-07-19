/**
 * Optional email notification contact — setup / verify / verified + change-email.
 */

import React, { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/bitcode/indicators/LoadingSpinner/LoadingSpinner';
import type { BitcodeEmailNotificationPreferences } from '@bitcode/orm';

export interface ProfileEmailSectionProps {
  email: string;
  setEmail: (value: string) => void;
  verificationCode: string;
  setVerificationCode: (value: string) => void;
  isVerifying: boolean;
  setIsVerifying: (value: boolean) => void;
  isVerified: boolean;
  verificationLoading: boolean;
  authError: string | null;
  onSendCode: () => void;
  onVerifyCode: () => void;
  emailNotificationPreferences: BitcodeEmailNotificationPreferences;
  setEmailNotificationPreferences: (
    next: BitcodeEmailNotificationPreferences | ((current: BitcodeEmailNotificationPreferences) => BitcodeEmailNotificationPreferences),
  ) => void;
}

export default function ProfileEmailSection({
  email,
  setEmail,
  verificationCode,
  setVerificationCode,
  isVerifying,
  setIsVerifying,
  isVerified,
  verificationLoading,
  authError,
  onSendCode,
  onVerifyCode,
  emailNotificationPreferences,
  setEmailNotificationPreferences,
}: ProfileEmailSectionProps) {
  const prefs = {
    receiveProductUpdates: Boolean(emailNotificationPreferences?.receiveProductUpdates),
    receiveYourNotifications: Boolean(
      emailNotificationPreferences?.receiveYourNotifications,
    ),
    receiveCriticalUpdates: true,
  };

  /** Last confirmed address — used to cancel a change-email attempt. */
  const [lockedVerifiedEmail, setLockedVerifiedEmail] = useState(
    isVerified ? (email || '').trim() : '',
  );
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  useEffect(() => {
    if (isVerified && (email || '').trim() && !isChangingEmail && !isVerifying) {
      setLockedVerifiedEmail((email || '').trim());
    }
  }, [email, isVerified, isChangingEmail, isVerifying]);

  // After OTP succeeds: parent sets isVerified and clears isVerifying.
  const wasVerifyingRef = React.useRef(isVerifying);
  useEffect(() => {
    const finishedOtp = wasVerifyingRef.current && !isVerifying && isVerified;
    if (finishedOtp) {
      setIsChangingEmail(false);
      setVerificationCode('');
      if ((email || '').trim()) {
        setLockedVerifiedEmail((email || '').trim());
      }
    } else if (isVerified && !isChangingEmail && !isVerifying && (email || '').trim()) {
      setLockedVerifiedEmail((email || '').trim());
    }
    wasVerifyingRef.current = isVerifying;
  }, [email, isVerified, isChangingEmail, isVerifying, setVerificationCode]);

  const hasLockedContact = Boolean(lockedVerifiedEmail);
  // Modes are mutually exclusive. During a change-email OTP, parent may still
  // report isVerified=true for the *previous* address until the new code lands.
  const showVerifiedIdle = isVerified && !isChangingEmail && !isVerifying;
  const showSetup = !isVerified && !isVerifying && !isChangingEmail;
  const showChangeCompose = isChangingEmail && !isVerifying;
  const showOtp = isVerifying;

  const beginChangeEmail = () => {
    setIsChangingEmail(true);
    setIsVerifying(false);
    setVerificationCode('');
    // Leave `email` as the locked address until they type a new one, then clear for a blank field.
    setEmail('');
  };

  const cancelChangeOrVerify = () => {
    setIsChangingEmail(false);
    setIsVerifying(false);
    setVerificationCode('');
    if (hasLockedContact) {
      setEmail(lockedVerifiedEmail);
    }
  };

  const fieldClassName =
    'w-full rounded-none border border-emerald-300/25 bg-[rgba(7,15,28,0.55)] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/38 focus:border-emerald-300/55 focus:bg-[rgba(7,15,28,0.72)]';

  return (
    <section
      className="account-creation-section mb-6 rounded-none border border-white/10 bg-white/[0.04] p-5"
      data-testid="profile-email-section"
      data-email-mode={
        showVerifiedIdle
          ? 'verified'
          : showChangeCompose
            ? 'change'
            : showOtp
              ? 'verifying'
              : 'setup'
      }
    >
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/72">
          Optional contact
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          {showVerifiedIdle
            ? 'Verified notification email'
            : showChangeCompose || (showOtp && hasLockedContact)
              ? 'Change notification email'
              : 'Email notifications'}
        </h3>
        <p className="mt-2 text-sm leading-7 text-white/66">
          {showVerifiedIdle
            ? 'This address receives the optional mail types below. It does not authenticate Bitcode — wallet identity remains the account root.'
            : showChangeCompose || (showOtp && hasLockedContact)
              ? 'Enter a new address and verify it with a one-time code. Your current verified email stays active until the new one is confirmed.'
              : 'Email does not authenticate Bitcode. It only adds notification and recovery contact after wallet identity exists.'}
        </p>
      </div>

      {authError ? (
        <div data-testid="profile-error" className="mb-3 text-sm text-red-300">
          {authError}
        </div>
      ) : null}

      {/* ── Verified contact (idle) ── */}
      {showVerifiedIdle ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-none border border-emerald-300/25 bg-emerald-400/10 px-4 py-3.5"
          data-testid="profile-email-verified-card"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/70">
              Active contact
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-emerald-50" data-testid="profile-verified-email">
              {lockedVerifiedEmail || email}
            </p>
            <p className="mt-1 text-xs text-emerald-100/65">Verified · used for delivery preferences below</p>
          </div>
          <button
            type="button"
            data-testid="profile-change-email-button"
            onClick={beginChangeEmail}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-none border border-white/15 bg-white/[0.06] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white/85 transition hover:border-emerald-300/35 hover:bg-emerald-400/10 hover:text-emerald-50"
          >
            Change email
          </button>
        </div>
      ) : null}

      {/* ── First-time setup: enter email ── */}
      {showSetup ? (
        <div className="flex flex-wrap items-start gap-3" data-testid="profile-email-setup">
          <div className="min-w-[16rem] flex-1">
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/62">
              Email address
            </label>
            <input
              data-testid="profile-email-input"
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClassName}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col justify-end pt-6">
            <button
              data-testid="profile-send-code"
              type="button"
              onClick={onSendCode}
              className="inline-flex h-11 items-center justify-center rounded-none border border-emerald-300/30 bg-emerald-400/12 px-5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200/42 hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!email.trim() || verificationLoading}
            >
              {verificationLoading ? (
                <LoadingSpinner size={20} thickness={2} color="rgba(103,254,183,0.8)" trackColor="rgba(103,254,183,0.2)" />
              ) : (
                'Send code'
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Change email: compose new address ── */}
      {showChangeCompose ? (
        <div className="space-y-3" data-testid="profile-email-change-compose">
          {hasLockedContact ? (
            <div className="rounded-none border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-white/55">
              Current verified address:{' '}
              <span className="font-medium text-white/80">{lockedVerifiedEmail}</span>
              <span className="text-white/40"> · remains active until the new address is verified</span>
            </div>
          ) : null}
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-[16rem] flex-1">
              <label htmlFor="email-change" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-amber-100/75">
                New email address
              </label>
              <input
                data-testid="profile-email-input"
                id="email-change"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClassName}
                placeholder="new@company.com"
                autoComplete="email"
              />
            </div>
            <div className="flex flex-wrap items-end gap-2 pt-6">
              <button
                data-testid="profile-send-code"
                type="button"
                onClick={onSendCode}
                className="inline-flex h-11 items-center justify-center rounded-none border border-emerald-300/30 bg-emerald-400/12 px-5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200/42 hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={
                  !email.trim() ||
                  email.trim().toLowerCase() === lockedVerifiedEmail.toLowerCase() ||
                  verificationLoading
                }
              >
                {verificationLoading ? (
                  <LoadingSpinner size={20} thickness={2} color="rgba(103,254,183,0.8)" trackColor="rgba(103,254,183,0.2)" />
                ) : (
                  'Send code to new email'
                )}
              </button>
              <button
                type="button"
                data-testid="profile-cancel-change-email"
                onClick={cancelChangeOrVerify}
                className="inline-flex h-11 items-center justify-center rounded-none border border-white/12 bg-transparent px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white/70 transition hover:border-white/22 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── OTP verify (first-time or change) ── */}
      {showOtp ? (
        <div className="space-y-3" data-testid="profile-email-verifying">
          <div
            className={`rounded-none border px-3 py-2.5 text-xs ${
              hasLockedContact
                ? 'border-amber-300/25 bg-amber-400/10 text-amber-50/90'
                : 'border-emerald-300/20 bg-emerald-400/8 text-emerald-100/85'
            }`}
          >
            {hasLockedContact ? (
              <>
                Confirming <span className="font-semibold">{email}</span> as your new notification
                address. Until verified, mail still goes to{' '}
                <span className="font-semibold">{lockedVerifiedEmail}</span>.
              </>
            ) : (
              <>
                Code sent to <span className="font-semibold">{email}</span>. Enter the 6-digit code
                to verify this contact.
              </>
            )}
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-[12rem] flex-1">
              <label htmlFor="verificationCode" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/62">
                Verification code
              </label>
              <input
                data-testid="profile-otp-input"
                id="verificationCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className={fieldClassName}
                placeholder="6-digit code"
              />
            </div>
            <div className="flex flex-wrap items-end gap-2 pt-6">
              <button
                data-testid="profile-verify-code"
                type="button"
                onClick={() => {
                  onVerifyCode();
                  // Parent sets isVerified; clear change mode on next paint via effect below.
                }}
                className="inline-flex h-11 items-center justify-center rounded-none border border-emerald-300/30 bg-emerald-400/80 px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!/^\d{6}$/.test(verificationCode) || verificationLoading}
              >
                {verificationLoading ? (
                  <LoadingSpinner size={20} thickness={2} color="rgba(0,30,60,0.9)" trackColor="rgba(0,30,60,0.3)" />
                ) : hasLockedContact ? (
                  'Confirm new email'
                ) : (
                  'Verify'
                )}
              </button>
              <button
                data-testid="profile-change-email-button"
                type="button"
                onClick={cancelChangeOrVerify}
                className="inline-flex h-11 items-center justify-center rounded-none border border-white/12 bg-transparent px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white/70 transition hover:border-white/22 hover:text-white"
              >
                {hasLockedContact ? 'Keep current email' : 'Change email'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Preferences: after any email is present (setup draft or verified) */}
      {(email || '').trim() || hasLockedContact ? (
        <div
          className="mt-5 space-y-3 rounded-none border border-white/10 bg-white/[0.03] p-4"
          data-testid="profile-email-notification-preferences"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Email delivery
          </p>
          <p className="text-xs leading-5 text-white/52">
            {showVerifiedIdle
              ? `Delivery for ${lockedVerifiedEmail || email}. Critical updates stay on.`
              : 'Choose what Bitcode may email once this address is verified. Critical updates stay on.'}
          </p>

          <label className="flex cursor-pointer items-start gap-3 rounded-none border border-white/8 bg-black/10 px-3 py-3">
            <input
              type="checkbox"
              data-testid="profile-pref-product-updates"
              className="mt-1 h-4 w-4 shrink-0 rounded-none border border-emerald-300/40 bg-transparent accent-emerald-400"
              checked={prefs.receiveProductUpdates}
              onChange={(event) =>
                setEmailNotificationPreferences((current) => ({
                  ...current,
                  receiveProductUpdates: event.target.checked,
                  receiveCriticalUpdates: true,
                }))
              }
            />
            <span>
              <span className="block text-sm font-semibold text-white/90">Receive Product Updates</span>
              <span className="mt-1 block text-xs leading-5 text-white/52">
                Optional product news and release notes.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-none border border-white/8 bg-black/10 px-3 py-3">
            <input
              type="checkbox"
              data-testid="profile-pref-your-notifications"
              className="mt-1 h-4 w-4 shrink-0 rounded-none border border-emerald-300/40 bg-transparent accent-emerald-400"
              checked={prefs.receiveYourNotifications}
              onChange={(event) =>
                setEmailNotificationPreferences((current) => ({
                  ...current,
                  receiveYourNotifications: event.target.checked,
                  receiveCriticalUpdates: true,
                }))
              }
            />
            <span>
              <span className="block text-sm font-semibold text-white/90">Receive Your Notifications</span>
              <span className="mt-1 block text-xs leading-5 text-white/52">
                Optional personal run, transfer, and account activity email.
              </span>
            </span>
          </label>

          <label className="flex cursor-not-allowed items-start gap-3 rounded-none border border-emerald-300/22 bg-emerald-400/[0.06] px-3 py-3 opacity-95">
            <input
              type="checkbox"
              data-testid="profile-pref-critical-updates"
              className="mt-1 h-4 w-4 shrink-0 rounded-none border border-emerald-300/40 bg-transparent accent-emerald-400"
              checked
              disabled
              readOnly
            />
            <span>
              <span className="block text-sm font-semibold text-emerald-50">Receive Critical Updates</span>
              <span className="mt-1 block text-xs leading-5 text-white/55">
                Always on — security, recovery, and critical account alerts.
              </span>
            </span>
          </label>
        </div>
      ) : null}
    </section>
  );
}
