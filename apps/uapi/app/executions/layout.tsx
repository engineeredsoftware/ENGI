import type { ReactNode } from 'react';

import ClientLayout from '@/app/ClientLayout';

export default function ExecutionsLayout({ children }: { children: ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
