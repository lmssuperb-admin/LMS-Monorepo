'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { apiUrl } from '@/lib/apiBase';
import {
  fetchRecommendedIds,
  fetchUserProgress,
  calcProgressPercent,
  formatActivityTime,
} from '@/lib/learningProgress';
import {
  Play,
  Search,
  Info,
  Users,
  Clock,
  Loader2,
  ChevronRight,
  BookOpen,
  Eye,
  TrendingUp,
  Award,
  Book,
} from 'lucide-react';

export default function CourseCatalog() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const userId = session?.user?.id;
    try {
      const [coursesRes, recommendedIds, progressData, enrolledList] = await Promise.all([
        fetch(apiUrl('/courses')).then(r => r.json()),
        fetchRecommendedIds(),
        userId ? fetchUserProgress(userId) : Promise.resolve({ courses: {} }),
        userId
          ? fetch(apiUrl(`/users/me/courses?userid=${userId}`))
              .then(r => r.json())
              .catch(() => [])
          : Promise.resolve([]),
      ]);

      const apiCourses = (Array.isArray(coursesRes) ? coursesRes : []).filter(c => c.id && c.id !== 1);
      const moodleEnrolled = new Set(
        (Array.isArray(enrolledList) ? enrolledList : []).map(c => Number(c.id))
      );
      const progressCourses = progressData?.courses || {};
      const startedIds = new Set(Object.keys(progressCourses).map(Number));

      const myLearningIds = new Set([...moodleEnrolled, ...startedIds]);
      const recommendedSet = new Set(recommendedIds.map(Number));

      const combined = apiCourses.map(c => {
        const cid = Number(c.id);
        const prog = progressCourses[String(cid)];
        const totalModules = prog?.totalModules || 0;
        const percent =
          totalModules > 0
            ? calcProgressPercent(prog, totalModules)
            : startedIds.has(cid)
              ? 5
              : 0;

        const inMyLearning = myLearningIds.has(cid);
        const fromRecommended = prog?.source === 'recommended' || recommendedSet.has(cid);

        return {
          id: c.id,
          name: c.fullname || c.shortname,
          author: 'Academy',
          date: c.startdate
            ? new Date(c.startdate * 1000).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—',
          views: prog?.timeSpentSeconds ? Math.max(1, Math.round(prog.timeSpentSeconds / 60)) : 0,
          progress: inMyLearning ? percent : 0,
          enrolled: inMyLearning,
          isRecommended: recommendedSet.has(cid) && !inMyLearning,
          isAssigned: moodleEnrolled.has(cid) && !fromRecommended,
          image: getCourseGradient(c.id),
          lastActivityAt: prog?.lastActivityAt,
          completedAt: prog?.completedAt,
          lastActivityLabel: prog?.completedAt
            ? `Completed ${formatActivityTime(prog.completedAt)}`
            : prog?.lastActivityAt
              ? `Last active ${formatActivityTime(prog.lastActivityAt)}`
              : inMyLearning
                ? 'In progress'
                : null,
        };
      });

      setCourses(combined);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const onFocus = () => fetchCourses();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchCourses]);

  const getCourseGradient = (id) => {
    const gradients = [
      'from-emerald-400 to-teal-500',
      'from-purple-500 to-indigo-600',
      'from-rose-400 to-orange-500',
      'from-orange-400 to-amber-500',
      'from-sky-400 to-blue-600',
    ];
    return gradients[id % gradients.length];
  };

  const filteredCourses = courses.filter(
    course =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recommendedCourses = filteredCourses.filter(c => c.isRecommended);
  const assignedCourses = filteredCourses.filter(c => c.isAssigned || (c.enrolled && !c.isRecommended));
  const myLearningCourses = courses.filter(c => c.enrolled);

  const totalLearningMinutes = myLearningCourses.reduce((sum, c) => sum + (c.views || 0), 0);
  const completedCount = myLearningCourses.filter(c => c.progress >= 100 || c.completedAt).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-6 lg:px-12 py-8 min-h-screen bg-[var(--background)] flex flex-col gap-16 transition-all duration-500">
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] italic">Academy Library</h1>
            <p className="text-sm font-bold text-[var(--text-muted)] mt-1">Discover, Learn, and Master new skills</p>
          </div>
          <div className="flex items-center gap-4 bg-surface border border-glass-border rounded-2xl p-1.5 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="bg-transparent border-none py-2.5 pl-12 pr-4 text-sm text-[var(--text-main)] focus:outline-none placeholder:text-[var(--text-muted)] w-64"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <CompactStatCard count={courses.length} label="Available Courses" icon={<BookOpen size={18} />} color="blue" />
          <CompactStatCard count={assignedCourses.length} label="Assigned" icon={<Users size={18} />} color="purple" />
          <CompactStatCard count={myLearningCourses.length} label="My Learning" icon={<Clock size={18} />} color="green" />
          <CompactStatCard count={completedCount} label="Completed" icon={<Award size={18} />} color="cyan" />
          <CompactStatCard count={totalLearningMinutes || 0} label="Learning Minutes" icon={<TrendingUp size={18} />} color="yellow" />
        </div>
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-primary rounded-full"></div>
            <h2 className="text-2xl font-black text-[var(--text-main)]">Recommended by Admin</h2>
          </div>
          <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
            Pro Picks
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {recommendedCourses.length > 0 ? (
            recommendedCourses.map(course => <CourseCard key={course.id} course={course} />)
          ) : (
            <p className="text-sm font-bold text-[var(--text-muted)] italic col-span-full">
              No recommended courses right now. Check back soon!
            </p>
          )}
        </div>
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-secondary rounded-full"></div>
            <h2 className="text-2xl font-black text-[var(--text-main)]">Assigned Content</h2>
          </div>
          <p className="text-sm font-bold text-[var(--text-muted)]">Courses assigned via Moodle enrolment</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {assignedCourses.length > 0 ? (
            assignedCourses.map(course => <CourseCard key={course.id} course={course} />)
          ) : (
            <p className="text-sm font-bold text-[var(--text-muted)] italic col-span-full">No assigned courses found.</p>
          )}
        </div>
      </section>

      <section className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
            <h2 className="text-2xl font-black text-[var(--text-main)]">My Learning</h2>
          </div>
          <Link
            href="/courses"
            className="text-primary text-xs font-black hover:underline uppercase tracking-widest flex items-center gap-2"
          >
            Refresh <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {myLearningCourses.length > 0 ? (
            myLearningCourses.map(course => (
              <div key={course.id}>
                <CourseCard course={course} hideMeta />
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 academy-card border-none bg-surface-hover/30 p-10 flex flex-col items-center justify-center text-center">
              <Clock size={40} className="text-primary/20 mb-4" />
              <p className="text-base font-bold text-[var(--text-muted)] italic max-w-xs">
                Open a recommended course to start learning — it will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CompactStatCard({ count, label, icon, color }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-500/10 border-blue-500/10',
    purple: 'text-purple-600 bg-purple-500/10 border-purple-500/10',
    green: 'text-green-600 bg-green-500/10 border-green-500/10',
    cyan: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/10',
    yellow: 'text-amber-600 bg-amber-500/10 border-amber-500/10',
  };

  return (
    <div className="bg-surface border border-glass-border rounded-[24px] p-6 flex items-center justify-between group hover:shadow-lg transition-all">
      <div>
        <h3 className="text-3xl font-black text-[var(--text-main)] mb-2">{count}</h3>
        <p className="text-[11px] font-black text-[var(--text-muted)] flex items-center gap-1">
          {label}
          <Info size={12} className="opacity-30" />
        </p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  );
}

function CourseCard({ course, hideMeta = false }) {
  const href = course.enrolled ? `/courses/${course.id}` : `/courses/${course.id}/enroll`;

  return (
    <Link
      href={href}
      className="bg-surface border border-glass-border rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col"
    >
      <div className={`h-40 bg-gradient-to-br ${course.image} relative flex items-center justify-center overflow-hidden`}>
        {course.isRecommended && (
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/20 shadow-xl">
              Recommended
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-150 group-hover:scale-100">
          <div className="bg-white text-primary p-4 rounded-full shadow-2xl">
            <Play size={20} fill="currentColor" />
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h4 className="text-sm font-black text-[var(--text-main)] mb-3 line-clamp-1 group-hover:text-primary transition-colors">
          {course.name}
        </h4>

        {!hideMeta && (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-black text-primary uppercase mb-0.5">{course.author}</p>
              <p className="text-[10px] font-bold text-[var(--text-muted)]">{course.date}</p>
            </div>
            <div className="pt-4 border-t border-glass-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                <Book size={12} />
                Course
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)]">
                <Eye size={12} />
                {course.views}
              </div>
            </div>
          </div>
        )}

        {hideMeta && (
          <div className="mt-auto pt-4 space-y-2">
            <div className="w-full h-1 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${course.progress}%` }}></div>
            </div>
            <p className="text-[9px] font-black text-primary text-right uppercase tracking-widest">
              {course.progress}% Completed
            </p>
            {course.lastActivityLabel && (
              <p className="text-[9px] font-bold text-[var(--text-muted)]">{course.lastActivityLabel}</p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
