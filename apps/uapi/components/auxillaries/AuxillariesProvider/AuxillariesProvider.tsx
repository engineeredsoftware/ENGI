"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  isAuxillariesCompatPath,
  isAuxillariesPath,
  readAuxillaryOverlayStep,
  type AuxillaryPane,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';

/**
 * Overlay fade only (surface keeps original internal entrance motion).
 * Open latency is solved via prefetch + keep-alive, not by shortening these.
 */
const OPEN_MS = 280;
const OPEN_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

const AuxillariesSurface = dynamic(
  () => import('@/components/auxillaries/AuxillariesSurface/AuxillariesSurface'),
  { ssr: false, loading: () => null },
);

/** Warm the dynamic shell as soon as the provider module evaluates on the client. */
if (typeof window !== 'undefined') {
  (AuxillariesSurface as typeof AuxillariesSurface & { preload?: () => void }).preload?.();
}

type PrefetchOptions = {
  /**
   * When true (default), fetch immediately (hover / open / click).
   * When false, schedule via requestIdleCallback for background warm.
   */
  urgent?: boolean;
};

/**
 * Prefetch Auxillaries chunks + default wallet pane so open is JS-warm.
 * Idempotent; urgent wins over a pending idle schedule.
 */
const prefetchAuxillaries = (options: PrefetchOptions = {}) => {
  if (typeof window === 'undefined') return;
  const urgent = options.urgent !== false;

  const w = window as Window & {
    __auxillariesPrefetched?: boolean;
    __auxillariesPrefetchIdle?: number;
  };

  const warm = () => {
    if (w.__auxillariesPrefetched) return;
    w.__auxillariesPrefetched = true;
    if (w.__auxillariesPrefetchIdle != null) {
      if (typeof window.cancelIdleCallback === 'function') {
        try {
          window.cancelIdleCallback(w.__auxillariesPrefetchIdle);
        } catch {
          window.clearTimeout(w.__auxillariesPrefetchIdle);
        }
      } else {
        window.clearTimeout(w.__auxillariesPrefetchIdle);
      }
      w.__auxillariesPrefetchIdle = undefined;
    }

    // Surface shell first (critical path), then content + default wallet pane.
    void import('@/components/auxillaries/AuxillariesSurface/AuxillariesSurface');
    void import('@/components/auxillaries/AuxillariesContent/AuxillariesContent');
    void import('@/components/auxillaries/AuxillariesWalletPane/AuxillariesWalletPane');
    void import('@/components/auxillaries/AuxillariesLoginPane/AuxillariesLoginPane');
    // Secondary panes — still warm so tab switches stay instant.
    void import('@/components/auxillaries/AuxillariesExternalsPane/AuxillariesExternalsPane');
    void import('@/components/auxillaries/AuxillariesProfilePane/AuxillariesProfilePane');
    void import('@/components/auxillaries/AuxillariesInterfacesPane/AuxillariesInterfacesPane');
    void import('@/hooks/use-auth-query');
    (AuxillariesSurface as typeof AuxillariesSurface & { preload?: () => void }).preload?.();

    // HEAD warms the connection; GET is owned by useUserData cache when present.
    if (typeof fetch !== 'undefined') {
      fetch('/api/auxillaries/data', { method: 'HEAD', credentials: 'same-origin' }).catch(
        () => {},
      );
    }
  };

  if (w.__auxillariesPrefetched) return;

  if (urgent) {
    warm();
    return;
  }

  if (w.__auxillariesPrefetchIdle != null) return;

  if (typeof window.requestIdleCallback === 'function') {
    w.__auxillariesPrefetchIdle = window.requestIdleCallback(() => warm(), {
      timeout: 900,
    });
  } else {
    w.__auxillariesPrefetchIdle = window.setTimeout(warm, 200) as unknown as number;
  }
};

type AuxillaryWindow = 'ConnectWindow' | 'AuxillariesWindow';
type AuxillaryOpenMode = AuxillaryWindow | 'connect' | 'account' | 'auxillaries';

function normalizeAuxillaryWindow(
  requestedWindow: AuxillaryOpenMode = 'AuxillariesWindow',
): AuxillaryWindow {
  if (requestedWindow === 'connect') {
    return 'ConnectWindow';
  }

  if (requestedWindow === 'account' || requestedWindow === 'auxillaries') {
    return 'AuxillariesWindow';
  }

  return requestedWindow;
}

function isDedicatedAuxillariesLocation() {
  if (typeof window === 'undefined') {
    return false;
  }

  const pathname = window.location.pathname;
  return isAuxillariesPath(pathname) || isAuxillariesCompatPath(pathname);
}

interface AuxillariesContextType {
  isOpen: boolean;
  window: AuxillaryWindow;
  openAuxillaries: (win?: AuxillaryWindow) => void;
  closeAuxillaries: () => void;
  toggleAuxillaries: (win?: AuxillaryWindow) => void;
}

const AuxillariesContext = createContext<AuxillariesContextType | null>(null);

