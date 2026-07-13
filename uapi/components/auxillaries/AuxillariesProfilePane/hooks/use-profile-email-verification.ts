/**
 * Email OTP send/verify handlers for optional profile contact notifications.
 */

import { trackEvent } from '@bitcode/google-analytics';
import { reportError } from '@bitcode/errors';
import { createClient } from '@bitcode/supabase/ssr/client';

interface UseProfileEmailVerificationArgs {
  email: string;
  verificationCode: string;
  profileAutosavePayload: Record<string, unknown>;
  username: string;
  setAuthError: (value: string | null) => void;
  setVerificationLoading: (value: boolean) => void;
  setIsVerifying: (value: boolean) => void;
  setIsVerified: (value: boolean) => void;
  verifiedRef: { current: boolean };
  onSave: (data: any) => void;
}

export function useProfileEmailVerification({
  email,
  verificationCode,
  profileAutosavePayload,
  username,
  setAuthError,
  setVerificationLoading,
  setIsVerifying,
  setIsVerified,
  verifiedRef,
  onSave,
}: UseProfileEmailVerificationArgs) {
  const handleSendCode = async () => {
    setAuthError(null);
    setVerificationLoading(true);
    trackEvent('onboarding_profile_send_code');
    try {
      const supabase = createClient();
      const { error: createError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });

      if (createError && /already\s+registered/i.test(createError.message)) {
        await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false },
        });
        setIsVerifying(true);
      } else if (createError) {
        setAuthError('Failed to send verification code. Please try again.');
      } else {
        setIsVerifying(true);
      }
    } catch (error: any) {
      setAuthError(error.message || 'Error sending code');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setAuthError(null);
    setVerificationLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email',
      });
      if (error) {
        setAuthError(error.message);
        trackEvent('onboarding_profile_verify_code_error', { message: error.message });
      } else {
        setIsVerified(true);
        verifiedRef.current = true;
        trackEvent('onboarding_profile_verified');
        onSave({
          ...profileAutosavePayload,
          username: username || email.split('@')[0],
          email,
          isVerified: true,
        });
      }
    } catch (error: any) {
      reportError(error);
      setAuthError(error.message || 'Error verifying code');
      trackEvent('onboarding_profile_verify_code_error', { message: error?.message });
    } finally {
      setVerificationLoading(false);
    }
  };

  return { handleSendCode, handleVerifyCode };
}
