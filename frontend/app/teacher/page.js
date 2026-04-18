'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  BookOpen,
  Activity,
  Zap, 
  BarChart3, 
  Users, 
  BrainCircuit, 
  ClipboardCheck, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  X,
  Loader2
} from 'lucide-react';

export default function TeacherPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [stats, setStats] = useState({ activeStudents: 0, totalCourses: 0, completionRate: 74, avgGrade: 88 });

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        fetch('http://localhost:4000/api/users'),
        fetch('http://localhost:4000/api/courses')
      ]);
      setStats({
        activeStudents: (await uRes.json()).length || 0,
        totalCourses: (await cRes.json()).length || 0,
        completionRate: 74,
        avgGrade: 88
      });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-8 py-6 h-[calc(100vh-100px)] flex flex-col overflow-hidden text-main">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black italic">TEACHER<span className="text-primary not-italic">HUB</span></h1>
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mt-1">Academic Controller</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setShowAIModal(true)} className="bg-primary hover:scale-105 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-primary/20 transition-all flex items-center gap-3">
              <Sparkles size={18} /> Neural Quiz Factory
           </button>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-12 grid-rows-6 gap-6 min-h-0 overflow-y-auto pr-2 custom-scrollbar pb-10">
        <div className="col-span-12 lg:col-span-8 row-span-3 academy-card p-12 flex flex-col relative overflow-hidden group hover:border-primary/20 cursor-pointer" onClick={() => setShowAIModal(true)}>
           <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform text-primary">
              <BrainCircuit size={160} />
           </div>
           <span className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[10px] mb-8">
              <Zap size={20} /> AI Powered Content
           </span>
           <h2 className="text-4xl font-black mb-4 max-w-sm italic">Automate your grading with AI.</h2>
           <p className="text-sm font-bold text-muted max-w-lg leading-relaxed">Instantly convert course modules into interactive assessments. Recreated from the repository's neural toolset.</p>
           <button className="mt-auto academy-button w-56 h-14 bg-primary text-white">Open Quiz Factory <ArrowUpRight size={18}/></button>
        </div>

        <div className="col-span-12 lg:col-span-4 row-span-3 space-y-6">
           <StatCard label="Enrolled Scholars" value={stats.activeStudents} trend="+5%" icon={<Users className="text-blue-500"/>} />
           <StatCard label="Active Modules" value={stats.totalCourses} trend="Sync OK" icon={<BookOpen className="text-purple-500"/>} />
           <StatCard label="Success Yield" value={`${stats.completionRate}%`} trend="+2%" icon={<TrendingUp className="text-green-500"/>} />
        </div>

        <div className="col-span-12 lg:col-span-6 row-span-3 academy-card p-10 flex flex-col">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-[10px] font-black uppercase text-muted tracking-widest">Attendance Heatmap</h3>
              <Activity size={18} className="text-primary" />
           </div>
           <div className="flex-grow flex items-end justify-between gap-4 px-4">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <div key={i} className="flex-grow h-full flex flex-col justify-end">
                   <div style={{height: `${h}%`}} className="w-full bg-primary/20 rounded-t-xl hover:bg-primary/50 transition-all cursor-pointer"></div>
                </div>
              ))}
           </div>
        </div>

        <div className="col-span-12 lg:col-span-6 row-span-3 academy-card p-10 overflow-hidden flex flex-col">
           <h3 className="text-[10px] font-black uppercase text-muted tracking-widest mb-8">Live Course Sessions</h3>
           <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              <SessionItem name="Vinit Chauhan" status="Studying: Neural Nets" />
              <SessionItem name="Sarah Miller" status="Studying: UX Design" />
              <SessionItem name="Marcus Thorne" status="Quiz Attempt: ML-01" />
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }) {
  return (
    <div className="academy-card p-8 flex flex-col justify-between hover:scale-[1.02] cursor-pointer">
       <div className="flex justify-between items-center mb-1">
          <div className="p-3 rounded-2xl bg-white/5">{icon}</div>
          <span className="text-[10px] font-black text-green-500 uppercase">{trend}</span>
       </div>
       <div>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black">{value}</p>
       </div>
    </div>
  );
}

function SessionItem({ name, status }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-3xl border border-glass-border bg-white/[0.01] hover:bg-white/5 transition-all">
       <div className="flex items-center gap-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">{name[0]}</div>
          <div>
             <h4 className="text-sm font-black italic">{name}</h4>
             <p className="text-[10px] font-bold text-muted mt-0.5">{status}</p>
          </div>
       </div>
       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
    </div>
  );
}
