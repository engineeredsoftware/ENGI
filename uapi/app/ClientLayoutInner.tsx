"use client"
/* eslint-disable react/no-multi-comp */

import React, { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { createClient } from '@bitcode/supabase/ssr/client'
import type { Session, User } from '@supabase/supabase-js'
import { AuthProvider } from '@/components/bitcode/auth/AuthProvider/AuthProvider'
import AuxillariesProvider from '@/components/auxillaries/AuxillariesProvider/AuxillariesProvider'
import { useQueryClient } from '@tanstack/react-query'
import { prefetchAuthData, updateCachedUser, useOnboarding } from '@/hooks/use-auth-query'
import { FEATURE_FLAGS } from '@/config/features'
import { buildMockReviewUser, isAuxillariesMockMode } from '@/lib/mock-review-mode'
import { shouldHideWorkspaceFooter } from '@/components/bitcode/layout/WorkspaceSurface/workspace-surface'

// Lazy-load toast infrastructure to avoid increasing initial JS bundle – the
// component itself is tiny but pulls in Radix primitives.
const Toaster = dynamic(
  () => import('@/components/shadcn/Sonner/Sonner').then(m => m.Toaster),
  { ssr: false }
)

// Runtime utility to surface cross-page Connect errors via toast.
function useConnectErrorToast() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    // Preferred Connect language; still accept legacy loginError* once.
    const err = params.get('connectError') || params.get('loginError');
    const description =
      params.get('connectErrorDescription') || params.get('loginErrorDescription');
    if (err) {
      // Remove the param from the URL so the toast doesn't repeat on refresh.
      params.delete('connectError');
      params.delete('connectErrorDescription');
      params.delete('loginError');
      params.delete('loginErrorDescription');
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '') +
        window.location.hash;
      window.history.replaceState({}, '', newUrl);
      import('@/components/shadcn/Sonner/Sonner')
        .then(({ toast }) => {
          const errorLabel = decodeURIComponent(err);
          const detail = description ? decodeURIComponent(description) : '';
          toast.error(detail ? `${errorLabel}: ${detail}` : errorLabel);
        })
        .catch(() => {});
    }
  }, []);
}

// Dynamically import Conversations overlay with loading optimization
const Conversation = dynamic(() => import('@/components/conversations/ConversationsOverlay/ConversationsOverlay'), {
  ssr: false,
  loading: () => null,
  suspense: true,
})

// Prefetch heavy components for instant loading
const prefetchHeavyComponents = () => {
  if (typeof window !== 'undefined') {
    const conversationsEnabled = !FEATURE_FLAGS.DISABLE_CONVERSATIONS_ROUTE && FEATURE_FLAGS.CONVERSATIONS_WIDGET;

    // Prefetch Conversations after 2 seconds (lower priority than Orbital)
    setTimeout(() => {
      if (conversationsEnabled && !(window as any).__conversationsPrefetched) {
        (window as any).__conversationsPrefetched = true;
        import('@/components/conversations/ConversationsOverlay/ConversationsOverlay').catch(() => {});
      }
    }, 2000);
    
    // Prefetch the retained Conversations sidebar after 3 seconds.
    setTimeout(() => {
      if (conversationsEnabled && !window.__sidebarsPrefetched) {
        window.__sidebarsPrefetched = true;
        import('@/components/bitcode/layout/sidebars/RightSidebar/RightSidebar').catch(() => {});
      }
    }, 3000);
  }
}

declare global {
  interface Window {
    __conversationsPrefetched?: boolean;
    __sidebarsPrefetched?: boolean;
  }
}

const RightSidebar = dynamic(
  () => import('@/components/bitcode/layout/sidebars/RightSidebar/RightSidebar'),
  { ssr: false, loading: () => null }
)

// Nav skeleton placeholder
// eslint-disable-next-line react/no-multi-comp
const NavSkeleton = () => (
  <div className="h-36 w-full skeleton-shine" />
);
const Nav = dynamic(
  () => import('@/components/bitcode/layout/Nav/Nav'),
  { ssr: false, loading: () => <NavSkeleton /> }
)
const Footer = dynamic(() => import('@/components/bitcode/layout/Footer/Footer'), { ssr: false })

// Content skeleton
// eslint-disable-next-line react/no-multi-comp
const ContentSkeleton = () => (
  <div className="w-full min-h-[calc(100vh-9rem)] skeleton-shine" />
)
const PageContent = dynamic(
  () => Promise.resolve({ default: ({ children }: { children: ReactNode }) => <>{children}</> }),
  { ssr: false, loading: () => <ContentSkeleton /> }
)

