"use client";

import Image from "next/image";

/**
 * ChatGPT logo exported as a monochrome SVG.  We apply CSS filters so the icon
 * can be dynamically tinted (e.g. forced white when used as a small SSO
 * circle).  Tailwind’s `invert` + `brightness` utilities are forwarded via the
 * `className` prop.
 */
export default function ChatGPTIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Image
      src="/icons/chatgpt.svg"
      alt="ChatGPT logo"
      width={32}
      height={32}
      className={`filter ${className}`}
      priority
    />
  );
}
