"use client";

import React from 'react';
import { cn } from '@bitcode/styling';
import { AnimatedList } from "@/components/bitcode/magicui/AnimatedList/AnimatedList";

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

let notifications = [
  {
    name: "Issue Created",
    description: "by Internal Team",
    time: "15m ago",

    icon: "🐙",
    color: "#e6edf3",
  },
  {
    name: "Issue Fixed",
    description: "by Bitcode Bot",
    time: "10m ago",
    icon: "🐲",
    color: "#65feb7",
  },
  {
    name: "Learn Latest React API",
    description: "via Bitcode Evidence Bounty",
    time: "5m ago",
    icon: "🧠",
    color: "#FF3D71",
  },
  {
    name: "Refactor Complete",
    description: "by Bitcode Bot",
    time: "1m ago",
    icon: "🐲",
    color: "#65feb7",
  },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-full desktop:max-w-[400px] transform cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex border h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            boxShadow: `0px 0px 8px 1px ${color}`,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
            <span className="text-sm tablet:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export function AnimatedListWork() {
  return (
    <div className="relative flex max-h-[500px] min-h-[500px] w-full flex-col overflow-hidden desktop:p-6">
    </div>
  );
}
