'use client';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { User, Mail, Shield, Check, Camera, Loader2, Key, Bell, Globe } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const user = session?.user || {};

  return (
    <div className="w-full max-w-5xl mx-auto px-8 py-12 text-main">
      
      {/* Profile Header */}
      <div className="academy-card p-12 flex flex-col items-center text-center relative overflow-hidden mb-10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-purple-600/20 opacity-50"></div>
        
        <div className="relative mt-10">
           <div className="w-32 h-32 rounded-full bg-background border-4 border-surface overflow-hidden shadow-2xl flex items-center justify-center text-primary font-black text-4xl">
              {user.name?.[0] || 'A'}
           </div>
           <button className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-all">
              <Camera size={18} />
           </button>
        </div>

        <div className="mt-8">
          <h1 className="text-4xl font-black text-main mb-2">
            {user.name || 'Academy Scholar'}
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted">
            <Shield size={14} className="text-primary" /> {user.role || 'Member'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
         
         {/* Account Info */}
         <div className="md:col-span-2 space-y-8">
            <div className="academy-card p-10 space-y-8">
               <h3 className="text-xs font-black uppercase tracking-widest text-muted border-b border-glass-border pb-4">Personal Details</h3>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <ProfileField icon={<User size={18}/>} label="Full Name" value={user.name || 'Not Provided'} />
                  <ProfileField icon={<Mail size={18}/>} label="Email Address" value={user.email || 'Not Provided'} />
                  <ProfileField icon={<Globe size={18}/>} label="Language" value="English (International)" />
                  <ProfileField icon={<Bell size={18}/>} label="Notifications" value="Enabled" />
               </div>
            </div>

            <div className="academy-card p-10 bg-primary/5 border-primary/20">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
                        <Key size={20} />
                     </div>
                     <div>
                        <h4 className="font-black text-sm">Security & Access</h4>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Update password or 2FA</p>
                     </div>
                  </div>
                  <button className="bg-surface border border-glass-border px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                     Manage
                  </button>
               </div>
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6">
            <div className="academy-card p-8 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">Courses In Progress</p>
                  <p className="text-2xl font-black text-main">04</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-black italic">!</div>
            </div>
            <div className="academy-card p-8 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">Rewards Claimed</p>
                  <p className="text-2xl font-black text-main">12</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-black italic">★</div>
            </div>
         </div>

      </div>
    </div>
  );
}

function ProfileField({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
       <div className="mt-1 text-primary">{icon}</div>
       <div>
          <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-bold text-main">{value}</p>
       </div>
    </div>
  );
}
