'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronDown, 
  Search, 
  BookOpen, 
  Video, 
  FileText, 
  ClipboardCheck, 
  MousePointer2, 
  CheckCircle2, 
  User, 
  Clock, 
  Layers, 
  HelpCircle, 
  Info,
  Loader2,
  BookMarked
} from 'lucide-react';
import Image from 'next/image';

export default function CourseAcademyPlayer() {
  const router = useRouter();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);
  const [learningPaths, setLearningPaths] = useState([]);
  const [activePath, setActivePath] = useState(null);

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

  useEffect(() => {
    fetchCourseDetails();
    fetchLearningPaths();
  }, [id]);

  const fetchLearningPaths = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/learningpaths');
      const paths = await res.json();
      setLearningPaths(paths);
      
      // Find if this course is part of any path
      const path = paths.find(p => p.courses?.includes(id));
      if (path) setActivePath(path);
    } catch (err) { console.error('Failed to fetch learning paths', err); }
  };

  const fetchCourseDetails = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/courses/${id}`);
      const data = await res.json();
      
      // 🕵️ Filter out 'Announcements' and 'Forum' modules that are just clutter
      const filteredCurriculum = (data && data.length > 0 ? data : STATIC_POSH_CURRICULUM).map(topic => ({
        ...topic,
        modules: (topic.modules || []).filter(m => 
          m.name?.toLowerCase() !== 'announcements' && 
          m.modname !== 'forum'
        ).map(m => {
          // 📄 Smart PDF Detection: If a URL activity points to a PDF, treat it as a resource
          const url = m.externalurl || m.url || '';
          const lowUrl = url.toLowerCase();
          if (m.modname === 'url' && (lowUrl.endsWith('.pdf') || lowUrl.includes('pluginfile.php'))) {
             return { ...m, modname: 'resource', isDetectedPdf: true };
          }
          // 🎥 Smart Video Detection: If a URL activity points to a video, treat it as a video
          if (m.modname === 'url' && (lowUrl.endsWith('.mp4') || lowUrl.endsWith('.mov') || lowUrl.endsWith('.webm'))) {
             return { ...m, modname: 'video', isDetectedVideo: true };
          }
          return m;
        })
      }));

      const courseData = {
        id: id,
        fullname: filteredCurriculum?.[0]?.name || "POSH Compliance",
        shortname: "POSH",
        summary: "This course has an ILT presentation for the POSH course, a Policy Handout, and forms. It covers essential guidelines for preventing sexual harassment in the workplace.",
        image: "/posh_banner.png",
        curriculum: filteredCurriculum
      };
      
      setCourse(courseData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Entering Academy...</p>
    </div>
  );

  if (!course) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-10">
      <h2 className="text-2xl font-black text-[var(--text-main)]">Course Not Found</h2>
      <p className="text-[var(--text-muted)] max-w-xs">We couldn't retrieve the content for this academy path.</p>
      <button onClick={() => router.push('/courses')} className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest">
         Back to Library
      </button>
    </div>
  );

  const curriculum = course.curriculum;

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

            {/* ── LEARNING PATH SIDEBAR MODULE ── */}
            {activePath && (
               <div className="academy-card bg-surface overflow-hidden rounded-[20px] border-glass-border mt-6 shadow-lg animate-in slide-in-from-left-4 duration-700">
                  <div className="p-5 border-b border-glass-border bg-primary/5">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary text-white">
                           <Layers size={16} />
                        </div>
                        <div>
                           <h4 className="text-xs font-black text-[var(--text-main)] uppercase tracking-tight">Learning Path</h4>
                           <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{activePath.name}</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-3 space-y-1">
                     {activePath.courses?.map((pathCourseId, idx) => {
                        const isCurrent = pathCourseId === id;
                        // Since we don't have all course names, we'll just show the IDs for now or fetch them if needed
                        // But in a real app, we'd have course titles. 
                        // For now let's use a placeholder if it's not the current one.
                        return (
                           <div 
                              key={pathCourseId}
                              onClick={() => !isCurrent && router.push(`/courses/${pathCourseId}`)}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${isCurrent ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-hover opacity-60 hover:opacity-100'}`}
                           >
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${isCurrent ? 'bg-primary text-white' : 'bg-background text-muted'}`}>
                                 {idx + 1}
                              </div>
                              <span className={`text-[10px] font-bold ${isCurrent ? 'text-primary' : 'text-[var(--text-main)]'}`}>
                                 {isCurrent ? course.fullname : `Course ${pathCourseId}`}
                              </span>
                              {isCurrent && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}
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
                           <ChevronLeft size={14} /> Dashboard
                        </button>
                        <button className="px-8 py-2.5 rounded-xl text-xs font-black text-white bg-primary hover:bg-secondary transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                           Next <ChevronLeft size={14} className="rotate-180" />
                        </button>
                     </div>
                  </div>

                  {/* Content Display (PDF/Video Viewer) */}
                  <div className="academy-card bg-surface rounded-[24px] border-glass-border overflow-hidden shadow-xl min-h-[800px] flex flex-col">
                     {activeModule.modname === 'resource' || activeModule.modname === 'lesson' || activeModule.modname === 'video' ? (
                        <div className="flex-grow relative bg-slate-100 dark:bg-slate-900/50">
                           <div className="absolute inset-0 flex flex-col">
                               {/* Media Toolbar Mock */}
                               <div className="bg-white dark:bg-slate-800 border-b border-glass-border p-3 flex items-center justify-between shadow-sm z-10">
                                  <div className="flex items-center gap-4">
                                     <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        {activeModule.modname === 'video' ? <Video size={16} /> : <BookOpen size={16} />}
                                     </div>
                                     <span className="text-xs font-black text-slate-700 dark:text-slate-200">{activeModule.name}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                     {activeModule.modname === 'video' ? (
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-md uppercase tracking-widest text-[9px]">Live Video</span>
                                     ) : (
                                        <>
                                           <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-md">1 / 1</span>
                                           <div className="flex items-center gap-1 border-x border-glass-border px-4">
                                              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all"><ChevronLeft size={14} /></button>
                                              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all rotate-180"><ChevronLeft size={14} /></button>
                                           </div>
                                        </>
                                     )}
                                     <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all"><Layers size={14} /></button>
                                  </div>
                               </div>
                               
                               {/* The Content */}
                               <div className="flex-grow overflow-hidden flex items-center justify-center">
                                  {(() => {
                                     const moodleToken = localStorage.getItem('moodle_token') || '6219356d21396a8682054c7d0ccf825e';
                                     let mediaUrl = activeModule.externalurl || activeModule.url;
                                     
                                     if (activeModule.contents && activeModule.contents[0]) {
                                        mediaUrl = activeModule.contents[0].fileurl;
                                     }

                                     if (mediaUrl && mediaUrl.includes('pluginfile.php')) {
                                        const separator = mediaUrl.includes('?') ? '&' : '?';
                                        mediaUrl = `${mediaUrl}${separator}token=${moodleToken}`;
                                     }

                                     if (activeModule.modname === 'video' || (mediaUrl && (mediaUrl.toLowerCase().endsWith('.mp4') || mediaUrl.toLowerCase().endsWith('.mov')))) {
                                        return (
                                           <div className="w-full h-full bg-black flex items-center justify-center">
                                              <video 
                                                 src={mediaUrl} 
                                                 controls 
                                                 className="max-w-full max-h-full shadow-2xl"
                                                 autoPlay
                                              />
                                           </div>
                                        );
                                     }

                                     return (
                                        <iframe 
                                           src={mediaUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"} 
                                           className="w-full h-full border-none"
                                           title="Media Viewer"
                                        />
                                     );
                                  })()}
                               </div>
                           </div>
                        </div>
                     ) : (
                        <div className="flex-grow flex flex-col items-center justify-center p-20 text-center space-y-6">
                           <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                              <BookMarked size={40} />
                           </div>
                           <div className="space-y-2">
                              <h3 className="text-xl font-black text-[var(--text-main)]">External Activity</h3>
                              <p className="text-sm font-medium text-[var(--text-muted)] max-w-md mx-auto">
                                 This module opens in a secure external environment.
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
                           <div className="h-full bg-secondary w-[5%] rounded-full shadow-[0_0_8px_rgba(14,165,233,0.3)]"></div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-[9px] font-black text-[var(--text-main)] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                          5%
                        </div>
                        <button 
                           onClick={() => setActiveModule(curriculum[0].modules[0])}
                           className="px-10 py-3 bg-[#00A3FF] hover:bg-[#0092E6] text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-md shadow-blue-500/20 transition-all active:scale-95"
                        >
                           Continue Learning
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
                           <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider">Learning Progress</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <ProgressStatCard value="5%" label="Course Progress" subtext="Completed" icon={<User size={18} className="text-purple-500" />} color="purple" />
                           <div className="academy-card bg-surface p-5 flex items-center justify-between group hover:shadow-lg transition-all duration-500 rounded-2xl">
                              <div className="space-y-2">
                                 <h3 className="text-2xl font-black text-[var(--text-main)]">12 min</h3>
                                 <p className="text-[10px] font-black text-[var(--text-main)] opacity-60 flex items-center gap-1.5 uppercase tracking-wider">Time Spent <Info size={10} className="opacity-30" /></p>
                              </div>
                              <div className="w-14 h-14 rounded-[20px] flex items-center justify-center bg-blue-500/10 text-blue-500">
                                 <Clock size={18} />
                              </div>
                           </div>
                           <div className="academy-card bg-surface p-5 flex items-center justify-between group hover:shadow-lg transition-all duration-500 rounded-2xl">
                              <div className="space-y-2">
                                 <h3 className="text-2xl font-black text-[var(--text-main)]">1/19</h3>
                                 <p className="text-[10px] font-black text-[var(--text-main)] opacity-60 flex items-center gap-1.5 uppercase tracking-wider">Activities <Info size={10} className="opacity-30" /></p>
                              </div>
                              <div className="w-14 h-14 rounded-[20px] flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                                 <Layers size={18} />
                              </div>
                           </div>
                           <div className="academy-card bg-surface p-5 flex items-center justify-between group hover:shadow-lg transition-all duration-500 rounded-2xl">
                              <div className="space-y-2">
                                 <h3 className="text-2xl font-black text-[var(--text-main)]">0%</h3>
                                 <p className="text-[10px] font-black text-[var(--text-main)] opacity-60 flex items-center gap-1.5 uppercase tracking-wider">Avg Score <Info size={10} className="opacity-30" /></p>
                              </div>
                              <div className="w-14 h-14 rounded-[20px] flex items-center justify-center bg-amber-500/10 text-amber-500">
                                 <HelpCircle size={18} />
                              </div>
                           </div>
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

function ProgressStatCard({ value, label, subtext, icon, color }) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-500',
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
  };

  return (
    <div className="academy-card bg-surface p-5 flex items-center justify-between group hover:shadow-lg transition-all duration-500 rounded-2xl">
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-[var(--text-main)]">{value}</h3>
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
