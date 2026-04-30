'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  MessageSquare, 
  Layers, 
  BookOpen, 
  HelpCircle, 
  User, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  CheckCircle2,
  ChevronLeft,
  Info,
  Loader2,
  Clock,
  Search,
  MousePointer2,
  FileText,
  ClipboardCheck,
  Video
} from 'lucide-react';
import Image from 'next/image';

export default function CourseEnrollmentPage() {
  const router = useRouter();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedEnroll, setExpandedEnroll] = useState(false);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/courses/${id}`);
      const data = await res.json();
      
      setCourse({
        id: id,
        fullname: data?.[0]?.name || "POSH Compliance",
        shortname: "POSH",
        summary: "This course has an ILT presentation for the POSH course, a Policy Handout, and forms. It covers essential guidelines for preventing sexual harassment in the workplace.",
        image: "/posh_banner.png",
        curriculum: data, // Store curriculum from API
        features: [
          { icon: <MessageSquare size={18} className="text-emerald-500" />, label: "Forum", count: "01" },
          { icon: <Layers size={18} className="text-blue-500" />, label: "Other", count: "14" },
          { icon: <BookOpen size={18} className="text-green-500" />, label: "Reading Material", count: "03" },
          { icon: <HelpCircle size={18} className="text-amber-500" />, label: "Quizzes", count: "02" },
        ],
        instructors: [], 
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    // Smooth scroll to top to see the new dashboard
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  if (!course) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-lg font-black text-[var(--text-muted)]">Course not found.</p>
      <button onClick={() => router.back()} className="text-primary font-bold hover:underline flex items-center gap-2">
        <ChevronLeft size={16} /> Go Back
      </button>
    </div>
  );



  const STATIC_POSH_CURRICULUM = [
    {
      name: "Topic 1",
      modules: [
        { name: "Posh Policy India", modname: "resource", url: "/Posh_Policy.pdf" },
        { name: "POSH India forms", modname: "resource", url: "/Posh_Forms.pdf" },
        { name: "Maxval session", modname: "zoom", url: "https://zoom.us/test" },
        { name: "CP - Posh (Anti Sexual Harassment)", modname: "url", url: "https://example.com" },
        { name: "Learning New language", modname: "lesson", url: "/Lesson.pdf" },
        { name: "Test session", modname: "zoom", url: "https://zoom.us/test" },
        { name: "quiz test 23", modname: "quiz", url: "https://example.com/quiz" },
      ]
    }
  ];

  if (isEnrolled) {
    const curriculum = (course.curriculum && course.curriculum.length > 0) ? course.curriculum : STATIC_POSH_CURRICULUM;

    return (
      <div className="min-h-screen bg-[var(--background)] pb-20 font-sans">
        <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95 duration-700">
           
           {/* ── LEFT COLUMN: CURRICULUM SIDEBAR ── */}
           <div className="lg:col-span-3">
              <div className="academy-card bg-surface overflow-hidden rounded-[20px] border-glass-border sticky top-6 shadow-lg">
                 <div className="p-5 border-b border-glass-border space-y-4">
                    <div className="flex items-center justify-between">
                       <button 
                          onClick={() => router.push('/courses')}
                          className="flex items-center gap-2 group cursor-pointer"
                       >
                          <div className="p-1.5 rounded-lg bg-surface-hover text-[var(--text-muted)] group-hover:text-primary group-hover:bg-primary/10 transition-all">
                             <ChevronLeft size={14} />
                          </div>
                          <h3 className="text-base font-black text-[var(--text-main)] tracking-tight group-hover:text-primary transition-colors">POSH</h3>
                       </button>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-40" size={12} />
                       <input 
                          type="text" 
                          placeholder="Search content..." 
                          className="w-full bg-background border border-glass-border rounded-lg py-2 pl-9 pr-3 text-[10px] font-bold text-[var(--text-main)] focus:outline-none focus:border-primary transition-all"
                       />
                    </div>
                 </div>

                 <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    {curriculum.map((topic, tIdx) => (
                       <div key={tIdx} className="border-b border-glass-border last:border-none">
                          <div className="p-5 flex items-center justify-between group cursor-pointer hover:bg-surface-hover/30 transition-all">
                             <div className="space-y-0.5">
                                <h4 className="text-xs font-black text-[var(--text-main)]">{topic.name}</h4>
                                <p className="text-[9px] font-black text-[var(--text-muted)] opacity-50">({topic.modules?.length || 0}/13)</p>
                             </div>
                             <ChevronDown size={14} className="text-[var(--text-muted)] group-hover:text-primary transition-all" />
                          </div>
                          
                          <div className="px-3 pb-5 space-y-0.5">
                             {topic.modules?.map((mod, mIdx) => {
                                let Icon = BookOpen;
                                if (mod.modname === 'url') Icon = MousePointer2;
                                if (mod.modname === 'resource') Icon = FileText;
                                if (mod.modname === 'quiz') Icon = ClipboardCheck;
                                if (mod.modname === 'zoom' || mod.name?.toLowerCase().includes('session')) Icon = Video;
                                if (mod.modname === 'lesson') Icon = User;

                                const isCompleted = mod.name === "Learning New language";
                                const isActive = activeModule?.name === mod.name;

                                return (
                                   <div 
                                      key={mIdx} 
                                      onClick={() => setActiveModule(mod)}
                                      className={`flex items-center justify-between p-2.5 rounded-lg transition-all group cursor-pointer ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-surface-hover'}`}
                                   >
                                      <div className="flex items-center gap-3">
                                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${isActive ? 'bg-primary text-white' : 'bg-background text-[var(--text-muted)]'}`}>
                                            <Icon size={14} />
                                         </div>
                                         <span className={`text-[10px] font-bold line-clamp-1 max-w-[140px] ${isActive ? 'text-primary' : 'text-[var(--text-main)] group-hover:text-primary'}`}>{mod.name}</span>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isCompleted ? 'border-sky-500 bg-sky-500 text-white' : 'border-sky-500/20 text-transparent'}`}>
                                         {isCompleted && <CheckCircle2 size={10} fill="currentColor" />}
                                      </div>
                                   </div>
                                );
                             })}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* ── RIGHT COLUMN: MAIN CONTENT ── */}
           <div className="lg:col-span-9">
              {activeModule ? (
                 /* ── MODULE PLAYER VIEW ── */
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    {/* Player Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-[20px] border border-glass-border shadow-sm">
                       <div>
                          <h2 className="text-lg font-black text-[var(--text-main)] tracking-tight">{activeModule.name}</h2>
                          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Module {activeModule.modname}</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <button 
                             onClick={() => setActiveModule(null)}
                             className="px-6 py-2 rounded-xl text-xs font-black text-[var(--text-muted)] bg-surface-hover hover:text-primary transition-all border border-glass-border flex items-center gap-2"
                          >
                             <ChevronLeft size={14} /> Previous
                          </button>
                          <button className="px-8 py-2.5 rounded-xl text-xs font-black text-white bg-primary hover:bg-secondary transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                             Next <ChevronLeft size={14} className="rotate-180" />
                          </button>
                       </div>
                    </div>

                    {/* Content Display (PDF Viewer) */}
                    <div className="academy-card bg-surface rounded-[24px] border-glass-border overflow-hidden shadow-xl min-h-[800px] flex flex-col">
                       {activeModule.modname === 'resource' || activeModule.modname === 'lesson' ? (
                          <div className="flex-grow relative bg-slate-100 dark:bg-slate-900/50">
                             {/* Mock PDF View Container */}
                             <div className="absolute inset-0 flex flex-col">
                                {/* PDF Toolbar Mock */}
                                <div className="bg-white dark:bg-slate-800 border-b border-glass-border p-3 flex items-center justify-between shadow-sm z-10">
                                   <div className="flex items-center gap-4">
                                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                         <BookOpen size={16} />
                                      </div>
                                      <span className="text-xs font-black text-slate-700 dark:text-slate-200">{activeModule.name}</span>
                                   </div>
                                   <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-md">1 / 1</span>
                                      <div className="flex items-center gap-1 border-x border-glass-border px-4">
                                         <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all"><ChevronLeft size={14} /></button>
                                         <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all rotate-180"><ChevronLeft size={14} /></button>
                                      </div>
                                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all"><Layers size={14} /></button>
                                   </div>
                                </div>
                                
                                {/* The PDF Content (Iframe for scrollable PDF experience) */}
                                <div className="flex-grow overflow-hidden">
                                   <iframe 
                                      src={activeModule.url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"} 
                                      className="w-full h-full border-none"
                                      title="PDF Viewer"
                                   />
                                </div>
                             </div>
                          </div>
                       ) : (
                          <div className="flex-grow flex flex-col items-center justify-center p-20 text-center space-y-6">
                             <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                                <Icon size={40} />
                             </div>
                             <div className="space-y-2">
                                <h3 className="text-xl font-black text-[var(--text-main)]">Ready to start?</h3>
                                <p className="text-sm font-medium text-[var(--text-muted)] max-w-md mx-auto">
                                   This module will open in a new window or your external application.
                                </p>
                             </div>
                             <a 
                                href={activeModule.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-10 py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-secondary transition-all shadow-lg shadow-primary/20"
                             >
                                Open Module
                             </a>
                          </div>
                       )}
                    </div>
                 </div>
              ) : (
                 /* ── DASHBOARD VIEW ── */
                 <div className="space-y-6 animate-in fade-in duration-700">
                    {/* Enrollment Banner */}
                    <div className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-xs font-black">
                       You are enrolled in the course.
                    </div>

                    {/* Course Image Banner */}
                    <div className="academy-card overflow-hidden bg-surface border-none shadow-lg rounded-[24px]">
                       <div className="relative h-[300px] w-full">
                          <Image src={course.image} alt={course.fullname} fill className="object-cover opacity-90" priority />
                       </div>
                    </div>

                    {/* Course Title & Progress */}
                    <div className="space-y-6">
                       <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight">{course.shortname || course.fullname}</h1>
                       <div className="flex items-center gap-6">
                          <div className="flex-grow h-1.5 bg-slate-100 dark:bg-slate-800/30 rounded-full overflow-hidden">
                             <div className="h-full bg-secondary w-[2%] rounded-full shadow-[0_0_8px_rgba(14,165,233,0.3)]"></div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-[9px] font-black text-[var(--text-main)] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                            0%
                          </div>
                          <button 
                             onClick={() => setActiveModule(curriculum[0].modules[0])}
                             className="px-10 py-3 bg-[#00A3FF] hover:bg-[#0092E6] text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-md shadow-blue-500/20 transition-all active:scale-95"
                          >
                             Start
                          </button>
                       </div>
                    </div>

                    {/* About & Stats */}
                    <div className="space-y-8 pt-6 border-t border-glass-border">
                       <div className="space-y-3">
                          <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider opacity-60">About Course</h2>
                          <p className="text-sm font-bold text-[var(--text-main)] opacity-80 max-w-3xl leading-relaxed">{course.summary}</p>
                       </div>

                       <div className="space-y-6">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#00A3FF]"></div>
                             <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider">Your Learning Progress</h2>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <ProgressStatCard value="0%" label="Course Progress" subtext="Completed" icon={<User size={18} className="text-purple-500" />} color="purple" />
                             <ProgressStatCard value="0 min" label="Time Spent" subtext="Learning Time" icon={<Clock size={18} className="text-blue-500" />} color="blue" />
                             <ProgressStatCard value="0" label="Activity Done" subtext="Completed" badge="0/19" icon={<Layers size={18} className="text-emerald-500" />} color="emerald" />
                             <ProgressStatCard value="0%" label="Quiz Score" subtext="Average Score" icon={<HelpCircle size={18} className="text-amber-500" />} color="amber" />
                          </div>
                       </div>
                    </div>
                 </div>
              )}
           </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20 font-sans">
      {/* ── HEADER NAVIGATION ── */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-primary transition-all mb-4"
        >
          <ChevronLeft size={14} /> Back to Library
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── LEFT COLUMN: MAIN CONTENT ── */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Course Hero */}
          <div className="academy-card overflow-hidden bg-surface border-none shadow-xl rounded-[28px]">
            <div className="relative h-[320px] w-full">
               <Image 
                src={course.image} 
                alt={course.fullname} 
                fill 
                className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                priority
               />
            </div>
            <div className="p-8 space-y-8">
              <h1 className="text-3xl font-black text-[var(--text-main)] italic tracking-tight">{course.shortname || course.fullname}</h1>
              
              <div className="flex items-center gap-6">
                <div className="flex-grow h-2 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[2%] rounded-full shadow-[0_0_8px_rgba(14,165,233,0.3)] transition-all duration-1000"></div>
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-xs font-black text-[var(--text-main)] border border-glass-border">
                    0%
                  </div>
                  <svg className="absolute w-12 h-12 -rotate-90">
                    <circle 
                      cx="24" cy="24" r="22" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      className="text-slate-100 dark:text-slate-800/50"
                    />
                    <circle 
                      cx="24" cy="24" r="22" 
                      fill="none" 
                      stroke="var(--secondary)" 
                      strokeWidth="2" 
                      strokeDasharray="138.2" 
                      strokeDashoffset="135.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* About Course */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-[var(--text-main)] uppercase tracking-wider">About Course</h2>
            <p className="text-base text-[var(--text-muted)] leading-relaxed font-medium">
              {course.summary}
            </p>
          </section>

          {/* Enrolment Options */}
          <section className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-[var(--text-main)] uppercase tracking-wider">Enrolment Options</h2>
              <p className="text-xs font-bold text-[var(--text-muted)] opacity-60">Choose how you'd like to access this course</p>
            </div>

            <div className="academy-card bg-surface overflow-hidden shadow-lg border-glass-border rounded-2xl">
              {/* Header */}
              <div 
                className="p-6 flex items-center justify-between cursor-pointer group"
                onClick={() => setExpandedEnroll(!expandedEnroll)}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-black text-[var(--text-main)]">Self Enrolment</h3>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-lg">Recommended</span>
                  </div>
                  <p className="text-[var(--text-muted)] text-xs font-medium">Start learning immediately with instant access</p>
                </div>
                <div className={`p-2 rounded-xl bg-surface-hover text-[var(--text-muted)] group-hover:text-primary transition-all ${expandedEnroll ? 'rotate-180' : ''}`}>
                  <ChevronDown size={18} />
                </div>
              </div>

              {/* Expanded Content */}
              {expandedEnroll && (
                <div className="p-6 pt-0 border-t border-glass-border animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-6 py-6 border-b border-glass-border mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Lock size={24} />
                    </div>
                    <div>
                      <p className="text-base font-black text-[var(--text-main)]">No enrolment key required</p>
                      <p className="text-xs font-bold text-[var(--text-muted)] opacity-60">Open access for all students</p>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    <h4 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] opacity-40">What you'll get:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FeatureItem label="Instant access to materials" />
                      <FeatureItem label="Self-paced learning" />
                      <FeatureItem label="Track progress" />
                      <FeatureItem label="Course Certificate" />
                    </div>
                  </div>

                  <button 
                    onClick={handleEnroll}
                    className="w-full py-4 bg-[#00A3FF] hover:bg-[#0092E6] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 group"
                  >
                    Enroll Now
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* ── RIGHT COLUMN: SIDEBAR ── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Course Features */}
          <div className="academy-card p-6 space-y-6 bg-surface border-glass-border rounded-2xl">
            <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] opacity-50">Course Features</h3>

            <div className="space-y-5">
              {course.features.map((feature, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-surface-hover flex items-center justify-center group-hover:scale-105 transition-all">
                      {feature.icon}
                    </div>
                    <span className="text-sm font-bold text-[var(--text-muted)]">{feature.label}</span>
                  </div>
                  <span className="text-sm font-black text-[var(--text-main)]">{feature.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructors */}
          <div className="academy-card p-6 space-y-6 bg-surface border-glass-border rounded-2xl">
            <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] opacity-50">Instructors</h3>
            
            <div className="pt-2 border-t border-glass-border">
              {course.instructors.length > 0 ? (
                course.instructors.map((inst, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-hover transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-[var(--text-muted)] border border-glass-border">
                       <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[var(--text-main)]">{inst.name}</p>
                      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{inst.role}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-2">
                   <p className="text-sm font-bold text-[var(--text-muted)] opacity-40">No Instructor</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function ProgressStatCard({ value, label, subtext, icon, color, badge }) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-500',
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
  };

  return (
    <div className="academy-card bg-surface p-5 flex items-center justify-between group hover:shadow-lg transition-all duration-500 rounded-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
           <h3 className="text-2xl font-black text-[var(--text-main)]">{value}</h3>
           {badge && (
             <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[8px] font-black rounded-full">
               {badge}
             </span>
           )}
        </div>
        <div>
          <p className="text-[10px] font-black text-[var(--text-main)] opacity-60 flex items-center gap-1.5 uppercase tracking-wider">
            {label}
            <Info size={10} className="opacity-30" />
          </p>
          <p className="text-[9px] font-bold text-[var(--text-muted)] mt-0.5">{subtext}</p>
        </div>
      </div>
      <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center ${colorClasses[color]} group-hover:scale-105 transition-transform shadow-sm`}>
        {icon}
      </div>
    </div>
  );
}

function FeatureItem({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
        <CheckCircle2 size={14} />
      </div>
      <span className="text-xs font-bold text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

