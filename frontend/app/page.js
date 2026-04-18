'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, Sparkles, AlertCircle, Globe, Loader2 } from 'lucide-react';

export default function RootPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Handle Redirects for Authenticated Users
  useEffect(() => {
    if (status === "authenticated") {
      const role = session.user.role;
      if (role === 'admin') {
        router.push("/admin");
      } else if (role === 'teacher' || role === 'editingteacher') {
        router.push("/teacher");
      } else {
        router.push("/student");
      }
    }
  }, [status, session, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result.error) {
        setError('Invalid Moodle credentials. Please try again.');
      } else {
        router.refresh(); // This will trigger the useEffect redirect
      }
    } catch (err) {
      setError('System authentication error. Please contact admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-[var(--text-main)] mb-2 uppercase tracking-widest">Entering AcademyAI</h2>
            <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Synchronizing Workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
      {/* Decorative Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[420px] relative z-10 scale-[0.95] md:scale-100 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-surface/50 backdrop-blur-3xl border border-glass-border rounded-[32px] p-8 shadow-2xl">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-[20px] flex items-center justify-center shadow-xl shadow-primary/20 mb-6 group hover:rotate-6 transition-transform">
              <Sparkles size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-main tracking-tight italic">Academy<span className="text-primary">AI</span></h1>
            <p className="text-muted mt-2 font-black uppercase tracking-[0.25em] text-[10px] opacity-70">Unified Login System</p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full mb-5 py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-md active:scale-[0.98] text-xs uppercase tracking-wider"
          >
            <Globe size={18} className="text-blue-500" />
            <span>Identity Link Google</span>
          </button>

          <div className="flex items-center gap-4 mb-8 text-muted/30">
            <div className="flex-grow h-px bg-current"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Portal Auth</span>
            <div className="flex-grow h-px bg-current"></div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-100 text-[11px] font-bold">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Moodle Identification"
                  className="w-full bg-background/50 border border-glass-border rounded-2xl py-4.5 pl-12 pr-4 text-xs font-bold text-main focus:outline-none focus:border-primary/50 transition-all placeholder:opacity-30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Encryption Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-background/50 border border-glass-border rounded-2xl py-4.5 pl-12 pr-4 text-xs font-bold text-main focus:outline-none focus:border-primary/50 transition-all placeholder:opacity-30"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 text-xs uppercase tracking-[0.15em] mt-2"
            >
              {loading ? "Decrypting Token..." : (
                <>Establish Session <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
