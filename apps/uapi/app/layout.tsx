import type { Metadata } from "next";
import { Suspense } from 'react';
import "./globals.css";
// Global navigation animations
import "@/styles/nav-animations.css";
// Global marketing animations (text gradients, pulses, etc.)
import "@/styles/marketing-animations.css";
// Global styles for the orbital modal and rings
import "@/styles/orbital-rings.css";
import "@/styles/orbital.css";
import "@/styles/orbital-global.css";
import "@/styles/auxillaries-bitcode.css";
import "@/styles/skeleton-shine.css";
import "@/styles/components.css";
// The Next-specific Analytics entry reports the framework route pattern
// alongside the page path, unlocking the Route dimension in Web Analytics.
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GoogleAnalytics } from '@next/third-parties/google'
import AnalyticsEventsClient from '@/components/bitcode/analytics/AnalyticsEventsClient/AnalyticsEventsClient';
import PageAnalyticsClient from '@/components/bitcode/analytics/PageAnalyticsClient/PageAnalyticsClient';
import WalletSessionPersistenceBridge from './WalletSessionPersistenceBridge';
import { init as initSentry } from '@bitcode/external-telemetry-sentry';

initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_COMMIT_SHA,
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.05,
});
// Restrict to normal (non-italic) axis only – halves font file size because
// the italic variable axis is no longer downloaded.  `display:swap` ensures
// text remains visible during fetch.
// Disable Google Font fetching in offline / CI environments.
const inter = { className: '' } as const;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.bitcode.ai';
const metadataTitle = "Bitcode";
const metadataDescription =
  "Bitcode is auditable market infrastructure for technical knowledge, with BTD-denominated settlement over the networked Bitcode system.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: metadataTitle,
  description: metadataDescription,
  applicationName: 'Bitcode',
  // Logo SSOT: public/bitcode-logo.svg (+ bitcode-logo.pxd). Favicons/OG derived from it.
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/bitcode-logo.svg', type: 'image/svg+xml' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: metadataTitle,
    description: metadataDescription,
    url: '/',
    siteName: 'Bitcode',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bitcode — auditable technical knowledge markets',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: metadataTitle,
    description: metadataDescription,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className="dark relative overflow-x-hidden"
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`${inter.className} z-20 overflow-x-hidden`}
      >
        {children}
        <WalletSessionPersistenceBridge />
        <AnalyticsEventsClient />
        <Suspense fallback={null}>
          <PageAnalyticsClient />
        </Suspense>
        <SpeedInsights />
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-R8VXLSXPW7" />
    </html>
  );
}
