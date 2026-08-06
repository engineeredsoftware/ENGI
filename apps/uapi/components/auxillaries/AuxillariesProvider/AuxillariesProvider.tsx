"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  AUXILLARY_OPEN_QUERY_PARAM,
  isAuxillariesCompatPath,
  isAuxillariesPath,
  readAuxillaryOverlayStep,
  type AuxillaryPane,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';

/**
 * Overlay fade only (surface keeps original internal entrance motion).
 * Open/close share one CSS transition (see orbital.css). Page scroll lock is
 * NOT delayed for the fade — scrollbar must return immediately at rest.
 */

/**
 * First-open placeholder: sits on the portal field gradient (not pitch black)
 * while the surface chunk mounts. Particles stay under the portal (z-index).
 */
function AuxillariesPortalLoading() {
  return (
    <div
      className="auxillaries-portal-loading"
      data-testid="auxillaries-portal-loading"
      aria-busy="true"
      aria-label="Loading Auxillaries"
    >
      <div className="auxillaries-portal-loading-mark" aria-hidden="true" />
    </div>
  );
}

const AuxillariesSurface = dynamic(
  () => import('@/components/auxillaries/AuxillariesSurface/AuxillariesSurface'),
  { ssr: false, loading: () => <AuxillariesPortalLoading /> },
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

  const showSurface = hasOpened || isOpen;

  // Scroll lock + keep-alive teardown. Geometry is CSS-only (fixed inset:0);
  // do not set width/height/padding here — that was the whack-a-mole source.
  useLayoutEffect(() => {
    const root = document.documentElement;
    // Clear any legacy compensation from earlier iterations.
    root.style.removeProperty('--auxillaries-scrollbar-comp');
    root.style.paddingRight = '';
    document.body.style.paddingRight = '';

    if (isOpen) {
      root.classList.add('auxillaries-open');
    } else {
      root.classList.remove('auxillaries-open');
    }

    return () => {
      root.classList.remove('auxillaries-open');
      root.style.removeProperty('--auxillaries-scrollbar-comp');
      root.style.paddingRight = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // React 18: force inert via DOM property; blur focus left inside keep-alive
  // so nav hover works immediately after close.
  useLayoutEffect(() => {
    const shell = document.querySelector(
      '[data-testid="auxillaries-overlay-root"]',
    ) as HTMLElement | null;
    if (!shell) return;

    if (isOpen) {
      shell.inert = false;
      return;
    }

    shell.inert = true;
    const active = document.activeElement;
    if (active instanceof HTMLElement && shell.contains(active)) {
      active.blur();
    }
  }, [isOpen, showSurface]);

  // Escape must work even when focus stayed on the page under the portal
  // (surface onKeyDown only fires if the surface is in the bubble path).
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && event.code !== 'Escape') return;
      // Nested modal/popover already handling Escape (stopped bubble).
      if (event.defaultPrevented) return;
      // Prefer closing a focused nested dialog before the whole overlay.
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        active.closest('[role="dialog"]') &&
        !active.closest('[data-testid="auxillaries-overlay-root"]')
      ) {
        return;
      }
      event.preventDefault();
      setIsOpen(false);
      setDeepLinkStep(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const openFromLocation = () => {
      if (isDedicatedAuxillariesLocation()) return;
      const params = new URLSearchParams(window.location.search);
      const openTo = params.get(AUXILLARY_OPEN_QUERY_PARAM);
      const teamInvite = params.get('team_invite') === '1' || params.get('team_invite') === 'true';

      // Team invite / explicit connect deep-link opens the Connect window (OTP signup).
      if (openTo === 'connect' || teamInvite) {
        prefetchAuxillaries({ urgent: true });
        setWindowState('ConnectWindow');
        setDeepLinkStep(null);
        setHasOpened(true);
        setIsOpen(true);
        return;
      }

      const step = readAuxillaryOverlayStep(params);
      if (!step) return;
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

  const portalMounted = Boolean(portalContainer && showSurface);

  return (
    <AuxillariesContext.Provider value={ctx}>
      {children}
      {portalMounted
        ? createPortal(
            <div
              // Geometry is CSS fixed inset:0. Only class toggles opacity /
              // pointer-events. `inert` also forced via shell.inert (React 18).
              className={`auxillaries-portal${
                isOpen ? ' auxillaries-open' : ' auxillaries-portal-dormant'
              }`}
              data-testid="auxillaries-overlay-root"
              data-auxillaries-open={isOpen ? 'true' : 'false'}
              aria-hidden={!isOpen}
              inert={!isOpen ? true : undefined}
            >
              <div className="h-full w-full min-h-0 min-w-0">
                <AuxillariesSurface
                  window={windowState}
                  onClose={closeAuxillaries}
                  initialStep={deepLinkStep ?? undefined}
                />
              </div>
            </div>,
            portalContainer!,
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
