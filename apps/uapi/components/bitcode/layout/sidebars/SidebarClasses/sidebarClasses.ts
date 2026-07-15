"use client";
// Shared Tailwind class constants for sidebar styling
export const sidebarBase = 'fixed top-0 h-full flex flex-col text-gray-200 backdrop-blur-xl';
export const sidebarBg = 'bg-gradient-to-b from-[#0a1428]/98 via-[#0a1428]/95 to-[#0a1428]/98';
export const sidebarBorderColor = 'border-emerald-500/[0.15]';
export const sidebarLeft = 'left-0 border-r';
export const sidebarRight = 'right-0 border-l';
export const sidebarW19 = 'w-[19rem]';
export const sidebarW28 = 'w-[28rem] max-w-[90vw]';
// Shadows: left sidebar uses negative X offset, inline uses positive X
export const sidebarShadowLeft = 
  'shadow-[-8px_0_24px_-6px_rgba(0,0,0,0.6),0_0_0_1px_rgba(103,254,183,0.1),inset_0_0_24px_rgba(103,254,183,0.02)]';
export const sidebarShadowRight = 
  'shadow-[8px_0_24px_-6px_rgba(0,0,0,0.6),0_0_0_1px_rgba(103,254,183,0.1),inset_0_0_24px_rgba(103,254,183,0.02)]';