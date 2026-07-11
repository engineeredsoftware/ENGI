// Consolidated, lightweight technology icon component.
//
// The previous implementation imported >20 icons from `react-icons`, pulling
// the entire FontAwesome/SimpleIcons packs (~90 KB gzipped) into any bundle
// that referenced this component.  For the marketing page we care more about
// consistency and payload size than showing the exact logo for every single
// language.  We therefore map *all* requested technologies to a small subset
// of Radix Icons which are tree-shakeable and already in our dependency tree.

import React from 'react';
import {
  CodeIcon,
  ContainerIcon,
  CubeIcon,
  RocketIcon,
} from '@radix-ui/react-icons';

import classNames from 'classnames';

type TechnologyIconProps = {
  className?: string;
  /** Stable public identifier for the technology. */
  value?: string;
};

const iconByTech: Record<string, React.ComponentType<any>> = {
  python: CodeIcon,
  javascript: CodeIcon,
  typescript: CodeIcon,
  csharp: CodeIcon,
  cpp: CodeIcon,
  c: CodeIcon,
  rust: RocketIcon,
  solidity: CubeIcon,
  solang: CubeIcon,
  substrate: CubeIcon,
  docker: ContainerIcon,
  html: CodeIcon,
  css: CodeIcon,
  react: CodeIcon,
  mdx: CodeIcon,
  ios: RocketIcon,
};

export default function TechnologyIcon({ className, value }: TechnologyIconProps) {
  const classes = classNames('h-5 w-5', className);
  const Icon = (value && iconByTech[value.toLowerCase()]) || CodeIcon;
  return <Icon className={classes} />;
}
