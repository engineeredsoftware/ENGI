'use client';

/**
 * OrbitalsConnectsOrbitalPhoneConnection
 *
 * Phone/SMS trigger configuration card for the Orbitals Connects experience.
 * Styling is defined in OrbitalsConnectsOrbitalPhoneConnection.module.css to
 * preserve the original visuals while staying within the CSS module canon.
 */


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@bitcode/external-telemetry-google';
import { createClient } from '@bitcode/supabase/ssr/client';
import { reportError } from '@bitcode/errors';
import { toast } from '@/components/shadcn/Sonner/Sonner';
import { PhoneConnect } from '@/components/bitcode/orbitals/PhoneConnect/PhoneConnect';

interface OrbitalsConnectsOrbitalPhoneConnectionProps {
  userId: string;
  userEmail?: string;
  userPhone?: string;
  onComplete?: () => void;
}

type ConnectionStatus = 'loading' | 'connected' | 'not-connected' | 'sso-pending';

export function OrbitalsConnectsOrbitalPhoneConnection({ 
  userId, 
  userEmail,
  userPhone,
  onComplete 
}: OrbitalsConnectsOrbitalPhoneConnectionProps) {
  const [status, setStatus] = useState<ConnectionStatus>('loading');
  const [phoneData, setPhoneData] = useState<{
    number: string;
    verified: boolean;
    isSSO: boolean;
  } | null>(null);
  const [showConnect, setShowConnect] = useState(false);
  const [hovering, setHovering] = useState(false);
  
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
      <div className="orbitals-connects-phone-connect-loading">
        <div className="orbitals-connects-loading-glow" />
        <div className="orbitals-connects-loading-content">
          <div className="orbitals-connects-orbital-ring">
            <div className="orbitals-connects-quantum-dot" />
          </div>
          <span className="orbitals-connects-loading-text">Initializing SMS module...</span>
        </div>
        {/* Styles moved to CSS Module */}
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
          className="orbitals-connects-phone-connected-container"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {/* Success rings animation on mount */}
          <motion.div 
            className="orbitals-connects-success-rings"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2, delay: 0.5 }}
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="orbitals-connects-ring"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.5, 2],
                  opacity: [0, 0.8, 0] 
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
          
          {/* Main content */}
          <div className="orbitals-connects-connected-content">
            <div className="orbitals-connects-status-header">
              <motion.div 
                className="orbitals-connects-icon-container"
                animate={{ rotate: hovering ? 360 : 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <div className="orbitals-connects-icon-glow" />
                <div className="orbitals-connects-icon-inner">
                  <svg className="orbitals-connects-check-icon" viewBox="0 0 24 24" fill="none">
                    <motion.path 
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    />
                  </svg>
                </div>
              </motion.div>
              
              <div className="orbitals-connects-status-info">
                <h3 className="orbitals-connects-status-title">
                  SMS Pipeline Active
                  {phoneData.isSSO && (
                    <span className="orbitals-connects-sso-badge">Phone SSO</span>
                  )}
                </h3>
                <p className="orbitals-connects-phone-number">{formatPhoneNumber(phoneData.number)}</p>
              </div>
              
              <button
                onClick={handleDisconnect}
                className="orbitals-connects-disconnect-button"
                title="Disconnect phone"
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M13 2h-2a2 2 0 00-2 2v5.5a.5.5 0 01-.5.5 4.5 4.5 0 100 9 .5.5 0 01.5.5V20a2 2 0 002 2h2a2 2 0 002-2v-.5a.5.5 0 01.5-.5 4.5 4.5 0 100-9 .5.5 0 01-.5-.5V4a2 2 0 00-2-2z" 
                    stroke="currentColor" 
                    strokeWidth={1.5}
                  />
                </svg>
              </button>
            </div>
            
          <div className="orbitals-connects-command-showcase">
            <div className="orbitals-connects-showcase-header">
                <span className="showcase-label">Text to</span>
                <span className="bitcode-number">+1 (555) 123-BITCODE</span>
              </div>
              
              <div className="command-examples">
                {[
                  { cmd: 'deliver auth system', color: 'emerald' },
                  { cmd: 'analyze security', color: 'blue' },
                  { cmd: 'evidence to react 18', color: 'purple' }
                ].map((example, i) => (
                  <motion.div
                    key={example.cmd}
                    className={`command-pill ${example.color}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <span className="command-icon">💬</span>
                    <code>{example.cmd}</code>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="quick-actions">
            <motion.a
              href="/packs?auxillary-open-to=externals"
              className="action-card orbital-entry"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
                <div className="orbitals-connects-action-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.5} />
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </div>
                <span>SMS orbital</span>
                <div className="orbitals-connects-action-arrow">→</div>
              </motion.a>
              
              <motion.a
                href="/docs/sms"
                className="orbitals-connects-action-card docs"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="orbitals-connects-action-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                      stroke="currentColor" 
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>SMS Guide</span>
                <div className="orbitals-connects-action-arrow">→</div>
              </motion.a>
            </div>
          </div>
          
        </motion.div>
      )}
      
      {status === 'not-connected' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="phone-not-connected"
        >
          <div className="connect-header">
            <div className="phone-icon">
              <div className="icon-bg" />
              <span className="icon-emoji">📱</span>
              <div className="pulse-ring" />
            </div>
            
            <div className="connect-info">
              <h3 className="connect-title">Enable SMS Commands</h3>
              <p className="connect-description">
                Build software instantly with text messages. Zero friction development.
              </p>
            </div>
          </div>
          
          <div className="feature-grid">
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Instant Pipeline Triggers</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🚀</span>
              <span className="feature-text">Build From Anywhere</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <span className="feature-text">Natural Language</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🌍</span>
              <span className="feature-text">Works Globally</span>
            </div>
          </div>
          
          <motion.button
            onClick={() => setShowConnect(true)}
            className="connect-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="button-text">Connect Phone Now</span>
            <div className="button-glow" />
            <div className="button-shimmer" />
          </motion.button>
          
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

export default OrbitalsConnectsOrbitalPhoneConnection;
