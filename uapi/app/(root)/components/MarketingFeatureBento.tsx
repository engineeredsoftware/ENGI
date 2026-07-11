'use client';

/* eslint-disable react/no-multi-comp */
import { Button } from "@/components/shadcn/button";
import { cn } from '@bitcode/styling';
import { ReactNode } from "react";
import { ScaleIcon } from '@heroicons/react/24/outline'
import { RichContextBeams } from "./rich-context-beams";
import { Calendar } from "@/components/shadcn/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/command";
import Globe from "@/components/bitcode/magicui/globe";
import Marquee from "@/components/bitcode/magicui/marquee";
import {
  MixIcon,
  RocketIcon,
  CodeIcon,
  ArrowRightIcon,
  MixerHorizontalIcon
} from "@radix-ui/react-icons";
import Image from "next/image";
import ModelOptions from "./model-options";
import AnimatingTypeCommands from "./animating-typing-commands";
import AnimatingTypingCommands from "./animating-typing-commands";
// Drop heavy react-icons; use Radix MixIcon as the default for robot symbol.
// Reuse `MixIcon` as our robot symbol to keep the bundle small while preserving
// the component prop shape.
const RiRobot2Line = MixIcon;
import { useRouter } from "next/navigation";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-[0.75rem]",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
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
}) => {
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

export { BentoCard, BentoGrid };

const features = [
  {
    Icon: RiRobot2Line,
    name: "Powerful AssetPack Workflows",
    description: (
      <span className="">
        PR-backed AssetPacks delivered cheap and fast through a simple Bitcode interface
      </span>
    ),
    href: "/",
    cta: "A low real and opportunity cost technical resource",
    //cta: "Crush your backlog with a easily scalable technical resource",
    className: "col-span-3 desktop:col-span-2",
    background: (
      //<Command className="absolute right-10 top-10 w-[70%] origin-top translate-x-0 border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:-translate-x-10">
      <div>
        <Image
          alt="gh-pr"
          src="/gh-pr-3.png"
          width={575}
          height={575}
          className="absolute left-24 top-6 origin-top rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent,#000_80%)] group-hover:scale-110"
        />
        <Image
          alt="gh-pr"
          src="/working-on-implementing.png"
          width={575}
          height={575}
          className="absolute -right-48 tablet:-right-52 bottom-36 tablet:bottom-28 origin-top rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent,#000_50%)] group-hover:-translate-x-2"
        />

        <span
          className="absolute z-50 right-28 tablet:right-3 bottom-10 tablet:bottom-3 border h-min origin-top rounded-sm p-2 text-right flex flex-col font-light border-green-primary border-opacity-15 gap-y-2 bg-green-primary bg-opacity-0 shadow-[inset_0_0_30px_5px_#91fbbc33] text-slate-300 tracking-wide invisible desktop:visible"
        >
          <span className="absolute right-0.5 -top-2.5 text-bold text-xs text-slate-300">
            Easy as
          </span>
          <span className="flex flex-row gap-x-2 items-center justify-end leading-none">
            <span className="text-md font-light">Register, Subscribe, Install</span>
            <span className="font-light text-green-primary text-md mr-0.5">1</span>
          </span>
          <span className="flex flex-row gap-x-2 items-center justify-end leading-none">
            <span className="text-md font-light">Label, Tag, Assign '<span className="font-light text-green-primary">bitcode</span>'</span>
            <span className="font-light text-green-primary text-md">2</span>
          </span>
          <span className="flex flex-row gap-x-2 items-center justify-end leading-none">
            <span className="text-md font-light">Get PRs, Reviews, Comments</span>
            <span className="font-light text-green-primary text-md">3</span>
          </span>
        </span>
      </div>
    ),
  },
  {
    Icon: MixIcon,
    name: "Practically Tooled",
    description: "Researches the problem, designs solutions, writes code, runs validations, and more to be useful",
    href: "/",
    cta: "Scales 1:1 with issues and imagination",
    className: "col-span-3 desktop:col-span-1",
    background: (
      <div
        className="absolute w-full -right-6 top-1 origin-top transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent,#000_100%)] group-hover:scale-105"
      >
        <AnimatingTypingCommands />
      </div>
    )
  },
  {
    Icon: CodeIcon,
    name: "Total Context",
    description: "Comprehends code, architecture, designs, documention, program outputs, repo activity, and more",
    href: "/",
    cta: "Ingestion from GitHub, Notion, and Figma",
    className: "col-span-3 desktop:col-span-1",
    background: (
      <div
        className="absolute w-full right-0 -top-2 origin-top transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent,#000_60%)] group-hover:scale-105"
      >
        <RichContextBeams />
      </div>
    ),
  },
  {
    Icon: MixerHorizontalIcon,
    name: "Extensive Customization",
    description: (
      <span>
        Configure the foundational LLM, set system prompts, and add new tools
      </span>
    ),
    className: "col-span-3 desktop:col-span-1",
    href: "/",
    cta: "Leverage the latest models and optimize",
    background: (

      <div
        className="absolute w-full -right-6 top-1 origin-top transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent,#000_100%)] group-hover:scale-105"
      >
        <ModelOptions />
      </div>
    ),
  },
  {
    Icon: ({ className = "", ...props }: { className?: string }) => (
      <ScaleIcon className={"!text-green-primary " + className} {...props} />
    ),
    name: (<span className="text-green-primary">$BTD-Data Marketplace</span>),
    description: (
      <>
        <span className="text-neutral-200">Technical assets are measured, priced, and exchanged as source-backed Bitcode shares</span>
      </>
    ),
    special: true,
    className: "col-span-3 desktop:col-span-1",
    //href: "/market",
    href: "/",
    cta: "Document your Bitcode, earn source shares",
    //disabled: true,
    background: (
      <Image
        alt="bounty"
        src="/bounty.png"
        width={400}
        height={200}
        className="absolute left-10 right-0 top-6 origin-top rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
];

export function BentoDemo() {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        // @ts-ignore
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}
