'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MarketingSectionWrapper from '@/components/marketing/MarketingSectionWrapper/MarketingSectionWrapper';
import Image from 'next/image';

const features = [
  {
    id: 'capability-leap',
    title: 'Capability Leap for Technical Work',
    description: 'Experience a reliable system that improves affordability, production speed, and reviewable quality by orders of magnitude for technical work.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    image: '/working-on-implementing.png',
    color: 'from-emerald-500/20 to-emerald-600/20',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
  },
  {
    id: 'recursive-improvement',
    title: 'Reusable Proof Improvement',
    description: 'Bitcode records measured patterns from accepted AssetPacks so future Reads can reuse stronger evidence and implementation paths.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" />
        <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 16V21" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3V8" stroke="currentColor" strokeWidth="2" />
        <path d="M16 12H21" stroke="currentColor" strokeWidth="2" />
        <path d="M3 12H8" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    image: '/marketplace-features.png',
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
  },
  {
    id: 'measurement-evidence',
    title: 'Read Measurement Evidence',
    description: 'Bind source, benchmarks, static analysis, and reviewable Read evidence before Bitcode searches for source-to-shares fit.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    image: '/working-on-implementing.png',
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
  {
    id: 'parallel-state-search',
    title: 'Parallel State Search',
    description: 'Leveraging parallel state exploration and pre-computation so Bitcode can compare code behavior and optimize AssetPack candidates.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 12C13.6569 12 15 13.3431 15 15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15C9 13.3431 10.3431 12 12 12Z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12Z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 12C10.3431 12 9 13.3431 9 15C9 16.6569 10.3431 18 12 18C13.6569 18 15 16.6569 15 15C15 13.3431 13.6569 12 12 12Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    image: '/parse-issue-with-comment-from-bitcode.png',
    color: 'from-indigo-500/20 to-indigo-600/20',
    borderColor: 'border-indigo-500/30',
    textColor: 'text-indigo-400',
  },
  {
    id: 'github-integration',
    title: 'Seamless GitHub Integration',
    description: 'Connect your repositories, assign tasks to Bitcode, and receive PR-backed AssetPacks directly in your GitHub workflow, accelerating your development process.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor" />
      </svg>
    ),
    image: '/gh-pr-3.png',
    color: 'from-gray-500/20 to-gray-600/20',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-400',
  },
  {
    id: 'synthetic-data',
    title: 'Synthetic Data Generation',
    description: 'Bitcode uses generated scenarios and synthetic datasets to test models, compare code-behavior predictions, and improve measured execution quality.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 7L13 15L9 11L3 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 13V7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    image: '/synthetic-data.png',
    color: 'from-amber-500/20 to-amber-600/20',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
  },
  {
    id: 'economic-impact',
    title: 'Economic Settlement',
    description: 'Bitcode connects software work to measurable source, Read, Fit, proof, BTC fees, and non-fungible $BTD share/read-right accounting.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    image: '/economic-impact.png',
    color: 'from-green-500/20 to-green-600/20',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
  },
  {
    id: 'future-tech',
    title: 'Versioned Product Growth',
    description: 'Bitcode keeps V26 focused on commercial AssetPack execution while later versions expand Terminal, Exchange, and external-connection flows.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    image: '/future-tech.png',
    color: 'from-red-500/20 to-red-600/20',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
  },
];

