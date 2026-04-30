'use client';
import { ThemeProvider } from '../lib/ThemeContext';
import { SessionProvider, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from './Navbar';
import {
  LayoutGrid,
  BookOpen,
  Sparkles,
  Users,
  BarChart3,
  Brain,
  Search
} from 'lucide-react';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const hideGlobalUI = isLoginPage;

  return (
    <SessionProvider>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen">
          {!hideGlobalUI && <Navbar />}

          <main className={`flex-grow ${!hideGlobalUI ? 'pb-32' : ''}`}>
            {children}
          </main>

          {!hideGlobalUI && !(pathname?.startsWith('/admin')) && <CommandBar />}
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}

function CommandBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || 'student';

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-surface/10 backdrop-blur-3xl border border-glass-border rounded-[32px] px-8 py-3.5 flex items-center gap-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

        {/* Dashboard Link */}
        <NavButton
          active={['/', '/admin', '/teacher', '/student'].includes(pathname)}
          onClick={() => router.push('/')}
          icon={<LayoutGrid size={22} />}
          label="Home"
        />

        {/* Catalog Link */}
        <NavButton
          active={pathname.startsWith('/courses')}
          onClick={() => router.push('/courses')}
          icon={<BookOpen size={22} />}
          label="Courses"
        />

        {/* Dynamic AI / User Link */}
        {/* {role === 'admin' ? (
            <NavButton 
              active={pathname === '/admin'}
              onClick={() => router.push('/admin')}
              icon={<Users size={22} />} 
              label="Directory" 
            />
          ) : (
            <NavButton 
              active={false}
              onClick={() => router.push(role === 'teacher' ? '/teacher' : '/student')}
              icon={<Sparkles size={22} className="text-[#a855f7]" />} 
              label="AI Tools" 
            />
          )} */}

        {/* Code Editor Link */}
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
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 group ${active ? 'px-4' : 'px-2'
        }`}
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${active
          ? 'bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white scale-110 shadow-xl shadow-primary/30'
          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
        }`}>
        {icon}
      </div>
      <span className={`text-[9px] font-[900] uppercase tracking-[0.25em] transition-all duration-300 ${active ? 'text-primary scale-105 opacity-100' : 'text-[var(--text-muted)] opacity-40 overflow-hidden w-0 group-hover:w-auto group-hover:opacity-80 transition-all'
        }`}>
        {label}
      </span>
    </button>
  );
}
