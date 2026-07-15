"use client"

import React, { ReactNode } from 'react'
import ClientLayoutInner from './ClientLayoutInner'
import { QueryProvider } from '@/react-providers/query-provider'

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </QueryProvider>
  )
}
