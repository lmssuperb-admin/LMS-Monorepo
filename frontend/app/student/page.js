'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  BookMarked, 
  Sparkles, 
  Trophy, 
  Clock, 
  ChevronRight,
  Brain,
  Search,
  CalendarDays,
  X,
  Send,
  Loader2
} from 'lucide-react';

export default function StudentPanel() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTutor, setShowTutor] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/courses');
      const data = await res.json();
      setCourses((data || []).map(c => ({
        id: c.id,
        name: c.fullname,
        shortname: c.shortname,
        progress: Math.floor(Math.random() * 100),
        image: getCourseEmoji(c.fullname)
      })));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const getCourseEmoji = (name) => {
     if (name.toLowerCase().includes('python')) return '🐍';
     if (name.toLowerCase().includes('react')) return '⚛️';
     if (name.toLowerCase().includes('ai')) return '🤖';
     return '📚';
  };

  const handleTutorSend = () => {
     if (!chatMsg.trim()) return;
     setIsTyping(true);
     setChatMsg('');
     setTimeout(() => setIsTyping(false), 2000);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-8 py-6 h-[calc(100vh-100px)] flex flex-col overflow-hidden relative">
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-main mb-1">My <span className="text-primary">Learning</span></h1>
          <p className="text-xs font-bold text-muted uppercase tracking-[0.2em]">Academic Journey Overview</p>
        </div>
        
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
           <input 
             type="text" 
             placeholder="Search library..." 
             className="academy-input w-72 h-12"
           />
        </div>
      </div>

      <div className="flex-grow flex gap-8 min-h-0 overflow-y-auto pr-2 custom-scrollbar pb-10">
        <div className="flex-grow space-y-8 min-w-0">
           
           <div 
             onClick={() => router.push('/courses/recommendations')}
             className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-glass-border rounded-[48px] p-10 flex items-center justify-between overflow-hidden relative cursor-pointer hover:border-primary/40 transition-all group shadow-xl"
           >
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform">
                 <Brain size={260} />
              </div>
              <div className="relative z-10 max-w-xl">
                 <span className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-4">
                    <Sparkles size={14} /> AI Recommendation
                 </span>
                 <h2 className="text-3xl font-black text-main mb-4 leading-tight italic uppercase">Mastering Neural Logic</h2>
                 <p className="text-muted text-sm mb-8 leading-relaxed font-bold">Recommended based on your enrollment in "Intro to AI".</p>
                 <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 group-hover:scale-105 transition-all">
                    Resume Path
                 </button>
              </div>
           </div>

           <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted mb-6 ml-4">Active Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {courses.map(course => (
                   <div key={course.id} onClick={() => router.push(`/courses/${course.id}`)} className="academy-card p-8 group cursor-pointer hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-6">
                         <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{course.image}</div>
                         <button className="p-3 bg-primary text-white shadow-lg rounded-xl"><Play size={16}/></button>
                      </div>
                      <h4 className="text-lg font-black text-main mb-1 line-clamp-1">{course.name}</h4>
                      <p className="text-[10px] font-black text-primary uppercase mb-6">{course.shortname}</p>
                      <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                         <div className="h-full bg-primary" style={{width: `${course.progress}%`}}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 flex-shrink-0 space-y-6">
           <div className="academy-card p-10">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Timeline</h3>
                 <CalendarDays size={18} className="text-primary" />
              </div>
              <div className="space-y-8">
                 <TimelineItem title="Midterm Quiz" date="April 20" type="exam" />
                 <TimelineItem title="Final Handover" date="May 01" type="submission" />
              </div>
           </div>

           <div onClick={() => setShowTutor(true)} className="academy-card p-10 bg-primary/5 hover:bg-primary/10 cursor-pointer border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Brain size={120} /></div>
              <h3 className="text-lg font-black text-main mb-2">AI Academic Assistant</h3>
              <p className="text-xs font-bold text-muted mb-6 leading-relaxed">Ask an AI anything about your Moodle courses.</p>
              <button className="bg-primary text-white w-full py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-primary/20">Expand Tutor</button>
           </div>
        </div>
      </div>

      {/* Tutor Modal */}
      {showTutor && (
        <div className="fixed inset-0 z-[150] flex items-center justify-end p-6 bg-black/40 backdrop-blur-md">
           <div className="relative w-full max-w-lg h-full max-h-[850px] academy-card flex flex-col overflow-hidden animate-in slide-in-from-right-10">
              <div className="p-10 border-b border-glass-border flex justify-between">
                 <h3 className="text-xl font-black">AI Tutor Hub</h3>
                 <button onClick={() => setShowTutor(false)}><X size={24}/></button>
              </div>
              <div className="flex-grow p-10 overflow-y-auto space-y-6">
                 <div className="bg-primary/10 p-5 rounded-3xl text-sm font-bold text-main rounded-tl-none">Hello! How can I help with your studies?</div>
              </div>
              <div className="p-10 border-t border-glass-border flex gap-4">
                 <input className="academy-input flex-grow h-14" placeholder="Type a message..." />
                 <button className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center"><Send size={24}/></button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ title, date, type }) {
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${type === 'exam' ? 'bg-red-500' : 'bg-primary'} animate-pulse`}></div>
          <div>
             <h4 className="text-xs font-black text-main">{title}</h4>
             <p className="text-[9px] font-black text-muted uppercase tracking-widest">{date}</p>
          </div>
       </div>
       <ChevronRight size={14} className="text-muted group-hover:text-primary transition-colors" />
    </div>
  );
}
