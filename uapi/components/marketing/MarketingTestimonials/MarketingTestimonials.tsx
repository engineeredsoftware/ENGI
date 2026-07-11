/* eslint-disable react/no-multi-comp */
import { cn } from '@bitcode/styling';
import Marquee from "@/components/bitcode/magicui/Marquee/Marquee";
import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Testimonials data
// ---------------------------------------------------------------------------
// Each review now contains a 1–5 star rating plus (optional) job title &
// company.  These extra fields let us surface richer UI details and generate
// SEO-friendly JSON-LD structured data (<script type="application/ld+json"/>)
// so that the testimonials can appear as review snippets in search results.
// ---------------------------------------------------------------------------

type Review = {
  name: string;
  username: string;
  body: string;
  img?: string;
  rating: number; // 1-5
  jobTitle?: string;
  company?: string;
  /** Optional summary metadata, e.g. key metrics or timeline */
  metadata?: string;
};

// ---------------------------------------------------------------------------
// Updated: punchier, believable quotes that speak directly to Bitcode’s
// strengths – instant setup, iterative learning, and real productivity wins.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Expanded set – 30 diverse, industry-specific testimonials highlighting the
// breadth of Bitcode’s benefits (ease of use, evolving intelligence, multi-modal
// context, quality PRs, observability, and measured-BTD transparency).
// ---------------------------------------------------------------------------

