'use client';

/**
 * Smart Phone Connect Component
 * 
 * Intelligently handles:
 * - Auto-linking for phone SSO users
 * - Easy linking for existing users
 * - Seamless orbital panel integration
 */

// moved to orbital/phone-connect-smart

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@bitcode/external-telemetry-google';
import { createClient } from '@bitcode/supabase/ssr/client';
import { reportError } from '@bitcode/errors';
import { toast } from '@/components/shadcn/Sonner/Sonner';
import { PhoneConnect } from '@/components/bitcode/orbitals/PhoneConnect/PhoneConnect';

interface PhoneConnectSmartProps {
  userId: string;
  userEmail?: string;
  userPhone?: string;
  onComplete?: () => void;
}

type ConnectionStatus = 'loading' | 'connected' | 'not-connected' | 'sso-pending';

export function PhoneConnectSmart({ 
  userId, 
  userEmail,
  userPhone,
  onComplete 
}: PhoneConnectSmartProps) {
  const [status, setStatus] = useState<ConnectionStatus>('loading');
  const [phoneData, setPhoneData] = useState<{
    number: string;
    verified: boolean;
    isSSO: boolean;
  } | null>(null);
  const [showConnect, setShowConnect] = useState(false);
  
  useEffect(() => {
    checkPhoneStatus();
  }, [userId]);
  
  const checkPhoneStatus = async () => {
    try {
      // Check if user has a verified phone
      const supabase = createClient();
      const { data: phoneRecord } = await supabase
        .from('user_phone_numbers')
        .select('phone_number, verified, created_at')
        .eq('user_id', userId)
        .single();
        
      if (phoneRecord?.verified) {
        setPhoneData({
          number: phoneRecord.phone_number,
          verified: true,
          isSSO: false
        });
        setStatus('connected');
        return;
      }
      
      // Check if user signed up with phone SSO
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.phone) {
        // User has phone from SSO but not verified in our system
        setPhoneData({
          number: user.phone,
          verified: false,
          isSSO: true
        });
        setStatus('sso-pending');
        
        // Auto-link for SSO users
        await autoLinkSSOPhone(user.phone);
      } else {
        setStatus('not-connected');
      }
      
    } catch (error) {
      reportError(error);
      setStatus('not-connected');
    }
  };
  
  const autoLinkSSOPhone = async (phone: string) => {
    try {
      // For SSO users, we can trust the phone is verified
      const supabase = createClient();
      const { error } = await supabase
        .from('user_phone_numbers')
        .upsert({
          user_id: userId,
          phone_number: phone,
          verified: true,
          verified_at: new Date().toISOString(),
          country_code: phone.slice(0, 2) // Extract from E.164
        });
        
      if (!error) {
        trackEvent('phone_auto_linked_sso', {
          user_id: userId,
          method: 'sso'
        });
        
        toast.success('Phone automatically connected from your account!');
        setStatus('connected');
        setPhoneData({
          number: phone,
          verified: true,
          isSSO: true
        });
        
        // Set default SMS preferences
        await setupDefaultPreferences();
      }
    } catch (error) {
      reportError(error);
      // Fall back to manual connection
      setStatus('not-connected');
    }
  };
  
  const setupDefaultPreferences = async () => {
    try {
      const supabase = createClient();
      await supabase
        .from('user_sms_preferences')
        .upsert({
          user_id: userId,
          enabled: true,
          daily_limit: 10,
          notification_types: ['completion', 'error'],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    } catch (error) {
      // Non-critical, don't block
      console.error('Failed to set SMS preferences:', error);
    }
  };
  
  const handleDisconnect = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to disconnect your phone? You\'ll read to verify again to use SMS commands.'
    );
    
    if (!confirmed) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_phone_numbers')
        .delete()
        .eq('user_id', userId);
        
      if (!error) {
        toast.success('Phone disconnected');
        setStatus('not-connected');
        setPhoneData(null);
        
        trackEvent('phone_disconnected', {
          user_id: userId
        });
      }
    } catch (error) {
      reportError(error);
      toast.error('Failed to disconnect phone');
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-800 rounded-lg"></div>
      </div>
    );
  }
  
  if (showConnect) {
    return (
      <PhoneConnect 
        userId={userId}
        onComplete={() => {
          setShowConnect(false);
          checkPhoneStatus();
          onComplete?.();
        }}
      />
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      {status === 'connected' && phoneData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          {/* Connected State */}
          <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    SMS Connected {phoneData.isSSO && '(via Phone Connect)'}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {formatPhoneNumber(phoneData.number)}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      Text commands to: <span className="font-mono text-green-400">+1 (555) 123-BITC</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded">deliver auth system</code>
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded">analyze security</code>
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded">evidence react</code>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDisconnect}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Disconnect phone"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/exchange?auxillary-open-to=externals"
              className="text-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mx-auto mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-400">SMS Orbital</p>
            </a>
            
            <a
              href="/docs/sms"
              className="text-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mx-auto mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-sm text-gray-400">SMS Guide</p>
            </a>
          </div>
        </motion.div>
      )}
      
      {status === 'not-connected' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          {/* Not Connected State */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Connect Your Phone
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Enable SMS commands to trigger pipelines with a simple text. 
                  Build features instantly from anywhere.
                </p>
                
                <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Example commands:</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-300">📱 "deliver auth system"</p>
                    <p className="text-sm text-gray-300">📱 "analyze security vulnerabilities"</p>
                    <p className="text-sm text-gray-300">📱 "evidence to React 18"</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowConnect(true)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  Connect Phone Now
                </button>
              </div>
            </div>
          </div>
          
          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-gray-800 rounded-lg">
              <span className="text-xl mb-1 block">⚡</span>
              <p className="text-xs text-gray-400">Instant Access</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <span className="text-xl mb-1 block">🚀</span>
              <p className="text-xs text-gray-400">Zero Friction</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <span className="text-xl mb-1 block">🌍</span>
              <p className="text-xs text-gray-400">Works Anywhere</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatPhoneNumber(phone: string): string {
  // Format E.164 to readable format
  if (phone.startsWith('+1') && phone.length === 12) {
    return `+1 (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
  }
  return phone;
}
