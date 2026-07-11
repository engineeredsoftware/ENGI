"use client";

import React from "react";
import { cn } from '@bitcode/styling';

interface BitcodePillProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export default function BitcodePill({ children, className, ...props }: BitcodePillProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-white/5 text-gray-200 border border-green-primary/30",
        className
      )}
    >
      {children}
    </span>
  );
}
