// @ts-nocheck
/* eslint-disable react/no-multi-comp */
"use client";

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect, useState, useRef, useMemo, Suspense } from 'react';
import MultiLineTypingAnimation from '@/components/base/bitcode/multi-line-typing-animation';
import QuantumButton from '@/components/base/bitcode/quantum-button';
import ScrollDown from './(root)/components/MarketingScrollDown';
const OrbitalRings = dynamic(() => import('@/components/base/bitcode/auxillaries/orbital-rings'), { loading: () => null });
import { openAuxillaries } from '@/app/auxillaries/components/AuxillariesProvider';
import { FEATURE_FLAGS } from '@/config/features';
import { useUserData } from '@/hooks/useUserData';

// Global styles for landing page
import '@/styles/radical-landing.css';
import '@/styles/shiny-text.css';
import '@/styles/space-fix.css';
import '@/styles/smooth-typing.css';
import '@/styles/cosmic-meteors.css';
import '@/styles/particle-effect.css';
import '@/styles/scroll-indicator.css';
import '@/styles/animations.css';
import '@/styles/components.css';
import '@/styles/highlight-transition.css';
// Marketing animations for feature sections
import '@/styles/marketing-animations.css';

function HeroClientInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams?.get('code') ?? '';
  const connectionId = searchParams?.get('connection_id') ?? '';
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Defer Supabase initialisation until the browser is idle so we don't
    // compete with critical rendering tasks.  Fallback to a micro-timeout on
    // browsers without requestIdleCallback support.
    const schedule = (cb: () => void) =>
      (window as any).requestIdleCallback
        ? (window as any).requestIdleCallback(cb, { timeout: 2000 })
        : setTimeout(cb, 1200);

    let unsub: { unsubscribe: () => void } | undefined;

    const id = schedule(() => {
      import('@bitcode/supabase/ssr/client').then(({ createClient }) => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
          setUser(session?.user ?? null);
        });
        unsub = listener.subscription;
      });
    });

    return () => {
      unsub?.unsubscribe();
      if ((window as any).cancelIdleCallback && typeof id === 'number') {
        (window as any).cancelIdleCallback(id);
      } else {
        clearTimeout(id as unknown as number);
      }
    };
  }, []);

  // Fetch full user data to determine onboarding completion
  const { data: userData, isLoading: userDataLoading, isOnboardingComplete } = useUserData();

  const [showButton, setShowButton] = useState(false);
  const { DISABLE_USING } = FEATURE_FLAGS;
  // Control sequence: use button -> scroll down (Trusted By moved to Testimonials section)
  const [showScrollDown, setShowScrollDown] = useState(false);
  // Allow scrolling immediately (no initial lock)
  const [scrollLocked, setScrollLocked] = useState(false);
  const containerRef = useRef(null);
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    // Toggle html class that locks the scroll when active
    document.documentElement.classList.toggle('scroll-lock', scrollLocked);
    if (!scrollLocked) {
      // Notify listeners that scroll has unlocked
      window.dispatchEvent(new CustomEvent('unlockScroll'));
    }
    // Fallback for browsers without scrollbar-gutter support: compute and set scrollbar width spacer
    if (typeof CSS !== 'undefined' && !CSS.supports('scrollbar-gutter', 'stable')) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-spacer', `${scrollbarWidth}px`);
    }
  }, [scrollLocked]);

  // Mouse tracking
  /*
   * -----------------------------------------------------------------------
   * Pointer-tracking optimisation
   * -----------------------------------------------------------------------
   * We update two CSS custom properties on every mousemove so the hero can
   * steer parallax/lighting effects.  On touch-only devices (pointer: coarse)
   * or when the user prefers-reduced-motion this work is useless and wastes
   * main-thread time.  We therefore:
   *   • Listen only when `(pointer:fine)` **and** no reduced-motion request
   *   • Pause updates while the onboarding modal is open (less visual load)
   */
  useEffect(() => {
    const mediaFine = window.matchMedia('(pointer:fine)');
    const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!mediaFine.matches || mediaReduced.matches) return;

    let frame: number;
    const move = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Guard against race conditions where the element unmounts between
        // frames (e.g. page navigation).
        if (!containerRef.current) return;
        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(frame);
    };
  }, []);

  const handleTypingComplete = () => {
    setTypingComplete(true);

    // Reveal the primary "Use" CTA as soon as the typing effect finishes
    setShowButton(true);

    // (Trusted By marquee is no longer displayed in hero)

    /*
     * Orchestrate downstream sections via custom window events so components
     * can coordinate their own entrance timings without tight coupling.
     *
     * 1.  ~2 s after the CTA becomes visible we emit `revealScreenshots`.
     *     The ScreenshotSection listens for this event to kick-off its more
     *     elaborate physics based entrance animation.
     */
    // Trigger screenshot reveal shortly after the CTA is visible (~0.8 s)
    setTimeout(() => {
      // Mark that the reveal event has occurred so late-mounting sections can
      // start immediately without waiting for another signal.
      // @ts-expect-error – untyped global
      window.__bitcodeRevealScreenshotsFired = true;
      window.dispatchEvent(new CustomEvent('revealScreenshots'));
    }, 800);
  };

  // Show the scroll indicator once the screenshots have finished their grand
  // entrance (emitted by ScreenshotSection).
  useEffect(() => {
    const onScreenshotsDone = () => setShowScrollDown(true);
    window.addEventListener('screenshotEntranceComplete', onScreenshotsDone);
    return () => window.removeEventListener('screenshotEntranceComplete', onScreenshotsDone);
  }, []);

  const handleUseClick = () => {
    import('@vercel/analytics').then(m => m.track('Landing Page Button Click', { 
      user: user?.id || 'unknown',
      onboarded: isOnboardingComplete 
    }));
    // Signed-in operators should land in the V47 Reading path.
    if (isOnboardingComplete) {
      router.push('/reads');
    } else {
      openAuxillaries('auxillaries');
    }
  };

  const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    '--index': i, '--delay': `${i * 0.7}s`, '--size': `${Math.random() * 3 + 1}px`, '--x': `${Math.random() * 100}%`, '--y': `${Math.random() * 100}%`
  })), []);

  // ---------------------------------------------------------------------
  // Responsive typing text – pre-insert a manual line-break for narrow view
  // ---------------------------------------------------------------------
  /**
   * -------------------------------------------------------------------
   * Responsive typing copy – "pre-break" words so no word is typed across
   * a line boundary mid-animation.  We dynamically insert `\n` before a
   * word that would otherwise overflow the container width *after the full
   * word is typed*.  This guarantees the break happens **before** typing
   * the first character of that word, achieving the desired effect.
   * -------------------------------------------------------------------
   */

  const rawText = 'provable technical-knowledge exchange';
  const HIGHLIGHT_PHRASE = 'technical-knowledge exchange';

  // Holds the text with dynamically-inserted line breaks.
  const [typingText, setTypingText] = useState<string>(rawText);

  // Reference to the inline container that constrains the headline width.
  const headlineRef = useRef<HTMLDivElement>(null);

  // Utility that walks through the text and inserts "\n" before a word that
  // would exceed the available width.  The highlight phrase is treated as an
  // atomic token so we never break inside it – otherwise the highlight would
  // fail to match during the animation.
  const computePreBrokenText = () => {
    const container = headlineRef.current;
    if (!container) return rawText;

    // Bail early when dimensions haven't been laid out yet.
    const containerRect = container.getBoundingClientRect();
    let availableWidth = containerRect.width;

    // Account for horizontal padding so we measure against the *content* box.
    const computed = window.getComputedStyle(container);
    const padLeft = parseFloat(computed.paddingLeft || '0');
    const padRight = parseFloat(computed.paddingRight || '0');
    availableWidth = Math.max(0, availableWidth - padLeft - padRight);

    if (!availableWidth) return rawText;

    // Prepare canvas for high-precision text width measurement — this avoids
    // any layout / transform quirks that affected the previous DOM-span
    // approach (especially when nested inside flex & perspective wrappers).
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return rawText;

    // Mirror the computed font styles of the container so we get real glyph
    // widths (after web font load).
    const computedStyle = window.getComputedStyle(container);
    ctx.font = [
      computedStyle.fontStyle,
      computedStyle.fontVariant,
      computedStyle.fontWeight,
      computedStyle.fontSize,
      computedStyle.lineHeight === 'normal' ? '' : `/${computedStyle.lineHeight}`,
      computedStyle.fontFamily
    ].filter(Boolean).join(' ');

    // Tokenise by individual words.  This allows the highlight phrase to wrap
    // across lines if needed (e.g. "AI" may fit on line 1 while "software
    // engineering" flows onto line 2 on very narrow screens).
    const tokens: string[] = rawText.split(/\s+/);

    const lines: string[] = [];
    let currentLine = '';

    const commitLine = () => {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
    };

    tokens.forEach(token => {
      if (!currentLine) {
        currentLine = token;
        return;
      }

      const testLine = `${currentLine} ${token}`;
      // Canvas width + letter-spacing adjustment (since measureText ignores it)
      const baseWidth = ctx.measureText(testLine).width;
      let letterSpacing = 0;
      const lsRaw = computedStyle.letterSpacing;
      if (lsRaw && lsRaw !== 'normal') {
        if (lsRaw.endsWith('px')) {
          letterSpacing = parseFloat(lsRaw);
        } else if (lsRaw.endsWith('em')) {
          letterSpacing = parseFloat(lsRaw) * parseFloat(computedStyle.fontSize);
        } else if (lsRaw.endsWith('rem')) {
          const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize);
          letterSpacing = parseFloat(lsRaw) * rootFont;
        }
      }

      const correction = letterSpacing * (testLine.length - 1);
      const fudgeFactor = 1.08; // 8 % safety buffer so we never under-predict
      const testWidth = (baseWidth + correction) * fudgeFactor;

      if (testWidth <= availableWidth) {
        currentLine = testLine;
      } else {
        commitLine();
        currentLine = token;
      }
    });
    commitLine();

    return lines.join('\n');
  };

  useEffect(() => {
    const update = () => setTypingText(computePreBrokenText());

    // Compute on mount and whenever the viewport resizes.  Re-compute once
    // web fonts are loaded so we account for the final glyph widths.
    update();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(update).catch(() => { });
    }

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <>
      {/* Reserve a full-viewport for the hero.  The earlier -mt-40 offset
          reduced the gap below the hero; dropping it restores a clean 100vh. */}
      <div
        ref={containerRef}
        className="absolute inset-0 bg-transparent overflow-hidden h-screen flex flex-col z-60" // make sure this is even with nav so we can controll in stacking layers
        style={{ '--mouse-x': '0px', '--mouse-y': '0px' }}
      >
        <div className="quantum-field">{particles.map((s, i) => <div key={i} className="quantum-particle" style={s}></div>)}</div>
        <div className="hidden tablet:block fixed inset-0 z-1 pointer-events-none homepage-background-auxillaries">
          <OrbitalRings count={4} baseSize={30} sizeIncrement={15} />
        </div>

        {/* Reduce top padding on very small screens so the headline sits higher
            while still leaving space for the nav bar. */}
        <main
          className="flex flex-1 flex-col items-center justify-start pt-12 tablet:pt-16 laptop:pt-0 px-4 tablet:px-6 laptop:px-8 desktop:px-12 relative z-10"
        >
          {/* hardcode the width of the widest point of the fully rendered hero text at the right size. tweaked here to ensure that it's 3 lines*/}
          <div className="relative -mt-16 mx-auto w-[344px] laptop:w-[777px] text-center perspective min-h-screen flex flex-col items-center justify-center">
            <div className="quote-container mb-14 w-full">
              <div className="quote-mark left">"</div>
              {/*
                 Responsive headline: beef up mobile size while clamping
                 line-height so the lock-up remains bold and centred on tiny
                 screens.  The text is the key message – make it loud even on
                 320 px devices.
              */}
              <h1
                className="text-4xl phone:text-5xl tablet:text-6xl laptop:text-7xl font-light text-white/90 tracking-wide leading-tight"
              >
                <div ref={headlineRef} className="min-h-[4.5em] flex items-center px-3">
                  <MultiLineTypingAnimation
                    text={typingText}
                    charDelay={20}
                    startDelay={200}
                    className="text-white/80"
                    onComplete={handleTypingComplete}
                    showCursor={typingComplete ? false : true}
                    highlightText={HIGHLIGHT_PHRASE}
                    highlightClass="super-shiny-text special-text"
                  />
                </div>
              </h1>
              <div className="quote-mark right">"</div>
            </div>
            <div className={`button-container ${showButton ? 'button-visible' : 'button-hidden'}`}>
              <QuantumButton
                onClick={handleUseClick}
                disabled={DISABLE_USING}
                disabledTooltip="Coming Soon"
                disabledTooltipPlacement="top"
              >
                {isOnboardingComplete ? 'user' : 'use'}
              </QuantumButton>
            </div>
            {showScrollDown && (
              <ScrollDown
                disabled={FEATURE_FLAGS.SOFT_LAUNCH}
                onEntranceComplete={() => setScrollLocked(false)}
              />
            )}
          </div>
        </main>
        {/* TrustedBy marquee moved to Testimonials section */}
      </div>
    </>
  );
}

export default function HeroClient() {
  return (
    <Suspense fallback={null}>
      <HeroClientInner />
    </Suspense>
  );
}
