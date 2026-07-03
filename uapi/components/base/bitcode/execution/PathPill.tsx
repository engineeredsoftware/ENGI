"use client";

import React from 'react';

export type PillType =
  | 'phase'
  | 'agent'
  | 'step'
  | 'failsafe'
  | 'generation'
  | 'tool';

interface PathPillProps {
  label: string | number | React.ReactNode;
  type: PillType;
  className?: string;
}

// Utility class generator – keeps style footprint tiny while allowing
// future token-based overrides.
const BASE =
  'inline-flex items-center justify-center px-2 py-[1px] text-[0.67rem] font-medium uppercase tracking-wider rounded-sm ring-1 ring-inset flex-shrink-0 select-none shadow-[inset_0_0_4px_var(--tw-ring-color)]';

const typeToClasses: Record<PillType, string> = {
  phase: `${BASE} bg-gradient-to-r from-gray-600/30 to-gray-600/10 text-gray-100 ring-gray-500/40`,
  agent: `${BASE} bg-gradient-to-r from-sky-600/40 to-sky-600/10 text-sky-100 ring-sky-500/40`,
  step: `${BASE} bg-gradient-to-r from-emerald-600/40 to-emerald-600/10 text-emerald-100 ring-emerald-500/40`,
  failsafe: `${BASE} bg-gradient-to-r from-purple-600/40 to-purple-600/10 text-purple-100 ring-purple-500/40`,
  generation: `${BASE} bg-gradient-to-r from-amber-600/40 to-amber-600/10 text-amber-100 ring-amber-500/40`,
  tool: `${BASE} bg-gradient-to-r from-indigo-600/40 to-indigo-600/10 text-indigo-100 ring-indigo-500/40`,
};
// Icon per pill — every pill TYPE renders a consistent icon. The icon is a
// per-type default, refined by a substring match on the (normalized) label.
// Labels drift across the pipeline — PTRR steps (Plan/Try/Refine/Retry),
// Thinkings generations (reason/judge/structured_output), failsafe stages, and
// custom step names like `read-comprehension`/`synthesis` — so matching is by
// substring and ALWAYS falls back to the type default, guaranteeing an icon.
import {
  GearIcon,
  MagnifyingGlassIcon,
  Pencil2Icon,
  CheckCircledIcon,
  RocketIcon,
  ClipboardIcon,
  MagicWandIcon,
  MixerHorizontalIcon,
  LightningBoltIcon,
  StackIcon,
  PersonIcon,
  ChatBubbleIcon,
  ScissorsIcon,
  LayersIcon,
} from '@radix-ui/react-icons';

type IconComponent = React.ComponentType<any>;
type IconRule = [match: string, Icon: IconComponent];

const PHASE_ICON_RULES: IconRule[] = [
  ['setup', GearIcon],
  ['discovery', MagnifyingGlassIcon],
  ['implementation', Pencil2Icon],
  ['validation', CheckCircledIcon],
  ['finish', RocketIcon],
];

const STEP_ICON_RULES: IconRule[] = [
  ['plan', ClipboardIcon],
  ['try', MagicWandIcon],
  ['generate', MagicWandIcon],
  ['refine', MixerHorizontalIcon],
  ['retry', LightningBoltIcon],
  ['intensify', LightningBoltIcon],
];

const FAILSAFE_ICON_RULES: IconRule[] = [
  ['prepare', StackIcon],
  ['chunk', ScissorsIcon],
  ['stitch', LayersIcon],
];

const GENERATION_ICON_RULES: IconRule[] = [
  ['reason', ChatBubbleIcon],
  ['judge', ScissorsIcon],
  ['structur', LayersIcon], // matches "structure" / "structured_output"
];

const TYPE_DEFAULT_ICON: Record<PillType, IconComponent> = {
  phase: GearIcon,
  agent: PersonIcon,
  step: ClipboardIcon,
  failsafe: StackIcon,
  generation: ChatBubbleIcon,
  tool: MixerHorizontalIcon,
};

function matchIcon(rules: IconRule[], label: string): IconComponent | null {
  const lower = label.toLowerCase();
  for (const [match, Icon] of rules) {
    if (lower.includes(match)) return Icon;
  }
  return null;
}

function getIcon(type: PillType, label: string): IconComponent | null {
  switch (type) {
    case 'phase':
      return matchIcon(PHASE_ICON_RULES, label) ?? TYPE_DEFAULT_ICON.phase;
    case 'step':
      return matchIcon(STEP_ICON_RULES, label) ?? TYPE_DEFAULT_ICON.step;
    case 'failsafe':
      return matchIcon(FAILSAFE_ICON_RULES, label) ?? TYPE_DEFAULT_ICON.failsafe;
    case 'generation':
      return matchIcon(GENERATION_ICON_RULES, label) ?? TYPE_DEFAULT_ICON.generation;
    case 'agent':
    case 'tool':
      return TYPE_DEFAULT_ICON[type];
    default:
      return null;
  }
}

export function PathPill({ label, type, className = '' }: PathPillProps) {
  const text = typeof label === 'string' ? label.toUpperCase() : label;
  const Icon = typeof label === 'string' ? getIcon(type, label) : null;

  return (
    <span className={`${typeToClasses[type]} flex gap-1 items-center ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {text}
    </span>
  );
}
