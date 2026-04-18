'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, Sparkles, AlertCircle, Globe } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
        router.push('/');
        router.refresh();
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
      {/* Decorative Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[420px] relative z-10 scale-[0.95] md:scale-100">
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-3xl border border-[rgba(255,255,255,0.08)] rounded-[32px] p-8 shadow-2xl">
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-2xl flex items-center justify-center shadow-xl shadow-[#6366f130] mb-4">
              <Sparkles size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text-main)]">AcademyAI</h1>
            <p className="text-[var(--text-muted)] mt-1 font-medium uppercase tracking-widest text-[9px]">Portal Access</p>
          </div>

          {/* Social Login */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full mb-4 py-3.5 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all shadow-lg active:scale-95 text-sm"
          >
            <Globe size={18} className="text-blue-500" />
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-grow h-[1px] bg-[rgba(255,255,255,0.08)]"></div>
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Or Use Credentials</span>
            <div className="flex-grow h-[1px] bg-[rgba(255,255,255,0.08)]"></div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-100 text-sm">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[#6366f1] transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Moodle username"
                  className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl py-4 pl-12 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[#6366f150] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[#6366f1] transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl py-4 pl-12 pr-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-[#6366f150] transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-2xl font-bold shadow-lg shadow-[#6366f130] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? "Authenticating..." : (
                <>Sign In Securely <ArrowRight size={20} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
