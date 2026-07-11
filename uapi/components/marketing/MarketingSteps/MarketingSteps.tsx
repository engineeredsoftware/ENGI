import { cn } from '@bitcode/styling'
import React from 'react'

const steps = [
  { name: 'create your account', href: '#', status: 'complete' },
  { name: 'subscribe to bitcode', href: '#', status: 'current' },
  { name: 'install the app', href: '#', status: 'upcoming' },
]

export default function MarketingSteps({ className }: any) {
  return (
    <nav className={cn("flex flex-col items-center justify-center", className)} aria-label="Progress">
      <ol role="list" className="mb-4 flex items-center space-x-5">
        {steps.map((step, index) => (
          <li key={step.name}>
            {step.status === 'complete' ? (
              <a href={step.href} className="block h-2 w-2 rounded-full bg-green-primary hover:bg-green-primary">
                <span className="sr-only">{step.name}</span>
              </a>
            ) : step.status === 'current' ? (
              <a href={step.href} className="relative flex items-center justify-center" aria-current="step">
                <span className="absolute flex h-7 w-7 p-px" aria-hidden="true">
                  <span className="h-full w-full rounded-full bg-green-primary bg-opacity-80 shadow-[0_0_4px_2px_#91fbbc]" />
                </span>
                <span className={cn("flex items-center justify-center text-xs font-black text-transparent text-center relative block h-5 w-5 rounded-full bg-green-primary bg-opacity-90")} aria-hidden="true">
                    {index + 1}
                </span>
                <span className="sr-only">{step.name}</span>
              </a>
            ) : (
              <a href={step.href} className="block h-2.5 w-2.5 rounded-full bg-white bg-opacity-20 hover:bg-gray-400">
                <span className="sr-only">{step.name}</span>
              </a>
            )}
          </li>
        ))}
      </ol>
      <p className="font-thin tracking-wider">
        {steps.find((step) => step.status === 'current')?.name}
      </p>
    </nav>
  )
}
