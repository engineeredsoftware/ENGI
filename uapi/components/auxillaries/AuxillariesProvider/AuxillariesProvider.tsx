"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  isAuxillariesCompatPath,
  isAuxillariesPath,
  readAuxillaryOverlayStep,
  type AuxillaryPane,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';

const AuxillariesSurface = dynamic(() => import('@/components/auxillaries/AuxillariesSurface/AuxillariesSurface'), { ssr: false });

if (typeof window !== 'undefined') {
  (AuxillariesSurface as typeof AuxillariesSurface & { preload?: () => void }).preload?.();
}

const prefetchAuxillaries = () => {
  if (typeof window !== 'undefined' && !(window as any).__auxillariesPrefetched) {
    (window as any).__auxillariesPrefetched = true;
    import('@/components/auxillaries/AuxillariesSurface/AuxillariesSurface').catch(() => {});
    import('@/components/auxillaries/AuxillariesLoginPane/AuxillariesLoginPane').catch(() => {});
    import('@/components/auxillaries/AuxillariesContent/AuxillariesContent').catch(() => {});
    import('@/hooks/use-auth-query').catch(() => {});
    if (typeof fetch !== 'undefined') {
      fetch('/api/auxillaries/data', { method: 'HEAD', credentials: 'same-origin' }).catch(() => {});
    }
  }
};

type AuxillaryWindow = 'ConnectWindow' | 'AuxillariesWindow';
type AuxillaryOpenMode = AuxillaryWindow | 'connect' | 'account' | 'auxillaries';

function normalizeAuxillaryWindow(requestedWindow: AuxillaryOpenMode = 'AuxillariesWindow'): AuxillaryWindow {
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
  const [windowState, setWindowState] = useState<AuxillaryWindow>('AuxillariesWindow');
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [deepLinkStep, setDeepLinkStep] = useState<AuxillaryPane | null>(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'auxillaries-portal';
    document.body.appendChild(el);
    setPortalContainer(el);
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
      setPortalContainer(null);
    };
  }, []);

  useEffect(() => {
    const openFromLocation = () => {
      const step = readAuxillaryOverlayStep(new URLSearchParams(window.location.search));
      if (!step || isDedicatedAuxillariesLocation()) return;
      setWindowState('AuxillariesWindow');
      setDeepLinkStep(step);
      setIsOpen(true);
    };

    openFromLocation();
    window.addEventListener('popstate', openFromLocation);
    return () => {
      window.removeEventListener('popstate', openFromLocation);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add('auxillaries-open', 'overflow-hidden');
    } else {
      document.documentElement.classList.remove('auxillaries-open', 'overflow-hidden');
    }
  }, [isOpen]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as {
        window?: AuxillaryWindow;
        mode?: 'connect' | 'account' | 'auxillaries';
        step?: AuxillaryPane;
      } | undefined;

      if (isDedicatedAuxillariesLocation()) {
        setIsOpen(false);
        setDeepLinkStep(null);
        return;
      }

      if (detail?.window) setWindowState(detail.window);
      else if (detail?.mode) setWindowState(normalizeAuxillaryWindow(detail.mode));
      setDeepLinkStep(detail?.step ?? null);
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

    setWindowState(win);
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
      if (!next) {
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

  return (
    <AuxillariesContext.Provider value={ctx}>
      {children}
      {isOpen && portalContainer
        ? createPortal(
            <div className="auxillaries-portal auxillaries-open">
              <AuxillariesSurface
                window={windowState}
                onClose={closeAuxillaries}
                initialStep={deepLinkStep ?? undefined}
              />
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

export function openAuxillaries(requestedWindow: AuxillaryOpenMode = 'AuxillariesWindow', step?: AuxillaryPane) {
  prefetchAuxillaries();
  const win = normalizeAuxillaryWindow(requestedWindow);
  const ev = new CustomEvent('open-auxillaries', { detail: { window: win, step } });
  window.dispatchEvent(ev);
}

export function closeAuxillaries() {
  const ev = new CustomEvent('close-auxillaries');
  window.dispatchEvent(ev);
}

export { prefetchAuxillaries };
