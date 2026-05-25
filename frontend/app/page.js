'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function roleHome(role) {
  if (role === 'admin') return '/admin';
  if (role === 'teacher' || role === 'editingteacher') return '/teacher';
  return '/student';
}

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated') {
      router.replace(roleHome(session.user.role));
    } else {
      router.replace('/login');
    }
  }, [status, session, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">Loading…</p>
      </div>
    </div>
  );
}
