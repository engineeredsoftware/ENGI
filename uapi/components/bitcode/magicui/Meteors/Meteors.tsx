"use client";

import React from 'react';
import { CosmicMeteors } from '@/components/bitcode/magicui/CosmicMeteors/CosmicMeteors';

interface MeteorsProps {
  number?: number;
  className?: string;
  style?: {};
  colorScheme?: "default" | "cosmic" | "aurora" | "nebula";
}

export const Meteors = ({
  number = 20,
  className = "",
  style = {},
  colorScheme = "default"
}: MeteorsProps) => {
  return (
    <CosmicMeteors
      number={number}
      className={className}
      style={style}
      colorScheme={colorScheme}
      starClusters={50}
      cosmicDust={100}
    />
  );
};

export default Meteors;
