import { getCourses } from '../../lib/api';
import Link from 'next/link';
import { BookOpen, Search, Filter, ArrowRight, Play, Star } from 'lucide-react';

export default async function CoursesPage() {
  let courses = [];
  try {
    courses = await getCourses();
  } catch (error) {
    console.error("Courses fetch error:", error);
  }

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-main)] mb-3">Course Catalog</h1>
          <p className="text-[var(--text-muted)] text-lg max-w-xl">
            Empower your journey with our world-class courses and certifications.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
             <input 
               type="text" 
               placeholder="Search course..." 
               className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl py-3.5 pl-12 pr-6 text-sm text-[var(--text-main)] focus:outline-none focus:border-[#6366f150] w-[300px]"
             />
          </div>
          <button className="p-3.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl text-[var(--text-muted)] hover:text-[#6366f1] transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="rounded-[32px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] overflow-hidden flex flex-col group hover:scale-[1.02] transition-all duration-300">
              <div className="h-52 bg-gradient-to-br from-[#6366f1] to-[#a855f7] relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-300"></div>
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                  {course.categoryname || 'Development'}
                </div>
                <button className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#6366f1] opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all shadow-2xl">
                   <Play size={20} className="fill-current ml-1" />
                </button>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-orange-400">
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="fill-current" />
                    <Star size={12} className="fill-current" />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">(4.9)</span>
                </div>
                
                <h3 className="text-xl font-bold text-[var(--text-main)] mb-3 line-clamp-2 leading-snug group-hover:text-[#6366f1] transition-colors">
                  {course.fullname}
                </h3>
                <p className="text-[var(--text-muted)] text-sm mb-6 line-clamp-2 leading-relaxed">
                  {course.summary ? course.summary.replace(/<[^>]*>?/gm, '') : 'Start your journey today with this comprehensive masterclass.'}
                </p>

                <div className="mt-auto pt-6 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-surface-hover border border-white/5 flex items-center justify-center text-[10px] font-bold">INS</div>
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Instructor</span>
                  </div>
                  <Link 
                    href={`/courses/${course.id}`}
                    className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[var(--text-main)] hover:bg-[#6366f1] hover:text-white transition-all shadow-lg"
                  >
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center">
            <h3 className="text-2xl font-bold text-[var(--text-muted)]">No courses found matching your criteria.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
