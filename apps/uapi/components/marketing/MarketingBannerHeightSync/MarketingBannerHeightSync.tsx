"use client";

import React, { useEffect } from 'react';

interface Props {
  /** The id of the banner element whose height should be written to the
   * `--banner-offset` CSS variable on `<html>`. */
  targetId: string;
}

export default function MarketingBannerHeightSync({ targetId }: Props) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const element = el;

    function update() {
      document.documentElement.style.setProperty('--banner-offset', `${element.getBoundingClientRect().height}px`);
    }

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(element);

    return () => ro.disconnect();
  }, [targetId]);

  return null;
}