export default function AuxillariesProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  /** After first open, keep the surface mounted (hidden) so re-open skips remount cost. */
  const [hasOpened, setHasOpened] = useState(false);
  const [windowState, setWindowState] = useState<AuxillaryWindow>('AuxillariesWindow');
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [deepLinkStep, setDeepLinkStep] = useState<AuxillaryPane | null>(null);
  const reduceMotionRef = useRef(prefersReducedMotion());

  useLayoutEffect(() => {
    const el = document.createElement('div');
    el.id = 'auxillaries-portal';
    document.body.appendChild(el);
    setPortalContainer(el);
    // Idle-warm chunks while the user is still on product chrome.
    prefetchAuxillaries({ urgent: false });
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
      setPortalContainer(null);
    };
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add('auxillaries-open', 'overflow-hidden');
    } else {
      document.documentElement.classList.remove('auxillaries-open', 'overflow-hidden');
    }
  }, [isOpen]);

  useEffect(() => {
    const openFromLocation = () => {
      const step = readAuxillaryOverlayStep(new URLSearchParams(window.location.search));
      if (!step || isDedicatedAuxillariesLocation()) return;
      prefetchAuxillaries({ urgent: true });
      setWindowState('AuxillariesWindow');
      setDeepLinkStep(step);
      setHasOpened(true);
      setIsOpen(true);
    };

    openFromLocation();
    window.addEventListener('popstate', openFromLocation);
    return () => {
      window.removeEventListener('popstate', openFromLocation);
    };
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as
        | {
            window?: AuxillaryWindow;
            mode?: 'connect' | 'account' | 'auxillaries';
            step?: AuxillaryPane;
          }
        | undefined;

      if (isDedicatedAuxillariesLocation()) {
        setIsOpen(false);
        setDeepLinkStep(null);
        return;
      }

      prefetchAuxillaries({ urgent: true });
      if (detail?.window) setWindowState(detail.window);
      else if (detail?.mode) setWindowState(normalizeAuxillaryWindow(detail.mode));
      setDeepLinkStep(detail?.step ?? null);
      setHasOpened(true);
      setIsOpen(true);
    };

    const onClose = () => {
      setIsOpen(false);
      setDeepLinkStep(null);
    };

    window.addEventListener('open-auxillaries', onOpen as EventListener);
    window.addEventListener('close-auxillaries', onClose as EventListener);

    return () => {
      window.removeEventListener('open-auxillaries', onOpen as EventListener);
      window.removeEventListener('close-auxillaries', onClose as EventListener);
    };
  }, []);

  const openAuxillaries = useCallback((win: AuxillaryWindow = 'AuxillariesWindow') => {
    if (isDedicatedAuxillariesLocation()) {
      setIsOpen(false);
      setDeepLinkStep(null);
      return;
    }

    prefetchAuxillaries({ urgent: true });
    setWindowState(win);
    setHasOpened(true);
    setIsOpen(true);
  }, []);

  const closeAuxillaries = useCallback(() => {
    setIsOpen(false);
    setDeepLinkStep(null);
  }, []);

  const toggleAuxillaries = useCallback((win?: AuxillaryWindow) => {
    if (isDedicatedAuxillariesLocation()) {
      setIsOpen(false);
      setDeepLinkStep(null);
      return;
    }

    if (typeof win !== 'undefined') setWindowState(win);
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        prefetchAuxillaries({ urgent: true });
        setHasOpened(true);
      } else {
        setDeepLinkStep(null);
      }
      return next;
    });
  }, []);

  const ctx: AuxillariesContextType = {
    isOpen,
    window: windowState,
    openAuxillaries,
    closeAuxillaries,
    toggleAuxillaries,
  };

  const showSurface = hasOpened || isOpen;
  const reduceMotion = reduceMotionRef.current;

  return (
    <AuxillariesContext.Provider value={ctx}>
      {children}
      {portalContainer && showSurface
        ? createPortal(
            <div
              className={`auxillaries-portal${isOpen ? ' auxillaries-open' : ' auxillaries-portal-dormant'}`}
              data-testid="auxillaries-overlay-root"
              data-auxillaries-open={isOpen ? 'true' : 'false'}
              aria-hidden={!isOpen}
              // Keep-alive dormant surface must not receive focus or input.
              inert={!isOpen ? true : undefined}
              style={{
                opacity: isOpen ? 1 : 0,
                visibility: isOpen ? 'visible' : 'hidden',
                pointerEvents: isOpen ? 'auto' : 'none',
                transition: reduceMotion
                  ? undefined
                  : `opacity ${OPEN_MS}ms ${OPEN_EASE}`,
                willChange: isOpen && !reduceMotion ? 'opacity' : undefined,
              }}
            >
              <div className="h-full w-full">
                <AuxillariesSurface
                  window={windowState}
                  onClose={closeAuxillaries}
                  initialStep={deepLinkStep ?? undefined}
                />
              </div>
            </div>,
            portalContainer,
          )
        : null}
    </AuxillariesContext.Provider>
  );
}

export function useAuxillaries() {
  const ctx = useContext(AuxillariesContext);
  if (!ctx) throw new Error('useAuxillaries must be used within AuxillariesProvider');
  return ctx;
}

export function openAuxillaries(
  requestedWindow: AuxillaryOpenMode = 'AuxillariesWindow',
  step?: AuxillaryPane,
) {
  prefetchAuxillaries({ urgent: true });
  const win = normalizeAuxillaryWindow(requestedWindow);
  const ev = new CustomEvent('open-auxillaries', { detail: { window: win, step } });
  window.dispatchEvent(ev);
}

export function closeAuxillaries() {
  const ev = new CustomEvent('close-auxillaries');
  window.dispatchEvent(ev);
}

export { prefetchAuxillaries };