// Preload nav
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Nav.preload?.();

export default function ClientLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const queryClient = useQueryClient();
  const mockMode = isAuxillariesMockMode();
  const supabase = createClient()
  const [user, setUser] = React.useState<null | import('@supabase/supabase-js').User>(mockMode ? buildMockReviewUser() : null)
  const [authLoaded, setAuthLoaded] = React.useState(mockMode)
  
  // Prefetch auth data IMMEDIATELY for instant Orbital open
  React.useLayoutEffect(() => {
    // Prefetch in microtask to not block render
    Promise.resolve().then(() => {
      prefetchAuthData(queryClient).catch(() => {});
    });
  }, [queryClient]);
  
  React.useEffect(() => {
    prefetchHeavyComponents();
  }, []);
  
  // Global error listener: capture client-side errors and send to telemetry backend
  React.useEffect(() => {
    function handleErrorEvent(event: ErrorEvent) {
      try {
        const { message, filename, lineno, colno, error } = event;
        const payload = {
          message,
          source: filename,
          lineno,
          colno,
          errorStack: error?.stack,
          metadata: {
            url: window.location.href,
            userAgent: navigator.userAgent
          }
        };
        fetch('/api/client-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.error('Failed to report client error', e);
      }
    }
    function handleRejection(event: PromiseRejectionEvent) {
      try {
        const reason = event.reason;
        const message = reason?.message || String(reason);
        const payload = {
          message,
          source: '',
          lineno: 0,
          colno: 0,
          errorStack: reason?.stack || null,
          metadata: {
            url: window.location.href,
            userAgent: navigator.userAgent
          }
        };
        fetch('/api/client-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.error('Failed to report unhandled rejection', e);
      }
    }
    window.addEventListener('error', handleErrorEvent);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleErrorEvent);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Show toast if redirected back with an auth error
  useConnectErrorToast();
  React.useEffect(() => {
    if (mockMode) {
      const mockUser = buildMockReviewUser();
      setUser(mockUser);
      updateCachedUser(queryClient, mockUser);
      setAuthLoaded(true);
      return;
    }

    // Get initial user from Supabase (React Query will cache this)
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user)
      setAuthLoaded(true)
    }).catch(() => {
      setAuthLoaded(true)
    })
    // Listen for auth changes and update React Query cache
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null)
      updateCachedUser(queryClient, session?.user ?? null)
      setAuthLoaded(true)
    })
    return () => { listener.subscription.unsubscribe() }
  }, [mockMode, supabase, queryClient])

  // State for Conversations sidebar open/close (desktop)
  const [isConversationSidebarOpen, setIsConversationSidebarOpen] = React.useState(false);
  
  // Get onboarding status to determine if Conversations should show
  const { data: onboardingData } = useOnboarding();
  const isOnboardingComplete = onboardingData?.isOnboardingComplete ?? false;
  const hideFooter = shouldHideWorkspaceFooter(pathname);
  const conversationsEnabled = !FEATURE_FLAGS.DISABLE_CONVERSATIONS_ROUTE && FEATURE_FLAGS.CONVERSATIONS_WIDGET;

  return (
    <AuthProvider>
      <AuxillariesProvider>
        <>
        {FEATURE_FLAGS.NAV_BAR && <Nav />}
        <PageContent>{children}</PageContent>
        {pathname !== '/' && !hideFooter && <Footer />}
        <React.Suspense fallback={null}>
          {/* Desktop supporting overlays. Auxillaries stays portal-only for V28. */}
          <div className="hidden laptop:block">
            {authLoaded && user && !mockMode && pathname !== '/conversations' && isOnboardingComplete && conversationsEnabled && (
              <>
                <Conversation
                  position="bottom-right"
                  size={60}
                  inSidebar={false}
                  isOpen={isConversationSidebarOpen}
                  onToggle={() => setIsConversationSidebarOpen(open => !open)}
                />
                <RightSidebar
                  inSidebar
                  isOpen={isConversationSidebarOpen}
                  onToggle={() => setIsConversationSidebarOpen(open => !open)}
                />
              </>
            )}
          </div>
        </React.Suspense>

        {/* Global toast portal */}
        <Toaster />
        </>
      </AuxillariesProvider>
    </AuthProvider>
  )
}
