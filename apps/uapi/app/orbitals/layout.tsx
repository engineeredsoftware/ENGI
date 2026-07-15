import type { ReactNode } from 'react';

import ClientLayout from '@/app/ClientLayout';

export default function OrbitalsLayout({ children }: { children: ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
