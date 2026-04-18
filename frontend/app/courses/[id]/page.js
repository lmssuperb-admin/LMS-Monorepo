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
  Loader2
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function CoursePlayer() {
  const router = useRouter();
  const { id } = useParams();
  const [courseContent, setCourseContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);
  const [showTutor, setShowTutor] = useState(true);

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
            {courseContent.map((section, sidx) => (
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
            ))}
         </div>
      </div>

      {/* ── CENTER: CONTENT PLAYER ────────────────────────────────────── */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
         
         {/* Player Area */}
         <div className="flex-grow bg-black flex items-center justify-center p-10">
            {activeModule ? (
               <div className="w-full h-full max-w-5xl rounded-[40px] overflow-hidden shadow-3xl bg-[var(--surface)] border border-glass-border flex flex-col">
                  {activeModule.modname === 'resource' ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-20">
                       <div className="w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-8 animate-float">
                          <FileText size={48} />
                       </div>
                       <h2 className="text-3xl font-black text-[var(--text-main)] mb-4">{activeModule.name}</h2>
                       <p className="text-[var(--text-muted)] max-w-lg mb-10 leading-relaxed">This PDF resource is being decrypted from the Moodle vault. You can read it here or download it to your local machine.</p>
                       <button className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                          View Presentation
                       </button>
                    </div>
                  ) : (
                    <div className="relative w-full h-full group">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-12 opacity-0 group-hover:opacity-100 transition-opacity">
                          <h2 className="text-2xl font-black text-white">{activeModule.name}</h2>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Video Lecture 04: Industrial Systems</p>
                       </div>
                       <video className="w-full h-full object-cover" poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070">
                          {/* Real video logic would go here */}
                       </video>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <button className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                             <Play size={32} fill="white" />
                          </button>
                       </div>
                    </div>
                  )}
               </div>
            ) : (
               <div className="text-center text-[var(--text-muted)]">
                  <BookMarked size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">Select a module to begin learning</p>
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

      {/* ── RIGHT: PERSISTENT AI TUTOR ─────────────────────────────────── */}
      {showTutor && (
        <div className="w-80 lg:w-96 flex-shrink-0 bg-surface border-l border-glass-border flex flex-col h-full">
           <div className="p-8 border-b border-glass-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Brain className="text-primary" size={20}/>
                 <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">Lesson Assistant</h2>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           </div>
           
           <div className="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-6">
              <TutorBubble msg="I've analyzed this module. It focuses on the second law of thermodynamics. Need help with the formulas?" />
              <TutorBubble msg="Pro-tip: Focus on the entropy equation at 04:30. It's often in the final exam." />
           </div>

           <div className="p-6 bg-white/[0.02] border-t border-glass-border">
              <div className="bg-black/20 border border-glass-border rounded-xl p-2 flex gap-2">
                 <input 
                   placeholder="Ask about this lesson..." 
                   className="flex-grow bg-transparent text-[10px] font-medium outline-none p-2 text-white"
                 />
                 <button className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                    <MessageSquare size={14}/>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function TutorBubble({ msg }) {
  return (
    <div className="flex gap-3">
       <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-1">
          <Sparkles size={12}/>
       </div>
       <div className="bg-white/5 border border-glass-border p-4 rounded-2xl text-[10px] font-medium leading-relaxed text-white/80 italic">
          "{msg}"
       </div>
    </div>
  );
}
