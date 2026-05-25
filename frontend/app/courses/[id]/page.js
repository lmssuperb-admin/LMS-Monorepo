'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import { apiUrl } from '@/lib/apiBase';
import { isNumericCourseId, normalizeCurriculumSections, STATIC_DEMO_CURRICULUM } from '@/lib/courseContent';
import {
  fetchRecommendedIds,
  fetchUserProgress,
  trackLearningEvent,
  buildModuleKey,
  countCurriculumModules,
  calcProgressPercent,
  formatDurationMinutes,
  formatActivityTime,
} from '@/lib/learningProgress';

export default function CourseAcademyPlayer() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session } = useSession();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);
  const [learningPaths, setLearningPaths] = useState([]);
  const [activePath, setActivePath] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [isRecommendedCourse, setIsRecommendedCourse] = useState(false);
  const moduleTimerRef = useRef(null);
  const moduleStartedRef = useRef(null);

  const userId = session?.user?.id;

  const refreshProgress = useCallback(async () => {
    if (!userId) return;
    const data = await fetchUserProgress(userId);
    const prog = data?.courses?.[String(id)];
    setCourseProgress(prog || null);
  }, [userId, id]);

  useEffect(() => {
    fetchCourseDetails();
    fetchLearningPaths();
    fetchRecommendedIds().then(ids => setIsRecommendedCourse(ids.map(Number).includes(Number(id))));
  }, [id]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  useEffect(() => {
    if (!course || !userId) return;
    let cancelled = false;
    (async () => {
      const recIds = await fetchRecommendedIds();
      if (cancelled) return;
      const isRec = recIds.map(Number).includes(Number(id));
      setIsRecommendedCourse(isRec);
      await trackLearningEvent({
        userId,
        courseId: id,
        courseName: course.fullname,
        action: 'start',
        source: isRec ? 'recommended' : 'catalog',
        totalModules: countCurriculumModules(course.curriculum),
      });
      await refreshProgress();
    })();
    return () => { cancelled = true; };
  }, [course?.id, userId, id, refreshProgress]);

  const fetchLearningPaths = async () => {
    try {
      const res = await fetch(apiUrl('/learningpaths'));
      const paths = await res.json();
      const list = Array.isArray(paths) ? paths : [];
      setLearningPaths(list);
      const courseIdNum = parseInt(id, 10);
      const path = list.find(p =>
        (p.courses || []).some(cid => String(cid) === String(id) || Number(cid) === courseIdNum)
      );
      if (path) setActivePath(path);
    } catch (err) {
      console.error('Failed to fetch learning paths', err);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      let fullname = 'Course';
      let shortname = '';
      let summary =
        'Explore lessons, resources, and activities for this course. Select a module from the sidebar to begin.';

      if (isNumericCourseId(id)) {
        try {
          const metaRes = await fetch(apiUrl('/courses'));
          const all = await metaRes.json();
          const meta = (Array.isArray(all) ? all : []).find(c => String(c.id) === String(id));
          if (meta) {
            fullname = meta.fullname || meta.shortname || fullname;
            shortname = meta.shortname || '';
            summary = meta.summary?.replace(/<[^>]*>/g, '') || summary;
          }
        } catch {
          /* optional metadata */
        }

        const res = await fetch(apiUrl(`/courses/${id}`));
        const data = await res.json();
        if (data?.error) throw new Error(data.error);

        const filteredCurriculum = normalizeCurriculumSections(
          Array.isArray(data) && data.length > 0 ? data : STATIC_DEMO_CURRICULUM,
          fullname
        );

        const coursePayload = {
          id,
          fullname,
          shortname: shortname || fullname,
          summary,
          image: '/posh_banner.png',
          curriculum: filteredCurriculum,
        };
        setCourse(coursePayload);
        return;
      }

      setCourse({
        id,
        fullname: 'Demo course',
        shortname: 'Demo',
        summary,
        image: '/posh_banner.png',
        curriculum: STATIC_DEMO_CURRICULUM,
      });
    } catch (err) {
      console.error(err);
      setCourse({
        id,
        fullname: 'Course',
        shortname: '',
        summary: 'Showing offline demo content because the course could not be loaded from Moodle.',
        image: '/posh_banner.png',
        curriculum: STATIC_DEMO_CURRICULUM,
      });
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
  const totalModules = countCurriculumModules(curriculum);
  const progressPercent = calcProgressPercent(courseProgress, totalModules);
  const completedCount = courseProgress?.completedModules?.length || 0;
  const timeSpentLabel = formatDurationMinutes(courseProgress?.timeSpentSeconds);
  const lastActivityLabel = courseProgress?.completedAt
    ? `Completed ${formatActivityTime(courseProgress.completedAt)}`
    : courseProgress?.lastActivityAt
      ? `Last active ${formatActivityTime(courseProgress.lastActivityAt)}`
      : 'Not started yet';

  const flushModuleTime = async (mod, seconds) => {
    if (!userId || !mod?._key || seconds < 3) return;
    await trackLearningEvent({
      userId,
      courseId: id,
      courseName: course.fullname,
      action: 'view_module',
      moduleKey: mod._key,
      seconds,
      source: isRecommendedCourse ? 'recommended' : 'catalog',
      totalModules,
    });
    await refreshProgress();
  };

  const openModule = async (mod, tIdx, mIdx) => {
    if (moduleTimerRef.current && activeModule) {
      const elapsed = Math.round((Date.now() - moduleStartedRef.current) / 1000);
      await flushModuleTime(activeModule, elapsed);
    }
    const enriched = { ...mod, _key: buildModuleKey(tIdx, mIdx, mod), _tIdx: tIdx, _mIdx: mIdx };
    setActiveModule(enriched);
    moduleStartedRef.current = Date.now();
    if (userId) {
      await trackLearningEvent({
        userId,
        courseId: id,
        courseName: course.fullname,
        action: 'view_module',
        moduleKey: enriched._key,
        source: isRecommendedCourse ? 'recommended' : 'catalog',
        totalModules,
      });
      await refreshProgress();
    }
  };

  const markModuleComplete = async () => {
    if (!activeModule || !userId) return;
    const elapsed = moduleStartedRef.current
      ? Math.round((Date.now() - moduleStartedRef.current) / 1000)
      : 0;
    await trackLearningEvent({
      userId,
      courseId: id,
      courseName: course.fullname,
      action: 'complete_module',
      moduleKey: activeModule._key,
      seconds: Math.max(elapsed, 30),
      source: isRecommendedCourse ? 'recommended' : 'catalog',
      totalModules,
    });
    moduleStartedRef.current = Date.now();
    await refreshProgress();
  };

  const isModuleDone = (tIdx, mIdx, mod) => {
    const key = buildModuleKey(tIdx, mIdx, mod);
    return courseProgress?.completedModules?.includes(key);
  };

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
                        <h3 className="text-base font-black text-[var(--text-main)] tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                           {course.shortname || course.fullname}
                        </h3>
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
                              <p className="text-[9px] font-black text-[var(--text-muted)] opacity-50">({topic.modules?.length || 0}/{totalModules || '?'})</p>
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

                              const isCompleted = isModuleDone(tIdx, mIdx, mod);
                              const isActive = activeModule?._key === buildModuleKey(tIdx, mIdx, mod);

                              return (
                                 <div 
                                    key={mIdx} 
                                    onClick={() => openModule(mod, tIdx, mIdx)}
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
                        <button
                           onClick={markModuleComplete}
                           className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg flex items-center gap-2"
                        >
                           <CheckCircle2 size={14} /> Mark complete
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
                           <div
                              className="h-full bg-secondary rounded-full shadow-[0_0_8px_rgba(14,165,233,0.3)] transition-all"
                              style={{ width: `${progressPercent}%` }}
                           ></div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-[9px] font-black text-[var(--text-main)] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                          {progressPercent}%
                        </div>
                        <button 
                           onClick={() => {
                              const firstTopic = curriculum?.[0];
                              const first = firstTopic?.modules?.[0];
                              if (first) openModule(first, 0, 0);
                           }}
                           disabled={!curriculum?.[0]?.modules?.length}
                           className="px-10 py-3 bg-[#00A3FF] hover:bg-[#0092E6] text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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
                           <ProgressStatCard value={`${progressPercent}%`} label="Course Progress" subtext={lastActivityLabel} icon={<User size={18} className="text-purple-500" />} color="purple" />
                           <div className="academy-card bg-surface p-5 flex items-center justify-between group hover:shadow-lg transition-all duration-500 rounded-2xl">
                              <div className="space-y-2">
                                 <h3 className="text-2xl font-black text-[var(--text-main)]">{timeSpentLabel}</h3>
                                 <p className="text-[10px] font-black text-[var(--text-main)] opacity-60 flex items-center gap-1.5 uppercase tracking-wider">Time Spent <Info size={10} className="opacity-30" /></p>
                              </div>
                              <div className="w-14 h-14 rounded-[20px] flex items-center justify-center bg-blue-500/10 text-blue-500">
                                 <Clock size={18} />
                              </div>
                           </div>
                           <div className="academy-card bg-surface p-5 flex items-center justify-between group hover:shadow-lg transition-all duration-500 rounded-2xl">
                              <div className="space-y-2">
                                 <h3 className="text-2xl font-black text-[var(--text-main)]">{completedCount}/{totalModules || '—'}</h3>
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
