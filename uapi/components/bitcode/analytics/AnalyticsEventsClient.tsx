"use client";

import { useEffect } from 'react';
import { trackEvent } from '@bitcode/google-analytics';

// Attach a single delegated click listener that fires a GA4 event for most
// user interactions.  This is meant as a catch-all safety net – you should
// still fire domain-specific events where extra context is helpful, but this
// ensures *some* telemetry exists even when developers forget to add manual
// tracking.

// 1)  If the clicked element (or one of its ancestors) declares
//     `data-ga-event="<eventName>"` we send that as the event name.
// 2)  Otherwise fall back to a heuristic composed of the element tag + text
//     (truncated) so we still get distinct signals.

// The listener runs in capture phase to reliably catch events before they are
// stoppedPropagation() by third-party components.

export default function AnalyticsEventsClient() {
  useEffect(() => {
    const handler = (e: Event) => {
      if (typeof window === 'undefined') return;
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (!target) return;

      // Walk up the DOM until body to find explicit marker.
      let el: HTMLElement | null = target;
      let eventName: string | undefined;
      while (el && el !== document.body) {
        const attr = el.getAttribute('data-ga-event');
        if (attr) {
          eventName = attr;
          break;
        }
        el = el.parentElement;
      }

      // Derive fallback name if none explicitly specified.
      if (!eventName && target instanceof HTMLElement) {
        const tag = target.tagName.toLowerCase();
        let txt = (target.textContent || '').trim().slice(0, 30).replace(/\s+/g, ' ');
        if (!txt) txt = target.getAttribute('aria-label') || target.getAttribute('title') || '';
        eventName = `${tag}_${txt || 'click'}`;
      }

      if (!eventName) return;
      trackEvent(eventName, {
        event_category: 'auto',
        event_label: window.location.pathname,
      });
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  return null;
}
