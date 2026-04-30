'use client';
import { useState, useEffect } from 'react';
import { 
  Play, 
  FileText, 
  HelpCircle, 
  ChevronLeft, 
  CheckCircle2, 
  Lock, 
  Brain, 
  MessageSquare,
  ChevronDown,
  Loader2,
  BookMarked
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function CoursePlayer() {
  const router = useRouter();
  const { id } = useParams();
  const [courseContent, setCourseContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    fetchCourseStructure();
  }, [id]);

  const fetchCourseStructure = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/courses/${id}`);
      const data = await res.json();
      setCourseContent(data || []);
      // Auto-select first module
      if (data?.[0]?.modules?.[0]) {
        setActiveModule(data[0].modules[0]);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
       <Loader2 className="animate-spin text-primary" size={40} />
       <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Curriculum...</p>
    </div>
  );

  return (
    <div className="w-full h-[calc(100vh-80px)] flex overflow-hidden bg-[var(--background)]">
      
      {/* ── LEFT: CURRICULUM SIDEBAR ────────────────────────────────── */}
      <div className="w-80 lg:w-96 flex-shrink-0 bg-surface border-r border-glass-border flex flex-col h-full">
         <div className="p-8 border-b border-glass-border">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-primary transition-all mb-4">
               <ChevronLeft size={14} /> Back to Library
            </button>
            <h1 className="text-xl font-black text-[var(--text-main)]">Course Structure</h1>
         </div>
         
         <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
            {Array.isArray(courseContent) ? courseContent.map((section, sidx) => (
              <div key={section.id || sidx} className="space-y-3">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-2">{section.name || 'Intro'}</h3>
                 <div className="space-y-1">
                    {section.modules?.map((mod) => (
                      <button 
                        key={mod.id}
                        onClick={() => setActiveModule(mod)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
                          activeModule?.id === mod.id 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'hover:bg-white/5 text-[var(--text-muted)]'
                        }`}
                      >
                         <div className={`p-2 rounded-lg ${activeModule?.id === mod.id ? 'bg-white/20 text-white' : 'bg-white/5'}`}>
                            {mod.modname === 'resource' ? <FileText size={16}/> : <Play size={16}/>}
                         </div>
                         <div className="flex-grow min-w-0">
                            <p className="text-xs font-bold truncate leading-tight">{mod.name}</p>
                            <p className={`text-[9px] mt-1 font-black uppercase tracking-widest ${activeModule?.id === mod.id ? 'text-white/60' : 'text-primary'}`}>
                               {mod.modname}
                            </p>
                         </div>
                      </button>
                    ))}
                 </div>
              </div>
            )) : (
              <div className="text-center p-6 bg-red-500/10 text-red-500 font-bold rounded-xl text-[10px] uppercase tracking-widest border border-red-500/20">
                 Failed to load curriculum: {courseContent?.error || 'Unknown API Error'}
              </div>
            )}
         </div>
      </div>

      {/* ── CENTER: CONTENT PLAYER ────────────────────────────────────── */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
         
         {/* Player Area */}
         <div className="flex-grow bg-black flex items-center justify-center p-10">
            {activeModule ? (
               <div className="w-full h-full max-w-5xl rounded-[40px] overflow-hidden shadow-3xl bg-[var(--surface)] border border-glass-border flex flex-col relative">
                  {/* Header Overlay (Hidden on hover for video) */}
                  <div className="absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                     <h2 className="text-xl font-black text-white italic tracking-tight">{activeModule.name}</h2>
                     <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Module: {activeModule.modname}</p>
                  </div>

                  {['resource', 'url', 'video', 'pdf'].includes(activeModule.modname || activeModule.type) ? (
                    <div className="w-full h-full bg-[#333] relative group">
                      {(() => {
                        const fileUrl = activeModule.contents?.[0]?.fileurl;
                        const externalUrl = activeModule.externalurl;
                        const customPdfUrl = activeModule.pdfUrl || activeModule.pdfurl;
                        const customVideoUrl = activeModule.videoUrl || activeModule.videourl;

                        const url = customPdfUrl || customVideoUrl || fileUrl || externalUrl || activeModule.url;

                        if (!url) {
                          return (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
                              {['resource', 'pdf'].includes(activeModule.modname || activeModule.type) ? <FileText size={64} className="mb-6 opacity-30" /> : <Play size={64} className="mb-6 opacity-30" />}
                              <p className="text-sm font-black uppercase tracking-[0.2em] mb-2">Content Not Found</p>
                              <p className="text-[10px] text-center max-w-[250px]">The file or link for this module is missing. Please recreate this activity in the admin console.</p>
                            </div>
                          );
                        }

                        const finalUrl = (url === fileUrl)
                          ? url + (url.includes('?') ? '&' : '?') + 'token=' + (localStorage.getItem('moodle_token') || '6219356d21396a8682054c7d0ccf825e')
                          : url;

                        // PDF
                        if (url.toLowerCase().includes('.pdf')) {
                          return <iframe src={finalUrl} className="w-full h-full border-none" title="PDF Viewer" />;
                        }

                        // YouTube
                        if (url.includes('youtube.com') || url.includes('youtu.be')) {
                          const videoId = url.match(/v=([^\&]+)/)?.[1] || url.match(/youtu\.be\/([^?]+)/)?.[1];
                          return <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} className="w-full h-full border-none" allow="autoplay; encrypted-media" allowFullScreen />;
                        }

                        // Vimeo
                        if (url.includes('vimeo.com')) {
                          const videoId = url.split('/').pop();
                          return <iframe src={`https://player.vimeo.com/video/${videoId}?autoplay=1`} className="w-full h-full border-none" allow="autoplay; fullscreen" allowFullScreen />;
                        }

                        // Direct video
                        if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) {
                          return <video controls autoPlay className="w-full h-full object-contain bg-black" src={finalUrl} />;
                        }

                        // Fallback
                        return <iframe src={finalUrl} className="w-full h-full border-none" title="External Content" />;
                      })()}
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-20">
                      <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 animate-float">
                        <Brain size={48} />
                      </div>
                      <h2 className="text-3xl font-black text-[var(--text-main)] mb-4">{activeModule.name}</h2>
                      <p className="text-[var(--text-muted)] max-w-lg mb-10 leading-relaxed italic">
                        "This module contains interactive content. Click below to launch the activity in a safe environment."
                      </p>
                      <a 
                        href={activeModule.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-primary text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                      >
                        Launch Activity
                      </a>
                    </div>
                  )}
               </div>
            ) : (
               <div className="text-center text-[var(--text-muted)] animate-pulse">
                  <BookMarked size={64} className="mx-auto mb-6 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initialize Curriculum Stream...</p>
               </div>
            )}
         </div>

         {/* Content Bar */}
         <div className="h-24 bg-surface border-t border-glass-border px-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <button className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] group-hover:bg-primary/10 group-hover:text-primary transition-all">
                     <HelpCircle size={18}/>
                  </div>
                  <span className="text-[8px] font-black uppercase text-[var(--text-muted)]">Question</span>
               </button>
               <button className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] group-hover:bg-primary/10 group-hover:text-primary transition-all">
                     <CheckCircle2 size={18}/>
                  </div>
                  <span className="text-[8px] font-black uppercase text-[var(--text-muted)]">Completed</span>
               </button>
            </div>
            
            <div className="flex gap-4">
               <button className="px-8 py-3 rounded-2xl border border-glass-border text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] hover:bg-white/5 transition-all">
                  Previous Lesson
               </button>
               <button className="px-8 py-3 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                  Next: Lab Workflow
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
