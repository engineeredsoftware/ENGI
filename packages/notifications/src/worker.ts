/*
 * Notification Worker – subscribes to Domain Events published via the local
 * in-process bus (see events.ts) and converts them into Notification records
 * plus side-effects (emails, Slack, etc.).
 *
 * In a proper production setup this file would be executed in its own
 * process/container (see containers/Dockerfile.long-runner-worker) so that heavy email
 * sends do not block the web server.  For now this scaffold keeps it in the
 * same process for simplicity.
 */

import { subscribeDomainEvents } from './events';
import { handleDomainEvent } from './processor';

let unsubscribe: (() => void) | null = null;

export function startNotificationWorker(): void {
  if (unsubscribe) return; // already running
  unsubscribe = subscribeDomainEvents((evt) => {
    // Fire & forget; log errors
    handleDomainEvent(evt).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[notifications] worker failed', err);
    });
  });
  // eslint-disable-next-line no-console
  console.log('[notifications] worker started');
}

export function stopNotificationWorker(): void {
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
}
