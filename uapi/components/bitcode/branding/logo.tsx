import React from 'react';

import {
  BITCODE_LOGO_PATH,
  BITCODE_LOGO_TRANSFORM,
  BITCODE_LOGO_VIEW_BOX,
  normalizeLogoColor,
} from './bitcode-logo-mark';

type LogoProps = {
  beta?: boolean;
  className?: string;
  height?: string;
  width?: string;
  fill?: string;
};

export default function Logo({
  beta = false,
  className = "",
  height = 'h-10',
  width = 'w-10',
  fill = '#65FEB7'
}: LogoProps) {
  const resolvedFill = normalizeLogoColor(fill);

  return (
    <div className={"relative " + className} >
      <svg
        aria-label="Bitcode logo"
        role="img"
        viewBox={BITCODE_LOGO_VIEW_BOX}
        preserveAspectRatio="xMidYMid meet"
        className={`block ${height} ${width} z-20`}
        style={{ color: resolvedFill }}
      >
        <g transform={BITCODE_LOGO_TRANSFORM}>
          <path fill="currentColor" d={BITCODE_LOGO_PATH} />
        </g>
      </svg>
      {beta && (
        <div className="absolute z-30 bottom-0 right-[-10px] translate-x-[65%] translate-y-[65%] text-xs font-medium text-nowrap">
          <span className="text-[#65FEB7] [text-shadow:0_0_8px_rgba(101,254,183,0.8),0_0_16px_rgba(101,254,183,0.4)]">V26</span><sup className="text-[0.75em] ml-[1px] text-[#FF9547] [text-shadow:0_0_8px_rgba(255,149,71,0.8),0_0_16px_rgba(255,149,71,0.4)]">PRC</sup>
        </div>
      )}
    </div>
  );
}
