import { cn } from '@bitcode/styling'
import React from 'react'

export default function Pill({ className = "", children }: any) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset bg-opacity-50", className)}>
      {children}
    </span>
  )
}
