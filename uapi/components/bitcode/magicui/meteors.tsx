"use client";

import { CosmicMeteors } from "./cosmic-meteors";

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
