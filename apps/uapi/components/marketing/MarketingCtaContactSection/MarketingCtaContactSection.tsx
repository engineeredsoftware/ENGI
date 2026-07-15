"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';

import Image from 'next/image';
import MarketingSectionWrapper from '@/components/marketing/MarketingSectionWrapper/MarketingSectionWrapper';
import MarketingButtonShimmer from '@/components/bitcode/effects/ButtonShimmer/ButtonShimmer';
import { FEATURE_FLAGS } from '@/config/features';

import {
  UserIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

/**
 * Combined CTA + Contact Form section that displays the
 * "Ready to Transform Your Development Process?" call-to-action
 * next to the "Still have questions?" contact form in a clean
 * 50/50 two-column layout.
 */
const MarketingCtaContactSection: React.FC = () => {
  const { DISABLE_USING } = FEATURE_FLAGS;

  /* Contact form state */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    // Honeypot field – real users never see/alter this
    website: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Very light email validation before hitting the network
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(error || res.statusText);
      }
      setStatus('sent');
      // Clear form so the user can submit another message if desired
      setFormData({ name: '', email: '', message: '', website: '' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  };

  // After showing success/error for a few seconds reset to idle
  useEffect(() => {
    if (status === 'sent' || status === 'error') {
      const timer = setTimeout(() => {
        setStatus('idle');
        setErrorMsg('');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // File-local class constants (SRP/DRY; no visual changes)
  const gradientBorderWrapper = 'pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-500/60 via-violet-500/40 to-indigo-500/60 opacity-30 blur-lg';
  const innerGlassPanel = 'absolute inset-0 bg-gradient-to-b from-gray-950/40 to-gray-950/60 backdrop-blur-xl';
  const inputGroup = 'relative group focus-within:ring-2 focus-within:ring-violet-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-950 rounded-md';
  const inputControl = 'w-full rounded-md border border-gray-700 bg-gray-900/60 py-3 pl-11 pr-3 text-white placeholder-gray-500 focus:border-transparent focus:ring-0 focus:outline-none transition-colors';

  return (
    <MarketingSectionWrapper id="cta" className="overflow-hidden">
      {/* Orbital accent elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl" />

      <div className="relative z-10">
        {/* Two-column grid */}
        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-12 items-stretch">
          {/* CTA Block */}
          <div className="flex justify-center laptop:justify-end w-full h-full">

            <div className="relative w-full flex flex-col h-full">
              {/* Gradient border wrapper – reuse the violet/fuchsia gradient */}
              <div className={gradientBorderWrapper} />

              <div className="relative rounded-2xl overflow-visible flex flex-col h-full">
                {/* Inner translucent panel */}
                <div className={innerGlassPanel} />

                <div className="relative z-10 p-8 text-center flex flex-col h-full">
                  <h2 className="text-2xl laptop:text-3xl font-semibold text-white mb-6 laptop:mb-8 super-shiny-text">
                    Launch Your First Bitcode AssetPack in Minutes
                  </h2>

                  <p className="text-lg text-gray-300 mb-8">
                    Measure a Read, review the fit, and open a PR-backed AssetPack.
                  </p>

                  {/* CTA buttons and BTD reference indicator wrapper */}
                  <div className="flex flex-col items-center flex-1 space-y-12">

                    {/* Buttons row */}
                    <div className="flex flex-col tablet:flex-row justify-center items-stretch tablet:items-center space-y-4 tablet:space-y-0 tablet:space-x-4 w-full">

                      {/* Primary CTA */}
                      {DISABLE_USING ? (
                        <div className="relative block h-fit w-full tablet:flex-1">
                          <MarketingButtonShimmer
                            variant="orange"
                            background="#030816"
                            className="mx-auto block w-full h-12 opacity-50 pointer-events-none"
                            innerClassName="text-base leading-none tracking-wider font-light text-white"
                            disabled
                          >
                            Connect
                          </MarketingButtonShimmer>
                        </div>
                      ) : (
                        <div className="relative block h-fit w-full tablet:flex-1">
                          <MarketingButtonShimmer
                            variant="orange"
                            background="#030816"
                            className="mx-auto block w-full h-12"
                            innerClassName="text-base leading-none tracking-wider font-light text-white"
                            onClick={() => document.dispatchEvent(new CustomEvent('start-onboarding'))}
                          >
                            Connect
                          </MarketingButtonShimmer>
                        </div>
                      )}

                      {/* Secondary CTA */}
                      <div className="w-full tablet:flex-1 block h-full">
                        <MarketingButtonShimmer
                          variant="orange"
                          background="#030816"
                          className={
                            DISABLE_USING
                              ? 'mx-auto block w-full h-12 opacity-50 pointer-events-none'
                              : 'mx-auto block w-full h-12'
                          }
                          innerClassName="text-base leading-none tracking-wider font-light text-white"
                          disabled={DISABLE_USING}
                          onClick={() => document.dispatchEvent(new CustomEvent('open-auxillaries'))}
                        >
                          Connect
                        </MarketingButtonShimmer>
                      </div>

                      {/* close buttons row */}
                    </div>

                    {/* BTD reference indicator (below buttons) */}
                    <div className="flex items-center justify-center space-x-3 select-none mt-2">
                      <span className="text-5xl font-bold text-emerald-300 drop-shadow-[0_0_8px_rgba(145,251,188,0.9)]">1</span>
                      {/* Bitcode "b" logo */}
                      <Image
                        src="/icons/logo.svg"
                        width={47}
                        height={47}
                        alt="Bitcode BTD unit"
                        className="w-[47px] h-[47px] drop-shadow-[0_0_14px_rgba(145,251,188,0.9)] animate-pulse-slow"
                      />
                      <span className="text-3xl font-semibold text-gray-200">AssetPack read-right</span>
                    </div>
                  </div>
                  {/* Explain what the BTD equivalency represents */}
                  <div className="flex justify-center my-6 overflow-visible">
                    <span className="super-shiny-text-orange font-semibold leading-none tracking-tight text-2xl">
                      measured Bitcode share/read-right
                    </span>
                  </div>

                  <div className="text-gray-400 text-base -mb-4">
                    BTC pays fees. $BTD is issued as non-fungible AssetPack read-rights.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Block */}
          <div className="flex justify-center laptop:justify-start w-full h-full">
            <div className="relative w-full flex flex-col h-full">
              {/* Gradient border wrapper – purple themed */}
              <div className={gradientBorderWrapper} />

              <div className="relative rounded-2xl overflow-hidden">
                {/* Fancy inner glow */}
                <div className={innerGlassPanel} />

                <form
                  onSubmit={handleSubmit}
                  className="relative z-10 p-8 space-y-6 flex flex-col h-full"
                >
                  <h4 className="text-3xl font-semibold text-white text-center">
                    Questions About Bitcode?
                  </h4>
                  <p className="text-lg text-center text-gray-300">
                    Tell us which Read, repository, or connected interface should be measured first.
                  </p>

                  {/* Inputs grid */}
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className={inputGroup}>
                      <label htmlFor="name" className="sr-only">
                        Name
                      </label>
                      <UserIcon className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className={inputControl}
                      />
                    </div>

                    {/* Email */}
                    <div className={inputGroup}>
                      <label htmlFor="email" className="sr-only">
                        Email
                      </label>
                      <EnvelopeIcon className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={inputControl}
                      />
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div className={inputGroup}>
                    <label htmlFor="message" className="sr-only">
                      Message
                    </label>
                    <ChatBubbleLeftRightIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Describe how Bitcode can help you..."
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className={inputControl}
                    />
                  </div>

                  {/* Honeypot field – hidden from users. Bots that fill it will be dropped. */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {status === 'error' && (
                    <p className="text-red-400 text-base text-center">
                      {errorMsg || 'Failed to send. Please try again.'}
                    </p>
                  )}

                  {status === 'sent' ? (
                    <p className="text-green-400 font-semibold text-lg text-center">
                      Thank you! Bitcode will be in touch soon.
                    </p>
                  ) : (
                    <MarketingButtonShimmer
                      type="submit"
                      disabled={status === 'sending'}
                      variant="purple"
                      background="#030816" /* dark translucent */
                      className="mx-auto block w-full h-12 disabled:opacity-50"
                      innerClassName="text-base leading-none tracking-wider font-light text-white flex items-center justify-center space-x-2"
                    >
                      {status === 'sending' && (
                        <svg
                          className="h-5 w-5 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                      )}
                      <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                    </MarketingButtonShimmer>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingSectionWrapper>
  );
};

export default MarketingCtaContactSection;
// Route-scoped marketing component (presentational only).
// Do not reuse cross-route; shared helpers live under components/bitcode.
