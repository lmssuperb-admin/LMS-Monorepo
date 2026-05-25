'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { apiUrl } from '@/lib/apiBase';
import {
  fetchUserProgress,
  calcProgressPercent,
  formatDurationMinutes,
} from '@/lib/learningProgress';
import {
  Trophy,
  ChevronRight,
  Brain,
  ChevronLeft,
  Settings2,
  Users,
  Award,
  GraduationCap,
  TrendingUp,
  Bookmark,
  Plus,
  Star,
  Loader2,
  Sparkles,
  MapPin,
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [progressData, setProgressData] = useState({ courses: {} });
  const [learningPaths, setLearningPaths] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const userId = session?.user?.id;
  const displayName = session?.user?.name || 'Student';

  useEffect(() => {
    if (status === 'loading') return;
    if (!userId) {
      setLoading(false);
      return;
    }
    loadDashboard();
  }, [userId, status]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [enrolledRes, progress, pathsRes] = await Promise.all([
        fetch(apiUrl(`/users/me/courses?userid=${userId}`)).then(r => r.json()).catch(() => []),
        fetchUserProgress(userId),
        fetch(apiUrl('/learningpaths')).then(r => r.json()).catch(() => []),
      ]);
      setEnrolledCourses(Array.isArray(enrolledRes) ? enrolledRes : []);
      setProgressData(progress);
      setLearningPaths(Array.isArray(pathsRes) ? pathsRes : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const stats = useMemo(() => {
    const progressCourses = progressData?.courses || {};
    const startedIds = Object.keys(progressCourses);
    const allCourseIds = new Set([
      ...enrolledCourses.map(c => String(c.id)),
      ...startedIds,
    ]);

    let completed = 0;
    let totalSeconds = 0;
    startedIds.forEach(cid => {
      const p = progressCourses[cid];
      const total = p?.totalModules || 0;
      const pct = calcProgressPercent(p, total);
      if (pct >= 100 || p?.completedAt) completed += 1;
      totalSeconds += p?.timeSpentSeconds || 0;
    });

    const xp = Math.round(totalSeconds / 60) * 10 + completed * 100;

    return {
      totalCourses: allCourseIds.size,
      certifications: completed,
      xp,
      posts: 0,
      learningMinutes: Math.round(totalSeconds / 60),
      level: Math.max(1, Math.floor(xp / 500) + 1),
      xpInLevel: xp % 500,
      xpToNext: 500 - (xp % 500),
    };
  }, [enrolledCourses, progressData]);

  const myPaths = useMemo(() => {
    const enrolledIds = new Set(enrolledCourses.map(c => Number(c.id)));
    const startedIds = new Set(Object.keys(progressData?.courses || {}).map(Number));
    const allIds = new Set([...enrolledIds, ...startedIds]);

    return learningPaths
      .filter(lp => (lp.courses || []).some(cid => allIds.has(Number(cid))))
      .map(lp => ({
        id: lp.id,
        name: lp.name,
        startDate: lp.startDate || '—',
        endDate: lp.endDate || '—',
        status: 'Active',
        credits: lp.credits ?? '0',
      }));
  }, [learningPaths, enrolledCourses, progressData]);

  const monthLabel = calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstWeekday = (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7;
  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === calendarMonth.getMonth() &&
    today.getFullYear() === calendarMonth.getFullYear();

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 py-8 min-h-screen bg-[var(--background)] flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[var(--text-main)]">Dashboard</h1>
        <button
          type="button"
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-glass-border rounded-xl text-xs font-bold text-[var(--text-muted)] shadow-sm hover:bg-white/5 transition-all"
        >
          <Settings2 size={16} />
          Customize Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface rounded-[32px] p-8 sm:p-10 border border-glass-border shadow-sm flex flex-col items-center">
          <div className="w-full flex justify-start mb-2">
            <h2 className="text-lg font-black text-[var(--text-main)]">Achievements</h2>
          </div>

          <div className="flex flex-col items-center mb-10">
            <div className="w-28 h-28 rounded-full border-4 border-primary/20 p-1 mb-4 overflow-hidden">
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-background/50 flex items-center justify-center">
                  <Users size={48} className="text-[var(--text-muted)] opacity-30" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-black text-[var(--text-main)] capitalize">{displayName}</h3>
            <Link href="/profile" className="text-primary text-xs font-bold underline mt-1">
              View Profile
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <StatTile label="Certifications" value={stats.certifications} icon={<Award size={20} />} />
            <StatTile label="Total Courses" value={stats.totalCourses} icon={<GraduationCap size={20} />} />
            <StatTile label="XP Points" value={stats.xp} icon={<TrendingUp size={20} />} />
            <StatTile label="Learning Time" value={formatDurationMinutes(stats.learningMinutes * 60)} icon={<Bookmark size={20} />} />
          </div>
        </div>

        <div className="bg-surface rounded-[32px] p-8 sm:p-10 border border-glass-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-black text-[var(--text-main)]">{monthLabel}</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                    )
                  }
                  className="p-1.5 bg-background rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                    )
                  }
                  className="p-1.5 bg-background rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <span key={day} className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-4 text-center">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(date => {
              const isToday = isCurrentMonth && date === today.getDate();
              return (
                <div key={date} className="flex items-center justify-center">
                  <span
                    className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${
                      isToday
                        ? 'border-2 border-primary text-primary shadow-lg shadow-primary/10 bg-primary/5'
                        : 'text-[var(--text-main)] hover:bg-white/5'
                    }`}
                  >
                    {date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        onClick={() => router.push('/code_editor')}
        className="bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 rounded-[40px] p-8 sm:p-10 flex items-center justify-between overflow-hidden relative cursor-pointer hover:border-primary/40 transition-all group shadow-xl"
      >
        <div className="relative z-10 max-w-xl">
          <span className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-4">
            <Sparkles size={14} /> New Feature
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] mb-4 leading-tight italic uppercase">
            AI Integrated Code Editor
          </h2>
          <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed font-bold">
            Solve challenges and master programming with our AI-powered platform.
          </p>
          <span className="inline-block bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest">
            Launch Editor
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <div className="bg-surface rounded-[32px] border border-glass-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-glass-border flex items-center justify-between">
            <h2 className="text-lg font-black text-[var(--text-main)]">Learning Path</h2>
            <Link href="/courses" className="text-[10px] font-black text-primary uppercase tracking-widest">
              Browse courses
            </Link>
          </div>
          {myPaths.length > 0 ? (
            <>
              <div className="bg-background/50 px-6 py-3 border-b border-glass-border flex items-center text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest gap-2">
                <span className="flex-1">Path Name</span>
                <span className="w-20 hidden sm:block">Start</span>
                <span className="w-20 hidden sm:block">End</span>
                <span className="w-16 text-right">Credits</span>
              </div>
              <div className="divide-y divide-glass-border">
                {myPaths.map(lp => (
                  <div key={lp.id} className="px-6 py-4 flex items-center gap-2 text-xs font-bold">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <span className="flex-1 text-[var(--text-main)]">{lp.name}</span>
                    <span className="w-20 text-[var(--text-muted)] hidden sm:block">{lp.startDate}</span>
                    <span className="w-20 text-[var(--text-muted)] hidden sm:block">{lp.endDate}</span>
                    <span className="w-16 text-right text-primary">{lp.credits}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center p-16">
              <p className="text-sm font-bold text-[var(--text-muted)] italic text-center">
                You are not enrolled in any learning path yet. Start a course from the library.
              </p>
            </div>
          )}
        </div>

        <div className="bg-surface rounded-[32px] p-8 border border-glass-border shadow-sm flex flex-col gap-6">
          <h2 className="text-lg font-black text-[var(--text-main)]">Your progress</h2>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-[var(--text-main)]">{stats.level}</span>
            <span className="text-xs font-black text-primary uppercase mb-1">{stats.xp} XP</span>
          </div>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase">Progress to level {stats.level + 1}</p>
          <div className="w-full h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(stats.xpInLevel / 500) * 100}%` }}
            />
          </div>
          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">
            {stats.xpToNext} XP needed for next level
          </p>
          <Link
            href="/courses"
            className="mt-2 w-full py-3 text-center bg-primary/10 text-primary font-black text-xs uppercase tracking-widest rounded-xl border border-primary/20 hover:bg-primary/15 transition-all"
          >
            Go to My Learning
          </Link>
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
      <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
        {icon}
      </div>
    </div>
  );
}
