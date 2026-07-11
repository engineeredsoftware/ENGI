/**
 * Phone SSO Component
 * 
 * Phone-based authentication for Bitcode account access.
 * Zero friction onboarding with SMS verification.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@bitcode/google-analytics';
import { supabase } from '@bitcode/supabase';
import { reportError } from '@bitcode/errors';
import { toast } from '@/components/shadcn/Sonner/Sonner';

interface PhoneSSOProps {
  redirectTo?: string;
  onSuccess?: () => void;
  showEmailOption?: boolean;
}

type AuthStep = 'phone' | 'verify' | 'profile';

export function PhoneSSO({ 
  redirectTo = '/dashboard', 
  onSuccess,
  showEmailOption = true 
}: PhoneSSOProps) {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Profile setup for new users
  const [isNewUser, setIsNewUser] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  
  // Auto-focus refs
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-detect country code from browser
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryDialCode = data.country_calling_code;
        if (countryDialCode) {
          setCountryCode(countryDialCode);
        }
      } catch (err) {
        // Default to +1 if detection fails
      }
    };
    detectCountry();
  }, []);
  
  // Auto-focus management
  useEffect(() => {
    if (step === 'phone' && phoneInputRef.current) {
      phoneInputRef.current.focus();
    } else if (step === 'verify' && codeInputRef.current) {
      codeInputRef.current.focus();
    } else if (step === 'profile' && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [step]);
  
  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);
  
  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (countryCode === '+1') {
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        return [match[1], match[2], match[3]]
          .filter(Boolean)
          .join(' ')
          .replace(/(\d{3}) (\d{3})/, '($1) $2-');
      }
    }
    
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
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('user_phone_numbers')
        .select('user_id')
        .eq('phone_number', fullNumber)
        .eq('verified', true)
        .single();
      
      setIsNewUser(!existingUser);
      
      // Send OTP via Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullNumber,
        options: {
          shouldCreateUser: true,
          channel: 'sms'
        }
      });
      
      if (error) throw error;
      
      trackEvent('phone_sso_code_sent', {
        country_code: countryCode,
        is_new_user: !existingUser
      });
      
      toast.success('Verification code sent!');
      setStep('verify');
      setResendTimer(60);
      
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
      const fullNumber = countryCode + phoneNumber.replace(/\D/g, '');
      
      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullNumber,
        token: verificationCode,
        type: 'sms'
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('Verification failed');
      
      // Check if profile is complete
      const needsProfile = !data.user.user_metadata?.full_name;
      
      trackEvent('phone_sso_verified', {
        user_id: data.user.id,
        needs_profile: needsProfile
      });
      
      if (needsProfile) {
        setStep('profile');
      } else {
        // Login complete
        toast.success('Welcome back!');
        onSuccess?.();
        router.push(redirectTo);
      }
      
    } catch (err: any) {
      reportError(err);
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const completeProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Update user profile
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          username: username
        }
      });
      
      if (updateError) throw updateError;
      
      // Save phone number as verified
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fullNumber = countryCode + phoneNumber.replace(/\D/g, '');
        
        await supabase
          .from('user_phone_numbers')
          .upsert({
            user_id: user.id,
            phone_number: fullNumber,
            country_code: countryCode,
            verified: true,
            verified_at: new Date().toISOString()
          });
      }
      
      trackEvent('phone_sso_profile_complete', {
        user_id: user?.id
      });
      
      toast.success('Welcome to Bitcode! 🚀');
      onSuccess?.();
      router.push('/'); // New users go to home page (onboarding handled by Orbital)
      
    } catch (err: any) {
      reportError(err);
      setError(err.message || 'Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome to Bitcode 🚀
              </h2>
              <p className="text-gray-400">
                Sign in or create an account with your phone
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
                    className="px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none transition-colors"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+7">🇷🇺 +7</option>
                  </select>
                  
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={countryCode === '+1' ? '(555) 555-5555' : '123 456 7890'}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
              
              <button
                onClick={sendVerificationCode}
                disabled={isLoading || phoneNumber.replace(/\D/g, '').length < 10}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Continue with Phone'
                )}
              </button>
              
              {showEmailOption && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-900 text-gray-400">or</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full px-4 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Continue with Email
                  </button>
                </>
              )}
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to Bitcode's Terms of Service and Privacy Policy
            </p>
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
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Verify Your Phone 🔐
              </h2>
              <p className="text-gray-400">
                Enter the 6-digit code sent to
              </p>
              <p className="text-white font-medium">
                {countryCode} {phoneNumber}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <input
                  ref={codeInputRef}
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                    setError(null);
                    
                    // Auto-submit when 6 digits entered
                    if (value.length === 6) {
                      verifyCode();
                    }
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-3xl tracking-[0.5em] placeholder-gray-600 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
              
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
              
              <button
                onClick={verifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
              
              <div className="flex justify-between text-sm">
                <button
                  onClick={() => {
                    setStep('phone');
                    setVerificationCode('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Change number
                </button>
                
                <button
                  onClick={sendVerificationCode}
                  disabled={resendTimer > 0}
                  className="text-gray-400 hover:text-white disabled:cursor-not-allowed transition-colors"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </div>
          </motion.div>
        );
        
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Complete Your Profile ✨
              </h2>
              <p className="text-gray-400">
                Just a few more details to get started
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setUsername(value);
                    }}
                    placeholder="johndoe"
                    className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Letters, numbers, and hyphens only
                </p>
              </div>
              
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
              
              <button
                onClick={completeProfile}
                disabled={isLoading || !fullName.trim() || !username.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? 'Creating Account...' : 'Complete Setup'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400">
                You'll be able to trigger pipelines via SMS at
              </p>
              <p className="text-white font-mono">
                {process.env.NEXT_PUBLIC_TWILIO_PHONE || '+1 (555) 123-4567'}
              </p>
            </div>
          </motion.div>
        );
    }
  };
  
  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
