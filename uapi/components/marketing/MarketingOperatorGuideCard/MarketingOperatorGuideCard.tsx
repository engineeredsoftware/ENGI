"use client";

import React from 'react';
import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import { MARKETING_OPERATOR_GUIDE_SOURCE } from '@/components/marketing/MarketingOperatorGuideAssets/marketing-operator-guide-assets';

type MarketingOperatorGuideCardProps = {
  initialSourcePlayable?: boolean | null;
  initialSourceResolved?: boolean;
};

export default function MarketingOperatorGuideCard({
  initialSourcePlayable,
  initialSourceResolved = false,
}: MarketingOperatorGuideCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasPlayableSource, setHasPlayableSource] = useState<boolean>(
    initialSourcePlayable ?? false,
  );
  const [hasResolvedSource, setHasResolvedSource] = useState(
    initialSourceResolved || initialSourcePlayable !== undefined,
  );

  useEffect(() => {
    if (initialSourceResolved || initialSourcePlayable !== undefined) {
      return;
    }

    let isMounted = true;

    const resolvePlayableSource = async () => {
      try {
        const response = await fetch(MARKETING_OPERATOR_GUIDE_SOURCE.src, {
          method: 'HEAD',
          cache: 'no-store',
        });

        if (isMounted) {
          setHasPlayableSource(response.ok);
          setHasResolvedSource(true);
        }
        return;
      } catch {
        // Ignore transient network failures and fail closed into the stable fallback state.
      }

      if (isMounted) {
        setHasResolvedSource(true);
      }
    };

    void resolvePlayableSource();

    return () => {
      isMounted = false;
    };
  }, [initialSourcePlayable, initialSourceResolved]);

  const activeSource = hasPlayableSource ? MARKETING_OPERATOR_GUIDE_SOURCE : null;

  const handlePlaybackError = () => {
    setHasError(true);
  };

  if (!hasResolvedSource) {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-3 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-left shadow-[0_0_35px_rgba(16,185,129,0.2)] backdrop-blur">
        <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">{BITCODE_PUBLIC_COPY.guideRoute.checkingVideoTitle}</span>
        <p className="text-sm text-emerald-100/80">{BITCODE_PUBLIC_COPY.guideRoute.checkingVideoBody}</p>
      </div>
    );
  }

  if (hasError || activeSource === null) {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-3 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-left shadow-[0_0_35px_rgba(16,185,129,0.2)] backdrop-blur">
        <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">{BITCODE_PUBLIC_COPY.guideRoute.missingVideoTitle}</span>
        <p className="text-sm text-emerald-100/80">{BITCODE_PUBLIC_COPY.guideRoute.missingVideoBody}</p>
        <div>
          <Link
            href="/packs"
            className="inline-flex items-center justify-center rounded-full border border-emerald-400/28 bg-emerald-400/12 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/18"
          >
            {BITCODE_PUBLIC_COPY.guideRoute.missingVideoCta}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_rgba(15,23,42,0.95)_70%)] shadow-[0_0_45px_rgba(16,185,129,0.25)]">
      {isPlaying ? (
        <video
          key={activeSource.src}
          className="h-full w-full object-cover"
          controls
          autoPlay
          poster={activeSource.poster}
          onError={handlePlaybackError}
        >
          <source src={activeSource.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="group flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900/70 via-slate-900/30 to-slate-900/80 p-10 text-center transition"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-slate-950 transition group-hover:bg-emerald-500/30 group-hover:text-white">
            <Play className="ml-1 h-8 w-8" />
          </span>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-white">{BITCODE_PUBLIC_COPY.guideRoute.cardTitle}</p>
            <p className="text-sm text-emerald-100/80">{BITCODE_PUBLIC_COPY.guideRoute.cardBody}</p>
          </div>
        </button>
      )}
    </div>
  );
}
