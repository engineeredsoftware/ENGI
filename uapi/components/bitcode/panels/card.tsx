'use client';

import { Button } from "@/components/shadcn/button";
import { cn } from '@bitcode/styling';
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function Card({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  disabled,
  special
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
  disabled: boolean;
  special: boolean
}) {
  const router = useRouter()
  return (
    <div
      key={name}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-sm",
        // light styles
        //"bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        //"transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] transition-shadow duration-300 ease-elegant",
        className,
        { "opacity-50": disabled },
        { "hover:dark:[box-shadow:0_-20px_69px_-10px_#91fbbcB0_inset]": special }
      )}
      {...href && { onClick: () => router.push(href) }}
    >
      <div>{background}</div>
      <div className={cn("z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10",
        { "-translate-y-10": disabled }
      )}>
        <Icon className={cn("h-12 w-12 origin-left transform-gpu text-neutral-700 dark:text-neutral-400 transition-all duration-300 ease-in-out group-hover:scale-75", { "scale-75": disabled })} />
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {name}
        </h3>
        <p className="max-w-xs text-neutral-400">{description}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
          { "translate-y-0 opacity-100": disabled }
        )}
      >
        <Button variant="ghost" asChild size="sm" className="pointer-events-none cursor-default">
          <a href={href}>
            {cta}
          </a>
        </Button>
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
    </div>
  )
}
