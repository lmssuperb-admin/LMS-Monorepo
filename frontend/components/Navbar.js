'use client';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Bell, LogOut, User, Settings, Info, Menu } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  const role = session.user?.role || 'student';
  const homeHref =
    role === 'admin' ? '/admin' : role === 'teacher' || role === 'editingteacher' ? '/teacher' : '/student';

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="h-20 w-full flex items-center justify-between px-6 sm:px-10 border-b border-glass-border bg-background/50 backdrop-blur-xl z-[100] sticky top-0">
      
      {/* Brand Section */}
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={() => router.push(homeHref)}
      >
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
           <span className="font-black text-2xl italic">A</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black text-main uppercase tracking-[0.2em] leading-none">Academy<span className="text-primary">AI</span></span>
          <span className="text-[9px] font-bold text-muted uppercase tracking-[0.25em] mt-1.5 opacity-70">Institutional Portal</span>
        </div>
      </div>


      <div className="flex-grow"></div>

      {/* Action Center */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Always Visible Theme Toggle */}
        <button 
           onClick={toggleTheme}
           className="w-11 h-11 rounded-2xl bg-surface/40 border border-glass-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-sm overflow-hidden group/theme"
           title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
           <div className="relative w-5 h-5">
             <div className={`absolute inset-0 transition-all duration-500 ${theme === 'dark' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0 scale-50'}`}>
               <Sun size={20} />
             </div>
             <div className={`absolute inset-0 transition-all duration-500 ${theme === 'light' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0 scale-50'}`}>
               <Moon size={20} />
             </div>
           </div>
        </button>

        {/* Utilities (Notifications) */}
        <button className="hidden xs:flex w-11 h-11 rounded-2xl bg-surface/40 border border-glass-border items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all duration-300 relative group/bell">
          <Bell size={18}/>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface group-hover:scale-125 transition-transform"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-3 p-1 pr-3 sm:pr-4 rounded-full border transition-all duration-300 ${
              isDropdownOpen 
                ? 'bg-surface border-primary/40 shadow-xl shadow-primary/10' 
                : 'bg-surface/40 border-glass-border hover:border-primary/30'
            }`}
          >
            {/* User Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-glass-border overflow-hidden bg-gradient-to-tr from-primary/10 to-purple-500/10 flex items-center justify-center p-0.5">
                {session.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-black">
                     {session.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-surface shadow-sm"></div>
            </div>

            <div className="hidden sm:flex flex-col items-start mr-1">
              <span className="text-[11px] font-black text-main leading-tight max-w-[100px] truncate">
                {session.user?.name}
              </span>
              <span className="text-[8px] font-bold text-primary uppercase tracking-[0.15em] mt-0.5">
                {session.user?.role || 'Member'}
              </span>
            </div>
            
            <Menu size={14} className={`text-muted opacity-50 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Luxury Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+12px)] right-0 w-64 bg-surface border border-glass-border rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 z-[110]">
              
              {/* Header Info */}
              <div className="px-6 py-6 bg-gradient-to-br from-primary/10 to-purple-500/5 border-b border-glass-border">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">
                        {session.user?.name?.charAt(0)}
                     </div>
                     <div className="overflow-hidden">
                        <p className="text-xs font-black text-main truncate">{session.user?.name}</p>
                        <p className="text-[10px] text-muted font-medium truncate opacity-70">{session.user?.email}</p>
                     </div>
                  </div>
                  <div className="w-full h-1 bg-glass-border rounded-full overflow-hidden">
                     <div className="w-2/3 h-full bg-primary"></div>
                  </div>
                  <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mt-1.5">Learning Progress: 68%</p>
              </div>

              {/* Menu Links */}
              <div className="p-2.5">
                <DropdownItem 
                  onClick={() => { router.push('/profile'); setIsDropdownOpen(false); }}
                  icon={<User size={16}/>} 
                  label="My Identity" 
                  desc="Academic profile & portfolio"
                />
                
                {/* Theme Toggle Inside Dropdown */}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                  className="w-full h-14 flex items-center justify-between px-3.5 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-surface border border-glass-border flex items-center justify-center text-muted group-hover:text-primary transition-all">
                       {theme === 'dark' ? <Moon size={16}/> : <Sun size={16}/>}
                    </div>
                    <div className="flex flex-col items-start text-left">
                       <span className="text-[11px] font-black text-main uppercase tracking-wide">Interface Mode</span>
                       <span className="text-[9px] font-medium text-muted">{theme === 'dark' ? 'Dark' : 'Light'} Vision</span>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full border border-glass-border relative transition-all duration-300 ${theme === 'dark' ? 'bg-primary border-primary' : 'bg-surface/20'}`}>
                    <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all duration-300 shadow-sm ${theme === 'dark' ? 'left-[22px]' : 'left-0.5'}`}></div>
                  </div>
                </button>
                
                <DropdownItem 
                  onClick={() => setIsDropdownOpen(false)}
                  icon={<Settings size={16}/>} 
                  label="Internal Settings" 
                  desc="Platform configurations"
                />
              </div>

              {/* Logout Button */}
              <div className="p-2.5 bg-red-500/[0.03] border-t border-glass-border">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all group"
                >
                   <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <LogOut size={16}/>
                   </div>
                   <div className="flex flex-col items-start text-left">
                     <span className="text-[11px] font-black uppercase tracking-wider">De-authenticate</span>
                     <span className="text-[9px] font-bold opacity-60">Close current session</span>
                   </div>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function DropdownItem({ icon, label, desc, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl hover:bg-white/5 group transition-all"
    >
      <div className="w-9 h-9 rounded-xl bg-surface border border-glass-border flex items-center justify-center text-muted group-hover:text-primary group-hover:border-primary/30 transition-all">
        {icon}
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-[11px] font-black text-main group-hover:text-primary transition-colors tracking-wide uppercase">{label}</span>
        <span className="text-[9px] font-medium text-muted mt-0.5">{desc}</span>
      </div>
    </button>
  );
}
