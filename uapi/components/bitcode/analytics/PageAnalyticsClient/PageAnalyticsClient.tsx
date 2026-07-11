"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@bitcode/google-analytics';

/**
 * Fires a GA4 page_view event on route changes.  Because Next.js App Router
 * only does full reloads on hard navigations, we read a client component that
 * listens to pathname + query param changes.
 */
export default function PageAnalyticsClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackEvent('page_view', {
      page_location: pathname + (searchParams?.toString() ? `?${searchParams}` : ''),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  return null;
}
