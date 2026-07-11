"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from '@bitcode/styling';

interface CosmicMeteorsProps {
  number?: number;
  className?: string;
  style?: React.CSSProperties;
  starClusters?: number;
  cosmicDust?: number;
  colorScheme?: "default" | "cosmic" | "aurora" | "nebula";
}

type MeteorType = "standard" | "distant" | "bright";
type MeteorSize = "tiny" | "small" | "medium" | "large";

interface MeteorStyle extends React.CSSProperties {
  "--duration": string;
  "--tail-length": string;
  "--trail-color": string;
  "--random-offset": string;
  "--base-opacity": string;
  "--peak-opacity": string;
  "--dust-opacity": string;
  "--twinkle-duration": string;
}

export const CosmicMeteors = ({
  number = 20,
  className = "",
  style = {},
  starClusters = 50,
  cosmicDust = 100,
  colorScheme = "default",
}: CosmicMeteorsProps) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<{
    style: MeteorStyle;
    type: MeteorType;
    size: MeteorSize;
  }>>([]);
  const [starClusterStyles, setStarClusterStyles] = useState<Array<MeteorStyle>>([]);
  const [cosmicDustStyles, setCosmicDustStyles] = useState<Array<MeteorStyle>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Color schemes - refined for elegance and subtlety
  const colorSchemes = {
    default: {
      meteorColors: ["rgba(255, 255, 255, 0.8)", "rgba(220, 230, 255, 0.7)", "rgba(240, 240, 255, 0.9)"],
      trailColors: ["rgba(255, 255, 255, 0.4)", "rgba(220, 230, 255, 0.3)", "rgba(240, 240, 255, 0.5)"],
    },
    cosmic: {
      meteorColors: ["rgba(103, 254, 183, 0.8)", "rgba(80, 200, 170, 0.7)", "rgba(120, 255, 200, 0.9)"],
      trailColors: ["rgba(103, 254, 183, 0.4)", "rgba(80, 200, 170, 0.3)", "rgba(120, 255, 200, 0.5)"],
    },
    aurora: {
      meteorColors: ["rgba(120, 200, 255, 0.8)", "rgba(100, 180, 255, 0.7)", "rgba(140, 220, 255, 0.9)"],
      trailColors: ["rgba(120, 200, 255, 0.4)", "rgba(100, 180, 255, 0.3)", "rgba(140, 220, 255, 0.5)"],
    },
    nebula: {
      meteorColors: ["rgba(255, 150, 220, 0.8)", "rgba(200, 120, 255, 0.7)", "rgba(180, 130, 255, 0.9)"],
      trailColors: ["rgba(255, 150, 220, 0.4)", "rgba(200, 120, 255, 0.3)", "rgba(180, 130, 255, 0.5)"],
    },
  };

  const selectedScheme = colorSchemes[colorScheme] || colorSchemes.default;

  // Fibonacci distribution for more natural spacing
  const fibonacciDistribution = (max: number, offset = 0): number => {
    const goldenRatio = 1.618033988749895;
    const angle = 2 * Math.PI * goldenRatio * (Math.random() + offset);
    const radius = Math.sqrt(Math.random()) * max;
    return radius * Math.cos(angle);
  };

  // Poisson disc sampling for even distribution with minimum distance
  const generatePoissonPosition = (width: number, height: number, minDistance: number = 50) => {
    const positions: [number, number][] = [];
    const gridSize = minDistance / Math.sqrt(2);
    const grid: (number | null)[][] = [];

    // Initialize grid
    for (let x = 0; x < Math.ceil(width / gridSize); x++) {
      grid[x] = [];
      for (let y = 0; y < Math.ceil(height / gridSize); y++) {
        grid[x][y] = null;
      }
    }

    // Random initial position
    const initialX = Math.random() * width;
    const initialY = Math.random() * height;
    const initialPos: [number, number] = [initialX, initialY];
    positions.push(initialPos);

    const gridX = Math.floor(initialX / gridSize);
    const gridY = Math.floor(initialY / gridSize);
    grid[gridX][gridY] = 0;

    // Process active points
    const active: number[] = [0];

    while (active.length > 0) {
      const randomIndex = Math.floor(Math.random() * active.length);
      const pointIndex = active[randomIndex];
      const point = positions[pointIndex];
      let found = false;

      // Try to find a valid point
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = minDistance + Math.random() * minDistance;
        const newX = point[0] + Math.cos(angle) * distance;
        const newY = point[1] + Math.sin(angle) * distance;

        if (newX < 0 || newX >= width || newY < 0 || newY >= height) continue;

        const newGridX = Math.floor(newX / gridSize);
        const newGridY = Math.floor(newY / gridSize);

        let valid = true;

        // Check surrounding grid cells
        for (let gx = Math.max(0, newGridX - 2); gx <= Math.min(grid.length - 1, newGridX + 2); gx++) {
          for (let gy = Math.max(0, newGridY - 2); gy <= Math.min(grid[0].length - 1, newGridY + 2); gy++) {
            const index = grid[gx][gy];
            if (index !== null) {
              const otherPoint = positions[index];
              const dx = newX - otherPoint[0];
              const dy = newY - otherPoint[1];
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < minDistance) {
                valid = false;
                break;
              }
            }
          }
          if (!valid) break;
        }

        if (valid) {
          const newPointIndex = positions.length;
          positions.push([newX, newY]);
          grid[newGridX][newGridY] = newPointIndex;
          active.push(newPointIndex);
          found = true;
          break;
        }
      }

      if (!found) {
        active.splice(randomIndex, 1);
      }
    }

    return positions;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const containerWidth = window.innerWidth + 8000;
    const containerHeight = window.innerHeight + 4000;

    // Generate meteor styles with natural distribution
    const meteors = [...new Array(number)].map((_, i) => {
      // Determine meteor type based on natural distribution
      // 60% standard, 30% distant, 10% bright
      const typeRandom = Math.random();
      let type: MeteorType = "standard";
      if (typeRandom > 0.9) {
        type = "bright";
      } else if (typeRandom > 0.6) {
        type = "distant";
      }

      // Determine size based on type and natural distribution
      let size: MeteorSize = "small";
      const sizeRandom = Math.random();
      if (type === "bright") {
        size = sizeRandom > 0.7 ? "large" : "medium";
      } else if (type === "standard") {
        size = sizeRandom > 0.8 ? "medium" : sizeRandom > 0.4 ? "small" : "tiny";
      } else {
        size = sizeRandom > 0.9 ? "small" : "tiny";
      }

      // Calculate natural spacing using Fibonacci distribution
      const topOffset = fibonacciDistribution(containerHeight, i * 0.1) + containerHeight / 2;

      // Calculate left position with logarithmic distribution for more natural grouping
      const leftBase = Math.log(1 + Math.random() * 10) / Math.log(11);
      const leftPosition = leftBase * containerWidth;

      // Determine duration based on type and position for natural velocity
      let baseDuration: number;
      if (type === "bright") {
        baseDuration = 4 + Math.random() * 3; // Faster
      } else if (type === "standard") {
        baseDuration = 7 + Math.random() * 8; // Medium
      } else {
        baseDuration = 12 + Math.random() * 15; // Slower
      }

      // Add slight variation based on position for more natural movement
      const positionFactor = 1 + (topOffset / containerHeight - 0.5) * 0.3;
      const duration = baseDuration * positionFactor;

      // Determine tail length based on type and speed
      let tailLength: number;
      if (type === "bright") {
        tailLength = 80 + Math.random() * 40;
      } else if (type === "standard") {
        tailLength = 40 + Math.random() * 30;
      } else {
        tailLength = 20 + Math.random() * 15;
      }

      // Select color based on scheme and add slight variation
      const colorIndex = Math.floor(Math.random() * selectedScheme.meteorColors.length);
      const trailColor = selectedScheme.trailColors[colorIndex];

      return {
        style: {
          top: `${topOffset}px`,
          left: `${leftPosition}px`,
          "--duration": `${duration}s`,
          "--tail-length": `${tailLength}px`,
          "--trail-color": trailColor,
          animationDelay: `${Math.random() * 20}s`,
          backgroundColor: selectedScheme.meteorColors[colorIndex],
          ...(size === "tiny" ? { height: "0.5px", width: "0.5px" } :
            size === "small" ? { height: "1px", width: "1px" } :
              size === "medium" ? { height: "1.5px", width: "1.5px" } :
                { height: "2px", width: "2px" }),
        } as MeteorStyle,
        type,
        size,
      };
    });

    // Generate star clusters with Poisson disc distribution for even spacing
    const starPositions = generatePoissonPosition(containerWidth, containerHeight, 100);
    const clusters = starPositions.slice(0, starClusters).map((position, i) => {
      const baseOpacity = 0.3 + Math.random() * 0.4;
      const peakOpacity = baseOpacity + 0.2 + Math.random() * 0.3;
      const twinkleDuration = 2 + Math.random() * 4;

      return {
        top: `${position[1]}px`,
        left: `${position[0]}px`,
        "--base-opacity": baseOpacity.toString(),
        "--peak-opacity": peakOpacity.toString(),
        "--twinkle-duration": `${twinkleDuration}s`,
        "--random-offset": `${Math.random() * 2}s`,
      } as MeteorStyle;
    });

    // Generate cosmic dust with random distribution
    const dust = [...new Array(cosmicDust)].map((_, i) => {
      return {
        top: `${Math.random() * containerHeight}px`,
        left: `${Math.random() * containerWidth}px`,
        "--dust-opacity": `${0.1 + Math.random() * 0.2}`,
      } as MeteorStyle;
    });

    setMeteorStyles(meteors);
    setStarClusterStyles(clusters);
    setCosmicDustStyles(dust);
  }, [number, starClusters, cosmicDust, colorScheme]);

  return (
    <div
      ref={containerRef}
      className={cn("absolute overflow-hidden will-change-transform", className)}
      style={{
        left: '-2000px',
        width: 'calc(100% + 4000px)',
        height: 'calc(100% + 2000px)',
        top: '-1000px',
        ...style
      }}
    >
      {/* Background star clusters */}
      {starClusterStyles.map((style, idx) => (
        <div
          key={`star-${idx}`}
          className="star-cluster"
          style={style}
        />
      ))}

      {/* Cosmic dust particles */}
      {cosmicDustStyles.map((style, idx) => (
        <div
          key={`dust-${idx}`}
          className="cosmic-dust"
          style={style}
        />
      ))}

      {/* Meteors with trails */}
      {meteorStyles.map(({ style, type, size }, idx) => (
        <span
          key={`meteor-${idx}`}
          className={cn(
            "pointer-events-none absolute rounded-[9999px] will-change-transform",
            {
              "meteor-standard": type === "standard",
              "meteor-distant": type === "distant",
              "meteor-bright": type === "bright",
            }
          )}
          style={style}
        >
          {/* Meteor Trail */}
          <div
            className="meteor-trail-glow"
            style={{
              "--trail-color": style["--trail-color"] as string,
              "--duration": style["--duration"] as string,
              "--tail-length": style["--tail-length"] as string,
            } as React.CSSProperties}
          />
        </span>
      ))}
    </div>
  );
};

export default CosmicMeteors;
