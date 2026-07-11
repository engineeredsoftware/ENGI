// Server component wrapper for the largely static Evidence Documents & Integrations
// section.  The animated canvas background is lazy-loaded on the client so no
// extra JS ships for the static markup.

"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Particle network background visualization
const AgentNetwork = dynamic(() => import('./MarketingAgentNetworkVisualization'), {
  ssr: false,
  loading: () => null,
});
import { ArrowPathIcon, SparklesIcon, CloudArrowUpIcon, ComputerDesktopIcon, KeyIcon, CodeBracketIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import {
  SiAmazon, SiVercel, SiFirebase, SiGithub, SiDocker, SiKubernetes, SiCircleci, SiJenkins, SiNetlify,
  SiGooglecloud, SiHeroku, SiDigitalocean, SiTerraform, SiEslint, SiPrettier, SiSentry, SiDatadog,
  SiPostman, SiSlack, SiPagerduty, SiNewrelic, SiGrafana, SiPrometheus, SiMongodb, SiRedis,
  SiAlgolia, SiArgo, SiFlux, SiOpenai
} from 'react-icons/si';

// Card for feature highlight
type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
};

function FeatureCard({ icon, title, children, className = '' }: FeatureCardProps) {
  return (
    <div className={`flex items-start p-4 tablet:p-5 laptop:p-6 bg-black/20 backdrop-blur-md rounded-xl ${className}`}>
      <div className="mr-4 p-2 tablet:p-3 bg-white/20 rounded-md">
        {icon}
      </div>
      <div>
        <h4 className="text-base tablet:text-lg font-semibold text-white mb-2">{title}</h4>
        <p className="text-sm tablet:text-base text-gray-200 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
// Card for individual setup steps (vertical layout)
function StepCard({ icon, title, children, className = '' }: FeatureCardProps) {
  return (
    <div className={`flex items-start p-4 tablet:p-5 laptop:p-6 bg-black/20 backdrop-blur-md rounded-xl ${className}`}>
      <div className="mr-4 p-2 tablet:p-3 bg-white/20 rounded-md">
        {icon}
      </div>
      <div>
        <h4 className="text-base tablet:text-lg font-semibold text-white mb-2">{title}</h4>
        <p className="text-sm tablet:text-base text-gray-200 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

// Static list of integration icons.
const INTEGRATIONS = [
  { name: 'AWS', Icon: SiAmazon },
  { name: 'Vercel', Icon: SiVercel },
  { name: 'Firebase', Icon: SiFirebase },
  { name: 'GitHub', Icon: SiGithub },
  { name: 'Docker', Icon: SiDocker },
  { name: 'Kubernetes', Icon: SiKubernetes },
  { name: 'CircleCI', Icon: SiCircleci },
  { name: 'Jenkins', Icon: SiJenkins },
  { name: 'Netlify', Icon: SiNetlify },
  { name: 'GCP', Icon: SiGooglecloud },
  { name: 'Heroku', Icon: SiHeroku },
  { name: 'DigitalOcean', Icon: SiDigitalocean },
  { name: 'Terraform', Icon: SiTerraform },
  { name: 'ESLint', Icon: SiEslint },
  { name: 'Prettier', Icon: SiPrettier },
  { name: 'Sentry', Icon: SiSentry },
  { name: 'Datadog', Icon: SiDatadog },
  { name: 'Postman', Icon: SiPostman },
  { name: 'Slack', Icon: SiSlack },
  { name: 'PagerDuty', Icon: SiPagerduty },
  { name: 'NewRelic', Icon: SiNewrelic },
  { name: 'Prometheus', Icon: SiPrometheus },
  { name: 'Grafana', Icon: SiGrafana },
  { name: 'MongoDB', Icon: SiMongodb },
  { name: 'Redis', Icon: SiRedis },
  { name: 'Algolia', Icon: SiAlgolia },
  { name: 'Argo', Icon: SiArgo },
  { name: 'Flux', Icon: SiFlux },
  { name: 'OpenAI', Icon: SiOpenai },
] as const;

type CloudItem = {
  name: string;
  Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; title?: string }>;
  style: React.CSSProperties;
};

function generateCloudItems(): CloudItem[] {
  const total = INTEGRATIONS.length;
  const innerCount = Math.floor(total / 2);

  return INTEGRATIONS.map(({ name, Icon }, idx) => {
    const ringIndex = idx < innerCount ? idx : idx - innerCount;
    const ringSize = idx < innerCount ? innerCount : total - innerCount;
    const angle = (360 / ringSize) * ringIndex;
    // set radii further out for better coverage
    const radius = idx < innerCount ? 0.5 : 0.9;
    const theta = (angle * Math.PI) / 180;
    const x = 50 + radius * 100 * Math.cos(theta);
    const y = 50 + radius * 100 * Math.sin(theta);
    // random animation timing to add depth
    const scale = Math.random() * 0.7 + 0.8;
    return {
      name,
      Icon,
      style: {
        position: 'absolute',
        top: `${y}%`,
        left: `${x}%`,
        // Center the icon at its coordinate and apply scale via CSS var so it
        // can be referenced inside the keyframes without re-declaring the
        // full transform each tick (avoids compositing jitter).
        '--icon-scale': scale.toString(),
        transform: 'translate(-50%, -50%) scale(var(--icon-scale))',
        color: 'white',
        opacity: idx < innerCount ? 0.3 : 0.1,
        // Icons themselves are static; animation is handled by parent ring.
      } as React.CSSProperties & { '--icon-scale': string },
    };
  });
}

export default function MarketingEvidenceDocumentsConnectsSection() {
  const cloudItems = useMemo(generateCloudItems, []);

  // Pause background icon rotation when the section is off-screen to reclaim
  // GPU time on long pages.  This keeps the animation silky when visible yet
  // completely free when the user scrolls away.
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    // default to active rotation if element not found or IntersectionObserver unsupported
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    // Initial visibility check (rootMargin bottom -200px)
    const { top, bottom } = el.getBoundingClientRect();
    const rootTop = 0;
    const rootBottom = window.innerHeight - 200;
    setInView(bottom > rootTop && top < rootBottom);

    // Observe visibility changes to pause/resume animation
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '0px 0px -200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="evidence-documents-connects"
      className="relative w-full pt-8 tablet:pt-10 laptop:pt-12 desktop:pt-16 pb-8 tablet:pb-10 laptop:pb-12 desktop:pb-16 overflow-visible px-4 tablet:px-6 desktop:px-8 wide:px-12"
      style={{ contain: 'layout style', contentVisibility: 'auto' } as any}
      data-rotate-active={inView}
    >
      {/* Particle background canvas */}
      <AgentNetwork />
      {/* Gradient band */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-700" />
      {/* Subtle dotted grid (dot-line) background */}
      <div
        className="absolute inset-0 z-[-15] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* ------------------------------------------------------------------
           Lightweight icon cloud
           – Split into two rings so we animate just two elements instead of
             every individual icon.
           – Each Icon itself is static; the parent ring rotates continuously.
           – Visually identical yet ~15× cheaper for the compositor.
         ------------------------------------------------------------------ */}
      <div className="absolute inset-0 -z-10 pointer-events-none transform translate-x-16 translate-y-4 scale-200 icon-cloud">
        <div className="absolute inset-0">
          {cloudItems.filter((_, i) => i < Math.floor(cloudItems.length / 2)).map(({ name, Icon, style }, idx) => (
            <Icon
              key={`inner-${idx}`}
              size={32}
              className="absolute text-white opacity-30 animate-rotate-slow"
              style={style}
              title={name}
            />
          ))}
        </div>
        <div className="absolute inset-0">
          {cloudItems.slice(Math.floor(cloudItems.length / 2)).map(({ name, Icon, style }, idx) => (
            <Icon
              key={`outer-${idx}`}
              size={32}
              className="absolute text-white opacity-10 animate-rotate-slow-reverse"
              style={style}
              title={name}
            />
          ))}
        </div>
      </div>
      <div className="relative z-0 mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2
            className="mx-auto max-w-lg laptop:max-w-xl desktop:max-w-2xl text-2xl tablet:text-3xl laptop:text-5xl desktop:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 mb-4 pb-2"
          >
            <span className="block wide:inline">Proactive Preparation,</span>{' '}
            <span className="block wide:inline">Reactive Correction</span>
          </h2>
          <p className="text-sm tablet:text-base laptop:text-lg desktop:text-xl text-gray-200 max-w-2xl mx-auto">
            Bitcode actively develops repository-specific evidence - manual guidance and automatic analysis keep work aligned
          </p>
        </div>
        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-6 tablet:gap-8 laptop:gap-10 desktop:gap-12 wide:gap-16 items-stretch">
          {/* Evidence Documents group */}
          <div className="relative overflow-visible bg-black/20 backdrop-blur-md border border-white/20 rounded-3xl p-6 tablet:p-8 laptop:p-10 shadow-2xl self-start">
            {/* (Decorative pulse canvas removed for performance) */}
            <div className="space-y-6">
              <div className="flex items-center mb-2">
                <SparklesIcon className="h-6 w-6 tablet:h-8 tablet:w-8 laptop:h-10 laptop:w-10 text-purple-400 mr-2 tablet:mr-3" />
                <h3 className="text-2xl tablet:text-3xl laptop:text-4xl desktop:text-5xl font-bold text-white">Bitcode Evidence Documents</h3>
              </div>
              <p className="text-base tablet:text-lg text-gray-200 leading-relaxed max-w-2xl">
                Feedback and freeform knowledge are treated as intensely as AssetPack evidence. Evidence documents improve Bitcode's repository-specific guidance for your software team's needs.
              </p>
              <div className="mt-6 border-t border-white/20 pt-6 space-y-6">
                <FeatureCard className="border-l-4 border-purple-400 pl-4" icon={<SparklesIcon className="h-6 w-6 text-purple-400" />} title="Knowledge Extensions">
                  Bitcode can process critical, internal, and new documentation for deep study, improving interconnected reasoning later.
                </FeatureCard>
                <FeatureCard className="border-l-4 border-pink-400 pl-4" icon={<ArrowPathIcon className="h-6 w-6 text-pink-400" />} title="AssetPack Feedback">
                  Feedback loops from reviews, tests, and operator decisions create a precise learning signal that improves every future AssetPack.
                </FeatureCard>
              </div>
            </div>
          </div>
          {/* MCP Configuration Spotlight */}
          <div className="relative overflow-visible">
            {/* Decorative connecting arc (hidden on small) */}
            <div className="hidden tablet:block absolute left-0 top-1/2 w-full h-px bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 opacity-20 transform -translate-y-1/2" />
            <div className="relative w-full bg-gradient-to-tr from-purple-700/70 via-blue-700/50 to-indigo-800/70 backdrop-blur-lg border border-white/20 rounded-3xl p-6 tablet:p-8 laptop:p-10 shadow-2xl">
              <div className="flex items-center mb-4">
                <CloudArrowUpIcon className="h-6 w-6 tablet:h-8 tablet:w-8 laptop:h-10 laptop:w-10 text-white mr-2 tablet:mr-3" />
                <h3 className="text-2xl tablet:text-3xl laptop:text-4xl desktop:text-5xl font-bold text-white">Interconnectivity</h3>
              </div>
              <p className="text-base tablet:text-lg text-gray-200 leading-relaxed max-w-2xl">
                Bitcode connects directly to the places where work and value flow, fusing tools and trade so every response arrives with live context and clear provenance.
              </p>
              <div className="mt-6 border-t border-white/20 pt-6">
                <div className="space-y-6">
                  <StepCard className="border-l-4 border-green-300 pl-4" icon={<CodeBracketIcon className="h-6 w-6 text-green-300" />} title="Configure Your MCPs">
                    30+ ready-made MCPs link Bitcode to the tools you already use, from repos and CI/CD to chat and analytics, while custom rules tune each connector.
                  </StepCard>
                  <StepCard className="border-l-4 border-blue-300 pl-4" icon={<ClipboardDocumentListIcon className="h-6 w-6 text-blue-300" />} title="Knowledge Procurement & Compensation">
                    Bitcode fetches just the knowledge it needs from code, systems, and services, attributing sources while keeping context fresh, compliant, and fairly valued.
                  </StepCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
