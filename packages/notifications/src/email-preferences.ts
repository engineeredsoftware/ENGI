/**
 * Profile email notification preference resolution.
 *
 * Categories:
 * - product_updates — marketing / product news (optional)
 * - your_notifications — personal run and account activity (optional)
 * - critical_updates — outages, zero-balance, run failures (always on)
 */

import { supabaseAdmin as supabase } from '@bitcode/supabase';

import type { NotificationType } from './types';

export type EmailNotificationCategory =
  | 'product_updates'
  | 'your_notifications'
  | 'critical_updates';

export interface EmailNotificationPreferences {
  receiveProductUpdates: boolean;
  receiveYourNotifications: boolean;
  receiveCriticalUpdates: boolean;
}

export const DEFAULT_EMAIL_NOTIFICATION_PREFERENCES: EmailNotificationPreferences = {
  receiveProductUpdates: false,
  receiveYourNotifications: true,
  receiveCriticalUpdates: true,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeEmailNotificationPreferences(value: unknown): EmailNotificationPreferences {
  const record = asRecord(value);
  return {
    receiveProductUpdates: readBoolean(
      record?.receiveProductUpdates ?? record?.receive_product_updates,
      DEFAULT_EMAIL_NOTIFICATION_PREFERENCES.receiveProductUpdates,
    ),
    receiveYourNotifications: readBoolean(
      record?.receiveYourNotifications ?? record?.receive_your_notifications,
      DEFAULT_EMAIL_NOTIFICATION_PREFERENCES.receiveYourNotifications,
    ),
    receiveCriticalUpdates: true,
  };
}

function readProfileSettingsEmail(settings: unknown): string | null {
  const root = asRecord(settings);
  const bitcode = asRecord(root?.bitcodeProfile);
  const email =
    (typeof bitcode?.email === 'string' && bitcode.email.trim()) ||
    (typeof root?.email === 'string' && root.email.trim()) ||
    '';
  return email || null;
}

function readProfileSettingsPreferences(settings: unknown): EmailNotificationPreferences {
  const root = asRecord(settings);
  const bitcode = asRecord(root?.bitcodeProfile);
  return normalizeEmailNotificationPreferences(
    bitcode?.emailNotificationPreferences ??
      bitcode?.email_notification_preferences ??
      root?.emailNotificationPreferences ??
      root?.email_notification_preferences,
  );
}

export function categoryForNotificationType(type: NotificationType): EmailNotificationCategory {
  switch (type) {
    case 'ZERO_BTD_BALANCE':
    case 'RUN_ERROR':
      return 'critical_updates';
    case 'RUN_START':
    case 'RUN_SUCCESS':
    case 'LOW_BTD_BALANCE':
      return 'your_notifications';
    default:
      return 'your_notifications';
  }
}

export function categoryAllowsEmail(
  prefs: EmailNotificationPreferences,
  category: EmailNotificationCategory,
): boolean {
  if (category === 'critical_updates') return true;
  if (category === 'product_updates') return Boolean(prefs.receiveProductUpdates);
  if (category === 'your_notifications') return Boolean(prefs.receiveYourNotifications);
  return false;
}

export async function loadUserEmailNotificationPreferences(
  userId: string,
): Promise<EmailNotificationPreferences> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('settings')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) {
      return { ...DEFAULT_EMAIL_NOTIFICATION_PREFERENCES };
    }
    return readProfileSettingsPreferences(data.settings);
  } catch {
    return { ...DEFAULT_EMAIL_NOTIFICATION_PREFERENCES };
  }
}

/**
 * Resolve the notification contact email from profile settings first, then auth.
 */
export async function resolveNotificationContactEmail(userId: string): Promise<string | null> {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('settings')
      .eq('id', userId)
      .maybeSingle();
    const settingsEmail = readProfileSettingsEmail(profile?.settings);
    if (settingsEmail) return settingsEmail;
  } catch {
    // fall through to auth
  }

  try {
    const authAdmin = (supabase.auth as typeof supabase.auth & {
      admin?: {
        getUserById(id: string): Promise<{
          data: { user?: { email?: string | null } | null } | null;
          error: Error | null;
        }>;
      };
    }).admin;
    if (!authAdmin) return null;
    const { data, error } = await authAdmin.getUserById(userId);
    if (error) return null;
    const email = data?.user?.email?.trim();
    return email || null;
  } catch {
    return null;
  }
}

export async function shouldSendUserEmail(
  userId: string,
  category: EmailNotificationCategory,
): Promise<{ allowed: boolean; email: string | null; reason?: string }> {
  const email = await resolveNotificationContactEmail(userId);
  if (!email) {
    return { allowed: false, email: null, reason: 'missing_email' };
  }
  const prefs = await loadUserEmailNotificationPreferences(userId);
  if (!categoryAllowsEmail(prefs, category)) {
    return { allowed: false, email, reason: `preference_disabled:${category}` };
  }
  return { allowed: true, email };
}
