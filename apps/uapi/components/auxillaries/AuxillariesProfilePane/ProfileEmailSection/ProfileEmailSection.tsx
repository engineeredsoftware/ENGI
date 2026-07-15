/**
 * Optional email notification contact section (OTP send/verify).
 */

import React from 'react';
import LoadingSpinner from '@/components/bitcode/indicators/LoadingSpinner/LoadingSpinner';

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
}: ProfileEmailSectionProps) {
  return (
    <section className="account-creation-section mb-6 rounded-none border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/72">
          Optional contact
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">Email notifications</h3>
        <p className="mt-2 text-sm leading-7 text-white/66">
          Email does not authenticate Bitcode. It only adds notification and recovery contact after wallet identity exists.
        </p>
      </div>

      {authError ? <div data-testid="profile-error" className="mb-2 text-red-300">{authError}</div> : null}

      {!isVerifying && !isVerified ? (
        <div className="flex flex-wrap items-start gap-3">
          <div className="orbitals-users-input-container enterprise min-w-[16rem] flex-1">
            <input
              data-testid="profile-email-input"
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="form-input"
              placeholder="Receive notifications and Bitcode updates"
            />
            <div className="input-focus-indicator"></div>
          </div>
          <button
            data-testid="profile-send-code"
            type="button"
            onClick={onSendCode}
            className="inline-flex h-14 items-center justify-center rounded-none border border-emerald-300/30 bg-emerald-400/12 px-5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200/42 hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!email.trim() || verificationLoading}
          >
            {verificationLoading ? (
              <LoadingSpinner size={20} thickness={2} color="rgba(103,254,183,0.8)" trackColor="rgba(103,254,183,0.2)" />
            ) : (
              'Send Code'
            )}
          </button>
        </div>
      ) : null}

      {isVerifying && !isVerified ? (
        <div className="flex flex-wrap items-start gap-3">
          <div className="orbitals-users-input-container enterprise min-w-[16rem] flex-1">
            <input
              data-testid="profile-otp-input"
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              className="form-input"
              placeholder={`Code sent to ${email}`}
            />
            <div className="input-focus-indicator"></div>
          </div>
          <button
            data-testid="profile-verify-code"
            type="button"
            onClick={onVerifyCode}
            className="inline-flex h-14 items-center justify-center rounded-none border border-emerald-300/30 bg-emerald-400/80 px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!/^\d{6}$/.test(verificationCode) || verificationLoading}
          >
            {verificationLoading ? (
              <LoadingSpinner size={20} thickness={2} color="rgba(0,30,60,0.9)" trackColor="rgba(0,30,60,0.3)" />
            ) : (
              'Verify'
            )}
          </button>
          <button
            data-testid="profile-change-email-button"
            type="button"
            onClick={() => setIsVerifying(false)}
            className="h-14 text-sm font-medium text-emerald-200/80 underline-offset-4 hover:underline"
          >
            Change email
          </button>
        </div>
      ) : null}

      {isVerified ? (
        <div className="rounded-none border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          Email verified: <span className="font-semibold">{email}</span>
        </div>
      ) : null}
    </section>
  );
}
