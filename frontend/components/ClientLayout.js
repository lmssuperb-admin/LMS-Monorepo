'use client';
import { ThemeProvider } from '../lib/ThemeContext';
import { SessionProvider, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './Navbar';
import {
  LayoutGrid,
  BookOpen,
  Brain,
} from 'lucide-react';

export default function ClientLayout({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AppShell>{children}</AppShell>
      </ThemeProvider>
    </SessionProvider>
  );
}

function AppShell({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    const token = session?.user?.moodleToken;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('moodle_token', token);
    }
  }, [session?.user?.moodleToken]);

  const isLoginPage = pathname === '/login';
  const isCodeEditor = pathname?.startsWith('/code_editor');
  const isNestedCourse = pathname?.startsWith('/courses/') && pathname !== '/courses';
  const isAdmin = pathname?.startsWith('/admin');
  const isAuthLanding = pathname === '/' && status === 'unauthenticated';

  // Top bar: hidden only on login, course player, and code editor (same as before)
  const hideNavbar = isLoginPage || isAuthLanding || isCodeEditor || isNestedCourse;
  // Bottom command bar: also hidden on admin (admin uses its own sidebar)
  const hideCommandBar = hideNavbar || isAdmin;

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Navbar />}

      <main
        key={pathname}
        className={`flex-grow animate-in fade-in duration-500 fill-mode-both ${!hideCommandBar ? 'pb-32' : ''}`}
      >
        {children}
      </main>

      {!hideCommandBar && <CommandBar />}
    </div>
  );
}

function CommandBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || 'student';

  const homeHref =
    role === 'admin' ? '/admin' : role === 'teacher' || role === 'editingteacher' ? '/teacher' : '/student';

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-surface/10 backdrop-blur-3xl border border-glass-border rounded-[32px] px-8 py-3.5 flex items-center gap-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <NavButton
          active={[homeHref, '/student', '/teacher', '/admin'].includes(pathname)}
          onClick={() => router.push(homeHref)}
          icon={<LayoutGrid size={22} />}
          label="Home"
        />
        <NavButton
          active={pathname.startsWith('/courses')}
          onClick={() => router.push('/courses')}
          icon={<BookOpen size={22} />}
          label="Courses"
        />
        <NavButton
          active={pathname.startsWith('/code_editor')}
          onClick={() => router.push('/code_editor')}
          icon={<Brain size={22} className="text-primary" />}
          label="Editor"
        />
      </div>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 group ${active ? 'px-4' : 'px-2'}`}
    >
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          active
            ? 'bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white scale-110 shadow-xl shadow-primary/30'
            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-[9px] font-[900] uppercase tracking-[0.25em] transition-all duration-300 ${
          active ? 'text-primary scale-105 opacity-100' : 'text-[var(--text-muted)] opacity-40 overflow-hidden w-0 group-hover:w-auto group-hover:opacity-80 transition-all'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
