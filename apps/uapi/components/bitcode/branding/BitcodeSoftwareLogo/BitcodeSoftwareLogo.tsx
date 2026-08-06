import React from 'react';
import Image from 'next/image';

type BitcodeSoftwareLogoProps = {
  width?: number;
  height?: number;
  className?: string;
  softwareClassName?: string;
}

export default function BitcodeSoftwareLogo({
  width = 115,
  height = 51.5,
  className = "",
  softwareClassName = "text-gray-300 ml-1 font-light"
}: BitcodeSoftwareLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image src="/logo.svg" width={width} height={height} alt="Bitcode logo" />
      <span className={softwareClassName}>.software</span>
    </div>
  );
}
