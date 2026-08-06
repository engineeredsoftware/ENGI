/**
 * @bitcode/security-client — client-only secure form hooks.
 * Prefer: import from '@bitcode/security-client'.
 */
"use client";

export type { SecureInputConfig, SecureFormState } from './secure-forms';
export {
  useSecureCredentialInput,
  useSecureFormSubmission,
  createSecureFormField,
  SecureFormUtils,
} from './secure-forms';
