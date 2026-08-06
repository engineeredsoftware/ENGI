'use client';

// File: apps/uapi/components/bitcode/layout/sidebars/sidebar-toggle.tsx

// components/sidebars/sidebar-toggle.tsx

import { motion, AnimatePresence } from 'framer-motion';
import React, { ReactElement, useState, useEffect } from 'react';
import styles from './sidebar-toggle.module.css';

export interface SidebarOption {
  id: string;
  icon: ReactElement;
  label: string;
}

interface SidebarToggleProps {
  position: 'left' | 'right';
  isOpen: boolean;
  onToggle: () => void;
  options: [SidebarOption, SidebarOption]; // Exactly two options
  activeOption: string;
  onOptionChange: (optionId: string) => void;
  /** Option IDs that should be rendered as disabled ('Coming Soon') */
  disabledOptions?: string[];
  /** When true, locks toggles until user onboarding is completed */
  onboardingLocked?: boolean;
}

const SidebarToggleComponent: React.FC<SidebarToggleProps> = ({
  position,
  isOpen,
  onToggle,
  options,
  activeOption,
  onOptionChange,
  disabledOptions = [],
  onboardingLocked = false,
}) => {
  // Lock toggles based on user onboarding state (derived from parent props)
  // Find the active and inactive option objects
  const activeOptionObj = options.find(opt => opt.id === activeOption) || options[0];
  const inactiveOptionObj = options.find(opt => opt.id !== activeOption) || options[1];
  // Determine if switching to the inactive option is disabled
  const isInactiveDisabled = disabledOptions.includes(inactiveOptionObj.id);

  // Get icon paths based on sidebar ID
  const getIconPaths = (id: string) => {
    switch (id) {
      case 'chat':
        return (
          <>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="15" y2="13" />
          </>
        );
      case 'feedbacks':
        return (
          <>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
            <path d="M12 14V8" />
            <path d="M9 11l3-3 3 3" />
          </>
        );
      case 'asset-packs':
        return (
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
          </>
        );
      default:
        return null;
    }
  };

  // Sidebar width is fixed via Tailwind class `w-[19rem]` → 19 * 16 = 304px
  // We want the toggle button (aka the "orb") to always lead the sidebar so it
  // remains visible and has a comfortable gap even when the sidebar is fully
  // open.  To achieve this we translate it by the sidebar width plus a small
  // extra margin. Using constants keeps the animation values in a single
  // place and makes it straightforward to tweak in the future if the sidebar
  // width ever changes.

  const SIDEBAR_WIDTH = 304; // px (19rem)
  const GAP_MAIN_TOGGLE = 16; // visible gap between sidebar edge & orb
  const GAP_SWITCH_TAB = 36; // gap for the secondary tab (a bit further)
  const OUTER_OFFSET = 16;   // the Tailwind negative offset (-left-4 / -right-4)
  const ORB_WIDTH = 140;     // approximate visual width including padding

  const baseMainLeft = SIDEBAR_WIDTH + GAP_MAIN_TOGGLE + OUTER_OFFSET;                  // 336
  const baseMainRight = SIDEBAR_WIDTH + GAP_MAIN_TOGGLE + OUTER_OFFSET + ORB_WIDTH;     // 476

  const baseSwitchLeft = SIDEBAR_WIDTH + GAP_SWITCH_TAB + OUTER_OFFSET;                 // 356
  const baseSwitchRight = SIDEBAR_WIDTH + GAP_SWITCH_TAB + OUTER_OFFSET + ORB_WIDTH;    // 496

  const mainToggleOpenX = `${position === 'left' ? baseMainLeft : -baseMainRight}px`;
  const switchTabOpenX = `${position === 'left' ? baseSwitchLeft : -baseSwitchRight}px`;

  return (
    <>
      {/* Main Toggle Button */}
      <motion.div
        data-testid={`sidebar-toggle-${position}`}
        initial={{ x: 0 }}
        animate={{
          // Slide fully in front of the sidebar when open and peek in
          // slightly when closed.
          x: isOpen
            ? mainToggleOpenX
            : position === 'left' ? '12px' : '-12px',
          scale: isOpen ? 1.05 : 1
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          mass: 1
        }}
        className={`
          fixed top-0 ${position === 'left' ? '-left-4' : '-right-4'}
          z-[100]
          rounded-none
          transition-all duration-300
          ${onboardingLocked
            ? 'bg-gray-800 border border-gray-600 shadow-none opacity-50 grayscale cursor-not-allowed'
            : [
                'bg-gradient-to-b from-[#0a1428]/95 to-[#0a1428]/90 backdrop-blur-md',
                'border border-emerald-500/20',
                // Tokenized base shadow for consistent depth
                'shadow-surface',
                // Preserve hover glow intensity exactly
                'hover:shadow-[0_4px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(103,254,183,0.2),0_0_12px_rgba(103,254,183,0.2)]',
                'hover:bg-[#0a1428]'
              ].join(' ')
          }
        `}
        onClick={(e) => { if (!onboardingLocked) onToggle(); else e.stopPropagation(); }}
      >
        <div className="group/toggle px-3 py-2 cursor-pointer">
          <div className="flex items-center w-[120px] justify-center relative">
            {/* Closed State */}
            <motion.div
              initial={false}
              animate={{
                scale: isOpen ? 0 : 1,
                x: isOpen ? (position === 'left' ? 20 : -20) : 0,
                opacity: isOpen ? 0 : 1
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
              className="absolute flex items-center space-x-2"
            >
              <div className="relative">
                {/* Orb Rings Animation */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-none border border-emerald-400/40 pointer-events-none -z-10"
                  initial={false}
                  animate={{
                    rotate: isOpen ? 180 : 0,
                    scale: isOpen ? 1.4 : 1,
                    opacity: isOpen ? 0.7 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                />
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-none border border-emerald-500/20 pointer-events-none -z-10"
                  initial={false}
                  animate={{
                    rotate: isOpen ? -180 : 0,
                    scale: isOpen ? 1.7 : 1,
                    opacity: isOpen ? 0.5 : 0.8,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 18,
                    delay: 0.05,
                  }}
                />
                {/* Active Option Icon */}
                <svg
                  className="w-5 h-5 text-emerald-400/80 transition-all duration-300 group-hover/toggle:text-emerald-300 group-hover/toggle:drop-shadow-[0_0_4px_rgba(103,254,183,0.4)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {getIconPaths(activeOptionObj.id)}
                </svg>

                {/* Animation Particles */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`
                      absolute w-[3px] h-[3px]
                      rounded-none
                      bg-emerald-400/40
                      transition-all duration-500 ease-out
                      backdrop-blur-[1px]
                      group-hover/toggle:bg-emerald-400/60
                      ${styles.particle}
                    `}
                    style={{ '--angle': `${i * 120}deg`, animationDelay: `${i * 0.3}s` } as React.CSSProperties}
                  />
                ))}

                <div className={`
                  absolute inset-[-25%] rounded-none
                  bg-emerald-400/10
                  transition-all duration-300
                  opacity-0 group-hover/toggle:opacity-100
                  blur-[8px]
                  group-hover/toggle:scale-110
                  group-hover/toggle:bg-emerald-400/15
                `} />
              </div>

              <span className="text-sm font-medium tracking-wide text-emerald-300/90">
                {activeOptionObj.label}
              </span>
            </motion.div>

            {/* Open State Actions */}
            <motion.div
              initial={false}
              animate={{
                scale: isOpen ? 1 : 0,
                x: isOpen ? 0 : (position === 'left' ? -20 : 20),
                opacity: isOpen ? 1 : 0
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: isOpen ? 0.1 : 0
              }}
              className="flex items-center space-x-3"
            >
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="group/close-btn relative w-8 h-8 flex items-center justify-center"
              >
                <div className="absolute inset-0 rounded-none bg-emerald-500/0 transition-all duration-300 group-hover/close-btn:bg-emerald-500/5" />
                <svg
                  className="w-5 h-5 text-emerald-400/80 transition-all duration-300 group-hover/close-btn:text-emerald-300 group-hover/close-btn:scale-110 group-hover/close-btn:drop-shadow-[0_0_4px_rgba(103,254,183,0.4)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={position === 'left'
                    ? "M19 12H5M12 5l-7 7 7 7"
                    : "M5 12h14M12 5l7 7-7 7"}
                  />
                </svg>
                <div className="absolute inset-0 rounded-none border border-emerald-500/0 transition-all duration-300 group-hover/close-btn:border-emerald-500/20" />
              </button>

              {/* New item button */}
              <button
                onClick={(e) => e.stopPropagation()}
                className="group/new-btn relative w-8 h-8 flex items-center justify-center"
              >
                <div className="absolute inset-0 rounded-none bg-emerald-500/0 transition-all duration-300 group-hover/new-btn:bg-emerald-500/5" />
                <svg
                  className="w-5 h-5 text-emerald-400/80 transition-all duration-300 group-hover/new-btn:text-emerald-300 group-hover/new-btn:scale-110 group-hover/new-btn:drop-shadow-[0_0_4px_rgba(103,254,183,0.4)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <div className="absolute inset-0 rounded-none border border-emerald-500/0 transition-all duration-300 group-hover/new-btn:border-emerald-500/20" />
              </button>
            </motion.div>
          </div>

          {/* Hover gradient effect for the main button */}
          <div className="absolute inset-0 opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-300">
            <div className={`absolute inset-0 bg-gradient-to-${position === 'left' ? 'r' : 'l'} from-emerald-500/[0.02] via-emerald-500/[0.05] to-transparent`} />
          </div>
          {/* Removed former onboarding tooltip */}
        </div>
      </motion.div>

      {/* Separate Floating Tab for Sidebar Switching */}
      <motion.button
        data-testid={`sidebar-switch-${inactiveOptionObj.id}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          // Slide out when open, peek by 30px when closed
          x: isOpen
            ? switchTabOpenX
            : position === 'left' ? '30px' : '-30px',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          mass: 1
        }}
        onClick={(e) => {
          e.stopPropagation();
          // disable switching when option disabled or onboarding incomplete
          const disabledAll = isInactiveDisabled || onboardingLocked;
          if (!disabledAll) {
            onOptionChange(inactiveOptionObj.id);
          }
        }}
        className={
          `
    fixed top-0 ${position === 'left' ? 'left-24' : 'right-24'}
    ${position === 'left' ? 'pl-3' : 'pr-3'}
    z-[50]
    w-14 h-[40px]
    rounded-none
    flex items-center justify-center
    transition-all duration-200
    ${(isInactiveDisabled || onboardingLocked)
            ? 'bg-gray-800 border border-gray-600 shadow-none !opacity-50 grayscale cursor-not-allowed group/tab'
            : 'bg-gradient-to-b from-emerald-900/90 to-emerald-950/95 border border-emerald-500/20 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_0_0_1px_rgba(103,254,183,0.1)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.4),0_0_0_1px_rgba(103,254,183,0.2),0_0_12px_rgba(103,254,183,0.15)] hover:border-emerald-500/30 group/tab overflow-hidden'
          }
  `
        }
      >
        {/* The inactive sidebar icon (that you'll switch to) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={inactiveOptionObj.id}
            initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              mass: 1
            }}
            className="flex items-center justify-center"
          >
            <svg
              className={`w-5 h-5 ${isInactiveDisabled ? 'text-gray-500' : 'text-emerald-400 transition-all duration-300 group-hover/tab:text-emerald-300 group-hover/tab:drop-shadow-[0_0_4px_rgba(103,254,183,0.4)]'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {getIconPaths(inactiveOptionObj.id)}
            </svg>
          </motion.div>
        </AnimatePresence>
        {/* Shine & glow when enabled */}
        {!isInactiveDisabled && (
          <>
            <div
              className="absolute inset-0 opacity-0 group-hover/tab:opacity-100 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, rgba(103,254,183,0.15) 0%, transparent 60%)' }}
            />
            <div
              className={`absolute inset-0 opacity-0 group-hover/tab:opacity-70 transition-all duration-300 ${styles.pulse}`}
              style={{ background: 'radial-gradient(circle at center, rgba(103,254,183,0.12) 0%, transparent 70%)' }}
            />
          </>
        )}
        {/* Tooltip for disabled or onboarding-locked option (below) */}
        {(isInactiveDisabled || onboardingLocked) && (
          <>
            <span
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover/tab:opacity-100 pointer-events-none"
            >
              {onboardingLocked ? 'Complete Onboarding' : 'Coming Soon'}
            </span>
            <span
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-[0.5rem] w-2 h-2 bg-black rotate-45 opacity-0 group-hover/tab:opacity-100 pointer-events-none"
            />
          </>
        )}
      </motion.button>

      {/* Animations moved to CSS Module */}
    </>
  );
};

// Memoise to avoid unnecessary re-renders when props have not changed.
export const SidebarToggle = React.memo(
  SidebarToggleComponent,
  (prev, next) =>
    prev.position === next.position &&
    prev.isOpen === next.isOpen &&
    prev.activeOption === next.activeOption &&
    prev.onboardingLocked === next.onboardingLocked &&
    prev.disabledOptions === next.disabledOptions &&
    // Shallow compare arrays with 2 items (as per type definition)
    prev.options[0].id === next.options[0].id &&
    prev.options[1].id === next.options[1].id,
);
