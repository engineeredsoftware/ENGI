/**
 * Technology badge icon used in marketplace listing rows.
 */
import React from "react";
import {
  SiReact,
  SiRust,
  SiPython,
  SiSolidity,
  SiTypescript,
  SiSwift,
} from "react-icons/si";

export function MarketingMarketplaceTechIcon({ tech }: { tech: string }) {
  const size = 16;
  switch (tech) {
    case "react":
      return <SiReact size={size} className="text-sky-400" />;
    case "rust":
      return <SiRust size={size} className="text-orange-400" />;
    case "python":
      return <SiPython size={size} className="text-yellow-300" />;
    case "solidity":
      return <SiSolidity size={size} className="text-gray-300" />;
    case "typescript":
      return <SiTypescript size={size} className="text-blue-400" />;
    case "swift":
      return <SiSwift size={size} className="text-orange-300" />;
    default:
      return null;
  }
}
