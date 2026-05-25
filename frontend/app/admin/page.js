'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const AdminConsole = dynamic(() => import('./AdminConsole'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  ),
});

export default function AdminPage() {
  return <AdminConsole />;
}
