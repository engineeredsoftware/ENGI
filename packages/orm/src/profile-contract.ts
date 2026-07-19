import type { Json } from './types/database';

type UnknownRecord = Record<string, unknown>;
type JsonRecord = { [key: string]: Json | undefined };

export type BitcodeWalletBindingStatus = 'pending' | 'manual' | 'verified';

export interface BitcodeWalletBinding {
  [key: string]: Json | undefined;
  address: string | null;
  provider: string | null;
  status: BitcodeWalletBindingStatus | null;
  boundAt: string | null;
}

export interface BitcodeWalletCapability {
  binding: BitcodeWalletBinding | null;
  hasIdentity: boolean;
  isVerifiedSigner: boolean;
}

/** Profile email fan-out categories. Critical is always on when email exists. */
export interface BitcodeEmailNotificationPreferences {
  receiveProductUpdates: boolean;
  receiveYourNotifications: boolean;
  /** Always true when persisted; cannot be disabled in product UI. */
  receiveCriticalUpdates: boolean;
}

export const DEFAULT_EMAIL_NOTIFICATION_PREFERENCES: BitcodeEmailNotificationPreferences = {
  receiveProductUpdates: false,
  receiveYourNotifications: true,
  receiveCriticalUpdates: true,
};

export interface BitcodeProfileSettings {
  companyName: string | null;
  teamMembers: Json[];
  email: string | null;
  isVerified: boolean | null;
  walletBinding: BitcodeWalletBinding | null;
  emailNotificationPreferences: BitcodeEmailNotificationPreferences;
}

export interface HydratedBitcodeProfileFields {
  company_name: string | null;
  team_members: Json[];
  email: string | null;
  is_verified: boolean | null;
  wallet_address: string | null;
  wallet_provider: string | null;
  wallet_binding_status: BitcodeWalletBindingStatus | null;
  wallet_bound_at: string | null;
  wallet_binding: BitcodeWalletBinding | null;
  email_notification_preferences: BitcodeEmailNotificationPreferences;
}

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function normalizeTeamMembers(value: unknown): Json[] {
  return Array.isArray(value) ? (value as Json[]) : [];
}

function normalizeEmailNotificationPreferences(
  value: unknown,
): BitcodeEmailNotificationPreferences {
  const record = asRecord(value);
  return {
    receiveProductUpdates:
      normalizeBoolean(record?.receiveProductUpdates) ??
      normalizeBoolean(record?.receive_product_updates) ??
      DEFAULT_EMAIL_NOTIFICATION_PREFERENCES.receiveProductUpdates,
    receiveYourNotifications:
      normalizeBoolean(record?.receiveYourNotifications) ??
      normalizeBoolean(record?.receive_your_notifications) ??
      DEFAULT_EMAIL_NOTIFICATION_PREFERENCES.receiveYourNotifications,
    // Critical is always enabled when preferences are read for product use.
    receiveCriticalUpdates: true,
  };
}

function readRecordString(
  primaryRecord: UnknownRecord | null,
  fallbackRecord: UnknownRecord | null,
  primaryKeys: string[],
  fallbackKeys: string[] = [],
) {
  for (const key of primaryKeys) {
    const value = normalizeString(primaryRecord?.[key]);
    if (value) return value;
  }

  for (const key of fallbackKeys) {
    const value = normalizeString(fallbackRecord?.[key]);
    if (value) return value;
  }

  return null;
}

function normalizeWalletBinding(
  value: unknown,
  fallbackRecord: UnknownRecord | null,
): BitcodeWalletBinding | null {
  const bindingRecord = asRecord(value);
  const address =
    normalizeString(bindingRecord?.address) ??
    normalizeString(bindingRecord?.wallet_address) ??
    normalizeString(fallbackRecord?.wallet_address) ??
    normalizeString(fallbackRecord?.walletAddress);
  const provider =
    normalizeString(bindingRecord?.provider) ??
    normalizeString(bindingRecord?.wallet_provider) ??
    normalizeString(fallbackRecord?.wallet_provider) ??
    normalizeString(fallbackRecord?.walletProvider);
  const rawStatus =
    normalizeString(bindingRecord?.status) ??
    normalizeString(bindingRecord?.wallet_binding_status) ??
    normalizeString(fallbackRecord?.wallet_binding_status) ??
    normalizeString(fallbackRecord?.walletBindingStatus);
  const status: BitcodeWalletBindingStatus | null =
    rawStatus === 'pending' || rawStatus === 'manual' || rawStatus === 'verified'
      ? rawStatus
      : rawStatus === 'bound'
        ? 'manual'
      : address
        ? 'manual'
        : null;
  const boundAt =
    normalizeString(bindingRecord?.boundAt) ??
    normalizeString(bindingRecord?.bound_at) ??
    normalizeString(fallbackRecord?.wallet_bound_at) ??
    normalizeString(fallbackRecord?.walletBoundAt);

  if (!address && !provider && !status && !boundAt) {
    return null;
  }

  const binding: BitcodeWalletBinding = {
    address,
    provider,
    status,
    boundAt,
  };

  const network = readRecordString(
    bindingRecord,
    fallbackRecord,
    ['network', 'wallet_network', 'walletNetwork'],
    ['wallet_network', 'walletNetwork'],
  );
  const proofKind = readRecordString(
    bindingRecord,
    fallbackRecord,
    ['proofKind', 'proof_kind', 'wallet_proof_kind', 'walletProofKind'],
    ['wallet_proof_kind', 'walletProofKind'],
  );
  const paymentAddress = readRecordString(
    bindingRecord,
    fallbackRecord,
    ['paymentAddress', 'payment_address', 'wallet_payment_address', 'walletPaymentAddress'],
    ['wallet_payment_address', 'walletPaymentAddress'],
  );
  const authAddress = readRecordString(
    bindingRecord,
    fallbackRecord,
    ['authAddress', 'auth_address', 'wallet_auth_address', 'walletAuthAddress'],
    ['wallet_auth_address', 'walletAuthAddress'],
  );
  const addressType = readRecordString(
    bindingRecord,
    fallbackRecord,
    ['addressType', 'address_type', 'wallet_address_type', 'walletAddressType'],
    ['wallet_address_type', 'walletAddressType'],
  );
  const persistence = readRecordString(
    bindingRecord,
    fallbackRecord,
    ['persistence', 'wallet_persistence', 'walletPersistence'],
    ['wallet_persistence', 'walletPersistence'],
  );

  if (network) binding.network = network;
  if (proofKind) binding.proofKind = proofKind;
  if (paymentAddress) binding.paymentAddress = paymentAddress;
  if (authAddress) binding.authAddress = authAddress;
  if (addressType) binding.addressType = addressType;
  if (persistence) binding.persistence = persistence;

  return binding;
}

