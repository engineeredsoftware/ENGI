import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Lightweight email notification utilities
// ---------------------------------------------------------------------------

const smtpUrl = process.env.EMAIL_SMTP_URL;

if (!smtpUrl) {
  // eslint-disable-next-line no-console
  console.warn('[email] EMAIL_SMTP_URL not set; emails will not be sent');
}

export interface EmailOptions {
  to: string;
  subject: string;
  template: string; // template file name without path
  vars: Record<string, string | number>;
}

/**
 * Send an email using an HTML template located under `supabase/templates`.
 * When `EMAIL_SMTP_URL` is not set the call is logged and resolved so that
 * local development / CI environments work without a mail server.
 */
export async function sendEmail(opts: EmailOptions): Promise<void> {
  if (!smtpUrl) {
    // eslint-disable-next-line no-console
    console.log('[email][stub] sending to', opts.to, 'subject:', opts.subject, 'template:', opts.template, 'vars:', opts.vars);
    return;
  }

  const transporter = nodemailer.createTransport({ url: smtpUrl });

  // Resolve template path relative to the monorepo root
  const templatePath = path.join(process.cwd(), 'supabase', 'templates', `${opts.template}.html`);

  let html: string;
  try {
    html = await fs.promises.readFile(templatePath, 'utf-8');

    // Interpolate {{var}} placeholders with the provided vars
    for (const [key, value] of Object.entries(opts.vars)) {
      // Replace all occurrences of the placeholder
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[email] Failed to load template', opts.template, err);
    html = '';
  }

  await transporter.sendMail({
    to: opts.to,
    subject: opts.subject,
    html,
  });
}

// ---------------------------------------------------------------------------
// Re-export new notification/event helpers so consumers can do a single
// import from '@bitcode/email'.
// ---------------------------------------------------------------------------

export * from './types';
export * from './events';
export * from './processor';
export * from './email-preferences';
export { startNotificationWorker } from './worker';

// Auto-start the worker in long-running server contexts when the env flag is
// set.  This means you can enable the notification pipeline locally by
// running:
//   NOTIFICATIONS_WORKER=1 next dev
// Start worker automatically unless explicitly disabled (OPT_OUT) – this makes
// local dev / test environments work out-of-the-box without extra flags.
if (process.env.DISABLE_NOTIFICATIONS_WORKER !== '1') {
  // Dynamically import to avoid pulling in heavy deps for edge runtimes that
  // *do not* read the worker (e.g. Vercel Edge Functions).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('./worker').startNotificationWorker();
}

