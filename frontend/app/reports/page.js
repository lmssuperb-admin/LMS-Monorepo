'use client';
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShieldAlert, 
  History, 
  FileSpreadsheet, 
  TrendingUp, 
  PieChart, 
  Download, 
  Filter,
  Users,
  Search,
  ChevronRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ReportingCenter() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    logs: [],
    grades: [],
    systemStats: { uptime: '99.99%', cpu: '12%', database: 'Optimized' }
  });

  const role = session?.user?.role || 'student';

  useEffect(() => {
    fetchReportData();
  }, [role]);

  const fetchReportData = async () => {
    try {
      // Porting logic: This links to your report_user_logins and gradebook blocks
      const [uRes] = await Promise.all([
        fetch('http://localhost:4000/api/users')
      ]);
      const users = await uRes.json();
      
      // Simulated data based on ported patterns
      const userList = Array.isArray(users) ? users : [];
      
      setData({
        ...data,
        logs: [
           { id: 1, user: 'Admin User', event: 'System Configuration Change', time: '12m ago', level: 'Notice' },
           { id: 2, user: 'Vinit Chauhan', event: 'Course Module: AI Quiz Completed', time: '1h ago', level: 'Info' },
           { id: 3, user: 'Sarah Lee', event: 'Failed Login Attempt', time: '3h ago', level: 'Warning' }
        ],
        grades: userList.slice(0, 5).map(u => ({
           id: u.id,
           name: u.fullname || u.username,
           course: 'Advanced ML',
           grade: Math.floor(60 + Math.random() * 40),
           status: 'On Track'
        }))
      });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return (
     <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-8 py-6 h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-main)] mb-1">Academy <span className="text-[#3b82f6]">Analytics</span></h1>
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Institutional Performance Engine</p>
        </div>
        
        <div className="flex gap-4">
           <button className="bg-white/5 border border-glass-border px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] hover:bg-white/10 transition-all flex items-center gap-2">
              <Download size={16} /> Export CSV
           </button>
           <button className="bg-[#3b82f6] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-2">
              <Filter size={16} /> Filter Results
           </button>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-12 grid-rows-6 gap-6 min-h-0 overflow-y-auto pr-2 custom-scrollbar pb-10">
        
        {/* 1. Large Performance Module (Ported from statistics block) */}
        <div className="col-span-12 lg:col-span-8 row-span-4 bg-surface border border-glass-border rounded-[40px] p-10 flex flex-col shadow-xl">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <TrendingUp size={20} />
                 </div>
                 <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">Performance Velocity</h2>
              </div>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Growth</span>
                 <span className="px-3 py-1 bg-white/5 text-[var(--text-muted)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">Retention</span>
              </div>
           </div>
           
           <div className="flex-grow flex items-end justify-between gap-4 px-4 pb-4">
              {[62, 45, 87, 54, 76, 32, 94, 61, 85, 43, 72, 88].map((h, i) => (
                <div key={i} className="flex-grow group relative h-full flex flex-col justify-end">
                   <div style={{height: `${h}%`}} className="w-full bg-blue-500/20 rounded-t-xl group-hover:bg-blue-500/50 transition-all cursor-pointer"></div>
                </div>
              ))}
           </div>
           <div className="flex justify-between mt-4 px-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] border-t border-glass-border pt-6">
              <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
           </div>
        </div>

        {/* 2. Side Intelligence Cards */}
        <div className="col-span-12 lg:col-span-4 row-span-4 space-y-6">
           <ReportStat label="Avg Attendance" value="94.2%" trend="+4%" color="#3b82f6" icon={<BarChart3 size={20}/>} />
           <ReportStat label="Course Completion" value="78.1%" trend="+12%" color="#a855f7" icon={<PieChart size={20}/>} />
           <ReportStat label="Uptime Health" value={data.systemStats.uptime} trend="Stable" color="#10b981" icon={<ShieldAlert size={20}/>} />
        </div>

        {/* 3. Detailed Data Table (Ported from report_user_logins & gradebook) */}
        <div className="col-span-12 row-span-2 bg-surface border border-glass-border rounded-[40px] overflow-hidden flex flex-col shadow-2xl">
           <div className="p-8 border-b border-glass-border flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-xl font-bold text-[var(--text-main)]">{role === 'admin' ? 'Security Audit Log' : 'Grade Performance Report'}</h2>
              <div className="flex gap-3">
                 <button className="p-3 bg-white/5 border border-glass-border rounded-xl text-[var(--text-muted)] hover:text-primary transition-all">
                    <Search size={16} />
                 </button>
                 <button className="p-3 bg-white/5 border border-glass-border rounded-xl text-[var(--text-muted)] hover:text-primary transition-all">
                    <Calendar size={16} />
                 </button>
              </div>
           </div>
           
           <div className="overflow-x-auto flex-grow h-full custom-scrollbar">
              <table className="w-full text-left">
                 <thead className="bg-black/10 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-glass-border">
                    <tr>
                       <th className="px-10 py-5">Identified User</th>
                       <th className="px-10 py-5">{role === 'admin' ? 'Event Description' : 'Course Context'}</th>
                       <th className="px-10 py-5">Timestamp</th>
                       <th className="px-10 py-5">{role === 'admin' ? 'Security Level' : 'Grade/Result'}</th>
                       <th className="px-10 py-5 text-right">Verification</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/[0.03]">
                    {(role === 'admin' ? data.logs : data.grades).map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-all group">
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-black text-blue-400">{item.user?.[0] || item.name?.[0]}</div>
                               <span className="text-sm font-bold text-[var(--text-main)]">{item.user || item.name}</span>
                            </div>
                         </td>
                         <td className="px-10 py-6 text-xs text-[var(--text-muted)] font-medium">{item.event || item.course}</td>
                         <td className="px-10 py-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.time || 'Apr 16'}</td>
                         <td className="px-10 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                               (item.level === 'Warning' || item.grade < 70) ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                            }`}>
                               {item.level || `${item.grade}%`}
                            </span>
                         </td>
                         <td className="px-10 py-6 text-right">
                            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-primary hover:text-white transition-all">
                               <ChevronRight size={14}/>
                            </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
}

function ReportStat({ label, value, trend, icon, color }) {
  return (
    <div className="bg-surface border border-glass-border rounded-[32px] p-8 flex flex-col justify-between hover:border-white/10 transition-all shadow-xl group cursor-pointer h-[30.5%]">
       <div className="flex items-center justify-between mb-2">
          <div className="p-3 rounded-2xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110" style={{color: color}}>
            {icon}
          </div>
          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/5 text-[var(--text-muted)] group-hover:text-white transition-colors">
            {trend}
          </span>
       </div>
       <div>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-[var(--text-main)]">{value}</p>
       </div>
    </div>
  );
}
