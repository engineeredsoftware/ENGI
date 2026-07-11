"use client";

import React from 'react';
import Testimonials from './MarketingTestimonials';
import Script from 'next/script';
import { TrustedBy } from './MarketingTrustedBy';
import { FEATURE_FLAGS } from '@/config/features';

// ---------------------------------------------------------------------------
// Generate JSON-LD structured data so that review snippets are eligible for
// search-engine rich results.  We intentionally keep the payload small – only
// the fields required by schema.org/Review & AggregateRating.
// ---------------------------------------------------------------------------

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Bitcode testimonials',
  itemListElement: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Jaya Bhatt' },
      reviewBody:
        'Compliance tweaks that used to block two sprints now ship via Bitcode PRs in under an hour.',
      reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 },
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Olivia Chen' },
      reviewBody:
        'Defects per KLOC dropped 38 % after Bitcode measured our codebase through reusable evidence documents.',
      reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 },
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Marcus Leblanc' },
      reviewBody:
        'Solo dev here—Bitcode turns bullet lists into merge-ready PRs while I make coffee.',
      reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5 },
    },
  ],
};

const MarketingTestimonialsSection: React.FC = () => {
  // Feature flag – allow marketing team to hide the entire testimonials block
  // by setting NEXT_PUBLIC_TESTIMONIALS_SECTION=false at build or runtime.
  if (!FEATURE_FLAGS.TESTIMONIALS_SECTION) {
    return null;
  }
  // File-local class constants (SRP/DRY; no visual changes)
  const sectionClass = 'relative w-screen overflow-visible pt-8 tablet:pt-10 laptop:pt-12 desktop:pt-16 pb-8 tablet:pb-10 laptop:pb-12 desktop:pb-16';
  const headingWrapClass = 'mb-12 text-center flex flex-col items-center gap-4';
  const titleClass = 'text-2xl laptop:text-3xl font-bold tracking-tight super-shiny-text';
  const subtitleClass = 'mx-auto max-w-3xl text-base laptop:text-lg text-gray-400';
  const breakoutClass = 'relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen overflow-hidden';

  return (
    <section id="testimonials" className={sectionClass}>
      {/* SEO – structured data */}
      <Script
        id="testimonials-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Heading container limited to site width, but marquee below breaks out */}
      <div className="mx-auto max-w-6xl px-4">
        <div className={headingWrapClass}>
          {/* Section title */}
          <h2 className={titleClass}>
            Hear from Teams Driving Continuous Innovation
          </h2>

          {/* Subtitle */}
          <p className={subtitleClass}>
            Teams of all backgrounds use Bitcode to measure Reads, prepare AssetPacks, and deliver reviewable software changes.
          </p>

          {/* Marquee of company logos – temporarily hidden */}
          <div className="w-full overflow-hidden mt-6 hidden">
            <TrustedBy>
              <h3 className="text-xs tablet:text-sm uppercase tracking-widest text-foreground/60 font-light">
                Trusted By Industry Leaders
              </h3>
            </TrustedBy>
          </div>
        </div>
      </div>

      {/* Break-out marquee spanning full viewport width regardless of ancestor padding */}
      <div className={breakoutClass}>
        <Testimonials />
      </div>
    </section>
  );
};

export default MarketingTestimonialsSection;
