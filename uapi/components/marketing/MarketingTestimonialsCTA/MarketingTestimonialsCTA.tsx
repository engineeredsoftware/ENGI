
/* eslint-disable react/no-multi-comp */
import { buttonVariants } from "@/components/shadcn/Button/Button";
import { cn } from '@bitcode/styling';
import Marquee from "@/components/bitcode/magicui/Marquee/Marquee";
import { ChevronRight, HeartHandshake } from "lucide-react";
import MarketingButtonShimmer from '@/components/bitcode/effects/ButtonShimmer/ButtonShimmer';
import Logo from "@/components/bitcode/branding/Logo/Logo";
import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@bitcode/supabase/ssr/client';
import type { Session, User } from '@supabase/supabase-js';

const reviews = [
  {
    name: "Alex Martinez",
    username: "@alexm",
    body: "It helps me to make faster progress on complex issues and totally tackles easy ones!",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jordan Kim",
    username: "@jkim",
    body: "Just gave Bitcode 10 issues. Going to bed...",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "Taylor Morgan",
    username: "@tmorgan",
    body: "Let's dream",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Casey Patel",
    username: "@cpatel",
    body: "Bitcode is out and POWERFUL! It's very easy to get setup and does the job. And it's only $5.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Riley Nguyen",
    username: "@rnguyen",
    body: "Really cool to see the refinement. Bitcode is a great GitHub app.",
    img: "https://avatar.vercel.sh/jenny",
  },
  {
    name: "Avery Chen",
    username: "@achen",
    body: "Incredible to see it humming. Great work.",
    img: "https://avatar.vercel.sh/james",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-[2rem] border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function TestimonialsCallToAction() {
  // Supabase client and user state for authentication CTA
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);
  const text = user ? 'Subscribe' : 'Use';
  return (
    <section id="cta">
      <div className="tablet:py-14 ">
        <div className="container flex w-full flex-col items-center justify-center p-0 tablet:p-4">
          <div className="shadow-[0_0_24px_1px_#91fbbc4d] relative flex w-full max-w-[1000px] flex-col items-center justify-center overflow-hidden rounded-[1.125rem] p-10 py-14">
            <div className="absolute rotate-[35deg] ">
              <Marquee pauseOnHover className="[--review-marquee-duration:20s]" repeat={3}>
                {firstRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--review-marquee-duration:20s]"
                repeat={3}
              >
                {secondRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee pauseOnHover className="[--review-marquee-duration:20s]" repeat={3}>
                {firstRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--review-marquee-duration:20s]"
                repeat={3}
              >
                {secondRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee pauseOnHover className="[--review-marquee-duration:20s]" repeat={3}>
                {firstRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--review-marquee-duration:20s]"
                repeat={3}
              >
                {secondRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
            </div>
            <div className="z-10 mx-auto size-24 rounded-[1.125rem] bg-white/10 p-3 shadow-2xl backdrop-blur-sm border border-green-primary dark:bg-black/10 desktop:size-32 invisible absolute laptop:visible laptop:relative">
              <Logo beta={false} height="h-18 desktop:h-26" width="w-18 desktop:w-26" className="-ml-1 flex items-center justify-center w-full h-full" />
            </div>
            <div className="z-10 mt-4 flex flex-col items-center text-center text-black dark:text-white">
              <h1 className="text-3xl font-extrabold desktop:text-4xl tracking-wide" style={{ textShadow: '0 0 20px #91fbbc4D' }}>
                Teams Love Accelerated Development
              </h1>
              <p className="mt-2 text-lg tracking-wide" style={{ textShadow: '0 0 20px #91fbbccc' }}>
                scale your teams' developer firepower <span className="text-green-primary">/</span> ship your next big idea faster
              </p>

              <MarketingButtonShimmer medium={true} className="relative mt-8 bg-green-primary">
                {/* Overlay button to open authentication orbital */}
                <button
                  onClick={() => document.dispatchEvent(new Event('open-auxillaries'))}
                  className="inset-0 z-10 absolute text-transparent"
                >{text}</button>
                <span className="flex items-center">
                  {text}
                  <ChevronRight className="ml-1 size-6 transition-all duration-300 ease-out group-hover:translate-x-1 text-green-primary" />
                </span>
              </MarketingButtonShimmer>
            </div>
            <div className="absolute inset-x-0 -bottom-10 h-full bg-gradient-to-b from-transparent to-white to-100% dark:to-black" />
            <div className="absolute inset-x-0 -bottom-5 h-full bg-gradient-to-b from-transparent to-white to-100% from-70% dark:to-green-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
