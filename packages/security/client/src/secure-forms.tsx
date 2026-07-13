"use client";

/**
 * Secure client-side credential handling utilities
 * 
 * Provides patterns for handling sensitive data in React forms
 * without exposing credentials in browser memory or dev tools.
 */

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';

/**
 * Secure credential input configuration
 */
export interface SecureInputConfig {
  readonly autoComplete?: string;
  readonly clearOnUnmount?: boolean;
  readonly obfuscateInDevTools?: boolean;
  readonly maxLength?: number;
  readonly validateInput?: (value: string) => boolean;
  readonly sanitizeInput?: (value: string) => string;
}

/**
 * Secure form state management for credentials
 */
export interface SecureFormState {
  readonly hasValue: boolean;
  readonly isValid: boolean;
  readonly length: number;
  readonly lastUpdated: Date;
}

/**
 * Default configuration for secure credential inputs
 */
const DEFAULT_SECURE_CONFIG: SecureInputConfig = {
  autoComplete: 'off',
  clearOnUnmount: true,
  obfuscateInDevTools: true,
  maxLength: 512,
  validateInput: (value: string) => value.length >= 8,
  sanitizeInput: (value: string) => value.trim()
};

/**
 * Hook for secure credential input handling
 * 
 * This hook manages credential input without storing the actual value
 * in React state, reducing exposure in browser memory and dev tools.
 */
export function useSecureCredentialInput(config: SecureInputConfig = {}) {
  const finalConfig = { ...DEFAULT_SECURE_CONFIG, ...config };
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<string>('');
  const [state, setState] = useState<SecureFormState>({
    hasValue: false,
    isValid: false,
    length: 0,
    lastUpdated: new Date()
  });

  // Clear value on unmount if configured
  const cleanup = useCallback(() => {
    if (finalConfig.clearOnUnmount && inputRef.current) {
      inputRef.current.value = '';
      valueRef.current = '';
      
      // Additional security: overwrite memory
      if (finalConfig.obfuscateInDevTools) {
        const dummy = 'x'.repeat(Math.max(1, valueRef.current.length));
        valueRef.current = dummy;
        setTimeout(() => {
          valueRef.current = '';
        }, 100);
      }
    }
  }, [finalConfig]);

  // Handle input changes
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    
    // Apply length limit
    if (finalConfig.maxLength && value.length > finalConfig.maxLength) {
      value = value.substring(0, finalConfig.maxLength);
      event.target.value = value;
    }
    
    // Sanitize input
    if (finalConfig.sanitizeInput) {
      value = finalConfig.sanitizeInput(value);
      event.target.value = value;
    }
    
    // Store in ref (not React state)
    valueRef.current = value;
    
    // Update state with metadata only
    setState({
      hasValue: value.length > 0,
      isValid: finalConfig.validateInput ? finalConfig.validateInput(value) : true,
      length: value.length,
      lastUpdated: new Date()
    });
  }, [finalConfig]);

  // Get the current value (use sparingly)
  const getValue = useCallback((): string => {
    return valueRef.current;
  }, []);

  // Clear the input
  const clear = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    valueRef.current = '';
    setState({
      hasValue: false,
      isValid: false,
      length: 0,
      lastUpdated: new Date()
    });
  }, []);

  // Check if value matches a pattern without exposing the value
  const matches = useCallback((pattern: RegExp): boolean => {
    return pattern.test(valueRef.current);
  }, []);

  return {
    inputRef,
    state,
    handleChange,
    getValue,
    clear,
    matches,
    cleanup,
    inputProps: {
      ref: inputRef,
      onChange: handleChange,
      autoComplete: finalConfig.autoComplete,
      maxLength: finalConfig.maxLength,
      type: 'password', // Always use password type for credentials
      spellCheck: false, // Disable spell check for credentials
      autoCorrect: 'off', // Disable auto-correct
      autoCapitalize: 'off', // Disable auto-capitalization
      'data-lpignore': 'true', // Ignore LastPass
      'data-form-type': 'other' // Prevent browser password managers
    }
  };
}

/**
 * Hook for secure form submission
 * 
 * Handles form submission with secure credential transmission
 * and automatic cleanup.
 */
