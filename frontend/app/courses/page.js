'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, 
  Search, 
  Info, 
  Users, 
  Clock, 
  CheckCircle2, 
  FileCheck, 
  Filter, 
  LayoutGrid, 
  List,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye,
  Settings2,
  TrendingUp,
  Award,
  Book
} from 'lucide-react';

export default function CourseCatalog() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/courses');
      const data = await res.json();
      setCourses((data || []).map((c, idx) => ({
        id: c.id,
        name: c.fullname,
        author: 'Admin User',
        date: '24 Apr 2026',
        views: Math.floor(Math.random() * 10),
        progress: idx === 0 ? 15 : Math.floor(Math.random() * 100),
        enrolled: idx < 3, // Mock first 3 as enrolled
        isRecommended: idx >= 3 && idx < 6, // Mock next 3 as recommended
        image: getCourseGradient(c.id)
      })));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const getCourseGradient = (id) => {
    const gradients = [
      'from-emerald-400 to-teal-500',
      'from-purple-500 to-indigo-600',
      'from-rose-400 to-orange-500',
      'from-orange-400 to-amber-500',
      'from-sky-400 to-blue-600'
    ];
    return gradients[id % gradients.length];
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recommendedCourses = [
    {
      id: 101, // Mock ID for static course
      name: "POSH Compliance - Prevention of Sexual Harassment",
      author: "Admin User",
      date: "30 Apr 2026",
      views: 1240,
      enrolled: false,
      isRecommended: true,
      image: "from-blue-600 to-indigo-700",
      isStatic: true
    },
    {
      id: 102,
      name: "Advanced Cybersecurity Fundamentals",
      author: "Admin User",
      date: "28 Apr 2026",
      views: 850,
      enrolled: false,
      isRecommended: true,
      image: "from-emerald-500 to-teal-600",
      isStatic: true
    },
    {
      id: 103,
      name: "Effective Workplace Communication",
      author: "Admin User",
      date: "25 Apr 2026",
      views: 2100,
      enrolled: false,
      isRecommended: true,
      image: "from-rose-500 to-orange-600",
      isStatic: true
    }
  ];

  const enrolledCourses = filteredCourses.filter(c => c.enrolled);
  const myLearningCourses = enrolledCourses.filter(c => c.progress > 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="w-full max-w-[1800px] mx-auto px-6 lg:px-12 py-8 min-h-screen bg-[var(--background)] flex flex-col gap-16 transition-all duration-500">
      
      {/* ── TOP STATS ── */}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..." 
                  className="bg-transparent border-none py-2.5 pl-12 pr-4 text-sm text-[var(--text-main)] focus:outline-none placeholder:text-[var(--text-muted)] w-64"
                />
             </div>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <CompactStatCard count={courses.length} label="Available Courses" icon={<BookOpen size={18} />} color="blue" />
          <CompactStatCard count={enrolledCourses.length} label="My Enrolments" icon={<Users size={18} />} color="purple" />
          <CompactStatCard count={myLearningCourses.length} label="Active Learning" icon={<Clock size={18} />} color="green" />
          <CompactStatCard count={0} label="Certificates" icon={<Award size={18} />} color="cyan" />
          <CompactStatCard count={1} label="Learning Hours" icon={<TrendingUp size={18} />} color="yellow" />
        </div>
      </section>

      {/* ── SECTION 1: RECOMMENDED BY ADMIN (STATIC UI) ── */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-primary rounded-full"></div>
            <h2 className="text-2xl font-black text-[var(--text-main)]">Recommended by Admin</h2>
          </div>
          <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Pro Picks</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {recommendedCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* ── SECTION 2: SPECIFIC USERS ENROLLED (ASSIGNED) ── */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-secondary rounded-full"></div>
            <h2 className="text-2xl font-black text-[var(--text-main)]">Assigned Content</h2>
          </div>
          <p className="text-sm font-bold text-[var(--text-muted)]">Courses curated for your profile</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {enrolledCourses.length > 0 ? enrolledCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          )) : (
             <p className="text-sm font-bold text-[var(--text-muted)] italic col-span-full">No assigned courses found.</p>
          )}
        </div>
      </section>

      {/* ── SECTION 3: MY LEARNING ── */}
      <section className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
            <h2 className="text-2xl font-black text-[var(--text-main)]">My Learning</h2>
          </div>
          <Link href="/courses/my" className="text-primary text-xs font-black hover:underline uppercase tracking-widest flex items-center gap-2">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {myLearningCourses.length > 0 ? myLearningCourses.map(course => (
             <div key={course.id}>
                <CourseCard course={course} hideMeta />
             </div>
           )) : (
             <div className="col-span-full py-10 academy-card border-none bg-surface-hover/30 p-10 flex flex-col items-center justify-center text-center">
                <Clock size={40} className="text-primary/20 mb-4" />
                <p className="text-base font-bold text-[var(--text-muted)] italic max-w-xs">Start your first course to track your progress here!</p>
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
  return (
    <Link 
      href={course.enrolled ? `/courses/${course.id}` : `/courses/${course.id}/enroll`}
      className="bg-surface border border-glass-border rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col"
    >
      {/* Thumbnail */}
      <div className={`h-40 bg-gradient-to-br ${course.image} relative flex items-center justify-center overflow-hidden`}>
        {/* Recommended Badge */}
        {course.isRecommended && (
           <div className="absolute top-4 left-4 z-20">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/20 shadow-xl">
                 Recommended
              </span>
           </div>
        )}

        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl scale-90 group-hover:scale-100 transition-all">
           <div className="w-24 h-16 bg-white/40 rounded flex flex-col gap-1 p-2">
              <div className="w-full h-1 bg-white/60 rounded"></div>
              <div className="w-2/3 h-1 bg-white/60 rounded"></div>
              <div className="w-1/2 h-1 bg-white/60 rounded"></div>
           </div>
        </div>
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-150 group-hover:scale-100">
           <div className="bg-white text-primary p-4 rounded-full shadow-2xl">
              <Play size={20} fill="currentColor" />
           </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col flex-grow">
        <h4 className="text-sm font-black text-[var(--text-main)] mb-3 line-clamp-1 group-hover:text-primary transition-colors">{course.name}</h4>
        
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
          <div className="mt-auto pt-4">
             <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{width: `${course.progress}%`}}></div>
             </div>
             <p className="text-[9px] font-black text-primary text-right mt-2 uppercase tracking-widest">{course.progress}% Completed</p>
          </div>
        )}
      </div>
    </Link>
  );
}
