'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Clock, 
  ChevronRight,
  Brain,
  CalendarDays,
  ChevronLeft,
  Settings2,
  Users,
  Award,
  GraduationCap,
  TrendingUp,
  Bookmark,
  Plus,
  Star,
  Target,
  ChevronRightSquare,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-10 py-8 min-h-screen bg-[var(--background)] flex flex-col gap-8">
      
      {/* ── DASHBOARD HEADER ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[var(--text-main)]">Dashboard</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-glass-border rounded-xl text-xs font-bold text-[var(--text-muted)] shadow-sm hover:bg-white/5 transition-all">
          <Settings2 size={16} />
          Customize Dashboard
        </button>
      </div>

      {/* ── TOP ROW: ACHIEVEMENTS & CALENDAR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Achievements Widget */}
        <div className="bg-surface rounded-[32px] p-10 border border-glass-border shadow-sm flex flex-col items-center">
          <div className="w-full flex justify-start mb-2">
            <h2 className="text-lg font-black text-[var(--text-main)]">Achievements</h2>
          </div>
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-1 mb-4">
              <div className="w-full h-full rounded-full bg-background/50 flex items-center justify-center overflow-hidden">
                <Users size={64} className="text-[var(--text-muted)] opacity-30" />
              </div>
            </div>
            <h3 className="text-xl font-black text-[var(--text-main)] capitalize">deepak kumar</h3>
            <button className="text-primary text-xs font-bold underline mt-1">View Profile</button>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <StatTile label="Certifications" value="0" icon={<Award size={20} />} />
            <StatTile label="Total Courses" value="1" icon={<GraduationCap size={20} />} />
            <StatTile label="XP Points" value="0" icon={<TrendingUp size={20} />} />
            <StatTile label="Post" value="0" icon={<Bookmark size={20} />} />
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="bg-surface rounded-[32px] p-10 border border-glass-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-black text-[var(--text-main)]">April 2026</h2>
              <div className="flex gap-2">
                <button className="p-1.5 bg-background rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"><ChevronLeft size={18} /></button>
                <button className="p-1.5 bg-background rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"><ChevronRight size={18} /></button>
              </div>
            </div>
            <button className="p-2 bg-background rounded-lg text-[var(--text-main)] hover:bg-white/5 transition-colors"><Plus size={20} /></button>
          </div>
          
          <div className="grid grid-cols-7 text-center mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <span key={day} className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-6 text-center">
            {Array(2).fill(0).map((_, i) => <div key={i}></div>)}
            {Array.from({ length: 30 }, (_, i) => i + 1).map(date => (
              <div key={date} className="flex items-center justify-center">
                <span className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all cursor-pointer
                  ${date === 30 
                    ? 'border-2 border-primary text-primary shadow-lg shadow-primary/10 bg-primary/5' 
                    : 'text-[var(--text-main)] hover:bg-white/5'}`}
                >
                  {date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: LEARNING PATH & LEVEL UP ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        
        {/* Learning Path Widget */}
        <div className="bg-surface rounded-[32px] border border-glass-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-glass-border">
            <h2 className="text-lg font-black text-[var(--text-main)]">Learning Path</h2>
          </div>
          <div className="bg-background/50 px-8 py-4 border-b border-glass-border flex items-center text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            <span className="flex-1">Learning Path Name</span>
            <span className="w-24">Start Date</span>
            <span className="w-24">End Date</span>
            <span className="w-24">Status</span>
            <span className="w-16 text-right">Credits</span>
          </div>
          <div className="flex-grow flex items-center justify-center p-20">
            <p className="text-sm font-bold text-[var(--text-muted)] italic">You are not enrolled into any Learning path yet.</p>
          </div>
        </div>

        {/* Level Up & Leaders Widget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface rounded-[32px] p-8 border border-glass-border shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-black text-[var(--text-main)]">Level Up</h2>
            
            <div className="relative pt-4">
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-black text-[var(--text-main)]">1</span>
                <span className="text-xs font-black text-primary uppercase mb-1">0 XP</span>
              </div>
              <div className="absolute top-2 right-0">
                 <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Star size={24} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white text-slate-800">1</div>
                 </div>
              </div>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-2">Progress to level 2</p>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                <div className="w-[10%] h-full bg-slate-500 rounded-full"></div>
              </div>
              <p className="text-[10px] font-black text-green-500 uppercase mt-4 tracking-widest">120 XP needed for next level</p>
            </div>

            <div className="space-y-3">
              <div className="bg-green-500/5 rounded-2xl p-4 flex items-center gap-4 border border-green-500/10">
                <div className="w-10 h-10 bg-surface border border-glass-border rounded-xl flex items-center justify-center text-green-500 shadow-sm">
                  <Trophy size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Current Rank</p>
                  <p className="text-sm font-black text-[var(--text-main)]">#177</p>
                </div>
              </div>
              <div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-4 border border-primary/10">
                <div className="w-10 h-10 bg-surface border border-glass-border rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <Star size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Next Milestone</p>
                  <p className="text-[11px] font-bold text-[var(--text-main)] line-clamp-1">Need 120 XP to reach next...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-surface rounded-[32px] p-8 border border-glass-border shadow-sm flex flex-col">
            <h2 className="text-lg font-black text-[var(--text-main)] mb-6">Top Performers</h2>
            <div className="space-y-4 flex-grow">
              <LeaderboardItem name="Admin User" xp="45155" rank="1" />
              <LeaderboardItem name="Student..." xp="8334" rank="2" />
              <LeaderboardItem name="Adam..." xp="1215" rank="3" />
            </div>
            <button className="w-full mt-6 py-3 text-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:translate-x-1 transition-all">
              View Full Leaderboard <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, icon }) {
  return (
    <div className="bg-background/40 border border-glass-border rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
      <div>
        <p className="text-[10px] font-black text-[var(--text-muted)] mb-1">{label}</p>
        <p className="text-xl font-black text-[var(--text-main)]">{value}</p>
      </div>
      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  );
}

function LeaderboardItem({ name, xp, rank }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-3xl hover:bg-background transition-all cursor-pointer border border-transparent hover:border-glass-border">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-background border-2 border-surface overflow-hidden flex items-center justify-center">
           <Users size={24} className="text-[var(--text-muted)] opacity-30" />
        </div>
        <div>
          <p className="text-sm font-black text-[var(--text-main)]">{name}</p>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Level 1 • {xp} XP</p>
        </div>
      </div>
      <span className="text-xs font-black text-[var(--text-muted)] mr-2">#{rank}</span>
    </div>
  );
}