export function readBitcodeProfileSettings(settings: unknown): BitcodeProfileSettings {
  const settingsRecord = asRecord(settings);
  const bitcodeProfile = asRecord(settingsRecord?.bitcodeProfile);
  const source = bitcodeProfile ?? settingsRecord ?? {};
  const walletBinding = normalizeWalletBinding(source.walletBinding, settingsRecord);

  return {
    companyName:
      normalizeString(source.companyName) ??
      normalizeString(source.company_name) ??
      normalizeString(settingsRecord?.companyName) ??
      normalizeString(settingsRecord?.company_name),
    teamMembers: normalizeTeamMembers(
      source.teamMembers ?? source.team_members ?? settingsRecord?.teamMembers ?? settingsRecord?.team_members,
    ),
    email:
      normalizeString(source.email) ??
      normalizeString(settingsRecord?.email),
    isVerified:
      normalizeBoolean(source.isVerified) ??
      normalizeBoolean(source.is_verified) ??
      normalizeBoolean(settingsRecord?.isVerified) ??
      normalizeBoolean(settingsRecord?.is_verified),
    walletBinding,
    emailNotificationPreferences: normalizeEmailNotificationPreferences(
      source.emailNotificationPreferences ??
        source.email_notification_preferences ??
        settingsRecord?.emailNotificationPreferences ??
        settingsRecord?.email_notification_preferences,
    ),
  };
}

export function mergeBitcodeProfileSettings(
  existingSettings: unknown,
  patch: Partial<BitcodeProfileSettings>,
): JsonRecord {
  const existingRecord = asRecord(existingSettings) ?? {};
  const existing = readBitcodeProfileSettings(existingSettings);
  const nextWalletBinding =
    patch.walletBinding === undefined ? existing.walletBinding : patch.walletBinding;
  const nextEmailNotificationPreferences =
    patch.emailNotificationPreferences === undefined
      ? existing.emailNotificationPreferences
      : normalizeEmailNotificationPreferences(patch.emailNotificationPreferences);

  return {
    ...existingRecord,
    bitcodeProfile: {
      companyName: patch.companyName === undefined ? existing.companyName : patch.companyName,
      teamMembers: patch.teamMembers === undefined ? existing.teamMembers : patch.teamMembers,
      email: patch.email === undefined ? existing.email : patch.email,
      isVerified: patch.isVerified === undefined ? existing.isVerified : patch.isVerified,
      walletBinding: nextWalletBinding,
      emailNotificationPreferences: nextEmailNotificationPreferences,
    },
  };
}

export function hydrateBitcodeProfile<T extends { settings?: unknown } & UnknownRecord>(
  profile: T | null,
): (T & HydratedBitcodeProfileFields) | null {
  if (!profile) {
    return null;
  }

  const settings = readBitcodeProfileSettings(profile.settings);

  return {
    ...profile,
    company_name: settings.companyName,
    team_members: settings.teamMembers,
    email: settings.email,
    is_verified: settings.isVerified,
    wallet_address: settings.walletBinding?.address ?? null,
    wallet_provider: settings.walletBinding?.provider ?? null,
    wallet_binding_status: settings.walletBinding?.status ?? null,
    wallet_bound_at: settings.walletBinding?.boundAt ?? null,
    wallet_binding: settings.walletBinding,
    email_notification_preferences: settings.emailNotificationPreferences,
  };
}

export function readBitcodeWalletBindingFromProfile(
  profile: ({ settings?: unknown } & UnknownRecord) | null | undefined,
): BitcodeWalletBinding | null {
  if (!profile) {
    return null;
  }

  if (asRecord(profile.wallet_binding)) {
    return normalizeWalletBinding(profile.wallet_binding, asRecord(profile)) ?? null;
  }

  return readBitcodeProfileSettings(profile.settings).walletBinding;
}

export function readBitcodeWalletCapabilityFromProfile(
  profile: ({ settings?: unknown } & UnknownRecord) | null | undefined,
): BitcodeWalletCapability {
  const binding = readBitcodeWalletBindingFromProfile(profile);

  return {
    binding,
    hasIdentity: Boolean(binding?.address),
    isVerifiedSigner: binding?.status === 'verified',
  };
}

export function profileHasWalletBinding(
  profile: ({ settings?: unknown } & UnknownRecord) | null | undefined,
): boolean {
  return readBitcodeWalletCapabilityFromProfile(profile).hasIdentity;
}

export function profileHasVerifiedWalletBinding(
  profile: ({ settings?: unknown } & UnknownRecord) | null | undefined,
): boolean {
  return readBitcodeWalletCapabilityFromProfile(profile).isVerifiedSigner;
}
