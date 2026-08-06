/**
 * User Model Preferences Model
 *
 * Manages user preferences for AI models.
 *
 * @doc-code
 * type: model
 * table: user_model_preferences
 */
import { BaseModel } from './base';
import { Tables, Insertable, Updatable } from '../types/database';
export type UserModelPreference = Tables<'user_model_preferences'> & {
    preferences?: Record<string, unknown>;
};
export type UserModelPreferenceInsert = Omit<Insertable<'user_model_preferences'>, 'model_provider' | 'model_name'> & {
    model_provider?: string;
    model_name?: string;
    preferences?: Record<string, unknown>;
};
export type UserModelPreferenceUpdate = Updatable<'user_model_preferences'> & {
    preferences?: Record<string, unknown>;
};
export declare class UserModelPreferencesModel extends BaseModel<'user_model_preferences'> {
    constructor(supabase: any);
    /**
     * Get preferences by user ID
     */
    getByUserId(userId: string): Promise<UserModelPreference | null>;
    /**
     * Upsert preferences
     */
    upsert(preferences: UserModelPreferenceInsert): Promise<UserModelPreference>;
    /**
     * Get default model for user
     */
    getDefaultModel(userId: string): Promise<{
        provider: string;
        model: string;
    } | null>;
    /**
     * Update specific preference
     */
    updatePreference(userId: string, key: string, value: unknown): Promise<UserModelPreference>;
}