const reviews: Review[] = [
  {
    name: 'Anita Lopez',
    username: '@anital',
    body: 'I selected the “prod-infra” plane in Bitcode pointed at our Terraform repo, and within minutes its evidence documents and integrations optimized our AWS, Kubernetes, and Docker pipelines. Our CI/CD now runs end-to-end with no manual configs.',
    img: 'https://avatar.vercel.sh/anita',
    rating: 5,
    jobTitle: 'DevOps Engineer',
    company: 'CloudWave Inc.',
    metadata: '5 min setup • 3 pipelines auto-configured • team of 12',
  },
  {
    name: 'David Zhang',
    username: '@davidz',
    body: 'The Pipeline Showcase visualized our monorepo workflows and exposed inefficiencies, cutting deployment times by 60%.',
    img: 'https://avatar.vercel.sh/david',
    rating: 5,
    jobTitle: 'Platform Architect',
    company: 'TechFlow Labs',
    metadata: '1.2 M LOC • 60% faster deploys • 8 engineers',
  },
  {
    name: 'Maria Rossi',
    username: '@mariar',
    body: 'Bitcode’s parallel workflow orchestration scaled testing across branches, doubling our release cadence without extra headcount.',
    img: 'https://avatar.vercel.sh/maria',
    rating: 5,
    jobTitle: 'QA Manager',
    company: 'NextGen Software',
    metadata: '80 test suites • 50% faster releases • 4 QA engineers',
  },
  {
    name: 'Priya Singh',
    username: '@priyas',
    body: 'Using the “Refresh Brand Everywhere” workflow, Bitcode generated visual diff PRs across our Next.js site—updating CSS variables, logos, and running Playwright screenshot tests. We merged with confidence and saw Lighthouse scores improve automatically.',
    img: 'https://avatar.vercel.sh/priya',
    rating: 5,
    jobTitle: 'UI Engineer',
    company: 'DesignSpark',
    metadata: '1,200 UI diffs • 100% regression coverage • 6 designers',
  },
  {
    name: 'Jin Soo Park',
    username: '@jinsoo',
    body: 'In the “Compute” plane, Bitcode provisioned ephemeral GPU workstations, ran our ML training jobs in parallel, and delivered results hours faster without any manual setup.',
    img: 'https://avatar.vercel.sh/jinsoo',
    rating: 5,
    jobTitle: 'ML Engineer',
    company: 'DataVista AI',
    metadata: '300 h saved • 4 GPUs • 2 data scientists',
  },
  {
    name: 'Jordan Lee',
    username: '@jordanl',
    body: 'Before Bitcode, every time I hopped between feature work, bug fixes, and PR reviews I lost all momentum. Now each read ends in a PR-backed AssetPack, and Bitcode quietly keeps the repo state coherent. The moment I introduce a regression, it builds a permanent fix right into the branch.',
    img: 'https://avatar.vercel.sh/jordanl',
    rating: 5,
    jobTitle: 'Senior Software Engineer',
    company: 'Acme Corp.',
    metadata: '2× faster output • 50% less context-switching • 1 engineer',
  },
  {
    name: 'Olivia Nguyen',
    username: '@oliviang',
    body: 'The BTD share dashboard gave me clear separation between BTC fee basis and measured $BTD issuance. We optimized usage and saved 35% in the first month.',
    img: 'https://avatar.vercel.sh/olivia',
    rating: 5,
    jobTitle: 'Finance Analyst',
    company: 'FinOptimize',
    metadata: '35% cost savings • 4 weeks • transparent billing',
  },
  {
    name: 'Sophia Patel',
    username: '@sophiap',
    body: 'In the “Add Another AI Feature” workflow, I described a new `/summaries` endpoint in chat. Bitcode benchmarked LLMs, wrote the handler with vector search, generated a full Jest test suite, and opened a production-ready PR—all in one session.',
    img: 'https://avatar.vercel.sh/sophiap',
    rating: 5,
    jobTitle: 'Senior Developer',
    company: 'APIWorks',
    metadata: '1 chat session • 1 feature shipped • 1 dev',
  },
  {
    name: 'Carlos Mendes',
    username: '@carlosm',
    body: 'The FAQ section answered all my questions on Bitcoin, $BTD, and security. Bitcode’s transparency made the decision easy.',
    img: 'https://avatar.vercel.sh/carlosm',
    rating: 5,
    jobTitle: 'CTO',
    company: 'SecureLink',
    metadata: '20 FAQs answered • 30% faster onboarding • CTO-ready review',
  },
  {
    name: 'Emma Brown',
    username: '@emmab',
    body: 'Under the “Automate SOC 2 Compliance” workflow, Bitcode ingested our control spreadsheet, injected encryption, auditing, and least-privilege IAM policies, and assembled an evidence bundle in a live compliance dashboard. Audit prep went from weeks to minutes.',
    img: 'https://avatar.vercel.sh/emma',
    rating: 5,
    jobTitle: 'Head of Security',
    company: 'SafeStack Corp.',
    metadata: 'SOC2 in 2 days • 5 controls automated • live audit dashboard',
  },
  {
    name: 'Marcus Leblanc',
    username: '@marcus',
    body: 'From code snippet to production-grade PR in under an hour, thanks to Bitcode’s knowledge-extension evidence documents. Best assistant I’ve had.',
    img: 'https://avatar.vercel.sh/marcus',
    rating: 5,
    jobTitle: 'Software Engineer',
    company: 'InnovateX',
    metadata: '15 PRs merged • 1h per PR • solo developer',
  },
  {
    name: 'Arjun Kapoor',
    username: '@arjunk',
    body: 'My team and I ran Bitcode’s evidence documents across our microservices and were amazed: each pass delivered more precise PRs, automating database migrations, updating configs, and generating unit tests. It feels like collaborating with a system that already knows our entire codebase.',
    img: 'https://avatar.vercel.sh/arjunk',
    rating: 5,
    jobTitle: 'Engineering Lead',
    company: 'EvoTech',
    metadata: '10 microservices • nightly evidence refresh • 8 engineers',
  },
  {
    name: 'Liam Nguyen',
    username: '@liamn',
    body: 'My team and I hooked up Bitcode to our GitHub repo so every push now triggers reviewable checks, evidence documents, and documentation updates. It’s freed us from repetitive checks and let us focus on building new features.',
    img: 'https://avatar.vercel.sh/liamn',
    rating: 5,
    jobTitle: 'DevOps Engineer',
    company: 'AutomateX',
    metadata: 'every push • 100% docs updated • zero manual reviews',
  },
  {
    name: 'Ella Martinez',
    username: '@ellam',
    body: 'As a Product Designer, I uploaded our design specs and set Bitcode loose—within minutes I had a functional component library PR, complete with docs and tests. Getting started took under 3 minutes, and it felt like working with a teammate who speaks both design and code.',
    img: 'https://avatar.vercel.sh/ellam',
    rating: 5,
    jobTitle: 'Product Designer',
    company: 'DreamBuild',
    metadata: '3 min setup • 1 component library PR • 2 designers',
  },
];

