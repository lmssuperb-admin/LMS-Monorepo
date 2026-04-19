'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Users, BookOpen, ShieldCheck, Search, Plus, Activity, Loader2, 
  MoreVertical, Edit2, X, ChevronRight, Filter, Globe, Database,
  UserPlus, Mail, MapPin, Key, Lock, CheckSquare, Square, ChevronDown,
  Info, Camera, PlusCircle, Tag, Phone, Home, Building, LayoutGrid, ScrollText,
  Building2, Smartphone
} from 'lucide-react';

export default function MasterAdminConsole() {
  const [mainTab, setMainTab] = useState('users'); 
  const [subTab, setSubTab] = useState('Browse users');
  const [data, setData] = useState({ users: [], courses: [], categories: [], cohorts: [], roles: [], systemAssignments: [] });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [modalSection, setModalSection] = useState('general');
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(['name', 'email']);
  const [filterByRole, setFilterByRole] = useState('all'); 
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [roleForm, setRoleForm] = useState({ userid: '', roleid: '', contextlevel: 'system', instanceid: 0 });
  
  const [form, setForm] = useState({
    username: '', auth: 'manual', suspended: false, generatepass: false, password: '', forcechange: false,
    firstname: '', lastname: '', email: '', visibility: '1', city: '', country: 'IN', timezone: '99', lang: 'en',
    description: '', idnumber: '', institution: '', department: '', phone1: '', phone2: '', address: '',
    profileimageurl: '', roleid: ''
  });

  useEffect(() => {
    fetchTabData();
  }, [mainTab, subTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterByRole, activeFilters]);

  const filteredUsers = data.users?.filter(u => {
    // 1. Role Category Filter
    if (filterByRole !== 'all' && u.role !== filterByRole) return false;

    // 2. Text Search Filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const searchInName = activeFilters.includes('name') && (u.fullname?.toLowerCase().includes(query) || u.firstname?.toLowerCase().includes(query) || u.lastname?.toLowerCase().includes(query));
    const searchInEmail = activeFilters.includes('email') && u.email?.toLowerCase().includes(query);
    const searchInRole = activeFilters.includes('role') && u.role?.toLowerCase().includes(query);
    
    // If no specific search fields active, default to globally searching name/email
    if (activeFilters.length === 0) return searchInName || searchInEmail;

    return searchInName || searchInEmail || searchInRole;
  });

  const totalUsers = filteredUsers?.length || 0;
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers?.slice(startIndex, startIndex + itemsPerPage);

  const fetchTabData = async () => {
    // 🧠 Abort previous fetch if still running
    if (window.fetchController) window.fetchController.abort();
    window.fetchController = new AbortController();
    const { signal } = window.fetchController;

    setLoading(true);
    try {
      let endpoint = '';
      if (subTab === 'Browse users') endpoint = 'users';
      else if (subTab === 'Manage courses') endpoint = 'courses';
      else if (subTab === 'Define roles' || subTab === 'Assign system roles') endpoint = 'roles';

      if (endpoint) {
        const res = await fetch(`http://localhost:4000/api/${endpoint}`, { signal }).then(r => r.json());
        let actualData = Array.isArray(res) ? res : (res.users || res.courses || res.roles || []);
        setData(prev => ({ ...prev, [endpoint]: actualData }));
      }

      if (subTab === 'Assign system roles') {
        // Fetch dependencies in parallel but Await them
        const [usersRes, assignRes] = await Promise.all([
          data.users.length === 0 ? fetch(`http://localhost:4000/api/users`, { signal }).then(r => r.json()) : Promise.resolve(null),
          fetch(`http://localhost:4000/api/roles/assignments?contextid=1`, { signal }).then(r => r.json())
        ]);

        setData(prev => ({ 
          ...prev, 
          users: usersRes?.users || prev.users,
          systemAssignments: Array.isArray(assignRes) ? assignRes : prev.systemAssignments 
        }));
      }
    } catch (err) { 
      if (err.name !== 'AbortError') console.error('Fetch error:', err); 
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    setLoading(true);
    try {
      if (!roleForm.userid || !roleForm.roleid) throw new Error("Please select both a user and a role");
      const res = await fetch('http://localhost:4000/api/roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      }).then(r => r.json());
      if (res && res.error) throw new Error(res.error);
      alert('Role Assigned Successfully!');
      setRoleForm({ userid: '', roleid: '', contextlevel: 'system', instanceid: 0 });
    } catch (err) { alert('Assignment failed: ' + err.message); }
    setLoading(false);
  };
  const handleUnassignRole = async (userid, roleid) => {
    if (!confirm('Are you sure you want to revoke this role?')) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/roles/unassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid, roleid, contextlevel: 'system', instanceid: 0 })
      }).then(r => r.json());
      if (res && res.error) throw new Error(res.error);
      alert('Role Revoked Successfully!');
      // Refresh assignments
      fetchTabData();
    } catch (err) { alert('Revocation failed: ' + err.message); }
    setLoading(false);
  };


  const handleInitialize = async () => {
     setLoading(true);
     try {
        const isEdit = showModal === 'Edit User';
        const url = isEdit ? `http://localhost:4000/api/users/${editingUser.id}` : 'http://localhost:4000/api/users';
        const method = isEdit ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
           method,
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(form)
        }).then(r => r.json());

        if (res.error) throw new Error(res.error);
        
        setShowModal(false);
        fetchTabData();
        alert(`User ${isEdit ? 'Updated' : 'Created'} Successfully!`);
     } catch (err) {
        alert("Operation failed: " + err.message);
     }
     setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:4000/api/system/upload', {
        method: 'POST',
        body: formData,
      }).then(r => r.json());

      if (res.url) {
        setForm({ ...form, profileimageurl: res.url });
        alert('Image uploaded successfully!');
      }
    } catch (err) {
      alert('Upload failed');
    }
    setLoading(false);
  };

  const menuItems = {
    users: { icon: <Users size={18}/>, subs: ['Browse users', 'Add user'] },
    courses: { icon: <BookOpen size={18}/>, subs: ['Manage courses', 'Categories', 'Add course'] },
    permissions: { icon: <ShieldCheck size={18}/>, subs: ['Define roles', 'Assign system roles'] },
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] flex overflow-hidden bg-background text-main">
      
      {/* MASTER SIDEBAR */}
      <div className="w-80 flex-shrink-0 bg-surface border-r border-glass-border flex flex-col">
         <div className="p-8 border-b border-glass-border">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Site<br/><span className="text-primary not-italic">Admin</span></h1>
         </div>
         <nav className="flex-grow p-6 space-y-4">
            {Object.entries(menuItems).map(([key, item]) => (
              <div key={key}>
                 <button onClick={() => { setMainTab(key); setSubTab(item.subs[0]); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${mainTab === key ? 'bg-primary text-white shadow-2xl shadow-primary/20' : 'text-muted hover:bg-white/5'}`}>{item.icon} {key}</button>
                 {mainTab === key && (
                   <div className="ml-9 mt-2 space-y-1 py-1 border-l border-glass-border animate-in slide-in-from-left-2 transition-all duration-300">
                      {item.subs.map(sub => (<button key={sub} onClick={() => { setSubTab(sub); if(sub === 'Add user') setShowModal('Add User'); }} className={`w-full text-left px-5 py-2.5 text-[11px] font-bold transition-all ${subTab === sub ? 'text-primary' : 'text-muted hover:text-main'}`}>{sub}</button>))}
                   </div>
                 )}
              </div>
            ))}
         </nav>
      </div>

      <div className="flex-grow flex flex-col min-w-0">
         <div className="h-24 bg-surface/50 border-b border-glass-border px-10 flex items-center justify-between backdrop-blur-xl">
            <h2 className="text-xl font-black italic tracking-tight uppercase">{subTab}</h2>
            {loading && <Loader2 className="animate-spin text-primary" size={20}/>}
         </div>

         <div className="flex-grow overflow-y-auto p-12 custom-scrollbar">
            {subTab === 'Browse users' && (
               <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center bg-surface/40 p-6 rounded-[32px] border border-glass-border backdrop-blur-md">
                     <button onClick={() => {
                        setForm({
                          username: '', auth: 'manual', suspended: false, generatepass: false, password: '', forcechange: false,
                          firstname: '', lastname: '', email: '', visibility: '1', city: '', country: 'IN', timezone: '99', lang: 'en',
                          description: '', idnumber: '', institution: '', department: '', phone1: '', phone2: '', address: '',
                          profileimageurl: '', roleid: ''
                        }); 
                        if (data.roles.length === 0) fetch('http://localhost:4000/api/roles').then(r => r.json()).then(res => {
                           setData(prev => ({...prev, roles: Array.isArray(res) ? res : (res.roles || [])}));
                        });
                        setShowModal('Add User');
                     }} className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">Add a new user</button>
                     <div className="flex gap-4 items-center">
                         <div className="relative">
                            <button 
                              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                              className={`bg-white/5 border border-glass-border px-6 py-4 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${showFilterDropdown ? 'text-primary border-primary/50' : 'text-muted hover:text-main'}`}
                            >
                               <Filter size={16}/> Filter By: {activeFilters.length}
                            </button>
                            {showFilterDropdown && (
                              <div className="absolute right-0 mt-3 w-64 bg-surface border border-glass-border rounded-[24px] shadow-3xl z-[100] p-6 space-y-6 animate-in zoom-in-95 duration-200">
                                 <div>
                                    <p className="text-[10px] font-black uppercase text-primary mb-4 tracking-widest px-1">Search Fields</p>
                                    <div className="space-y-1">
                                       {['name', 'email', 'role'].map(f => (
                                          <label key={f} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl cursor-pointer group">
                                             <input 
                                               type="checkbox" 
                                               checked={activeFilters.includes(f)}
                                               onChange={() => {
                                                 if (activeFilters.includes(f)) setActiveFilters(activeFilters.filter(x => x !== f));
                                                 else setActiveFilters([...activeFilters, f]);
                                               }}
                                               className="w-4 h-4 accent-primary" 
                                             />
                                             <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeFilters.includes(f) ? 'text-primary' : 'text-muted group-hover:text-main'}`}>{f}</span>
                                          </label>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="pt-2 border-t border-glass-border">
                                    <p className="text-[10px] font-black uppercase text-primary mb-4 tracking-widest px-1">Filter by Role</p>
                                    <div className="grid grid-cols-1 gap-1">
                                       {['all', 'admin', 'teacher', 'student'].map(r => (
                                          <button 
                                            key={r}
                                            onClick={() => setFilterByRole(r)}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterByRole === r ? 'bg-primary text-white' : 'text-muted hover:bg-white/5'}`}
                                          >
                                             {r}
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                            )}
                         </div>
                         <div className="relative w-80">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={16}/>
                            <input 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="academy-input w-full pl-14 h-12 bg-background/30" 
                              placeholder="Search users..." 
                            />
                         </div>
                     </div>
                  </div>

                  <div className="academy-card overflow-hidden text-[11px]">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-glass-border bg-white/5 uppercase text-[9px] font-black tracking-[0.2em] text-primary/60">
                              <th className="p-6">Name / Surname</th>
                              <th className="p-6">Email address</th>
                              <th className="p-6">Role</th>
                              <th className="p-6">Last access</th>
                              <th className="p-6 w-20"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border text-xs font-bold">
                           {paginatedUsers?.map(u => (
                              <tr key={u.id} className="hover:bg-white/5 transition-colors group relative">
                                 <td className="p-6 flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black italic overflow-hidden">{u.profileimageurl ? <img src={u.profileimageurl} className="w-full h-full object-cover" /> : u.firstname?.[0]}</div><span className="text-primary hover:underline cursor-pointer">{u.fullname}</span></td>
                                 <td className="p-6 text-muted font-medium uppercase tracking-tighter">{u.email}</td>
                                 <td className="p-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                       u.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                                       u.role === 'teacher' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                                       'bg-primary/10 text-primary border border-primary/20'
                                    }`}>
                                       {u.role || 'student'}
                                    </span>
                                 </td>
                                 <td className="p-6 text-muted font-medium">
                                     {u.lastaccess ? new Date(u.lastaccess * 1000).toLocaleString('en-US', { 
                                        day: '2-digit', month: 'short', year: 'numeric', 
                                        hour: '2-digit', minute: '2-digit', hour12: true 
                                     }) : 'Never logged in'}
                                  </td>
                                 <td className="p-6 text-right relative">
                                    <button onClick={() => setActiveMenu(activeMenu === u.id ? null : u.id)} className="p-3 hover:bg-white/10 rounded-xl transition-all"><MoreVertical size={18} className="text-muted"/></button>
                                    {activeMenu === u.id && (
                                      <div className="absolute right-16 top-1/2 -translate-y-1/2 z-50 bg-background border border-glass-border shadow-2xl rounded-2xl w-44 overflow-hidden animate-in zoom-in-95 duration-200">
                                         <button onClick={() => {setShowModal('Edit User'); setEditingUser(u); setForm({...form, ...u}); setActiveMenu(null);}} className="w-full px-6 py-4 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all text-left text-muted hover:text-white"><Edit2 size={14}/> Edit profile</button>
                                         <button onClick={() => {setMainTab('permissions'); setSubTab('Assign system roles'); setRoleForm({ ...roleForm, userid: u.id }); setActiveMenu(null);}} className="w-full px-6 py-4 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all text-left text-muted hover:text-white"><ShieldCheck size={14}/> Manage Role</button>
                                      </div>
                                    )}
                                 </td>
                              </tr>
                           ))}
                           {paginatedUsers?.length === 0 && (
                              <tr>
                                 <td colSpan="5" className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                       <Search size={48}/>
                                       <p className="text-[10px] font-black uppercase tracking-[0.2em]">No users match your criteria</p>
                                    </div>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
                  
                  {/* PAGINATION CONTROLS */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4 py-4">
                     <div className="flex items-center gap-4 bg-surface/40 px-6 py-3 rounded-2xl border border-glass-border">
                        <span className="text-[10px] font-black uppercase text-muted tracking-widest whitespace-nowrap">Show</span>
                        <select 
                          value={itemsPerPage} 
                          onChange={(e) => setItemsPerPage(Number(e.target.value))}
                          className="bg-transparent text-[10px] font-black uppercase text-primary outline-none cursor-pointer"
                        >
                           {[5, 10, 25, 50].map(v => <option key={v} value={v} className="bg-surface">{v}</option>)}
                        </select>
                        <span className="text-[10px] font-black uppercase text-muted tracking-widest whitespace-nowrap">per page</span>
                     </div>

                     <div className="flex items-center gap-2">
                        <button 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface/40 border border-glass-border text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                           <ChevronDown className="rotate-90" size={18}/>
                        </button>
                        
                        <div className="flex items-center gap-2 bg-surface/40 px-3 py-2 rounded-2xl border border-glass-border">
                           {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) pageNum = i + 1;
                              else if (currentPage <= 3) pageNum = i + 1;
                              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                              else pageNum = currentPage - 2 + i;

                              return (
                                 <button 
                                   key={pageNum}
                                   onClick={() => setCurrentPage(pageNum)}
                                   className={`w-8 h-8 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${currentPage === pageNum ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:text-main hover:bg-white/5'}`}
                                 >
                                    {pageNum}
                                 </button>
                              );
                           })}
                        </div>

                        <button 
                          disabled={currentPage === totalPages || totalPages === 0}
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface/40 border border-glass-border text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                           <ChevronDown className="-rotate-90" size={18}/>
                        </button>
                     </div>

                     <div className="text-[10px] font-black uppercase text-muted tracking-widest bg-surface/40 px-6 py-3 rounded-2xl border border-glass-border">
                        Showing <span className="text-primary">{Math.min(startIndex + 1, totalUsers)}</span> to <span className="text-primary">{Math.min(startIndex + itemsPerPage, totalUsers)}</span> of <span className="text-primary">{totalUsers}</span> accounts
                     </div>
                  </div>
               </div>
            )}

            {subTab === 'Define roles' && (
               <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="academy-card overflow-hidden">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-glass-border bg-white/5 uppercase text-[9px] font-black tracking-[0.2em] text-primary/60">
                              <th className="p-6">Role Name</th>
                              <th className="p-6">Shortname</th>
                              <th className="p-6">Description</th>
                              <th className="p-6 text-right">ID</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border text-xs font-bold">
                           {data.roles?.map(r => (
                              <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                 <td className="p-6 text-primary">{r.name}</td>
                                 <td className="p-6 text-muted font-medium uppercase tracking-widest text-[10px]">{r.shortname}</td>
                                 <td className="p-6 text-muted opacity-60 font-medium max-w-md truncate">{r.description || 'No description provided'}</td>
                                 <td className="p-6 text-muted uppercase text-right">#{r.id}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {subTab === 'Assign system roles' && (
               <div className="max-w-4xl space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-surface/40 p-12 rounded-[48px] border border-glass-border backdrop-blur-md space-y-10 shadow-3xl">
                     <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary/10 rounded-3xl text-primary"><ShieldCheck size={32}/></div>
                        <div>
                           <h3 className="text-2xl font-black italic uppercase tracking-tight">System Assignment</h3>
                           <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Assign global permissions to users</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <p className="text-[9px] font-black uppercase text-muted tracking-widest ml-1">Select User</p>
                           <div className="relative">
                              <select 
                                value={roleForm.userid} 
                                onChange={e => setRoleForm({...roleForm, userid: e.target.value})}
                                className="academy-input w-full h-16 bg-background/50 border border-glass-border px-6 text-xs font-bold appearance-none focus:border-primary transition-all outline-none rounded-2xl"
                              >
                                 <option value="">Choose a user...</option>
                                 {data.users?.map(u => <option key={u.id} value={u.id}>{u.fullname} ({u.email})</option>)}
                              </select>
                              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16}/>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <p className="text-[9px] font-black uppercase text-muted tracking-widest ml-1">Select Role</p>
                           <div className="relative">
                              <select 
                                value={roleForm.roleid} 
                                onChange={e => setRoleForm({...roleForm, roleid: e.target.value})}
                                className="academy-input w-full h-16 bg-background/50 border border-glass-border px-6 text-xs font-bold appearance-none focus:border-primary transition-all outline-none rounded-2xl"
                              >
                                 <option value="">Choose a role...</option>
                                 {data.roles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                              </select>
                              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16}/>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 bg-primary/5 rounded-[32px] border border-primary/10 flex items-start gap-6">
                        <Info className="text-primary flex-shrink-0 mt-1" size={20}/>
                        <p className="text-[11px] font-medium leading-relaxed text-main/80">
                           Warning: Assigning system roles gives users broad permissions across the entire platform. 
                           System roles (like Manager or Course Creator) are global. For course-specific teaching roles, 
                           use the Enrollments area within individual courses.
                        </p>
                     </div>
                     <div className="pt-10 border-t border-glass-border space-y-8">
                        <div>
                           <h4 className="text-sm font-black italic uppercase tracking-wider">Current Global Assignments</h4>
                           <p className="text-[9px] font-bold text-muted uppercase tracking-widest mt-1">Manage existing permissions</p>
                        </div>
                        <div className="academy-card overflow-hidden">
                           <table className="w-full text-left border-collapse text-[10px]">
                              <thead>
                                 <tr className="border-b border-glass-border bg-white/5 uppercase text-[8px] font-black tracking-widest text-primary/60">
                                    <th className="p-6">User</th>
                                    <th className="p-6">Role</th>
                                    <th className="p-6 text-right">Actions</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-glass-border font-bold">
                                 {data.systemAssignments?.map((a, i) => {
                                    const user = data.users.find(u => u.id === a.userid);
                                    const role = data.roles.find(r => r.id === a.roleid);
                                    return (
                                       <tr key={i} className="hover:bg-white/5 transition-colors">
                                          <td className="p-6">
                                             <div className="flex flex-col">
                                                <span className="text-main">{user?.fullname || 'Loading...'}</span>
                                                <span className="text-muted text-[8px]">{user?.email}</span>
                                             </div>
                                          </td>
                                          <td className="p-6">
                                             <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] uppercase">{role?.name || a.roleid}</span>
                                          </td>
                                          <td className="p-6 text-right">
                                             <button onClick={() => handleUnassignRole(a.userid, a.roleid)} className="text-red-500 hover:underline uppercase text-[8px] font-black tracking-widest">Revoke</button>
                                          </td>
                                       </tr>
                                    );
                                 })}
                                 {(!data.systemAssignments || data.systemAssignments.length === 0) && (
                                    <tr><td colSpan="3" className="p-10 text-center text-muted uppercase text-[8px] tracking-widest">No global assignments found</td></tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>


                     <button 
                       onClick={handleAssignRole}
                       disabled={loading}
                       className="w-full bg-primary text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                     >
                        {loading ? 'Processing...' : 'Finalize Assignment'}
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* ── HIGH-DENSITY PROFESSIONAL USER PORTAL ──────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-surface w-full max-w-6xl border border-glass-border rounded-[48px] shadow-3xl flex h-[85vh] overflow-hidden">
              
              <div className="w-72 bg-white/5 border-r border-glass-border flex flex-col p-8">
                 <div className="mb-10 text-primary"><UserPlus size={40}/></div>
                 <h3 className="text-xl font-black italic uppercase mb-8">{showModal}</h3>
                 <nav className="space-y-2">
                    <ModalNav active={modalSection === 'general'} icon={<ScrollText size={16}/>} label="General" onClick={() => setModalSection('general')} />
                    <ModalNav active={modalSection === 'userpicture'} icon={<Camera size={16}/>} label="User Picture" onClick={() => setModalSection('userpicture')} />
                    <ModalNav active={modalSection === 'optional'} icon={<LayoutGrid size={16}/>} label="Institutional" onClick={() => setModalSection('optional')} />
                 </nav>
              </div>

              <div className="flex-grow flex flex-col min-w-0 relative bg-background/20">
                 <button onClick={() => setShowModal(false)} className="absolute right-8 top-8 p-3 bg-white/5 rounded-2xl hover:bg-red-500 hover:text-white transition-all z-10 focus:outline-none"><X size={24}/></button>

                 <div className="flex-grow overflow-y-auto p-12 custom-scrollbar">
                    {modalSection === 'general' && (
                       <div className="space-y-10 animate-in fade-in duration-500">
                          <div className="grid grid-cols-3 gap-8 p-8 bg-white/5 rounded-[32px] border border-glass-border hover:border-primary/20 transition-all">
                             <CompactInput label="Username" value={form.username} onChange={v => setForm({...form, username: v})} req />
                             <CompactSelect label="Auth Method" value={form.auth} options={[{v:'manual', l:'Manual accounts'}]} />
                             <CompactInput label="Password" type="password" value={form.password} onChange={v => setForm({...form, password: v})} />
                              <CompactSelect 
                                label="Initial System Role" 
                                value={form.roleid} 
                                options={[{v:'', l:'None (Default)'}, ...data.roles.map(r => ({v: r.id, l: r.name}))]} 
                                onChange={v => setForm({...form, roleid: v})}
                                icon={<ShieldCheck size={12}/>}
                              />
                           </div>

                          <div className="flex items-center gap-12 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                             <CompactToggle label="Suspended" checked={form.suspended} onChange={v => setForm({...form, suspended: v})} />
                             <CompactToggle label="Force Pass Change" checked={form.forcechange} onChange={v => setForm({...form, forcechange: v})} />
                          </div>

                          <div className="grid grid-cols-3 gap-8">
                             <CompactInput label="First name" req value={form.firstname} onChange={v => setForm({...form, firstname: v})} />
                             <CompactInput label="Last name" req value={form.lastname} onChange={v => setForm({...form, lastname: v})} />
                             <CompactInput label="Email address" req value={form.email} onChange={v => setForm({...form, email: v})} />
                          </div>

                          <div className="grid grid-cols-4 gap-6">
                             <CompactInput label="City" value={form.city} onChange={v => setForm({...form, city: v})} />
                             <CompactSelect label="Country" value={form.country} options={[{v:'IN', l:'India'}, {v:'US', l:'USA'}]} onChange={v => setForm({...form, country: v})} />
                             <CompactSelect label="Timezone" value={form.timezone} options={[{v:'99', l:'Server time'}]} />
                             <CompactSelect label="Language" value={form.lang} options={[{v:'en', l:'English'}]} />
                          </div>
                       </div>
                    )}

                    {modalSection === 'userpicture' && (
                       <div className="h-full flex flex-col justify-center items-center gap-10">
                          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                          <div onClick={() => fileInputRef.current.click()} className="w-56 h-56 rounded-[48px] border-4 border-dashed border-glass-border bg-white/5 flex flex-col items-center justify-center group hover:border-primary transition-all cursor-pointer overflow-hidden">
                             {form.profileimageurl ? (
                               <img src={form.profileimageurl} className="w-full h-full object-cover" />
                             ) : (
                               <>
                                 <Camera size={48} className="text-muted group-hover:text-primary transition-colors"/>
                                 <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-6">Upload Portrait</p>
                               </>
                             )}
                          </div>
                          {form.profileimageurl && <button onClick={() => setForm({...form, profileimageurl: ''})} className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">Remove Picture</button>}
                       </div>
                    )}

                    {modalSection === 'optional' && (
                       <div className="grid grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                          <CompactInput label="ID number" value={form.idnumber} onChange={v => setForm({...form, idnumber: v})} icon={<Lock size={12}/>} />
                          <CompactInput label="Institution" value={form.institution} onChange={v => setForm({...form, institution: v})} icon={<Building2 size={12}/>} />
                          <CompactInput label="Department" value={form.department} onChange={v => setForm({...form, department: v})} icon={<Tag size={12}/>} />
                          <CompactInput label="Phone" value={form.phone1} onChange={v => setForm({...form, phone1: v})} icon={<Phone size={12}/>} />
                          <CompactInput label="Mobile" value={form.phone2} onChange={v => setForm({...form, phone2: v})} icon={<Smartphone size={12}/>} />
                          <CompactInput label="Address" value={form.address} onChange={v => setForm({...form, address: v})} icon={<Home size={12}/>} />
                       </div>
                    )}
                 </div>

                 <div className="p-10 border-t border-glass-border flex gap-6 bg-white/5 items-center justify-end px-12">
                    <p className="mr-auto text-[9px] font-black text-primary uppercase tracking-[0.3em]">Validation Status: Safe to Commit</p>
                    <button onClick={handleInitialize} className="bg-primary text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"> {showModal === 'Edit User' ? 'Update User' : 'Initialize account'} </button>
                    <button onClick={() => setShowModal(false)} className="bg-white/5 px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest text-muted hover:bg-glass-border transition-all">Cancel</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function ModalNav({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl transition-all font-black uppercase text-[10px] tracking-widest ${active ? 'bg-primary text-white' : 'text-muted hover:bg-white/5'}`}>{icon} {label}</button>
  );
}

function CompactInput({ label, type='text', value, onChange, req, icon }) {
  return (
    <div className="space-y-3 flex-grow">
       <div className="flex items-center gap-2">
          {icon} <span className="text-[9px] font-black uppercase text-muted tracking-widest">{label} {req && <span className="text-red-500 text-lg leading-none">*</span>}</span>
       </div>
       <input type={type} value={value} onChange={e => onChange(e.target.value)} className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 text-xs font-bold focus:border-primary transition-all outline-none" placeholder={`Enter ${label.toLowerCase()}...`} />
    </div>
  );
}

function CompactSelect({ label, value, options, onChange, icon }) {
  return (
    <div className="space-y-3 flex-grow">
       <div className="flex items-center gap-2">
          {icon} <span className="text-[9px] font-black uppercase text-muted tracking-widest">{label}</span>
       </div>
       <div className="relative">
          <select value={value} onChange={e => onChange?.(e.target.value)} className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 pr-12 text-xs font-bold appearance-none focus:border-primary transition-all outline-none">
             {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14}/>
       </div>
    </div>
  );
}

function CompactToggle({ label, checked, onChange }) {
  return (
    <button onClick={() => onChange?.(!checked)} className="flex items-center gap-4 group">
       <div className={`w-12 h-6 rounded-full transition-all duration-300 relative ${checked ? 'bg-primary' : 'bg-white/10'}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${checked ? 'left-7' : 'left-1'}`} />
       </div>
       <span className="text-[9px] font-black uppercase tracking-widest text-muted group-hover:text-primary transition-colors">{label}</span>
    </button>
  );
}
