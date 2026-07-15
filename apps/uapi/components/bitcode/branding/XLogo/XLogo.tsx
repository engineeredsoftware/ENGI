import React from 'react';

interface XLogoProps {
  className?: string;
  title?: string;
}

/**
 * X (Twitter) mark — currentColor fill so callers set theme via text-* classes.
 */
const XLogo = ({ className = 'h-4 w-4', title }: XLogoProps) => (
  <svg
    className={`fill-current ${className}`}
    viewBox="0 0 1200 1227"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={title ? undefined : true}
    role={title ? 'img' : undefined}
  >
    {title ? <title>{title}</title> : null}
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
  </svg>
);

export default XLogo;