const MarketingFeaturesGrid = () => {
  const [activeFeature, setActiveFeature] = useState('capability-leap');

  // File-local class constants (SRP/DRY; no visual changes)
  const featureCardBase = [
    'feature-card glow-effect animate-fade-in-up',
    'relative p-4 rounded-md border backdrop-blur-sm cursor-pointer',
    'bg-[#030816]/50 border-[#1f2937] hover:border-emerald-500/30',
    'transition-all duration-200'
  ].join(' ');
  const featureIconBadge = 'p-1.5 rounded-md bg-[#1f2937]/50 text-emerald-400 mr-3';
  const featureTitleBase = 'text-sm font-medium mb-1';

  const terminalPanelClass = 'bg-[#030816]/50 backdrop-blur-sm border border-[#1f2937] rounded-md overflow-hidden';
  const terminalHeaderClass = 'bg-[#1f2937]/80 px-4 py-2 flex items-center justify-between border-b border-[#1f2937]';
  const paneLeftClass = 'w-full desktop:w-1/2 p-4 border-r border-[#1f2937]';
  const paneRightClass = 'w-full desktop:w-1/2 p-4';
  const imageFrameClass = 'relative h-[240px] overflow-hidden rounded-md border border-[#1f2937]';
  const infoCardClass = 'bg-[#1f2937]/30 rounded-md p-3 border border-[#1f2937]';

  return (
    <MarketingSectionWrapper>
      <div className="text-center mb-12">
        {/* Increased bottom margin for better separation from the subtitle */}
        <h2 className="text-2xl laptop:text-3xl font-bold mb-4 tracking-tight text-white block super-shiny-text">
          Reliable Capabilities
        </h2>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto">
          Bitcode represents a paradigm shift in technology creation, combining advanced AI with reliable approaches to engineering.
        </p>
      </div>

      {/* Features Grid - Terminal-like cards */}
      <div className="grid grid-cols-1 laptop:grid-cols-2 desktop:grid-cols-3 gap-6 mb-8">
        {features.map((feature, idx) => (
          <div
            key={feature.id}
            className={`${featureCardBase} ${activeFeature === feature.id ? 'border-emerald-500/30' : ''}`}
            style={{ animationDelay: `${idx * 150}ms` }}
            onClick={() => setActiveFeature(feature.id)}
          >
            <div className="flex items-start">
              <div className={featureIconBadge}>
                {feature.icon}
              </div>
              <div>
                <h3 className={`${featureTitleBase} ${activeFeature === feature.id ? 'text-emerald-400' : 'text-white'}`}>
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Showcase - Terminal-like display */}
      <motion.div
        className={terminalPanelClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        key={activeFeature}
      >
        {/* Terminal header */}
        <div className={terminalHeaderClass}>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70"></div>
            </div>
            <span className="ml-2 text-xs font-mono text-gray-400">bitcode@feature:~/{activeFeature}</span>
          </div>
        </div>
        <div className="flex flex-col desktop:flex-row">
          {/* Feature Image */}
          <div className={paneLeftClass}>
            <div className={imageFrameClass}>
              <Image
                src={features.find(f => f.id === activeFeature)?.image || '/placeholder.png'}
                alt={features.find(f => f.id === activeFeature)?.title || 'Feature'}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030816]/90 via-transparent to-transparent"></div>

              {/* Terminal-like overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 font-mono text-xs text-emerald-400">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">$</span>
                  <span>bitcode.feature.load("<span className="text-emerald-400">{activeFeature}</span>")</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Details */}
          <div className={paneRightClass}>
            <h3 className="text-base font-medium mb-2 text-emerald-400 font-mono">
              {features.find(f => f.id === activeFeature)?.title}
            </h3>

            <p className="text-sm text-gray-300 mb-4 font-mono leading-relaxed">
              {features.find(f => f.id === activeFeature)?.description}
            </p>

            {/* Feature-specific content */}
            {activeFeature === 'github-integration' && (
              <div className="space-y-3">
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">Easy Setup</h4>
                  <p className="text-xs text-gray-400">
                    Install the Bitcode GitHub App, connect your repositories, and start assigning tasks to Bitcode with simple labels or mentions.
                  </p>
                </div>
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">PR-backed AssetPacks</h4>
                  <p className="text-xs text-gray-400">
                    Receive pull requests with code changes, proof receipts, and AssetPack evidence attached to the branch.
                  </p>
                </div>
              </div>
            )}

            {activeFeature === 'measurement-evidence' && (
              <div className="space-y-3">
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">Measured Read</h4>
                  <p className="text-xs text-gray-400">
                    Bitcode synthesizes a reviewable Read from repository evidence before any Finding Fits or AssetPack settlement begins.
                  </p>
                </div>
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">Proof-Carrying Inputs</h4>
                  <p className="text-xs text-gray-400">
                    Static and inferred measurement receipts make the Read inspectable before Bitcode accepts it for source-to-shares settlement.
                  </p>
                </div>
              </div>
            )}

            {activeFeature === 'rich-context' && (
              <div className="space-y-3">
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">Comprehensive Analysis</h4>
                  <p className="text-xs text-gray-400">
                    Bitcode analyzes your entire codebase, understanding architecture, patterns, and dependencies to deliver contextually appropriate solutions.
                  </p>
                </div>
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">Integration Knowledge</h4>
                  <p className="text-xs text-gray-400">
                    Connect with Notion, Figma, and other tools to incorporate design documents, specifications, and project management information.
                  </p>
                </div>
              </div>
            )}

            {activeFeature === 'attachments' && (
              <div className="space-y-3">
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">File Attachments</h4>
                  <p className="text-xs text-gray-400">
                    Upload design files, PDFs, images, and other documents to provide additional context for your engineering tasks.
                  </p>
                </div>
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">URL References</h4>
                  <p className="text-xs text-gray-400">
                    Share links to documentation, articles, or other resources that Bitcode should consider when working on your task.
                  </p>
                </div>
              </div>
            )}

            {activeFeature === 'web-research' && (
              <div className="space-y-3">
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">Advanced Search</h4>
                  <p className="text-xs text-gray-400">
                    Bitcode uses Perplexity and Exa to perform deep, contextual searches across the web, finding relevant information for your engineering tasks.
                  </p>
                </div>
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">Knowledge Integration</h4>
                  <p className="text-xs text-gray-400">
                    Research findings are seamlessly integrated into the solution, ensuring your code leverages the latest best practices and techniques.
                  </p>
                </div>
              </div>
            )}

            {activeFeature === 'model-config' && (
              <div className="space-y-3">
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">Granular Control</h4>
                  <p className="text-xs text-gray-400">
                    Configure all ~200 model calls with precise control over reasoning, judgment, structured output, planning, and code writing parameters.
                  </p>
                </div>
                <div className={infoCardClass}>
                  <h4 className="text-xs font-medium mb-1 text-emerald-400 font-mono">Model Selection</h4>
                  <p className="text-xs text-gray-400">
                    Choose from the latest foundation models and optimize settings for your specific engineering reads and quality requirements.
                  </p>
                </div>
              </div>
            )}

            {/* Terminal footer with blinking cursor */}
            <div className="mt-4 flex items-center">
              <span className="text-gray-500 mr-1.5">$</span>
              <span className="h-4 w-2 bg-emerald-400 animate-pulse"></span>
            </div>
          </div>
        </div>
      </motion.div>
    </MarketingSectionWrapper>
  );
};

export default MarketingFeaturesGrid;
