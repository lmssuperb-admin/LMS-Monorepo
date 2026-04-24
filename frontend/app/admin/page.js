'use client';
import { useState, useEffect, useRef } from 'react';
import {
   Users, BookOpen, ShieldCheck, Search, Plus, Activity, Loader2,
   MoreVertical, Edit2, X, ChevronRight, Filter, Globe, Database,
   UserPlus, Mail, MapPin, Key, Lock, CheckSquare, Square, ChevronDown,
   Info, Camera, PlusCircle, Tag, Phone, Home, Building, LayoutGrid, ScrollText,
   Building2, Smartphone, Type, List, Link, Image, Video, UploadCloud, ChevronUp
} from 'lucide-react';

function formatRelativeTime(seconds) {
   if (!seconds || seconds === 0) return 'Never logged in';
   const diff = Math.floor(Date.now() / 1000) - seconds;
   if (diff < 0) return 'Just now';
   if (diff < 60) return `${diff} secs ago`;
   if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
   if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
   if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
   return new Date(seconds * 1000).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

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

   const [courseForm, setCourseForm] = useState({ fullname: '', categoryid: '', summary: '', imageurl: '' });
   const [courseStep, setCourseStep] = useState(2);
   const [createdCourse, setCreatedCourse] = useState(null);
   const [showActivityModal, setShowActivityModal] = useState(false);
   const [selectedActivity, setSelectedActivity] = useState('');
   const [activeCourseView, setActiveCourseView] = useState('dashboard');
   const [showRestrictionModal, setShowRestrictionModal] = useState(false);
   const [activities, setActivities] = useState([
      { id: 1, name: 'Basics Of Java', type: 'book', topic: 1 }
   ]);
   const [newActivityForm, setNewActivityForm] = useState({ name: '', description: '' });

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
         else if (subTab === 'Manage courses' || subTab === 'Add course') endpoint = 'courses';
         else if (subTab === 'Define roles' || subTab === 'Assign system roles') endpoint = 'roles';

         // 🔄 Main Endpoint Fetch
         if (endpoint) {
            const res = await fetch(`http://localhost:4000/api/${endpoint}`, { signal }).then(r => r.json());
            let actualData = Array.isArray(res) ? res : (res.users || res.courses || res.roles || []);
            setData(prev => ({ ...prev, [endpoint]: actualData }));
         }

         // Fetch categories if doing courses
         if (mainTab === 'courses') {
            const cats = await fetch(`http://localhost:4000/api/courses/categories`, { signal }).then(r => r.json());
            setData(prev => ({ ...prev, categories: Array.isArray(cats) ? cats : [] }));
         }

         // 🔐 Global Assignments Persistence Sync
         // We always fetch assignments if in the Permissions main tab or specific subtab
         if (mainTab === 'permissions' || subTab === 'Assign system roles') {
            const [usersRes, assignRes] = await Promise.all([
               // We FORCE fetch users to update the role badges in the table
               fetch(`http://localhost:4000/api/users`, { signal }).then(r => r.json()),
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
         fetchTabData(); // Refresh UI instantly
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

   const handleCreateCourseFinal = async () => {
      setLoading(true);
      try {
         const payload = {
            ...courseForm,
            shortname: courseForm.fullname.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.floor(Math.random() * 1000)
         };
         const res = await fetch('http://localhost:4000/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         }).then(r => r.json());

         if (res.error) throw new Error(res.error);
         setCreatedCourse({ ...res, imageurl: courseForm.imageurl });
         setCourseStep(4); // Success Course Overview view
      } catch (err) {
         alert("Failed to create course: " + err.message);
      }
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
      users: { icon: <Users size={18} />, subs: ['Browse users', 'Add user'] },
      courses: { icon: <BookOpen size={8} />, subs: ['Manage courses', 'Categories', 'Add course'] },
      permissions: { icon: <ShieldCheck size={18} />, subs: ['Define roles', 'Assign system roles'] },
   };

   return (
      <div className="w-full h-[calc(100vh-80px)] flex overflow-hidden bg-background text-main">

         {/* MASTER SIDEBAR */}
         <div className="w-72 flex-shrink-0 bg-surface border-r border-glass-border flex flex-col shadow-sm">
            <div className="p-8 border-b border-glass-border">
               <h1 className="text-xl font-black italic uppercase tracking-tighter">Site<br /><span className="text-primary not-italic">Admin</span></h1>
            </div>
            <nav className="flex-grow p-4 space-y-1.5">
               {Object.entries(menuItems).map(([key, item]) => (
                  <div key={key}>
                     <button onClick={() => { setMainTab(key); setSubTab(item.subs[0]); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${mainTab === key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:bg-surface-hover'}`}>{item.icon} {key}</button>
                     {mainTab === key && (
                        <div className="ml-8 mt-1 space-y-0.5 py-1 border-l-2 border-primary/20 animate-in slide-in-from-left-1 duration-300">
                           {item.subs.map(sub => (<button key={sub} onClick={() => { setSubTab(sub); if (sub === 'Add user') setShowModal('Add User'); }} className={`w-full text-left px-5 py-2 text-[10px] font-bold tracking-tight transition-all ${subTab === sub ? 'text-primary' : 'text-muted hover:text-main'}`}>{sub}</button>))}
                        </div>
                     )}
                  </div>
               ))}
            </nav>
         </div>

         <div className="flex-grow flex flex-col min-w-0">
            <div className="h-20 bg-surface/80 border-b border-glass-border px-8 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
               <h2 className="text-lg font-black italic tracking-tight uppercase text-main/90">{subTab}</h2>
               {loading && <Loader2 className="animate-spin text-primary" size={18} />}
            </div>

            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
               {subTab === 'Browse users' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                     <div className="flex justify-between items-center bg-surface/60 p-5 rounded-2xl border border-glass-border shadow-sm">
                        <button onClick={() => {
                           // ... existing form reset ...
                           setForm({
                              username: '', auth: 'manual', suspended: false, generatepass: false, password: '', forcechange: false,
                              firstname: '', lastname: '', email: '', visibility: '1', city: '', country: 'IN', timezone: '99', lang: 'en',
                              description: '', idnumber: '', institution: '', department: '', phone1: '', phone2: '', address: '',
                              profileimageurl: '', roleid: ''
                           });
                           if (data.roles.length === 0) fetch('http://localhost:4000/api/roles').then(r => r.json()).then(res => {
                              setData(prev => ({ ...prev, roles: Array.isArray(res) ? res : (res.roles || []) }));
                           });
                           setShowModal('Add User');
                        }} className="bg-primary text-white px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">Add a new user</button>
                        <div className="flex gap-3 items-center">
                           <div className="relative">
                              <button
                                 onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                 className={`bg-surface border border-glass-border px-5 py-3.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${showFilterDropdown ? 'text-primary border-primary shadow-sm' : 'text-muted hover:bg-surface-hover'}`}
                              >
                                 <Filter size={14} /> Filter: {activeFilters.length}
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
                              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={16} />
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
                                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                          u.role === 'teacher' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                             'bg-primary/10 text-primary border border-primary/20'
                                          }`}>
                                          {u.role || 'student'}
                                       </span>
                                    </td>
                                    <td className="p-6 text-muted font-medium">
                                       {u.lastaccess ? (
                                          <div className="flex flex-col space-y-1">
                                             <span className="text-primary font-black text-xs">{formatRelativeTime(u.lastaccess)}</span>
                                             <span className="text-[9px] uppercase tracking-widest opacity-60 flex items-center gap-1">
                                                {new Date(u.lastaccess * 1000).toLocaleString('en-US', {
                                                   day: '2-digit', month: 'short', year: 'numeric',
                                                   hour: '2-digit', minute: '2-digit', hour12: true
                                                })}
                                             </span>
                                          </div>
                                       ) : (
                                          <span className="text-[9px] font-black uppercase tracking-widest text-muted/60 bg-muted/10 px-3 py-1 rounded-full border border-muted/20">Never logged in</span>
                                       )}
                                    </td>
                                    <td className="p-6 text-right relative">
                                       <button onClick={() => setActiveMenu(activeMenu === u.id ? null : u.id)} className="p-3 hover:bg-white/10 rounded-xl transition-all"><MoreVertical size={18} className="text-muted" /></button>
                                       {activeMenu === u.id && (
                                          <div className="absolute right-16 top-1/2 -translate-y-1/2 z-50 bg-background border border-glass-border shadow-2xl rounded-2xl w-44 overflow-hidden animate-in zoom-in-95 duration-200">
                                             <button onClick={() => { setShowModal('Edit User'); setEditingUser(u); setForm({ ...form, ...u }); setActiveMenu(null); }} className="w-full px-6 py-4 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all text-left text-muted hover:text-white"><Edit2 size={14} /> Edit profile</button>
                                             <button onClick={() => { setMainTab('permissions'); setSubTab('Assign system roles'); setRoleForm({ ...roleForm, userid: u.id }); setActiveMenu(null); }} className="w-full px-6 py-4 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all text-left text-muted hover:text-white"><ShieldCheck size={14} /> Manage Role</button>
                                          </div>
                                       )}
                                    </td>
                                 </tr>
                              ))}
                              {paginatedUsers?.length === 0 && (
                                 <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                       <div className="flex flex-col items-center gap-4 opacity-30">
                                          <Search size={48} />
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
                              <ChevronDown className="rotate-90" size={18} />
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
                              <ChevronDown className="-rotate-90" size={18} />
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
                  <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                     <div className="bg-surface p-10 rounded-3xl border border-glass-border shadow-xl space-y-8">
                        <div className="flex items-center gap-5">
                           <div className="p-3.5 bg-primary/10 rounded-2xl text-primary border border-primary/10"><ShieldCheck size={28} /></div>
                           <div>
                              <h3 className="text-xl font-black italic uppercase tracking-tight text-main">System Assignment</h3>
                              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">Assign global permissions to users</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <p className="text-[9px] font-black uppercase text-muted tracking-widest ml-1">Select User</p>
                              <div className="relative">
                                 <select
                                    value={roleForm.userid}
                                    onChange={e => setRoleForm({ ...roleForm, userid: e.target.value })}
                                    className="academy-input w-full h-16 bg-background/50 border border-glass-border px-6 text-xs font-bold appearance-none focus:border-primary transition-all outline-none rounded-2xl"
                                 >
                                    <option value="">Choose a user...</option>
                                    {data.users?.filter(u => !data.systemAssignments?.some(a => parseInt(a.userid) === parseInt(u.id))).map(u => (
                                       <option key={u.id} value={u.id}>{u.fullname} ({u.email})</option>
                                    ))}
                                 </select>
                                 <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                              </div>
                           </div>

                           <div className="space-y-4">
                              <p className="text-[9px] font-black uppercase text-muted tracking-widest ml-1">Select Role</p>
                              <div className="relative">
                                 <select
                                    value={roleForm.roleid}
                                    onChange={e => setRoleForm({ ...roleForm, roleid: e.target.value })}
                                    className="academy-input w-full h-16 bg-background/50 border border-glass-border px-6 text-xs font-bold appearance-none focus:border-primary transition-all outline-none rounded-2xl"
                                 >
                                    <option value="">Choose a role...</option>
                                    {data.roles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                 </select>
                                 <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                              </div>
                           </div>
                        </div>

                        <div className="p-8 bg-primary/5 rounded-[32px] border border-primary/10 flex items-start gap-6">
                           <Info className="text-primary flex-shrink-0 mt-1" size={20} />
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

               {subTab === 'Add course' && (
                  <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
                     {courseStep < 4 && (
                        <div className="flex items-center gap-4 mb-10 text-[10px] font-black uppercase tracking-widest text-muted">
                           <span className="cursor-pointer hover:text-main">Choose Creation Method</span> <ChevronRight size={14} />
                           <div className={`flex items-center gap-2 ${courseStep >= 2 ? 'text-primary' : ''}`}>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${courseStep >= 2 ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>2</span>
                              Configure Course
                           </div> <ChevronRight size={14} />
                           <div className={`flex items-center gap-2 ${courseStep >= 3 ? 'text-primary' : ''}`}>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${courseStep >= 3 ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>3</span>
                              Course Image
                           </div>
                        </div>
                     )}

                     {courseStep === 2 && (
                        <div className="bg-surface border border-glass-border rounded-3xl p-10 shadow-xl space-y-6">
                           <div className="space-y-2 mb-8">
                              <h3 className="text-xl font-black text-main">Configure Course</h3>
                              <p className="text-muted text-[10px] uppercase tracking-widest font-bold">Fill in the basic details for the course.</p>
                           </div>
                           <CompactInput label="Course Name" req value={courseForm.fullname} onChange={v => setCourseForm({ ...courseForm, fullname: v })} />
                           <CompactSelect label="Course Category" value={courseForm.categoryid} options={[{ v: '', l: 'Select Category' }, ...data.categories.map(c => ({ v: c.id, l: c.name }))]} onChange={v => setCourseForm({ ...courseForm, categoryid: v })} />

                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase text-muted tracking-widest">Course Summary</label>
                              <textarea value={courseForm.summary} onChange={e => setCourseForm({ ...courseForm, summary: e.target.value })} className="academy-input w-full h-32 bg-background/50 border border-glass-border p-6 text-xs font-bold focus:border-primary transition-all outline-none resize-none" placeholder="Describe what students will learn in this course" />
                           </div>

                           <div className="flex justify-end gap-4 pt-6 border-t border-glass-border">
                              <button className="px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/5 text-muted hover:bg-glass-border transition-all">Back</button>
                              <button onClick={() => setCourseStep(3)} disabled={!courseForm.fullname} className="px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-white shadow-md shadow-primary/20 hover:shadow-lg disabled:opacity-50 transition-all">Next</button>
                           </div>
                        </div>
                     )}

                     {courseStep === 3 && (
                        <div className="bg-surface border border-glass-border rounded-3xl p-10 shadow-xl space-y-8">
                           <div className="space-y-2 mb-8 border-b border-glass-border pb-6">
                              <h3 className="text-xl font-black text-main">Add Course Image</h3>
                           </div>

                           <div className="flex gap-14">
                              <div className="w-1/3 flex flex-col gap-6 pt-2">
                                 <button onClick={() => alert("Simulating Image Gallery Search")} className="w-full bg-primary text-white py-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/30 h-36">
                                    <Search size={28} />
                                    <span className="text-center leading-tight">Search in<br />Image Gallery</span>
                                 </button>

                                 <div className="flex items-center gap-4">
                                    <div className="h-px bg-glass-border flex-grow"></div>
                                    <div className="text-muted font-black text-[10px] uppercase tracking-widest">or</div>
                                    <div className="h-px bg-glass-border flex-grow"></div>
                                 </div>

                                 <input type="file" ref={fileInputRef} onChange={async (e) => {
                                    const f = e.target.files[0];
                                    if (!f) return;
                                    const formData = new FormData();
                                    formData.append('image', f);
                                    setLoading(true);
                                    try {
                                       const res = await fetch('http://localhost:4000/api/system/upload', { method: 'POST', body: formData }).then(r => r.json());
                                       if (res.url) setCourseForm({ ...courseForm, imageurl: res.url });
                                    } catch (e) { }
                                    setLoading(false);
                                 }} className="hidden" accept="image/*" />

                                 <button onClick={() => fileInputRef.current?.click()} className="w-full bg-primary/5 border-2 border-dashed border-primary/30 text-primary py-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary transition-all font-black text-[11px] uppercase tracking-widest h-36">
                                    <Camera size={28} />
                                    <span>Upload</span>
                                 </button>

                                 <button onClick={() => setCourseForm({ ...courseForm, imageurl: '' })} className="flex items-center justify-center gap-2 text-main font-black text-[11px] uppercase tracking-widest mt-4 hover:text-primary transition-colors">
                                    <X size={16} /> Default
                                 </button>
                              </div>

                              <div className="w-2/3 flex flex-col">
                                 <h4 className="text-[11px] font-black uppercase text-main tracking-widest mb-4">Preview</h4>
                                 <div className="flex-grow border border-glass-border rounded-3xl overflow-hidden bg-background relative flex items-center justify-center shadow-lg group">
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-background to-background"></div>
                                    {courseForm.imageurl ? (
                                       <img src={courseForm.imageurl} className="w-full h-full object-cover absolute inset-0 z-10" />
                                    ) : (
                                       <div className="text-center opacity-70 z-10 p-10 bg-surface/50 backdrop-blur-md rounded-2xl border border-glass-border shadow-2xl transform rotate-3 transition-transform group-hover:rotate-0">
                                          <div className="w-64 h-40 bg-gradient-to-tr from-primary/30 to-blue-400/10 rounded-xl mx-auto mb-6 flex flex-col items-center justify-center border border-white/10 shadow-inner">
                                             <Camera size={32} className="text-primary/50 mb-2" />
                                             <span className="text-primary font-black text-[10px] tracking-widest uppercase">Course Cover</span>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>

                           <div className="flex justify-center gap-8 pt-10 border-t border-glass-border">
                              <button onClick={() => setCourseStep(2)} className="px-12 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-surface border border-glass-border text-muted hover:text-main hover:bg-white/5 transition-all">Back</button>
                              <button onClick={handleCreateCourseFinal} disabled={loading} className="px-12 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3">
                                 {loading ? <Loader2 size={16} className="animate-spin" /> : null} Create Course
                              </button>
                           </div>
                        </div>
                     )}

                     {courseStep === 4 && createdCourse && (
                        <div className="animate-in slide-in-from-bottom-5 duration-700 fade-in">
                           <div className="flex items-center justify-between mb-6">
                              <div className="flex gap-2 p-1.5 bg-surface rounded-2xl border border-glass-border font-black text-[10px] uppercase tracking-widest shadow-sm">
                                 <button className="bg-primary text-white px-6 py-3 rounded-[14px] shadow-md">Course Overview</button>
                                 <button className="text-muted hover:text-main px-6 py-3 rounded-[14px] transition-all">Participants</button>
                                 <button className="text-muted hover:text-main px-6 py-3 rounded-[14px] transition-all">Reports</button>
                                 <button className="text-muted hover:text-main px-4 py-3 rounded-[14px] transition-all"><ChevronRight size={14} /></button>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="flex items-center gap-3 bg-surface p-2 rounded-2xl border border-glass-border">
                                    <span className="text-[10px] font-black uppercase text-primary ml-2">Edit</span>
                                    <div className="w-10 h-5 bg-primary rounded-full relative shadow-inner"><div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div></div>
                                    <span className="text-[10px] font-black uppercase text-muted ml-2 mr-2 opacity-50">Preview</span>
                                 </div>
                                 <button className="p-2 bg-surface border border-glass-border rounded-xl text-muted hover:text-main shadow-sm"><MoreVertical size={16} /></button>
                              </div>
                           </div>

                           <div className="flex gap-6 items-start">
                              {/* Left Panel: Topics */}
                              <div className="w-[320px] bg-surface/80 backdrop-blur-xl border border-glass-border rounded-[32px] p-6 shadow-xl flex-shrink-0 sticky top-24">
                                 <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-black italic text-main text-sm truncate pr-4">{createdCourse.fullname}</h4>
                                    <button className="p-2 border border-glass-border rounded-lg text-muted"><LayoutGrid size={12} /></button>
                                 </div>
                                 <div className="relative mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={14} />
                                    <input className="w-full bg-background/80 border border-glass-border rounded-2xl pl-12 pr-4 py-4 text-[11px] outline-none font-bold placeholder-muted focus:border-primary transition-all shadow-inner" placeholder="Search..." />
                                 </div>

                                 <div className="space-y-6">
                                    {[0, 1, 2].map((i) => (
                                       <div key={i} className="mb-6">
                                          <h4 className="text-[12px] font-black uppercase text-muted tracking-widest pl-7 flex items-center justify-between group cursor-pointer hover:text-white transition-colors">
                                             <div className="flex items-center gap-3">
                                                Topic {i + 1}
                                             </div>
                                             <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </h4>
                                          <div className="space-y-3 mt-4 relative">
                                             <div className="absolute -left-[19px] top-4 bottom-8 w-px bg-glass-border"></div>

                                             {activities.filter(a => a.topic === (i + 1)).length > 0 ? (
                                                activities.filter(a => a.topic === (i + 1)).map((act, index) => (
                                                   <div key={act.id} className="relative pl-7 group">
                                                      <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-4 h-px bg-glass-border"></div>
                                                      <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-primary bg-background shadow-[0_0_8px_rgba(var(--primary),0.8)] z-10"></div>
                                                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-glass-border group-hover:border-primary/50 transition-colors shadow-sm cursor-pointer">
                                                         <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                               <BookOpen size={14} />
                                                            </div>
                                                            <span className="text-[10px] font-black tracking-widest text-main">{act.name}</span>
                                                         </div>
                                                         <div className="flex gap-1">
                                                            <button className="p-1 hover:bg-white/10 rounded"><MoreVertical size={14} className="text-muted" /></button>
                                                            <button className="p-1 hover:bg-white/10 rounded"><ChevronDown size={14} className="text-muted" /></button>
                                                         </div>
                                                      </div>
                                                   </div>
                                                ))
                                             ) : (
                                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest pl-7 bg-white/5 py-2 rounded-lg inline-block">No content added</p>
                                             )}

                                             <br />
                                             <button onClick={() => setShowActivityModal(true)} className="ml-7 py-2.5 px-5 bg-primary/5 text-primary border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all inline-flex items-center justify-center gap-2 shadow-sm">
                                                <Plus size={12} /> Add Activity
                                             </button>
                                          </div>
                                       </div>
                                    ))}
                                    <div className="pt-4 border-t border-glass-border">
                                       <button className="w-full py-4 bg-background text-primary border-2 border-primary/20 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 shadow-sm">
                                          <Plus size={14} /> Add Topics
                                       </button>
                                    </div>
                                 </div>
                              </div>

                              {activeCourseView === 'dashboard' && (
                                 <>
                                    {/* Middle Panel: Hero & Overview */}
                                    <div className="flex-grow space-y-8 min-w-0">
                                       <div className="w-full h-80 bg-primary rounded-[32px] overflow-hidden relative shadow-2xl border border-glass-border">
                                          {courseForm.imageurl ? (
                                             <img src={courseForm.imageurl} className="w-full h-full object-cover" />
                                          ) : (
                                             <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-indigo-600 to-primary" />
                                          )}
                                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                          <div className="absolute bottom-8 left-10 right-10 flex flex-col items-start">
                                             <h2 className="text-4xl font-black text-white italic tracking-tight drop-shadow-lg mb-6">{createdCourse.fullname}</h2>
                                             <div className="w-full flex items-center gap-6 bg-surface/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                                <div className="flex-grow bg-black/40 h-3 rounded-full overflow-hidden shadow-inner"><div className="w-[0%] h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" /></div>
                                                <span className="text-white text-[12px] font-black bg-black/40 px-3 py-1 rounded-full">0%</span>
                                                <button className="bg-primary text-white ml-auto px-10 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all">Start</button>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="space-y-4 px-2">
                                          <h4 className="text-[12px] font-black uppercase text-main tracking-widest flex items-center gap-2"><Info size={16} className="text-primary" /> About Course</h4>
                                          <p className="text-sm font-medium leading-relaxed text-main/80 bg-surface/60 p-8 rounded-3xl border border-glass-border shadow-sm">{createdCourse.summary || 'No summary provided.'}</p>
                                       </div>

                                       <div className="space-y-4 px-2">
                                          <h4 className="text-[12px] font-black uppercase text-main tracking-widest flex items-center gap-2"><Activity size={16} className="text-primary" /> Course Analytics Dashboard</h4>
                                          <div className="grid grid-cols-2 gap-6">
                                             <div className="bg-surface p-8 rounded-3xl border border-glass-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                <div>
                                                   <h5 className="text-3xl font-black text-main">0</h5>
                                                   <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-2">Total Enrollments</p>
                                                   <p className="text-[8px] text-green-500 font-bold mt-1 tracking-widest bg-green-500/10 inline-block px-2 py-0.5 rounded uppercase">vs Last Month</p>
                                                </div>
                                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shadow-inner"><UserPlus size={28} /></div>
                                             </div>
                                             <div className="bg-surface p-8 rounded-3xl border border-glass-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                <div>
                                                   <h5 className="text-3xl font-black text-main">0 min</h5>
                                                   <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-2">Average Time</p>
                                                   <p className="text-[8px] text-muted font-bold mt-1 tracking-widest uppercase">Per Session</p>
                                                </div>
                                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shadow-inner"><Activity size={28} /></div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Right Panel: Admin details */}
                                    <div className="w-[300px] space-y-6 flex-shrink-0">
                                       <div className="bg-surface border border-glass-border rounded-[32px] p-8 shadow-xl space-y-5">
                                          <h4 className="text-[10px] font-black uppercase text-muted tracking-widest mb-6 border-b border-glass-border pb-4">Course Actions</h4>
                                          <button className="w-full py-4 bg-background border-2 border-primary/30 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-primary text-primary transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md hover:bg-primary/5">
                                             <UserPlus size={16} /> Enroll Users
                                          </button>
                                       </div>

                                       <div className="bg-surface border border-glass-border rounded-[32px] p-8 shadow-xl space-y-5">
                                          <h4 className="text-[10px] font-black uppercase text-muted tracking-widest mb-6 flex items-center gap-3 border-b border-glass-border pb-4">
                                             <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" /> Course Features
                                          </h4>
                                          <div className="flex items-center justify-between text-xs font-black text-main/80 hover:text-primary cursor-pointer transition-colors bg-white/5 p-4 rounded-2xl">
                                             <span className="flex items-center gap-3 uppercase tracking-widest"><BookOpen size={16} className="text-primary/70" /> Forum</span>
                                             <ChevronRight size={16} />
                                          </div>
                                       </div>

                                       <div className="bg-surface border border-glass-border rounded-[32px] p-8 shadow-xl space-y-5">
                                          <h4 className="text-[10px] font-black uppercase text-muted tracking-widest mb-6 flex items-center gap-3 border-b border-glass-border pb-4">
                                             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" /> Instructors
                                          </h4>
                                          <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-glass-border shadow-inner group cursor-pointer hover:border-primary transition-colors">
                                             <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">A</div>
                                                <span className="text-[11px] font-black uppercase tracking-widest text-main">Admin User</span>
                                             </div>
                                             <Database size={16} className="text-muted group-hover:text-primary transition-colors" />
                                          </div>
                                       </div>
                                    </div>
                                 </>
                              )}

                              {activeCourseView === 'add-activity' && (
                                 <div className="flex-grow bg-surface border border-glass-border rounded-[32px] shadow-xl overflow-hidden min-w-0">
                                    <div className="p-8 border-b border-glass-border flex items-center gap-4">
                                       <button onClick={() => setActiveCourseView('dashboard')} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><ChevronRight size={18} className="rotate-180" /></button>
                                       <div>
                                          <h3 className="text-xl font-black text-main">Adding a new {selectedActivity === 'video' ? 'Video' : 'Activity'} to Topic 1</h3>
                                          <p className="text-muted text-[10px] uppercase font-bold tracking-widest mt-1">You are adding a new {selectedActivity === 'video' ? 'video' : 'activity'}</p>
                                       </div>
                                    </div>

                                    <div className="p-10 space-y-12">
                                       {/* General Section */}
                                       <div className="space-y-6">
                                          <h4 className="text-sm font-black text-main">General</h4>
                                          <div className="space-y-3 flex-grow">
                                             <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase text-muted tracking-widest">Activity Name <span className="text-red-500 text-lg leading-none">*</span></span>
                                             </div>
                                             <input type="text" value={newActivityForm.name} onChange={e => setNewActivityForm({ ...newActivityForm, name: e.target.value })} className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 text-xs font-bold focus:border-primary transition-all outline-none" placeholder={`Enter activity name...`} />
                                          </div>
                                          <div className="space-y-3">
                                             <label className="text-[9px] font-black uppercase text-muted tracking-widest">Description <Info size={10} className="inline" /></label>
                                             <div className="border border-glass-border rounded-xl bg-background/50 overflow-hidden">
                                                <div className="flex items-center gap-2 p-3 bg-surface border-b border-glass-border flex-wrap">
                                                   <div className="flex items-center gap-1 bg-white/5 set-padding rounded p-1">
                                                      <button className="p-1.5 hover:bg-white/10 rounded"><Type size={14} /></button>
                                                      <button className="p-1.5 hover:bg-white/10 rounded font-serif font-black">A</button>
                                                   </div>
                                                   <div className="flex items-center gap-1 bg-white/5 rounded p-1">
                                                      <button className="p-1.5 hover:bg-white/10 rounded font-bold">B</button>
                                                      <button className="p-1.5 hover:bg-white/10 rounded italic">I</button>
                                                   </div>
                                                   <div className="flex items-center gap-1 bg-white/5 rounded p-1">
                                                      <button className="p-1.5 hover:bg-white/10 rounded"><List size={14} /></button>
                                                      <button className="p-1.5 hover:bg-white/10 rounded"><Link size={14} /></button>
                                                      <button className="p-1.5 hover:bg-white/10 rounded"><Image size={14} /></button>
                                                      <button className="p-1.5 hover:bg-white/10 rounded"><Video size={14} /></button>
                                                   </div>
                                                </div>
                                                <textarea className="w-full h-32 bg-transparent p-6 text-xs font-bold outline-none resize-none" placeholder="This activity will explain..." />
                                             </div>
                                          </div>
                                          <label className="flex items-center gap-4 group cursor-pointer w-max">
                                             <div className="w-5 h-5 rounded border border-glass-border flex items-center justify-center group-hover:border-primary transition-all"></div>
                                             <span className="text-[10px] font-bold text-main/80 uppercase tracking-widest">Display description on course page</span>
                                          </label>
                                       </div>

                                       {/* Conditional Video Section */}
                                       {selectedActivity === 'video' && (
                                          <div className="space-y-6">
                                             <h4 className="text-xl font-black text-main">Video</h4>
                                             <div className="flex bg-gray-100 border border-glass-border rounded-lg w-full max-w-md overflow-hidden p-1 shadow-sm">
                                                <button className="flex-1 px-6 py-2.5 bg-white text-main rounded-md font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow"><UploadCloud size={14} /> Upload File</button>
                                                <button className="flex-1 px-6 py-2.5 text-muted hover:text-main rounded-md font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"><Link size={14} /> Video Link</button>
                                             </div>
                                             <div>
                                                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">* <span className="text-main">Video file:</span> <Info size={12} className="inline text-muted" /></label>
                                                <div className="w-full h-56 mt-3 border-2 border-dashed border-glass-border bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors cursor-pointer group">
                                                   <div className="w-12 h-12 flex items-center justify-center text-muted group-hover:text-main transition-all">
                                                      <UploadCloud size={28} />
                                                   </div>
                                                   <div className="text-center">
                                                      <span className="text-sm font-bold text-main">Drag and drop video here, or click to <span className="text-[#0ea5e9]">browse</span></span>
                                                      <p className="text-[10px] font-medium text-muted mt-1 uppercase tracking-widest">Supports MP4, MOV, AVI • Max file size: 500MB</p>
                                                   </div>
                                                </div>
                                                <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Video url should be youtube or vimeo</p>
                                             </div>
                                             <div className="space-y-4 pt-4">
                                                <label className="flex items-center gap-4 cursor-pointer w-max group">
                                                   <div className="w-4 h-4 rounded border border-glass-border flex items-center justify-center group-hover:border-primary transition-all"></div>
                                                   <span className="text-[11px] font-bold text-main">Check to generate a transcription for this video</span>
                                                </label>
                                                <label className="flex items-center gap-4 cursor-pointer w-max group">
                                                   <div className="w-4 h-4 rounded border border-glass-border flex items-center justify-center group-hover:border-primary transition-all"></div>
                                                   <span className="text-[11px] font-bold text-main">Check if the video is in Hindi.</span>
                                                </label>
                                             </div>
                                          </div>
                                       )}

                                       <div className="pt-8">
                                          <h4 className="text-sm font-black text-main flex items-center gap-2 mb-6"><ChevronUp size={16} /> Advanced Settings</h4>
                                          <div className="space-y-4">
                                             {/* Video Sub-section */}
                                             <div className="p-4 bg-gray-100/60 border border-gray-200/60 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                                                <span className="text-main font-black text-[12px]">Video</span>
                                                <ChevronRight className="text-muted" size={16} />
                                             </div>

                                             {/* Common Module Settings Collapsible Section */}
                                             <div className="border border-gray-200/60 rounded-xl overflow-hidden shadow-sm bg-surface">
                                                <div className="bg-gray-100/60 p-4 flex items-center justify-between cursor-pointer">
                                                   <span className="text-main font-black text-[12px]">Common Module Settings</span>
                                                   <ChevronUp className="text-main" size={16} />
                                                </div>
                                                <div className="p-8 space-y-8">
                                                   <div className="flex items-center gap-6">
                                                      <span className="w-32 text-[10px] font-black text-main flex items-center gap-2">Availability <Info size={12} className="text-muted" /></span>
                                                      <select className="academy-input w-72 h-10 bg-white border border-gray-200 px-4 text-xs font-bold appearance-none outline-none rounded-lg shadow-sm">
                                                         <option>Show on course page</option>
                                                         <option>Hide from students</option>
                                                      </select>
                                                   </div>
                                                   <div className="flex items-center gap-6">
                                                      <span className="w-32 text-[10px] font-black text-main flex items-center gap-2">ID number <Info size={12} className="text-muted" /></span>
                                                      <input className="academy-input w-72 h-10 bg-white border border-gray-200 px-4 text-xs font-bold outline-none rounded-lg shadow-sm placeholder:font-normal placeholder:opacity-50" placeholder="Input" />
                                                   </div>
                                                </div>
                                             </div>

                                             {/* Restrict Access Section */}
                                             <div className="border border-gray-200/60 rounded-xl overflow-hidden shadow-sm bg-surface">
                                                <div className="bg-gray-100/60 p-4 flex items-center justify-between cursor-pointer">
                                                   <span className="text-main font-black text-[12px]">Restrict Access</span>
                                                   <ChevronUp className="text-main" size={16} />
                                                </div>
                                                <div className="p-8 space-y-6">
                                                   <div className="flex items-start gap-6">
                                                      <span className="w-32 text-[10px] font-black text-main">Access restrictions</span>
                                                      <div className="space-y-4">
                                                         <span className="text-xs text-main">None</span>
                                                         <button onClick={() => setShowRestrictionModal(true)} className="block text-[#0ea5e9] text-xs font-bold hover:underline">Add restriction...</button>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>

                                             {/* Activity Completion Section */}
                                             <div className="border border-gray-200/60 rounded-xl overflow-hidden shadow-sm bg-surface">
                                                <div className="bg-gray-100/60 p-4 flex items-center justify-between cursor-pointer">
                                                   <span className="text-main font-black text-[12px]">Activity Completion</span>
                                                   <ChevronUp className="text-main" size={16} />
                                                </div>
                                                <div className="p-8 space-y-6">
                                                   <div className="flex items-center gap-6">
                                                      <span className="w-40 text-[10px] font-black text-main flex items-center gap-2">Completion tracking <Info size={12} className="text-muted" /></span>
                                                      <select className="academy-input w-80 h-10 bg-white border border-gray-200 px-4 text-xs font-bold appearance-none outline-none rounded-lg shadow-sm">
                                                         <option>Show activity as complete when conditions are met</option>
                                                         <option>Students can manually mark the activity as complete</option>
                                                      </select>
                                                   </div>
                                                   <div className="flex items-center gap-6">
                                                      <span className="w-40 text-[10px] font-black text-main">Require View</span>
                                                      <label className="flex items-center gap-4 group cursor-pointer w-max">
                                                         <div className="w-4 h-4 bg-[#0ea5e9] text-white rounded-[4px] flex items-center justify-center"><CheckSquare size={12} className="fill-current" /></div>
                                                         <span className="text-xs font-bold text-main">Student must view this activity to complete it</span>
                                                      </label>
                                                   </div>
                                                </div>
                                             </div>

                                             <div className="p-4 bg-gray-100/60 border border-gray-200/60 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                                                <span className="text-main font-black text-[12px]">Tags</span>
                                                <ChevronRight className="text-muted" size={16} />
                                             </div>

                                             <div className="p-4 bg-gray-100/60 border border-gray-200/60 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                                                <span className="text-main font-black text-[12px]">Competencies</span>
                                                <ChevronRight className="text-muted" size={16} />
                                             </div>
                                          </div>
                                       </div>

                                    </div>

                                    <div className="p-6 bg-background border-t border-glass-border flex gap-4">
                                       <button onClick={() => {
                                          setActivities([...activities, { id: Date.now(), name: newActivityForm.name || (selectedActivity === 'video' ? 'New Video Activity' : 'New Activity'), type: selectedActivity, topic: 1 }]);
                                          setNewActivityForm({ name: '', description: '' });
                                          setActiveCourseView('dashboard');
                                       }} className="px-8 py-3.5 bg-[#0e7490] hover:bg-[#164e63] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Save & Enroll User</button>
                                       <button onClick={() => {
                                          setActivities([...activities, { id: Date.now(), name: newActivityForm.name || (selectedActivity === 'video' ? 'New Video Activity' : 'New Activity'), type: selectedActivity, topic: 1 }]);
                                          setNewActivityForm({ name: '', description: '' });
                                          setActiveCourseView('dashboard');
                                       }} className="px-8 py-3.5 bg-[#0e7490] hover:bg-[#164e63] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Save And Display</button>
                                       <button onClick={() => setActiveCourseView('dashboard')} className="px-8 py-3.5 bg-surface hover:bg-white/5 text-muted rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                                    </div>
                                 </div>
                              )}

                           </div>
                        </div>
                     )}

                  </div>
               )}
            </div>
         </div>

         {/* ── HIGH-DENSITY PROFESSIONAL USER PORTAL ── */}
         {showModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
               <div className="bg-surface w-full max-w-5xl border border-glass-border rounded-3xl shadow-3xl flex h-[80vh] overflow-hidden">

                  <div className="w-64 bg-surface-hover/30 border-r border-glass-border flex flex-col p-6">
                     <div className="mb-8 text-primary"><UserPlus size={32} /></div>
                     <h3 className="text-lg font-black italic uppercase mb-6 text-main/90">{showModal}</h3>
                     <nav className="space-y-1.5">
                        <ModalNav active={modalSection === 'general'} icon={<ScrollText size={14} />} label="General" onClick={() => setModalSection('general')} />
                        <ModalNav active={modalSection === 'userpicture'} icon={<Camera size={14} />} label="User Picture" onClick={() => setModalSection('userpicture')} />
                        <ModalNav active={modalSection === 'optional'} icon={<LayoutGrid size={14} />} label="Institutional" onClick={() => setModalSection('optional')} />
                     </nav>
                  </div>

                  <div className="flex-grow flex flex-col min-w-0 relative">
                     <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 p-2.5 bg-background border border-glass-border rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all z-10 focus:outline-none"><X size={20} /></button>

                     <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                        {modalSection === 'general' && (
                           <div className="space-y-8 animate-in fade-in duration-500">
                              <div className="grid grid-cols-3 gap-6 p-6 bg-background/30 rounded-2xl border border-glass-border">
                                 <CompactInput label="Username" value={form.username} onChange={v => setForm({ ...form, username: v })} req />
                                 {/* <CompactSelect label="Auth Method" value={form.auth} options={[{v:'manual', l:'Manual accounts'}]} /> */}
                                 <CompactInput label="Password" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} />
                                 <CompactSelect
                                    label="System Role"
                                    value={form.roleid}
                                    options={[{ v: '', l: 'None (Default)' }, ...data.roles.map(r => ({ v: r.id, l: r.name }))]}
                                    onChange={v => setForm({ ...form, roleid: v })}
                                    icon={<ShieldCheck size={12} />}
                                 />
                              </div>

                              <div className="flex items-center gap-8 bg-primary/5 p-5 rounded-xl border border-primary/10">
                                 <CompactToggle label="Suspended" checked={form.suspended} onChange={v => setForm({ ...form, suspended: v })} />
                                 <CompactToggle label="Force Change" checked={form.forcechange} onChange={v => setForm({ ...form, forcechange: v })} />
                              </div>

                              <div className="grid grid-cols-3 gap-6">
                                 <CompactInput label="First name" req value={form.firstname} onChange={v => setForm({ ...form, firstname: v })} />
                                 <CompactInput label="Last name" req value={form.lastname} onChange={v => setForm({ ...form, lastname: v })} />
                                 <CompactInput label="Email address" req value={form.email} onChange={v => setForm({ ...form, email: v })} />
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                 <CompactInput label="City" value={form.city} onChange={v => setForm({ ...form, city: v })} />
                                 <CompactSelect label="Country" value={form.country} options={[{ v: 'IN', l: 'India' }, { v: 'US', l: 'USA' }]} onChange={v => setForm({ ...form, country: v })} />
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
                                       <Camera size={48} className="text-muted group-hover:text-primary transition-colors" />
                                       <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-6">Upload Portrait</p>
                                    </>
                                 )}
                              </div>
                              {form.profileimageurl && <button onClick={() => setForm({ ...form, profileimageurl: '' })} className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">Remove Picture</button>}
                           </div>
                        )}

                        {modalSection === 'optional' && (
                           <div className="grid grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                              <CompactInput label="ID number" value={form.idnumber} onChange={v => setForm({ ...form, idnumber: v })} icon={<Lock size={12} />} />
                              <CompactInput label="Institution" value={form.institution} onChange={v => setForm({ ...form, institution: v })} icon={<Building2 size={12} />} />
                              <CompactInput label="Department" value={form.department} onChange={v => setForm({ ...form, department: v })} icon={<Tag size={12} />} />
                              <CompactInput label="Phone" value={form.phone1} onChange={v => setForm({ ...form, phone1: v })} icon={<Phone size={12} />} />
                              <CompactInput label="Mobile" value={form.phone2} onChange={v => setForm({ ...form, phone2: v })} icon={<Smartphone size={12} />} />
                              <CompactInput label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} icon={<Home size={12} />} />
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

         {showActivityModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="bg-surface w-full max-w-4xl border border-glass-border rounded-3xl shadow-3xl overflow-hidden flex flex-col h-[70vh]">
                  <div className="flex items-center justify-between p-6 border-b border-glass-border">
                     <h3 className="text-lg font-black text-main">Add Activity</h3>
                     <button onClick={() => setShowActivityModal(false)} className="p-2 text-muted hover:text-main rounded-xl hover:bg-white/5"><X size={20} /></button>
                  </div>
                  <div className="p-6 border-b border-glass-border">
                     <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input className="w-full bg-background/50 border border-glass-border rounded-2xl pl-14 pr-6 py-4 text-xs outline-none font-bold placeholder-muted focus:border-primary transition-all" placeholder="Search..." />
                     </div>
                  </div>
                  <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                     <div className="grid grid-cols-4 gap-4">
                        {[
                           { name: 'AI Activity Builder', icon: <Activity />, new: true, id: 'ai' },
                           { name: 'SCORM', icon: <Database />, id: 'scorm' },
                           { name: 'Quiz', icon: <CheckSquare />, id: 'quiz' },
                           { name: 'Video', icon: <Camera />, id: 'video' },
                           { name: 'Certificates', icon: <ShieldCheck />, id: 'cert' },
                           { name: 'ILT (Instructor-Led Training)', icon: <Users />, id: 'ilt' },
                           { name: 'Assignment', icon: <BookOpen />, id: 'assign' },
                           { name: 'Zoom meeting', icon: <Activity />, id: 'zoom' },
                           { name: 'Microsoft Teams Meeting', icon: <Users />, id: 'teams' },
                           { name: 'AI Quiz Generator', icon: <Activity />, id: 'aiquiz' },
                           { name: 'URL', icon: <Globe />, id: 'url' },
                           { name: 'PDF Uploader', icon: <BookOpen />, id: 'pdf' },
                        ].map(act => (
                           <div key={act.id} onClick={() => setSelectedActivity(act.id)} className={`relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all cursor-pointer ${selectedActivity === act.id ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/20' : 'border-glass-border hover:border-primary/50 text-main hover:bg-white/5 bg-surface'}`}>
                              {act.new && <span className="absolute -top-3 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/30 z-10">New</span>}
                              <div className={`p-4 rounded-xl ${selectedActivity === act.id ? 'bg-primary/10' : 'bg-background'}`}>
                                 {act.icon}
                              </div>
                              <span className="text-[10px] font-black text-center leading-tight h-8 flex items-center justify-center">{act.name}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="p-6 border-t border-glass-border flex items-center justify-between bg-white/5">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                        Selected: <span className="text-primary">{['ai', 'scorm', 'quiz', 'video', 'cert', 'ilt', 'assign', 'zoom', 'teams', 'aiquiz', 'url', 'pdf'].includes(selectedActivity) ? 'Activity Selected' : 'None'}</span>
                     </span>
                     <div className="flex gap-4">
                        <button onClick={() => setShowActivityModal(false)} className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:bg-white/5">Cancel</button>
                        <button disabled={!selectedActivity} onClick={() => {
                           setShowActivityModal(false);
                           setActiveCourseView('add-activity');
                        }} className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                           <Plus size={14} /> Add Activity
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {showRestrictionModal && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="bg-white w-full max-w-2xl rounded-3xl shadow-3xl overflow-hidden flex flex-col">
                  <div className="p-6 text-center border-b border-gray-100 relative">
                     <h3 className="text-lg font-black text-main">Add restriction...</h3>
                  </div>
                  <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                     <div className="grid gap-2">
                        {[
                           { title: 'Cohort', desc: 'Allow only students who belong to a specified cohort.' },
                           { title: 'Activity completion', desc: 'Require students to complete (or not complete) another activity.' },
                           { title: 'Course completed', desc: 'Allow only students who already (or not yet) completed this course.' },
                           { title: 'Date', desc: 'Prevent access until (or from) a specified date and time.' },
                           { title: 'Days', desc: 'Prevent access until a specified day offset is reached relative to the course start date.' },
                           { title: 'Grade', desc: 'Require students to achieve a specified grade.' },
                           { title: 'Language', desc: 'Require students to use a certain language.' },
                           { title: 'Mobile app', desc: 'Require students to access (or not access) using the Mobile app.' },
                           { title: 'Other course completion', desc: 'Require students to complete other course .' },
                           { title: 'User profile', desc: 'Control access based on fields within the student\'s profile.' },
                           { title: 'Restriction set', desc: 'Add a set of nested restrictions to apply complex logic.' },
                        ].map(res => (
                           <div key={res.title} onClick={() => { setShowRestrictionModal(false); alert('Restriction configured.'); }} className="flex gap-6 p-4 hover:bg-sky-50 cursor-pointer rounded-2xl transition-all items-center border border-transparent hover:border-sky-100">
                              <div className="w-1/3 text-right">
                                 <span className="text-[#0ea5e9] text-sm tracking-wide font-medium">{res.title}</span>
                              </div>
                              <div className="w-2/3">
                                 <p className="text-xs font-bold text-gray-700 leading-relaxed">{res.desc}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="p-6 text-center border-t border-gray-100 bg-gray-50 flex justify-center">
                     <button onClick={() => setShowRestrictionModal(false)} className="px-8 py-2.5 bg-white text-[#0ea5e9] font-black text-xs rounded-xl shadow-sm hover:shadow hover:bg-gray-50 transition-all tracking-widest uppercase">Cancel</button>
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

function CompactInput({ label, type = 'text', value, onChange, req, icon }) {
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
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
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
