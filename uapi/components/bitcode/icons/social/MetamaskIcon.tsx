"use client";

import Image from "next/image";

export default function MetamaskIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Image
      src="/icons/metamask.svg"
      alt="MetaMask logo"
      width={32}
      height={32}
      className={className}
      priority
    />
  );
}
