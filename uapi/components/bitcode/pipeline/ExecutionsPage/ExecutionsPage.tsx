"use client";
// Route-level page component for /executions
// Unifies Shippables and evidence-document flows behind a single execution experience.

import React, { Suspense } from 'react';
import { ExecutionsClient } from '@/components/bitcode/pipeline/ExecutionsPageClient/ExecutionsPageClient';

export default function ExecutionsPage() {
  return (
    <div className="px-4 tablet:px-6 desktop:px-8">
      <Suspense fallback={null}>
        <ExecutionsClient />
      </Suspense>
    </div>
  );
}
