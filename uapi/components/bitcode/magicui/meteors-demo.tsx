"use client";

import { useState } from "react";
import { Meteors } from "./meteors";

export const MeteorsDemo = () => {
  const [colorScheme, setColorScheme] = useState<"default" | "cosmic" | "aurora" | "nebula">("default");
  const [meteorCount, setMeteorCount] = useState(20);

  return (
    <div className="relative h-[40rem] w-full overflow-hidden rounded-lg border bg-black">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <select 
          className="rounded bg-white/10 px-3 py-1 text-white"
          value={colorScheme}
          onChange={(e) => setColorScheme(e.target.value as any)}
        >
          <option value="default">Default</option>
          <option value="cosmic">Cosmic</option>
          <option value="aurora">Aurora</option>
          <option value="nebula">Nebula</option>
        </select>
        
        <div className="flex items-center gap-2">
          <label className="text-white">Meteors:</label>
          <input 
            type="range" 
            min="5" 
            max="50" 
            value={meteorCount}
            onChange={(e) => setMeteorCount(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-white">{meteorCount}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-center text-4xl font-bold text-white">
          Cosmic Meteors
        </h1>
        <p className="mt-4 max-w-md text-center text-lg text-white/80">
          Stars traversing the fabric of space with natural distribution, 
          varied velocities, and elegant rendering.
        </p>
      </div>
      
      {/* Meteors effect */}
      <Meteors 
        number={meteorCount} 
        colorScheme={colorScheme}
      />
    </div>
  );
};

export default MeteorsDemo;
