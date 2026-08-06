/**
 * Twilio Security Utilities
 * 
 * Provides security functions for Twilio integration,
 * including webhook signature validation.
 */

import crypto from 'crypto';

/**
 * Validate Twilio webhook signature
 * 
 * @param authToken - Twilio auth token
 * @param twilioSignature - X-Twilio-Signature header value
 * @param url - Full URL of the webhook endpoint
 * @param params - Request parameters (form data)
 * @returns true if signature is valid
 */
export function validateTwilioWebhook(
  authToken: string,
  twilioSignature: string,
  url: string,
  params: Record<string, string>
): boolean {
  // Sort parameters by key
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, string>);
  
  // Build the validation string
  let data = url;
  for (const [key, value] of Object.entries(sortedParams)) {
    data += key + value;
  }
  
  // Calculate expected signature
  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');
  
  // Compare signatures (constant-time comparison)
  return crypto.timingSafeEqual(
    Buffer.from(twilioSignature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Mask phone number for logging
 * +1234567890 -> +1******890
 */
export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || phoneNumber.length < 10) {
    return phoneNumber;
  }
  
  const firstThree = phoneNumber.substring(0, 3);
  const lastThree = phoneNumber.substring(phoneNumber.length - 3);
  const masked = '*'.repeat(phoneNumber.length - 6);
  
  return `${firstThree}${masked}${lastThree}`;
}

/**
 * Validate E.164 phone number format
 */
export function isValidE164(phoneNumber: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

/**
 * Sanitize SMS message content
 * Remove potential security risks while preserving message intent
 */
export function sanitizeSmsContent(content: string): string {
  // Remove any potential script tags or HTML
  let sanitized = content.replace(/<[^>]*>/g, '');
  
  // Remove any potential SQL injection attempts
  sanitized = sanitized.replace(/(['";\\])/g, '\\$1');
  
  // Limit length to prevent overflow
  const maxLength = 5000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }
  
  return sanitized.trim();
}