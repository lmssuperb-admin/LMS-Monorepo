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
      setCourses((data || []).map(c => ({
        id: c.id,
        name: c.fullname,
        author: 'Admin User',
        date: '24 Apr 2026',
        views: Math.floor(Math.random() * 10),
        progress: Math.floor(Math.random() * 100),
        enrolled: Math.random() > 0.5,
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

  const allContent = filteredCourses;
  const myLearning = courses.filter(c => c.enrolled);

  const totalPages = Math.ceil(allContent.length / itemsPerPage) || 1;
  const pagedContent = allContent.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-10 py-8 min-h-screen bg-[var(--background)] flex flex-col gap-12">
      
      {/* ── TOP STATS: MY COURSES ── */}
      <section>
        <h2 className="text-xl font-black text-[var(--text-main)] mb-6">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <CompactStatCard count={courses.length} label="Enrolled Courses" icon={<BookOpen size={18} />} color="blue" />
          <CompactStatCard count={courses.filter(c => c.progress > 0 && c.progress < 100).length || 1} label="In Progress Courses" icon={<Clock size={18} />} color="purple" />
          <CompactStatCard count={courses.filter(c => c.progress === 100).length} label="Completed Courses" icon={<CheckCircle2 size={18} />} color="green" />
          <CompactStatCard count={0} label="Certificates Earned" icon={<FileCheck size={18} />} color="cyan" />
          <CompactStatCard count={1} label="Learning Hours" icon={<TrendingUp size={18} />} color="yellow" />
        </div>
      </section>

      {/* ── DISCOVER BAR ── */}
      <section>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-black text-[var(--text-main)]">Discover</h2>
          <div className="flex items-center gap-4 bg-surface border border-glass-border rounded-2xl p-2 px-4 shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl text-primary text-xs font-black cursor-pointer hover:bg-primary/20 transition-all">
              <div className="w-5 h-5 bg-primary rounded flex items-center justify-center text-white text-[10px]">C</div>
              Company Workspace
              <ChevronRight className="rotate-90" size={14} />
            </div>
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description, title, author, tags" 
                className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-sm text-[var(--text-main)] focus:outline-none placeholder:text-[var(--text-muted)]"
              />
            </div>
            <button className="p-3 text-[var(--text-muted)] hover:text-primary transition-colors">
              <Settings2 size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ── ALL CONTENT ── */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-[var(--text-main)]">All Content</h2>
          <Link href="/courses/all" className="text-primary text-xs font-black hover:underline uppercase tracking-widest">View All</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {pagedContent.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
          {pagedContent.length === 0 && (
             <p className="text-sm font-bold text-[var(--text-muted)] italic col-span-full py-10">No courses available.</p>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="w-10 h-10 rounded-xl bg-surface border border-glass-border flex items-center justify-center text-[var(--text-muted)] hover:text-primary transition-all shadow-sm disabled:opacity-30 disabled:hover:text-[var(--text-muted)]"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-6 py-2 bg-surface border border-glass-border rounded-xl text-xs font-black text-[var(--text-main)] shadow-sm">
            {currentPage} / {totalPages}
          </div>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="w-10 h-10 rounded-xl bg-surface border border-glass-border flex items-center justify-center text-[var(--text-muted)] hover:text-primary transition-all shadow-sm disabled:opacity-30 disabled:hover:text-[var(--text-muted)]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* ── MY LEARNING ── */}
      <section className="pb-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-[var(--text-main)]">My Learning</h2>
          <Link href="/courses/my" className="text-primary text-xs font-black hover:underline uppercase tracking-widest">View All</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
           {myLearning.length > 0 ? myLearning.slice(0, 1).map(course => (
             <div key={course.id} className="col-span-full md:col-span-1 lg:col-span-1">
                <CourseCard course={course} hideMeta />
             </div>
           )) : (
             <p className="text-sm font-bold text-[var(--text-muted)] italic col-span-full">Start your first course to see it here!</p>
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
      href={`/courses/${course.id}`}
      className="bg-surface border border-glass-border rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col"
    >
      {/* Thumbnail */}
      <div className={`h-40 bg-gradient-to-br ${course.image} relative flex items-center justify-center overflow-hidden`}>
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
