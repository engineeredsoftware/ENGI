import type { Json } from './types/database';
type UnknownRecord = Record<string, unknown>;
type JsonRecord = {
    [key: string]: Json | undefined;
};
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
export declare const DEFAULT_EMAIL_NOTIFICATION_PREFERENCES: BitcodeEmailNotificationPreferences;
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
export declare function readBitcodeProfileSettings(settings: unknown): BitcodeProfileSettings;
export declare function mergeBitcodeProfileSettings(existingSettings: unknown, patch: Partial<BitcodeProfileSettings>): JsonRecord;
export declare function hydrateBitcodeProfile<T extends {
    settings?: unknown;
} & UnknownRecord>(profile: T | null): (T & HydratedBitcodeProfileFields) | null;
export declare function readBitcodeWalletBindingFromProfile(profile: ({
    settings?: unknown;
} & UnknownRecord) | null | undefined): BitcodeWalletBinding | null;
export declare function readBitcodeWalletCapabilityFromProfile(profile: ({
    settings?: unknown;
} & UnknownRecord) | null | undefined): BitcodeWalletCapability;
export declare function profileHasWalletBinding(profile: ({
    settings?: unknown;
} & UnknownRecord) | null | undefined): boolean;
export declare function profileHasVerifiedWalletBinding(profile: ({
    settings?: unknown;
} & UnknownRecord) | null | undefined): boolean;
export {};
