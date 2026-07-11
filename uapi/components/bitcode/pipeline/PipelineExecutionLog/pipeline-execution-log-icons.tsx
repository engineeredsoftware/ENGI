/**
 * Custom log row icons for PipelineExecutionLog (AI / tool / thinking).
 */
import React from "react";

export const RobotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="5" y="7" width="14" height="10" rx="2" />
    <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <line x1="12" y1="4" x2="12" y2="7" />
    <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
    <path d="M9 16h6" />
  </svg>
);

export const WrenchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 7a5 5 0 0 1-6.8 4.7L7.7 19.2a2.8 2.8 0 0 1-4 0 2.8 2.8 0 0 1 0-4l7.5-7.5A5 5 0 0 1 15 2a5 5 0 0 1 5 5z" />
    <circle cx="9" cy="15" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const ThoughtBubbleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M6 10a6 6 0 0 1 11.3-2.8A5 5 0 0 1 18 18H7a4 4 0 0 1-1-7.9 6.1 6.1 0 0 1 0-.1z" />
    <circle cx="5" cy="19" r="1.2" />
    <circle cx="3.5" cy="21" r="0.8" />
  </svg>
);
