"use client";

import { cn } from '@bitcode/styling';
import { AnimatedBeam } from "@/components/bitcode/magicui/AnimatedBeam/AnimatedBeam";
import React, { forwardRef, useRef } from "react";
import { NotionLogoIcon, FigmaLogoIcon, GitHubLogoIcon, CommitIcon, ChatBubbleIcon } from "@radix-ui/react-icons";
import Logo from "@/components/bitcode/branding/Logo/Logo";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white dark:bg-black p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

export function MarketingRichContextBeams() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex w-full ml-auto max-w-[500px] items-center justify-center overflow-hidden p-10"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-2">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div5Ref} className="border-green-primary">
            <CommitIcon className="h-6 w-6 text-green-primary" />
          </Circle>
          <Circle ref={div1Ref}>
            <GitHubLogoIcon className="h-6 w-6" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div6Ref} className="border-green-primary">
            <ChatBubbleIcon className="h-6 w-6 text-green-primary" />
          </Circle>
          <Circle ref={div4Ref} className="h-16 w-16 shadow-green-primary shadow-[0_0_20px_5px]">
            <Logo beta={false} className="-ml-1.5" height="h-11" width="w-11" />
          </Circle>
          <Circle ref={div2Ref}>
            <FigmaLogoIcon className="h-6 w-6" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div /> {/* move to right */}
          <Circle ref={div7Ref}>
            <NotionLogoIcon className="h-6 w-6" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        reverse={true}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
        reverse={true}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        reverse={true}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        reverse={true}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse={true}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        reverse={true}
      />
    </div>
  );
}
