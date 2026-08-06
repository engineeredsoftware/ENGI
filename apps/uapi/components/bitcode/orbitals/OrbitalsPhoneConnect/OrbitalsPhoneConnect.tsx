'use client';

/**
 * Phone/SMS Connect Component for Orbital Panel
 * 
 * Phone number setup experience - the fastest path to Bitcode.
 * Supports phone SSO, SMS commands, and Conversations chat via text.
 */

// moved to orbital/phone-connect

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@bitcode/external-telemetry-google';
import { supabase } from '@bitcode/supabase';
import { reportError } from '@bitcode/errors';
import { toast } from '@/components/shadcn/Sonner/Sonner';

interface PhoneConnectProps {
  userId: string;
  onComplete?: () => void;
}

type SetupStep = 'enter' | 'verify' | 'preferences' | 'complete';

export function PhoneConnect({ userId, onComplete }: PhoneConnectProps) {
  const [step, setStep] = useState<SetupStep>('enter');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1'); // Default to US
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Preferences
  const [enableSMS, setEnableSMS] = useState(true);
  const [defaultRepo, setDefaultRepo] = useState({ owner: '', name: '' });
  const [dailyLimit, setDailyLimit] = useState(10);
  const [quietHours, setQuietHours] = useState({ enabled: false, start: '22:00', end: '08:00' });
  
  // Auto-focus refs
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (step === 'enter' && phoneInputRef.current) {
      phoneInputRef.current.focus();
    } else if (step === 'verify' && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [step]);
  
  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);
  
  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (countryCode === '+1') {
      // US formatting: (555) 555-5555
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        return [match[1], match[2], match[3]]
          .filter(Boolean)
          .join(' ')
          .replace(/(\d{3}) (\d{3})/, '($1) $2-');
      }
    }
    
    // Default formatting for other countries
    return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError(null);
  };
  
  const sendVerificationCode = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fullNumber = countryCode + phoneNumber.replace(/\D/g, '');
      
      const { error } = await supabase.rpc('send_phone_verification', {
        p_user_id: userId,
        p_phone_number: fullNumber
      });
      
      if (error) throw error;
      
      trackEvent('phone_verification_sent', {
        country_code: countryCode,
        user_id: userId
      });
      
      toast.success('Verification code sent!');
      setStep('verify');
      setResendTimer(60); // 60 second cooldown
      
    } catch (err: any) {
      reportError(err);
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyCode = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('verify_phone_number', {
        p_user_id: userId,
        p_verification_code: verificationCode
      });
      
      if (error) throw error;
      if (!data) {
        setError('Invalid verification code');
        return;
      }
      
      trackEvent('phone_verified', {
        user_id: userId
      });
      
      toast.success('Phone number verified!');
      setStep('preferences');
      
    } catch (err: any) {
      reportError(err);
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const savePreferences = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('user_sms_preferences')
        .upsert({
          user_id: userId,
          enabled: enableSMS,
          daily_limit: dailyLimit,
          default_repo_owner: defaultRepo.owner || null,
          default_repo_name: defaultRepo.name || null,
          quiet_hours_start: quietHours.enabled ? quietHours.start : null,
          quiet_hours_end: quietHours.enabled ? quietHours.end : null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        
      if (error) throw error;
      
      trackEvent('phone_preferences_saved', {
        user_id: userId,
        sms_enabled: enableSMS,
        has_default_repo: !!defaultRepo.owner
      });
      
      toast.success('SMS preferences saved!');
      setStep('complete');
      
      // Show complete state briefly
      setTimeout(() => {
        onComplete?.();
      }, 2000);
      
    } catch (err: any) {
      reportError(err);
      setError(err.message || 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 'enter':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Connect Your Phone 📱
              </h3>
              <p className="text-gray-400 text-sm">
                Enable SMS commands to trigger pipelines with a simple text.
                The fastest way to use Bitcode!
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+61">🇦🇺 +61</option>
                  </select>
                  
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={countryCode === '+1' ? '(555) 555-5555' : '123 456 7890'}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
              
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              
              <button
                onClick={sendVerificationCode}
                disabled={isLoading || phoneNumber.replace(/\D/g, '').length < 10}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              By connecting your phone, you agree to receive SMS messages from Bitcode.
              Standard messaging rates may apply.
            </div>
          </motion.div>
        );
        
      case 'verify':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Verify Your Phone 🔐
              </h3>
              <p className="text-gray-400 text-sm">
                We sent a 6-digit code to {countryCode} {phoneNumber}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  ref={codeInputRef}
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                    setError(null);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-600 focus:border-green-500 focus:outline-none"
                />
              </div>
              
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              
              <button
                onClick={verifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    setStep('enter');
                    setVerificationCode('');
                  }}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Change phone number
                </button>
                {' • '}
                <button
                  onClick={sendVerificationCode}
                  disabled={resendTimer > 0}
                  className="text-sm text-gray-400 hover:text-white disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </div>
          </motion.div>
        );
        
      case 'preferences':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                SMS Preferences ⚙️
              </h3>
              <p className="text-gray-400 text-sm">
                Customize how you want to use SMS with Bitcode
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Enable SMS Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Enable SMS Commands</h4>
                  <p className="text-gray-400 text-sm">Text commands to trigger pipelines</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableSMS}
                    onChange={(e) => setEnableSMS(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              
              {/* Default Repository */}
              <div>
                <h4 className="text-white font-medium mb-2">Default Repository</h4>
                <p className="text-gray-400 text-sm mb-3">Skip repo name in SMS commands</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="owner"
                    value={defaultRepo.owner}
                    onChange={(e) => setDefaultRepo({ ...defaultRepo, owner: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  />
                  <span className="text-gray-500 self-center">/</span>
                  <input
                    type="text"
                    placeholder="repo"
                    value={defaultRepo.name}
                    onChange={(e) => setDefaultRepo({ ...defaultRepo, name: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
              
              {/* Daily Limit */}
              <div>
                <h4 className="text-white font-medium mb-2">Daily SMS Limit</h4>
                <p className="text-gray-400 text-sm mb-3">Maximum commands per day</p>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>1</span>
                  <span className="text-white font-medium">{dailyLimit} per day</span>
                  <span>50</span>
                </div>
              </div>
              
              {/* Quiet Hours */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">Quiet Hours</h4>
                    <p className="text-gray-400 text-sm">Pause notifications during these hours</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quietHours.enabled}
                      onChange={(e) => setQuietHours({ ...quietHours, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                
                {quietHours.enabled && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="time"
                      value={quietHours.start}
                      onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={quietHours.end}
                      onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
              
              <button
                onClick={savePreferences}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </motion.div>
        );
        
      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">
              Phone Connected! 🎉
            </h3>
            
            <p className="text-gray-400 mb-6">
              Text commands to: <span className="text-white font-mono">{process.env.NEXT_PUBLIC_TWILIO_PHONE}</span>
            </p>
            
            <div className="bg-gray-800 rounded-lg p-4 text-left max-w-md mx-auto">
              <p className="text-sm text-gray-400 mb-2">Try these commands:</p>
              <ul className="space-y-1 text-sm text-white font-mono">
                <li>• deliver auth system with JWT</li>
                <li>• analyze security vulnerabilities</li>
                <li>• evidence react to latest</li>
                <li>• measure performance</li>
              </ul>
            </div>
          </motion.div>
        );
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