export function useSecureFormSubmission<T extends Record<string, any>>(
  submitFn: (data: T) => Promise<void>,
  config: {
    clearOnSubmit?: boolean;
    validateBeforeSubmit?: (data: T) => boolean;
    sanitizeBeforeSubmit?: (data: T) => T;
  } = {}
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = useCallback(async (data: T) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate data if validator provided
      if (config.validateBeforeSubmit && !config.validateBeforeSubmit(data)) {
        throw new Error('Form validation failed');
      }

      // Sanitize data if sanitizer provided
      const sanitizedData = config.sanitizeBeforeSubmit 
        ? config.sanitizeBeforeSubmit(data)
        : data;

      // Submit the form
      await submitFn(sanitizedData);

      // Clear form if configured
      if (config.clearOnSubmit && formRef.current) {
        formRef.current.reset();
        
        // Also clear any password inputs manually
        const passwordInputs = formRef.current.querySelectorAll('input[type="password"]');
        passwordInputs.forEach((input: HTMLInputElement) => {
          input.value = '';
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFn, config]);

  return {
    formRef,
    isSubmitting,
    error,
    submit,
    clearError: () => setError(null)
  };
}

/**
 * Utility function to create secure form fields
 */
export function createSecureFormField(
  name: string,
  label: string,
  config: SecureInputConfig & {
    required?: boolean;
    placeholder?: string;
    helpText?: string;
  } = {}
) {
  return function SecureFormField({ 
    className = '',
    ...props 
  }: {
    className?: string;
    [key: string]: any;
  }) {
    const {
      inputRef,
      state,
      inputProps,
      cleanup
    } = useSecureCredentialInput(config);

    // Cleanup on unmount
    useEffect(() => {
      return cleanup;
    }, [cleanup]);

    return (
      <div className={`secure-form-field ${className}`}>
        <label htmlFor={name} className="block text-sm font-medium">
          {label}
          {config.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <input
          {...inputProps}
          {...props}
          id={name}
          name={name}
          placeholder={config.placeholder}
          required={config.required}
          className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                     focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                     ${!state.isValid && state.hasValue ? 'border-red-500' : ''}`}
        />
        
        {config.helpText && (
          <p className="mt-1 text-sm text-gray-500">{config.helpText}</p>
        )}
        
        {!state.isValid && state.hasValue && (
          <p className="mt-1 text-sm text-red-500">
            Invalid {label.toLowerCase()}
          </p>
        )}
        
        {/* Security indicator */}
        <div className="mt-1 flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${
            state.hasValue 
              ? state.isValid 
                ? 'bg-green-500' 
                : 'bg-red-500'
              : 'bg-gray-300'
          }`} />
          <span className="text-xs text-gray-500">
            {state.length} characters
          </span>
        </div>
      </div>
    );
  };
}

/**
 * Security utilities for client-side credential handling
 */
export const SecureFormUtils = {
  /**
   * Disable browser features that could expose credentials
   */
  disableBrowserFeatures: () => {
    // Disable context menu on password fields
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && target.getAttribute('type') === 'password') {
        e.preventDefault();
      }
    });

    // Disable copy/paste on password fields (optional, may hurt UX)
    document.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && target.getAttribute('type') === 'password') {
        // Disable Ctrl+C, Ctrl+V, Ctrl+A on password fields
        if (e.ctrlKey && ['c', 'v', 'a'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
    });
  },

  /**
   * Clear all password inputs on page unload
   */
  setupUnloadCleanup: () => {
    window.addEventListener('beforeunload', () => {
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      passwordInputs.forEach((input: HTMLInputElement) => {
        input.value = '';
      });
    });
  },

  /**
   * Obfuscate form data in dev tools
   */
  obfuscateDevTools: () => {
    if (process.env.NODE_ENV === 'development') {
      // Override console methods to filter credential data
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        const filtered = args.map(arg => {
          if (typeof arg === 'object' && arg !== null) {
            return SecureFormUtils.sanitizeObjectForLogging(arg);
          }
          return arg;
        });
        originalLog.apply(console, filtered);
      };
    }
  },

  /**
   * Sanitize object for safe logging (remove credential fields)
   */
  sanitizeObjectForLogging: (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'credential', 
      'auth', 'access_token', 'refresh_token', 'api_key'
    ];

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => keyLower.includes(sensitive))) {
        if (typeof value === 'string' && value.length > 0) {
          sanitized[key] = `[REDACTED:${value.length}chars]`;
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else if (typeof value === 'object') {
        sanitized[key] = SecureFormUtils.sanitizeObjectForLogging(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
};
