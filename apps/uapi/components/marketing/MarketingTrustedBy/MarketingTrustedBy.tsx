import LogoMarquee from "@/components/bitcode/magicui/LogoMarquee/LogoMarquee";
import React, { ReactNode } from 'react';

// TODO: magicui only supports a small handful of company logos (they are high quality though). move to more expansive co logo set
const companies = [
  "Google",
  "Microsoft",
  "Netflix",
  "Spotify",
];

interface TrustedByProps {
  children: ReactNode;
}

export function TrustedBy({ children }: TrustedByProps) {
  return (
    <section id="companies" className="w-full max-w-[100vw] overflow-hidden">
      <div className="w-full flex flex-col items-center">
        {/* Label (passed via `children`) */}
        {children && (
          <div className="mb-4 flex items-center justify-center">
            {children}
          </div>
        )}

        <div className="relative w-full py-4">
          <LogoMarquee className="max-w-full [--logo-marquee-duration:40s]">
            {companies.map((logo, idx) => (
              <div
                key={idx}
                className="mx-6 opacity-80 hover:opacity-100 transition-opacity duration-500 ease-out"
              >
                <img
                  src={`https://cdn.magicui.design/companies/${logo}.svg`}
                  className="h-8 w-24 dark:brightness-0 dark:invert filter grayscale hover:grayscale-0 transition-all duration-500"
                  alt={logo}
                  style={{
                    filter: "grayscale(0.8) brightness(0.9)",
                    transition: "all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = "grayscale(0) brightness(1.1)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "grayscale(0.8) brightness(0.9)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
              </div>
            ))}
          </LogoMarquee>
          <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-[180%] w-1/3"
            style={{
              background: 'radial-gradient(ellipse 80% 90% at left, rgba(3,8,22,1) 0%, rgba(3,8,22,0.9) 10%, rgba(3,8,22,0.7) 25%, rgba(3,8,22,0.4) 45%, rgba(3,8,22,0.1) 70%, transparent 100%)'
            }}></div>
          <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[180%] w-1/3"
            style={{
              background: 'radial-gradient(ellipse 80% 90% at right, rgba(3,8,22,1) 0%, rgba(3,8,22,0.9) 10%, rgba(3,8,22,0.7) 25%, rgba(3,8,22,0.4) 45%, rgba(3,8,22,0.1) 70%, transparent 100%)'
            }}></div>
        </div>
      </div>
    </section>
  );
}

export const MarketingTrustedBy = TrustedBy;
