"use client";
/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';
import MarketingSectionWrapper from "@/components/marketing/MarketingSectionWrapper/MarketingSectionWrapper";

const cardFrameEmerald =
  "relative overflow-hidden rounded-lg border border-emerald-400/20 bg-emerald-500/5 shadow-[0_0_28px_rgba(16,185,129,0.14)]";
const cardFramePurple =
  "relative overflow-hidden rounded-lg border border-purple-400/20 bg-purple-500/5 shadow-[0_0_28px_rgba(168,85,247,0.14)]";


// A wrapper image component showing a pulsing skeleton until the image loads or fails
function SkeletonImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div className="w-full aspect-video bg-gray-700/20 rounded-lg overflow-hidden relative">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse" />
      )}
      {!error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover object-center shadow-2xl transition-transform duration-500 ${loaded ? 'hover:scale-105' : 'hidden'}`}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual helper components
// ---------------------------------------------------------------------------

function DeviceOutlines() {
  const devices = [
    { name: 'Phone', w: 110, h: 200 },
    { name: 'Tablet', w: 150, h: 200 },
    { name: 'Laptop', w: 210, h: 130 },
    { name: 'Widescreen', w: 260, h: 110 },
  ];

  return (
    <div className="flex flex-wrap items-end justify-center gap-3">
      {devices.map((d) => (
        <div key={d.name} className="flex flex-col items-center">
          <div style={{ width: d.w, height: d.h }} className={cardFrameEmerald}>
            <img
              src="/screenshots/sidebar-chats-chatting.png"
              alt={`${d.name} view`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 rounded-lg border border-emerald-400/10 pointer-events-none" />
          </div>
          <div className="mt-2 text-sm text-gray-300">{d.name}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Operator interface preview for small and full screens
// ---------------------------------------------------------------------------
function OperatorDeviceShowcase() {
  const devices = [
    { name: 'Small Screen', src: '/screenshots/conversations-small.png', w: 110, h: 200 },
    { name: 'Full Screen', src: '/screenshots/conversations-fullscreen.png', w: 260, h: 110 },
  ];
  return (
    <div className="flex flex-wrap items-end justify-center gap-3">
      {devices.map((d) => (
        <div key={d.name} className="flex flex-col items-center">
          <div style={{ width: d.w, height: d.h }} className={cardFramePurple}>
            <img
              src={d.src}
              alt={`${d.name} Conversations Interface`}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 rounded-lg border border-purple-400/10 pointer-events-none" />
            {/* Floating text overlay for Operator devices */}
            <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white text-xs px-2 py-1 rounded">
              {d.name === 'Small Screen' ? 'Quick Chat' : 'Batch Edits'}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-300">{d.name}</div>
        </div>
      ))}
    </div>
  );
}

function TerminalCurl() {
  return (
    <div className="w-full max-w-md bg-[#0a132a]/40 border border-gray-400/30 rounded-lg p-6 font-mono text-gray-200 shadow-lg backdrop-blur-sm">
      <pre className="whitespace-pre-wrap text-[12px] leading-relaxed">
        {`curl -X POST https://api.bitcode.ai/v1/mcp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "repo": "acme/widgets",
    "read": "bitcode-deliver-pr",
    "definition_of_read": "refactor utils + docs"
  }'
`}
      </pre>
    </div>
  );
}

export default function MarketingHeadlessMobileShowcase() {
  const sectionTitleClass = 'text-3xl laptop:text-4xl font-bold text-white mb-6 laptop:mb-8 tracking-tight block relative pb-2 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-emerald-400 after:rounded super-shiny-text';
  const sectionSubtitleClass = 'mt-2 text-base laptop:text-lg text-gray-400 max-w-3xl mx-auto';
  return (
    <MarketingSectionWrapper className="overflow-visible">
      <div className="text-center mb-12">
        <h2 className={sectionTitleClass}>
          Interfaces: Headless, Mobile, Operator, Smart Editor, API
        </h2>
        <p className={sectionSubtitleClass}>
          Discover five powerful alternatives to the point-and-click UI: Headless, Mobile, Operator, Smart Editor, and API interfaces for versatile labeling and automation.
        </p>
      </div>
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-12">
        {/* Headless Mode */}
        <div className="flex flex-col items-center text-center">
          <SkeletonImage src="/screenshots/setup-marketplace.png" alt="Headless Mode Integration" />
          <h3 className="mt-4 text-2xl font-semibold text-white">GitHub Triggers</h3>
          <p className="mt-2 text-gray-300 leading-relaxed">
            Add <code>bitcode-deliver-pr</code> to a GitHub Issue or Pull Request to request a PR-backed AssetPack through Finish. Integrate automatically via CI/CD or programmatically via the Bitcode API.
          </p>
        </div>
        {/* Mobile Mode */}
        <div className="flex flex-col items-center text-center">
          <DeviceOutlines />
          <h3 className="mt-4 text-2xl font-semibold text-white">On-the-Go Mobile Responsive</h3>
          <p className="mt-2 text-gray-300 leading-relaxed">
            Phone, Tablet, Laptop, Widescreen
          </p>
        </div>

        {/* Operator Interface */}
        <div className="flex flex-col items-center text-center">
          <OperatorDeviceShowcase />
          <h3 className="mt-4 text-2xl font-semibold text-white">Operator Interface</h3>
          <p className="mt-2 text-gray-300 leading-relaxed">
            A focused Conversations view for power users – optimized for small screens and full-screen monitors alike.
          </p>
        </div>

        {/* API Interface */}
        <div className="flex flex-col items-center text-center">
          <TerminalCurl />
          <h3 className="mt-4 text-2xl font-semibold text-white">MCP API</h3>
          <p className="mt-2 text-gray-300 leading-relaxed">
            Trigger Bitcode from any backend with a single signed curl request.
          </p>
        </div>
      </div>
    </MarketingSectionWrapper>
  );
}
