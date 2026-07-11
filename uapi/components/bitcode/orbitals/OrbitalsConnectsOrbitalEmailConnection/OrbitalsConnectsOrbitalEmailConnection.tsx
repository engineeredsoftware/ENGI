/**
 * OrbitalsConnectsOrbitalEmailConnection
 *
 * Email trigger configuration card inside the Orbitals Connects orbital.
 * Styling relies on OrbitalsConnectsOrbitalEmailConnection.module.css which
 * preserves the original animation/visual hierarchy.
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import './OrbitalsConnectsOrbitalEmailConnection.module.css';
import { motion } from 'framer-motion';
import { trackEvent } from '@bitcode/google-analytics';
import { createClient } from '@bitcode/supabase/ssr/client';
import { reportError } from '@bitcode/errors';
import { toast } from '@/components/shadcn/Sonner/Sonner';

interface OrbitalsConnectsOrbitalEmailConnectionProps {
  userId: string;
  userEmail?: string;
  onComplete?: () => void;
}

type ConnectionStatus = 'loading' | 'connected' | 'not-connected' | 'configuring';

interface EmailConfig {
  email: string;
  verified: boolean;
  forwardingEnabled: boolean;
  customDomain?: string;
}

const waveIds = [1, 2, 3];
const loadingParticles = Array.from({ length: 6 });

export function OrbitalsConnectsOrbitalEmailConnection({ userId, userEmail, onComplete }: OrbitalsConnectsOrbitalEmailConnectionProps) {
  const [status, setStatus] = useState<ConnectionStatus>('loading');
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('user_email_triggers')
          .select('email, verified, forwarding_enabled, custom_domain')
          .eq('user_id', userId)
          .single();

        if (data?.verified) {
          setEmailConfig({
            email: data.email,
            verified: true,
            forwardingEnabled: data.forwarding_enabled,
            customDomain: data.custom_domain ?? undefined,
          });
          setStatus('connected');
        } else if (data) {
          setEmailConfig({
            email: data.email,
            verified: false,
            forwardingEnabled: false,
            customDomain: data.custom_domain ?? undefined,
          });
          setCustomEmail(data.email);
          setStatus('configuring');
        } else {
          if (userEmail) setCustomEmail(userEmail);
          setStatus('not-connected');
        }
      } catch (error) {
        reportError(error);
        setStatus('not-connected');
      }
    })();
  }, [supabase, userId, userEmail]);

  const handleSetupEmail = async () => {
    if (!customEmail) {
      toast.error('Enter an email address to continue');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_email_triggers')
        .upsert({
          user_id: userId,
          email: customEmail,
          verified: false,
          forwarding_enabled: true,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      await sendVerificationEmail(customEmail);

      setEmailConfig({ email: customEmail, verified: false, forwardingEnabled: true });
      setStatus('configuring');
      toast.info('Verification email sent! Check your inbox.');
      trackEvent('email_trigger_setup_started', { user_id: userId, email: customEmail });
    } catch (error) {
      reportError(error);
      toast.error('Failed to set up email triggers');
    }
  };

  const sendVerificationEmail = async (email: string) => {
    console.info('Sending verification email to', email);
    // TODO: wire actual delivery service.
  };

  const handleVerifyCode = async () => {
    if (!emailConfig || verificationCode.length !== 6) {
      toast.error('Enter the 6-digit code we emailed you.');
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.rpc('verify_email_trigger', {
        p_user_id: userId,
        p_email: emailConfig.email,
        p_code: verificationCode,
      });

      if (error) throw error;
      if (!data) {
        toast.error('Invalid verification code');
        return;
      }

      setEmailConfig({ ...emailConfig, verified: true });
      setStatus('connected');
      toast.success('Email verified! You can now trigger pipelines via email.');
      trackEvent('email_trigger_verified', { user_id: userId, email: emailConfig.email });
      onComplete?.();
    } catch (error) {
      reportError(error);
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect email triggers? You will read to verify again to use email commands.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_email_triggers')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Email triggers disconnected');
      setEmailConfig(null);
      setStatus('not-connected');
      trackEvent('email_trigger_disconnected', { user_id: userId });
    } catch (error) {
      reportError(error);
      toast.error('Failed to disconnect email triggers');
    }
  };

  const renderLoading = () => (
    <div className="orbitals-connects-email-connect-loading">
      <div className="orbitals-connects-loading-orb">
        <div className="orb-core" />
        <div className="orb-ring" />
        <div className="orb-particles">
          {loadingParticles.map((_, index) => (
            <div key={index} className="particle" style={{ '--index': index } as React.CSSProperties} />
          ))}
        </div>
      </div>
      <span className="orbitals-connects-loading-text">Initializing email module…</span>
    </div>
  );

  const renderConfiguring = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="orbitals-connects-email-configuring"
    >
      <div className="orbitals-connects-config-header">
        <div className="orbitals-connects-config-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="orbitals-connects-config-info">
          <h3>Verify your email</h3>
          <p>
            We sent a six-digit code to <strong>{emailConfig?.email}</strong>
          </p>
        </div>
      </div>

      <div className="orbitals-connects-verification-form">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          value={verificationCode}
          onChange={(event) => setVerificationCode(event.target.value.replace(/[^0-9]/g, ''))}
          className="orbitals-connects-verification-input"
        />
        <motion.button
          type="button"
          className="orbitals-connects-verify-button"
          disabled={verificationCode.length !== 6 || isVerifying}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleVerifyCode}
        >
          {isVerifying ? <span className="orbitals-connects-loading-spinner" /> : 'Verify email'}
        </motion.button>
      </div>

      <div className="orbitals-connects-help-actions">
        <button type="button" className="orbitals-connects-resend-link" onClick={() => sendVerificationEmail(emailConfig!.email)}>
          Resend code
        </button>
        <button type="button" className="orbitals-connects-change-link" onClick={() => setStatus('not-connected')}>
          Use different email
        </button>
      </div>
    </motion.div>
  );

  const renderConnected = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
      className="orbitals-connects-email-connected-container"
    >
      <motion.div className="orbitals-connects-success-waves" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 2, delay: 0.5 }}>
        {waveIds.map((id) => (
          <motion.div
            key={id}
            className="orbitals-connects-wave"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.1, 1.7], opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.6, delay: id * 0.15, ease: 'easeOut' }}
          />
        ))}
      </motion.div>

      <div className="orbitals-connects-connected-content">
        <div className="orbitals-connects-status-header">
          <div className="orbitals-connects-icon-container">
            <div className="orbitals-connects-icon-glow" />
            <div className="orbitals-connects-icon-inner">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm0 0l8 7 8-7"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="orbitals-connects-status-info">
            <div className="orbitals-connects-status-title">
              Email triggers active
              {emailConfig?.customDomain && <span className="orbitals-connects-domain-badge">{emailConfig.customDomain}</span>}
            </div>
            <p className="orbitals-connects-status-description">
              Inbox automation is live. Forward requirements, specs, or logs to Bitcode and we will spin up the right pipelines instantly.
            </p>
            <div className="orbitals-connects-email-address">{emailConfig?.email}</div>
          </div>

          <button type="button" className="orbitals-connects-disconnect-button" onClick={handleDisconnect}>
            <span>Disconnect</span>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="orbitals-connects-command-showcase">
          <div className="orbitals-connects-showcase-header">
            <div className="orbitals-connects-showcase-label">Forward to</div>
            <div className="orbitals-connects-bitcode-email">build@bitcode.ai</div>
            <div className="orbitals-connects-showcase-label">Example message</div>
          </div>

          <div className="orbitals-connects-email-log">
            <header className="orbitals-connects-email-header">
              <div className="orbitals-connects-email-field">
                <strong>From:</strong> {emailConfig?.email}
              </div>
              <div className="orbitals-connects-email-field">
                <strong>Subject:</strong> Deliver application shippables
              </div>
            </header>
            <div className="orbitals-connects-email-body">
              <p>Trigger AssetPack execution for Bitcode transactions:</p>
              <ul>
                <li>Attach updated auxillary copy</li>
                <li>Generate migration plan for production DB</li>
                <li>Run post-AssetPack regression tests</li>
              </ul>
            </div>
            <div className="orbitals-connects-features-grid">
              <div className="feature">
                <span className="orbitals-connects-feature-icon">⚡</span>
                Instant pipeline dispatch
              </div>
              <div className="feature">
                <span className="orbitals-connects-feature-icon">📎</span>
                Attachment parsing
              </div>
              <div className="feature">
                <span className="orbitals-connects-feature-icon">🔐</span>
                Verified sender security
              </div>
              <div className="feature">
                <span className="orbitals-connects-feature-icon">📈</span>
                Execution telemetry feedback
              </div>
            </div>
          </div>

          <div className="orbitals-connects-quick-actions">
            <motion.a
              href="/packs?auxillary-open-to=externals"
              className="orbitals-connects-action-card orbital-entry"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="orbitals-connects-action-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.5} />
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </div>
              <span>Email orbital</span>
              <div className="orbitals-connects-action-arrow">→</div>
            </motion.a>
            <motion.a
              href="/docs/email"
              className="orbitals-connects-action-card docs"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="orbitals-connects-action-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span>Email guide</span>
              <div className="orbitals-connects-action-arrow">→</div>
            </motion.a>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderNotConnected = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="email-not-connected"
    >
      <div className="connect-header">
        <div className="email-icon">
          <div className="icon-bg" />
          <div className="icon-envelope">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="envelope-flap" />
        </div>
        <div className="connect-info">
          <h3 className="connect-title">Enable email commands</h3>
          <p className="connect-description">Forward specs, approvals, or context to Bitcode and trigger pipelines asynchronously.</p>
        </div>
      </div>

      <div className="orbitals-connects-setup-form">
        <input
          type="email"
          className="orbitals-connects-email-input"
          placeholder="founder@acme.dev"
          value={customEmail}
          onChange={(event) => setCustomEmail(event.target.value)}
        />
        <motion.button
          type="button"
          className="orbitals-connects-setup-button"
          disabled={!customEmail || !customEmail.includes('@')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSetupEmail}
        >
          <span className="button-text">Set up email triggers</span>
          <div className="orbitals-connects-button-glow" />
          <div className="orbitals-connects-button-shimmer" />
        </motion.button>
      </div>

      <div className="benefits-list">
        <div className="benefit">
          <span className="benefit-icon">🧠</span>
          <div className="benefit-content">
            <span className="benefit-title">Structured understanding</span>
            <span className="benefit-desc">Emails are parsed into Bitcode intents with attachment awareness.</span>
          </div>
        </div>
        <div className="benefit">
          <span className="benefit-icon">⏱️</span>
          <div className="benefit-content">
            <span className="benefit-title">Async execution</span>
            <span className="benefit-desc">Review pipeline output on your own time with full logs.</span>
          </div>
        </div>
        <div className="benefit">
          <span className="benefit-icon">🔐</span>
          <div className="benefit-content">
            <span className="benefit-title">Verified senders</span>
            <span className="benefit-desc">Only approved addresses can trigger production changes.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (status === 'loading') {
    return renderLoading();
  }

  if (status === 'configuring' && emailConfig) {
    return renderConfiguring();
  }

  if (status === 'connected' && emailConfig) {
    return renderConnected();
  }

  return renderNotConnected();
}

export default OrbitalsConnectsOrbitalEmailConnection;