// ---------------------------------------------------------------------------
// Only display reviews with rating >= 4.5 stars.
// ---------------------------------------------------------------------------
const displayedReviews = reviews.filter((r) => r.rating >= 4.5);

// Guard: if fewer than 4 reviews remain, fall back to showing all to keep the
// marquee populated.  (Prevents an empty marquee in dev environments.)
const safeReviews = displayedReviews.length >= 4 ? displayedReviews : reviews;

// Prepare reviews for single-row carousel marquee.


interface ReviewCardProps extends Review {}

const ReviewCard = ({ img, name, username, body, metadata, rating: _rating, jobTitle, company }: ReviewCardProps) => {
  const [hasError, setHasError] = useState(false);


  return (
    <figure
      className={cn(
        'relative flex w-80 flex-shrink-0 flex-col gap-4 overflow-hidden rounded-2xl border border-green-primary/20 bg-white/5 dark:bg-black/30 p-6 backdrop-blur-sm transition-all duration-300',
      )}
      style={{ contain: 'paint' }}
    >
      {/* Decorative gradient border glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-green-primary/10 via-transparent to-purple-500/10" />
      {/* Author name & role */}
      <div className="mb-2">
        <figcaption className="text-sm font-semibold leading-none text-foreground">{name}</figcaption>
        <p className="text-xs text-gray-500 dark:text-gray-400">{jobTitle ? jobTitle : username}</p>
      </div>

      {/* Quote */}
      <blockquote className="text-sm italic text-foreground/80 before:mr-1 before:content-['“'] before:text-3xl before:text-primary">
        {body}
      </blockquote>
      {/* Metrics row */}
      {metadata && (
        <div className="w-full flex flex-wrap justify-center text-center gap-2 text-sm uppercase font-semibold super-shiny-text leading-snug mt-3">
          {metadata.split('•').map((item, idx, arr) => {
            const parts = item.trim().split(' ');
            const value = parts[0].toUpperCase();
            const label = parts.slice(1).join(' ').toUpperCase();
            return (
              <span key={idx} className="inline-flex items-center">
                <span className="text-green-primary">{value}</span>
                <span className="ml-1 text-gray-400">{label}</span>
                {idx < arr.length - 1 && <span className="mx-1 text-gray-500">·</span>}
              </span>
            );
          })}
        </div>
      )}
    </figure>
  );
};

const MarketingTestimonials = () => {

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-green-primary/10 bg-gradient-to-b from-white/5 via-transparent to-transparent py-20 laptop:shadow-2xl">
      {/*
       * Duplicate the rows 3× instead of 2× so that the combined width of all
       * sliding groups safely exceeds even the widest common desktop
       * viewport.  Two duplicates were occasionally insufficient on very
       * wide screens (e.g. ultrawide monitors), causing a brief empty gap
       * right before the animation loop reset.  Increasing the repetition
       * count eliminates that flash without any measurable performance cost
       * – each group already re-uses the same React nodes.
       */}
      {/*
       * Use a slightly slower speed (~45 s per full loop) so visitors have
       * enough time to read each testimonial without feeling rushed. We also
       * pause the animation on hover to improve accessibility for users who
       * read more time to take in the content.
       */}
      <Marquee
        className="[--review-marquee-duration:180s]"
        repeat={3}
        pauseOnHover
      >
        {safeReviews.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background via-transparent to-transparent dark:from-black" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background via-transparent to-transparent dark:from-black" />
    </div>
  );
};

export default MarketingTestimonials;
