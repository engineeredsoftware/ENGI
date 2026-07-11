import React from 'react';
/* eslint-disable react/no-multi-comp */
import { BoltIcon, WrenchScrewdriverIcon, ChartPieIcon } from '@heroicons/react/20/solid'
import { AnimatedListWork } from './animated-list-of-work'
import Image from 'next/image'
import Pill from './pill'

const features = [
  {
    name: 'Reach Zero Backlog: ',
    description:
      'Bitcode can fix bugs and implement features. It\'s best at the easy stuff like adding documentation and writing tests.',
    icon: BoltIcon,
  },
  {
    name: 'A Configurable Craftsman: ',
    description: 'Steer Bitcode towards speed or quality, or default to balanced, by using adjustable labels.',
    icon: WrenchScrewdriverIcon,
  },
  {
    name: 'Bitcode Ad Infinitum: ',
    description: 'Run many Bitcode workflows and watch them make progress with clear status and reviewable receipts.',
    icon: ChartPieIcon,
  },
]


const FeatureListShots = () => (
  <div className='relative rounded-md overflow-hidden'>
    <div className='desktop:absolute -right-12 overflow-hidden top-6 rounded-md border [mask-image:linear-gradient(to_top_left,transparent,#000_40%)]'>
      <Image src={"/parse-issue-with-comment-from-bitcode.png"} width={500} height={500} alt="Bitcode issue comment workflow" />
    </div>
    <div className='desktop:absolute -right-72 overflow-hidden rounded-md border [mask-image:linear-gradient(to_top_left,transparent,#000_80%)]'>
      <Image src={"/email-notif.jpg"} width={500} height={500} alt={'asd'} />
    </div>
    <div className='desktop:absolute left-2 -top-2.5 z-30 overflow-hidden rounded-lg flex gap-2 items-center justify-center p-4'>
      <Pill className="text-[#e3815a] bg-[#e3815a] ring-[#e3815a]">
        speed
      </Pill>
      <Pill className="text-green-primary bg-green-primary ring-green-primary">
        balanced
      </Pill>
      <Pill className="text-[#ad5ae4] bg-[#ad5ae4] ring-[#ad5ae4]">
        quality
      </Pill>
    </div>
  </div>
)

export default function MarketingFeatureList() {
  return (
    <div className="overflow-hidden">
      <div className="mx-auto max-w-7xl tablet:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 tablet:gap-y-20 desktop:mx-0 desktop:max-w-none desktop:grid-cols-2">
          <div className="desktop:pr-8 desktop:pt-4">
            <div className="desktop:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-green-primary">Seamlessly Integrate</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-neutral-100 tablet:text-4xl">Your Pocket Technical Operator</p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-neutral-200">
                Ask Bitcode to measure Reads, prepare AssetPacks, and coordinate reviewable technical work anytime.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 dark:text-neutral-300 desktop:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900 dark:text-white">
                      <feature.icon className="absolute left-1 top-1 h-5 w-5 text-green-primary" aria-hidden="true" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <FeatureListShots />
        </div>
      </div>
    </div>
  )
}
