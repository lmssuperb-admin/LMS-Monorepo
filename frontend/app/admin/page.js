'use client';
import { useState, useEffect, useRef } from 'react';
import {
   Users, BookOpen, ShieldCheck, Search, Plus, Activity, Loader2,
   MoreVertical, Edit2, X, ChevronLeft, ChevronRight, Filter, Globe, Database,
   UserPlus, Mail, MapPin, Key, Lock, CheckSquare, Square, ChevronDown,
   Info, Camera, PlusCircle, Tag, Phone, Home, Building, LayoutGrid, ScrollText,
   Building2, Smartphone, Type, List, Link, Image, Video, UploadCloud, ChevronUp, FilePlus, Sparkles, Play, FileText, BrainCircuit, PenTool, HelpCircle, FolderOpen, Check, LayoutDashboard, Bell, Calendar, TrendingUp, Award, Clock, ArrowRight, MessageSquare, ExternalLink, Sliders
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
   const [mainTab, setMainTab] = useState('dashboard');
   const [subTab, setSubTab] = useState('Overview');
   const [data, setData] = useState({
      users: [], courses: [], categories: [], cohorts: [], roles: [], systemAssignments: [],
      announcements: [
         { id: 1, title: 'Launch Of New Semester', author: 'Admin User', date: '2026-04-27T10:24', icon: <Bell size={18} /> },
         { id: 2, title: 'General Notification', author: 'Admin User', date: '2026-04-27T08:27', icon: <Bell size={18} /> },
         { id: 3, title: 'Webinar - AI is Future', author: 'Admin User', date: '2026-04-22T20:00', icon: <Bell size={18} /> }
      ],
      events: [
         { id: 1, name: 'Weekly Sync', time: '10:00 AM', date: '2026-04-22', status: 'Offline' },
         { id: 2, name: 'A - Demo Course', time: '10:00 AM - 11:00 AM', date: '2026-04-22', status: 'Offline' },
         { id: 3, name: 'Project Review', time: '02:00 PM', date: '2026-04-25', status: 'Online' }
      ]
   });
   const [loading, setLoading] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [editingUser, setEditingUser] = useState(null);
   const [editingCourse, setEditingCourse] = useState(null);
   const [activeMenu, setActiveMenu] = useState(null);
   const [modalSection, setModalSection] = useState('general');
   const fileInputRef = useRef(null);
   const activityFileInputRef = useRef(null);
   const posterImageInputRef = useRef(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [activeFilters, setActiveFilters] = useState(['name', 'email']);
   const [filterByRole, setFilterByRole] = useState('all');
   const [showFilterDropdown, setShowFilterDropdown] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(10);
   const [roleForm, setRoleForm] = useState({ userid: '', roleid: '', contextlevel: 'system', instanceid: 0 });

   const [courseForm, setCourseForm] = useState({ fullname: '', categoryid: '', summary: '', imageurl: '' });
   const [categoryForm, setCategoryForm] = useState({ name: '', parent: '0', idnumber: '', description: '' });
   const [courseStep, setCourseStep] = useState(1);
   const [courseTopics, setCourseTopics] = useState([
      { id: 1, name: 'Topic 1', activities: [] },
      { id: 2, name: 'Topic 2', activities: [] },
      { id: 3, name: 'Topic 3', activities: [] },
   ]);
   const [enrolledUserIds, setEnrolledUserIds] = useState([]);
   const [enrolledRoles, setEnrolledRoles] = useState({});
   const [activeTopicId, setActiveTopicId] = useState(1);
   const [createdCourse, setCreatedCourse] = useState(null);
   const [showActivityModal, setShowActivityModal] = useState(false);
   const [selectedActivity, setSelectedActivity] = useState('');
   const [activeCourseView, setActiveCourseView] = useState('dashboard');
   const [showRestrictionModal, setShowRestrictionModal] = useState(false);
   const [activities, setActivities] = useState([
      { id: 1, name: 'Basics Of Java', type: 'book', topic: 1 }
   ]);
   const [newActivityForm, setNewActivityForm] = useState({ name: '', description: '' });
   const [videoActivityForm, setVideoActivityForm] = useState({
      name: '',
      description: '',
      displayDescription: false,
      videoType: 'upload', // 'upload' or 'link'
      videoUrl: '',
      playerSizeWidth: '800',
      playerSizeHeight: '500',
      moveForward: false,
      responsive: true,
      posterImageUrl: '',
      captions: '',
      completionTracking: 'manual', // 'none', 'manual', 'conditions'
      requireView: false,
      courseCompletion: false,
      completionDate: '',
      completionDateEnabled: false,
      restrictions: [],
   });

   const [pdfActivityForm, setPdfActivityForm] = useState({
      name: '',
      description: '',
      displayDescription: false,
      displayContents: 'separate', // 'separate' or 'inline'
      showSubfolders: true,
      openInNewTab: true,
      pdfUrl: '',
      completionTracking: 'manual',
      requireView: false,
      courseCompletion: false,
      completionDate: '',
      completionDateEnabled: false,
      restrictions: [],
   });
   const [activeAdvancedSection, setActiveAdvancedSection] = useState('video');
   const [selectedEventDay, setSelectedEventDay] = useState(null);
   const [dashboardTab, setDashboardTab] = useState('all');
   const [dashboardPage, setDashboardPage] = useState(1);
   const coursesPerPage = 4;

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
         // 🏠 Dashboard Data Fetching (Real Data aggregation)
         if (mainTab === 'dashboard') {
            const [usersRes, coursesRes, eventsRes] = await Promise.all([
               fetch(`http://localhost:4000/api/users`, { signal }).then(r => r.json()),
               fetch(`http://localhost:4000/api/courses`, { signal }).then(r => r.json()),
               fetch(`http://localhost:4000/api/system/calendar`, { signal }).then(r => r.json())
            ]);

            setData(prev => ({
               ...prev,
               users: usersRes?.users || [],
               courses: Array.isArray(coursesRes) ? coursesRes : (coursesRes.courses || []),
               events: Array.isArray(eventsRes) ? eventsRes.map(e => ({
                  id: e.id,
                  day: new Date(e.timestart * 1000).getDate(),
                  month: new Date(e.timestart * 1000).getMonth(),
                  year: new Date(e.timestart * 1000).getFullYear(),
                  time: new Date(e.timestart * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                  title: e.name,
                  location: e.location || 'Online',
                  type: e.eventtype
               })) : []
            }));
         }

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
         if (mainTab === 'permissions' || subTab === 'Assign system roles') {
            const [usersRes, assignRes] = await Promise.all([
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

   const handleCreateCourseFinal = () => {
      if (!courseForm.fullname || !courseForm.categoryid) {
         alert("Please fill in course name and category.");
         return;
      }
      setCourseStep(3); // Move to Content Builder
   };

   const handlePublishCourse = async () => {
      setLoading(true);
      try {
         // 1. Create Course
         const coursePayload = {
            ...courseForm,
            shortname: courseForm.fullname.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.floor(Math.random() * 1000)
         };
         const course = await fetch('http://localhost:4000/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(coursePayload)
         }).then(r => r.json());

         if (course.error) throw new Error(course.error);

         // 2. Add Activities
         for (let i = 0; i < courseTopics.length; i++) {
            const topic = courseTopics[i];
            for (const act of topic.activities) {
               await fetch(`http://localhost:4000/api/courses/${course.id}/activities`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...act, section: i })
               });
            }
         }

         // 3. Enroll Users
         for (const userId of enrolledUserIds) {
            const roleid = enrolledRoles[userId] || 5; // Default to student
            await fetch('http://localhost:4000/api/roles/assign', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ userid: userId, roleid: roleid, contextlevel: 'course', instanceid: course.id })
            });
         }

         setCreatedCourse(course);
         alert('Course Published Successfully!');
         setCourseStep(1);
         setMainTab('courses');
         setSubTab('Manage courses');
         setActiveCourseView('dashboard');
      } catch (err) {
         alert("Publication failed: " + err.message);
      }
      setLoading(false);
   };

   const handleSaveActivity = () => {
      const formToUse = selectedActivity === 'pdf' ? pdfActivityForm : videoActivityForm;
      const newActivity = {
         ...formToUse,
         id: `temp-${Date.now()}`,
         type: selectedActivity,
      };

      setCourseTopics(prev => prev.map(t =>
         t.id === activeTopicId ? { ...t, activities: [...t.activities, newActivity] } : t
      ));

      setActiveCourseView('dashboard');
      // Reset form
      setVideoActivityForm({
         name: '', description: '', displayDescription: false, videoType: 'upload', videoUrl: '',
         playerSizeWidth: '800', playerSizeHeight: '500', moveForward: false, responsive: true,
         posterImageUrl: '', captions: '', completionTracking: 'manual', requireView: false,
         courseCompletion: false, completionDate: '', completionDateEnabled: false, restrictions: [],
      });
      setPdfActivityForm({
         name: '', description: '', displayDescription: false, displayContents: 'separate',
         showSubfolders: true, openInNewTab: true, pdfUrl: '', completionTracking: 'manual',
         requireView: false, courseCompletion: false, completionDate: '', completionDateEnabled: false, restrictions: [],
      });
   };

   const handleCreateCategory = async () => {
      setLoading(true);
      try {
         const res = await fetch('http://localhost:4000/api/courses/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryForm)
         }).then(r => r.json());

         if (res.error) throw new Error(res.error);
         alert('Category Created Successfully!');
         setCategoryForm({ name: '', parent: '0', idnumber: '', description: '' });
         fetchTabData();
      } catch (err) {
         alert("Failed to create category: " + err.message);
      }
      setLoading(false);
   };

   const handleDeleteCourse = async (id) => {
      if (!confirm('Are you sure you want to delete this course?')) return;
      setLoading(true);
      try {
         const res = await fetch(`http://localhost:4000/api/courses/${id}`, { method: 'DELETE' }).then(r => r.json());
         if (res.error) throw new Error(res.error);
         alert('Course Deleted Successfully!');
         fetchTabData();
      } catch (err) {
         alert("Deletion failed: " + err.message);
      }
      setLoading(false);
   };


   const handleInitialize = async () => {
      setLoading(true);
      try {
         if (showModal === 'Edit Course') {
            const res = await fetch(`http://localhost:4000/api/courses/${editingCourse.id}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(courseForm)
            }).then(r => r.json());
            if (res.error) throw new Error(res.error);
            setShowModal(false);
            fetchTabData();
            alert('Course Updated Successfully!');
            setLoading(false);
            return;
         }
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

   const handleActivityFileUpload = async (e, field) => {
      const file = e.target.files[0];
      if (!file) return;
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      try {
         const res = await fetch('http://localhost:4000/api/system/upload', { method: 'POST', body: formData }).then(r => r.json());
         if (res.url) {
            if (selectedActivity === 'pdf') {
               setPdfActivityForm(prev => ({ ...prev, [field]: res.url }));
            } else {
               setVideoActivityForm(prev => ({ ...prev, [field]: res.url }));
            }
            alert('File uploaded successfully!');
         }
      } catch (err) { alert('Upload failed'); }
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
      dashboard: { icon: <LayoutDashboard size={18} />, subs: ['Overview'] },
      users: { icon: <Users size={18} />, subs: ['Browse users', 'Add user'] },
      courses: { icon: <BookOpen size={18} />, subs: ['Manage courses', 'Categories', 'Add course'] },
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
               {mainTab === 'dashboard' && subTab === 'Overview' && (
                  <div className="space-y-8 animate-in fade-in duration-700">
                     {/* TOP STATS */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<Users size={20} />} label="Total Users" value={data.users.length} sub="Active Now" />
                        <StatCard icon={<Activity size={20} />} label="Active Users" value={data.users.filter(u => u.lastaccess > (Date.now() / 1000 - 86400)).length} sub="Past 24h" />
                        <StatCard icon={<BookOpen size={20} />} label="Total Courses" value={data.courses.length} sub="Published" />
                        <StatCard icon={<Award size={20} />} label="Certificates Issued" value={14} sub="Completed" />
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* GENERAL OVERVIEW - PIE CHARTS */}
                        <div className="lg:col-span-2 academy-card p-8 space-y-8">
                           <div className="flex justify-between items-center">
                              <h3 className="text-[12px] font-black uppercase tracking-widest text-main">General Overview</h3>
                              <div className="flex gap-2">
                                 <button className="p-2 bg-white/5 rounded-lg border border-glass-border"><TrendingUp size={14} className="text-primary" /></button>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                 <p className="text-[10px] font-black uppercase text-muted tracking-widest">User Distribution Overview</p>
                                 <div className="flex items-center gap-6">
                                    {(() => {
                                       const total = data.users.length || 1;
                                       const active = data.users.filter(u => u.lastaccess > (Date.now() / 1000 - 86400)).length;
                                       const suspended = data.users.filter(u => u.suspended).length;
                                       const inactive = total - active - suspended;

                                       const activeP = (active / total) * 100;
                                       const inactiveP = (inactive / total) * 100;
                                       const suspendedP = (suspended / total) * 100;

                                       return (
                                          <div className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-xl flex-shrink-0"
                                             style={{ background: `conic-gradient(#22c55e 0% ${activeP}%, #64748b ${activeP}% ${activeP + inactiveP}%, #ef4444 ${activeP + inactiveP}% 100%)` }}>
                                             <div className="absolute inset-5 bg-surface rounded-full flex flex-col items-center justify-center border border-glass-border shadow-inner px-2">
                                                <span className="text-lg font-black text-main leading-none">{active}</span>
                                                <span className="text-[7px] font-bold text-muted uppercase mt-0.5">Active</span>
                                             </div>
                                          </div>
                                       );
                                    })()}
                                    <div className="space-y-2">
                                       <LegendItem color="#0ea5e9" label="Total Users" value={data.users.length} />
                                       <LegendItem color="#22c55e" label="Active" value={data.users.filter(u => u.lastaccess > (Date.now() / 1000 - 86400)).length} />
                                       <LegendItem color="#64748b" label="Inactive" value={data.users.length - data.users.filter(u => u.lastaccess > (Date.now() / 1000 - 86400)).length} />
                                       <LegendItem color="#ef4444" label="Suspended" value={data.users.filter(u => u.suspended).length} />
                                    </div>
                                 </div>
                              </div>
                              <div className="space-y-6">
                                 <p className="text-[10px] font-black uppercase text-muted tracking-widest">User Enrollments Breakdown</p>
                                 <div className="flex items-center gap-6">
                                    {(() => {
                                       const total = data.users.length || 1;
                                       const enrolled = Math.floor(total * 0.8); // Mocking enrollment ratio as I don't have enrollment endpoint yet
                                       const overdue = 13;
                                       const notEnrolled = total - enrolled - overdue;

                                       const enrolledP = (enrolled / total) * 100;
                                       const overdueP = (overdue / total) * 100;

                                       return (
                                          <div className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-xl flex-shrink-0"
                                             style={{ background: `conic-gradient(#0ea5e9 0% ${enrolledP}%, #f59e0b ${enrolledP}% ${enrolledP + overdueP}%, #64748b ${enrolledP + overdueP}% 100%)` }}>
                                             <div className="absolute inset-5 bg-surface rounded-full flex flex-col items-center justify-center border border-glass-border shadow-inner px-2">
                                                <span className="text-lg font-black text-main leading-none">{enrolled}</span>
                                                <span className="text-[7px] font-bold text-muted uppercase mt-0.5">Enrolled</span>
                                             </div>
                                          </div>
                                       );
                                    })()}
                                    <div className="space-y-2">
                                       <LegendItem color="#0ea5e9" label="Total Courses" value={data.courses.length} />
                                       <LegendItem color="#22c55e" label="Enrolled" value={Math.floor(data.users.length * 0.8)} />
                                       <LegendItem color="#ef4444" label="Not Enrolled" value={Math.ceil(data.users.length * 0.2)} />
                                       <LegendItem color="#f59e0b" label="Overdue" value={13} />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>


                        {/* CALENDAR SECTION */}
                        <div className="academy-card p-8">
                           <div className="flex justify-between items-center mb-8">
                              <h3 className="text-[12px] font-black uppercase tracking-widest text-main">April 2026</h3>
                              <div className="flex gap-2">
                                 <button className="p-2 hover:bg-white/5 rounded-lg transition-all"><ChevronLeft size={16} /></button>
                                 <button className="p-2 hover:bg-white/5 rounded-lg transition-all"><ChevronRight size={16} /></button>
                                 <button className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20 ml-2"><Plus size={16} /></button>
                              </div>
                           </div>

                           <div className="grid grid-cols-7 gap-y-6 text-center">
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                 <span key={d} className="text-[9px] font-black uppercase text-muted tracking-widest">{d}</span>
                              ))}
                              {Array.from({ length: 30 }).map((_, i) => {
                                 const day = i + 1;
                                 const isToday = day === new Date().getDate();
                                 const dayEvents = data.events.filter(e => e.day === day && e.month === 3); // April is index 3
                                 const hasEvents = dayEvents.length > 0;

                                 return (
                                    <div key={i} className="relative group flex justify-center"
                                       onMouseEnter={() => hasEvents && setSelectedEventDay(day)}
                                       onMouseLeave={() => setSelectedEventDay(null)}
                                    >
                                       <button
                                          className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all relative z-10 ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-main hover:bg-white/5'}`}
                                          onClick={() => { setSubTab('Events Calendar'); setSelectedEventDay(null); }}
                                       >
                                          {day}
                                          {hasEvents && !isToday && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
                                       </button>
                                       {selectedEventDay === day && (
                                          <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-background border border-glass-border shadow-2xl rounded-2xl z-[100] p-5 animate-in slide-in-from-bottom-2 duration-300">
                                             <div className="flex justify-between items-center mb-4 border-b border-glass-border pb-2">
                                                <div className="flex flex-col">
                                                   <span className="text-[10px] font-black uppercase text-primary tracking-widest">Your Events !</span>
                                                   <span className="text-[9px] font-bold text-muted">{day} April 2026</span>
                                                </div>
                                             </div>
                                             <div className="space-y-4">
                                                <div className="flex items-center justify-between text-[8px] font-black uppercase text-muted border-b border-white/5 pb-2">
                                                   <span>Timing</span>
                                                   <span>Name</span>
                                                   <span>Location</span>
                                                </div>
                                                {dayEvents.map(ev => (
                                                   <div key={ev.id} className="flex items-center justify-between group/ev">
                                                      <div className="flex items-center gap-3">
                                                         <div className="w-2 h-2 rounded-full border border-primary bg-background shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                                         <span className="text-[9px] font-bold text-main">{ev.time}</span>
                                                      </div>
                                                      <span className="text-[9px] font-black uppercase truncate max-w-[80px]">{ev.title}</span>
                                                      <span className="text-[8px] font-black uppercase text-primary/80">{ev.location}</span>
                                                   </div>
                                                ))}
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     </div>

                     {/* LEARNING HOURS CHART (FULL WIDTH) */}
                     <div className="academy-card p-8 space-y-8 mb-8">
                        <div className="flex justify-between items-center">
                           <div>
                              <h3 className="text-[18px] font-black text-main tracking-tight mb-2">Learning Hours</h3>
                              <div className="flex gap-4">
                                 <div className="bg-[#e0f2fe] text-[#0ea5e9] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight">Total Hours: 75.29</div>
                                 <div className="bg-[#eff6ff] text-[#3b82f6] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight">Avg Hours: 15.06</div>
                              </div>
                           </div>
                           <div className="flex gap-3">
                              <div className="flex items-center gap-2 bg-surface/40 border border-glass-border px-4 py-2 rounded-xl">
                                 <span className="text-[10px] font-black text-main uppercase">This Week</span>
                                 <ChevronDown size={14} className="text-muted" />
                              </div>
                              <button className="p-2.5 bg-white/5 rounded-xl border border-glass-border hover:bg-primary/10 transition-all group"><Sliders size={16} className="text-muted group-hover:text-primary transition-colors" /></button>
                           </div>
                        </div>

                        <div className="relative h-[300px] w-full mt-12 flex items-end justify-between px-16 pb-10">
                           {/* Y-Axis Labels */}
                           <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-[10px] font-black text-muted/60 pr-6">
                              <span>40.0hrs</span>
                              <span>35.0hrs</span>
                              <span>30.0hrs</span>
                              <span>25.0hrs</span>
                              <span>20.0hrs</span>
                              <span>15.0hrs</span>
                              <span>10.0hrs</span>
                              <span>5.0hrs</span>
                              <span>0.0hrs</span>
                           </div>

                           {/* Grid Lines */}
                           <div className="absolute inset-0 left-16 bottom-10 flex flex-col justify-between pointer-events-none opacity-10">
                              {[...Array(9)].map((_, i) => <div key={i} className="w-full border-t border-dashed border-muted/50" />)}
                           </div>

                           {/* Bars */}
                           {[
                              { label: 'Mar 26', value: 14.5, active: false },
                              { label: 'Apr 02', value: 20.8, active: false },
                              { label: 'Apr 09', value: 39.2, active: true },
                              { label: 'Apr 16', value: 0, active: false },
                              { label: 'Apr 23', value: 1.5, active: false },
                           ].map((bar, i) => (
                              <div key={i} className="relative flex flex-col items-center group w-16">
                                 <div
                                    className={`w-full rounded-t-xl transition-all duration-700 ease-out cursor-pointer ${bar.active ? 'bg-[#7dd3fc] shadow-lg shadow-[#0ea5e9]/30' : 'bg-[#7dd3fc]/40 hover:bg-[#7dd3fc]'}`}
                                    style={{ height: `${(bar.value / 40) * 100}%` }}
                                 >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-glass-border px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl">
                                       <span className="text-[10px] font-black text-primary">{bar.value} hrs</span>
                                    </div>
                                 </div>
                                 <span className="absolute -bottom-8 text-[9px] font-black text-muted uppercase tracking-wider whitespace-nowrap">{bar.label}</span>
                              </div>
                           ))}

                           {/* X-Axis Line */}
                           <div className="absolute bottom-10 left-16 right-0 h-px bg-glass-border" />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                        {/* COURSES OVERVIEW */}
                        <div className="academy-card p-8">
                           <div className="flex justify-between items-center mb-8">
                              <h3 className="text-[12px] font-black uppercase tracking-widest text-main">Courses Overview & Enrollment</h3>
                              <div className="flex gap-2">
                                 <button className="p-2 bg-white/5 rounded-lg border border-glass-border"><Filter size={14} className="text-muted" /></button>
                                 <button className="p-2 bg-white/5 rounded-lg border border-glass-border"><LayoutGrid size={14} className="text-muted" /></button>
                                 <button className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20"><TrendingUp size={14} /></button>
                              </div>
                           </div>

                           <div className="flex gap-12 mb-8 border-b border-glass-border pb-8">
                              <StatItem label="Total Course" value={data.courses.length} />
                              <StatItem label="With Enrollments" value={data.courses.filter(c => c.visible).length} color="text-primary" />
                              <StatItem label="Without Enrollments" value={data.courses.filter(c => !c.visible).length} color="text-muted" />
                           </div>

                           <div className="space-y-4">
                              <div className="grid grid-cols-5 text-[8px] font-black uppercase text-muted tracking-widest px-4 border-b border-glass-border pb-3">
                                 <div className="col-span-2">Top Performing Course</div>
                                 <div>Views</div>
                                 <div>Enrolled</div>
                                 <div>Status</div>
                              </div>
                              {data.courses.slice((dashboardPage - 1) * coursesPerPage, dashboardPage * coursesPerPage).map(course => (
                                 <TopCourseRow key={course.id} name={course.fullname} views={Math.floor(Math.random() * 5000)} enrolled={Math.floor(Math.random() * 200)} status={course.visible ? 'Success' : 'Active'} />
                              ))}
                              {data.courses.length === 0 && <p className="text-[10px] text-center p-4 text-muted font-black uppercase">No courses found</p>}
                           </div>

                           <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-glass-border">
                              <button
                                 disabled={dashboardPage === 1}
                                 onClick={() => setDashboardPage(prev => Math.max(1, prev - 1))}
                                 className="p-2 hover:bg-white/5 rounded-xl border border-glass-border transition-all disabled:opacity-30"
                              >
                                 <ChevronLeft size={14} />
                              </button>
                              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                                 <span className="text-primary">{dashboardPage}</span> / {Math.ceil(data.courses.length / coursesPerPage) || 1}
                              </div>
                              <button
                                 disabled={dashboardPage >= Math.ceil(data.courses.length / coursesPerPage)}
                                 onClick={() => setDashboardPage(prev => prev + 1)}
                                 className="p-2 hover:bg-white/5 rounded-xl border border-glass-border transition-all disabled:opacity-30"
                              >
                                 <ChevronRight size={14} />
                              </button>
                           </div>
                        </div>

                        {/* LATEST ANNOUNCEMENTS */}
                        <div className="academy-card p-8">
                           <div className="flex justify-between items-center mb-8">
                              <h3 className="text-[12px] font-black uppercase tracking-widest text-main">Latest Announcements</h3>
                              <button className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-all"><Plus size={16} /></button>
                           </div>

                           <div className="space-y-4">
                              {data.announcements.map(ann => (
                                 <div key={ann.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-glass-border hover:border-primary/30 transition-all group">
                                    <div className="flex items-center gap-5">
                                       <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                          {ann.icon}
                                       </div>
                                       <div>
                                          <h4 className="text-[11px] font-black text-main uppercase tracking-tight line-clamp-1">{ann.title}</h4>
                                          <div className="flex items-center gap-3 mt-1.5">
                                             <span className="text-[9px] font-bold text-muted uppercase flex items-center gap-1"><Users size={10} /> {ann.author}</span>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                       <span className="text-[9px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10 flex items-center gap-1.5"><Clock size={10} /> {new Date(ann.date).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                       <button className="p-2 text-muted hover:text-main transition-colors"><ArrowRight size={14} /></button>
                                    </div>
                                 </div>
                              ))}
                           </div>

                           <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-glass-border">
                              <button className="p-2 hover:bg-white/5 rounded-xl border border-glass-border transition-all"><ChevronLeft size={14} /></button>
                              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"><span className="text-primary">1</span> / 4</div>
                              <button className="p-2 hover:bg-white/5 rounded-xl border border-glass-border transition-all"><ChevronRight size={14} /></button>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* {subTab === 'Events Calendar' && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                     <div className="academy-card p-10 min-h-[600px] flex flex-col items-center justify-center text-center">
                        <Calendar size={64} className="text-primary/20 mb-8" />
                        <h2 className="text-2xl font-black text-main uppercase italic mb-4">Advanced Events Calendar</h2>
                        <p className="text-muted text-sm max-w-lg mb-10 leading-relaxed font-medium italic">You are entering the master scheduling engine. Here you can manage all global syncs, course webinars, and student milestones.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                           <div className="p-8 bg-white/5 border border-glass-border rounded-[32px] space-y-4">
                              <StatItem label="Total Events" value={data.events.length} />
                           </div>
                           <div className="p-8 bg-white/5 border border-glass-border rounded-[32px] space-y-4">
                              <StatItem label="Upcoming" value={2} color="text-primary" />
                           </div>
                           <div className="p-8 bg-white/5 border border-glass-border rounded-[32px] space-y-4">
                              <StatItem label="Completed" value={1} color="text-muted" />
                           </div>
                        </div>
                        <button className="mt-12 bg-primary text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20">Create New Event</button>
                     </div>
                  </div>
               )} */}

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

               {subTab === 'Manage courses' && (
                  <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                     <div className="flex justify-between items-center bg-surface/60 p-6 rounded-3xl border border-glass-border shadow-sm">
                        <div>
                           <h3 className="text-xl font-black italic uppercase tracking-tight text-main">Manage Courses</h3>
                           <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">View, edit, and organize all available courses</p>
                        </div>
                        <button onClick={() => setSubTab('Add course')} className="bg-primary text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center gap-3">
                           <Plus size={16} /> Create New Course
                        </button>
                     </div>

                     <div className="academy-card overflow-hidden text-[11px]">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="border-b border-glass-border bg-white/5 uppercase text-[9px] font-black tracking-[0.2em] text-primary/60">
                                 <th className="p-6">Course Name</th>
                                 <th className="p-6">Shortname</th>
                                 <th className="p-6">Category</th>
                                 <th className="p-6 text-right">Actions</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-glass-border text-xs font-bold">
                              {data.courses?.map(c => (
                                 <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6">
                                       <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                                             {c.imageurl ? <img src={c.imageurl} className="w-full h-full object-cover" /> : <BookOpen size={20} />}
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-main uppercase tracking-tighter text-sm">{c.fullname}</span>
                                             <span className="text-muted text-[10px] font-medium line-clamp-1 max-w-xs">{c.summary?.replace(/<[^>]*>/g, '') || 'No summary provided'}</span>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="p-6 text-muted font-medium uppercase tracking-widest text-[10px]">{c.shortname}</td>
                                    <td className="p-6">
                                       <span className="px-3 py-1 bg-surface border border-glass-border rounded-full text-[9px] uppercase text-muted">
                                          {data.categories.find(cat => cat.id == c.categoryid)?.name || `Category #${c.categoryid}`}
                                       </span>
                                    </td>
                                    <td className="p-6 text-right">
                                       <div className="flex justify-end gap-2">
                                          <button onClick={() => { setEditingCourse(c); setCourseForm({ fullname: c.fullname, categoryid: c.categoryid, summary: c.summary, imageurl: c.imageurl }); setShowModal('Edit Course'); setModalSection('general'); }} className="p-3 hover:bg-primary hover:text-white rounded-xl transition-all border border-glass-border text-muted"><Edit2 size={16} /></button>
                                          <button onClick={() => handleDeleteCourse(c.id)} className="p-3 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-glass-border text-muted"><X size={16} /></button>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                              {(!data.courses || data.courses.length === 0) && (
                                 <tr><td colSpan="4" className="p-20 text-center text-muted uppercase text-[10px] tracking-[0.3em]">No courses found in database</td></tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}

               {subTab === 'Add course' && (
                  <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
                     {courseStep < 4 && (
                        <div className="flex items-center gap-4 mb-10 text-[10px] font-black uppercase tracking-widest text-muted">
                           <div className={`flex items-center gap-2 ${courseStep >= 1 ? 'text-primary' : ''}`}>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${courseStep >= 1 ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>1</span>
                              Creation Method
                           </div> <ChevronRight size={14} />
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

                     {courseStep === 1 && (
                        <div className="bg-surface border border-glass-border rounded-3xl p-10 shadow-xl space-y-8">
                           <div className="space-y-2 mb-8">
                              <h3 className="text-xl font-black text-main">Choose Creation Method</h3>
                              <p className="text-muted text-[10px] uppercase tracking-widest font-bold">How would you like to start building your new course?</p>
                           </div>

                           <div className="grid grid-cols-2 gap-8 max-w-3xl">
                              <div onClick={() => setCourseStep(2)} className="bg-background/50 border border-glass-border rounded-[24px] p-8 cursor-pointer hover:border-primary hover:shadow-2xl hover:shadow-primary/20 transition-all group flex flex-col items-center text-center">
                                 <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FilePlus size={28} />
                                 </div>
                                 <h4 className="text-sm font-black text-main uppercase tracking-widest">Start from Scratch</h4>
                                 <p className="text-xs text-muted font-bold mt-3 leading-relaxed">Build a completely blank course and structure it manually with your own content.</p>
                              </div>

                              <div className="bg-background/50 border border-glass-border rounded-[24px] p-8 opacity-50 cursor-not-allowed flex flex-col items-center text-center relative overflow-hidden">
                                 <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-muted">Coming Soon</div>
                                 <div className="w-16 h-16 rounded-2xl bg-white/5 text-muted flex items-center justify-center mb-6">
                                    <Sparkles size={28} />
                                 </div>
                                 <h4 className="text-sm font-black text-main uppercase tracking-widest">AI Generated</h4>
                                 <p className="text-xs text-muted font-bold mt-3 leading-relaxed">Let Antigravity AI generate a complete course structure and outline based on a topic.</p>
                              </div>
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
                              <button onClick={() => setCourseStep(4)} disabled={loading} className="px-12 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3">
                                 Next: Course Content
                              </button>
                           </div>
                        </div>
                     )}

                     {courseStep === 4 && (
                        <div className="animate-in slide-in-from-bottom-5 duration-700 fade-in pb-20">
                           <div className="flex items-center justify-between mb-8">
                              <div className="flex gap-4 items-center">
                                 <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <LayoutGrid size={24} />
                                 </div>
                                 <div>
                                    <h3 className="text-xl font-black text-main uppercase italic">Course Content Builder</h3>
                                    <p className="text-muted text-[10px] uppercase font-bold tracking-widest mt-1">Structure your course with topics and activities</p>
                                 </div>
                              </div>
                              <button onClick={() => setCourseStep(5)} className="px-10 py-4 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3">
                                 Next: Enroll Participants <ChevronRight size={14} />
                              </button>
                           </div>

                           <div className="flex gap-8 items-start">
                              <div className="w-[320px] bg-surface/80 backdrop-blur-xl border border-glass-border rounded-[32px] p-6 shadow-xl flex-shrink-0 sticky top-24">
                                 <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-black italic text-main text-sm truncate pr-4">{courseForm.fullname}</h4>
                                    <button className="p-2 border border-glass-border rounded-lg text-muted"><BookOpen size={12} /></button>
                                 </div>

                                 <div className="space-y-6">
                                    {courseTopics.map((topic, tidx) => (
                                       <div key={topic.id} className="mb-6">
                                          <h4 className={`text-[12px] font-black uppercase tracking-widest pl-7 flex items-center justify-between group cursor-pointer transition-colors ${activeTopicId === topic.id ? 'text-primary' : 'text-muted hover:text-white'}`} onClick={() => setActiveTopicId(topic.id)}>
                                             <div className="flex items-center gap-3">
                                                {topic.name}
                                             </div>
                                             <ChevronDown size={14} />
                                          </h4>
                                          <div className="space-y-3 mt-4 relative">
                                             <div className="absolute -left-[19px] top-4 bottom-8 w-px bg-glass-border"></div>

                                             {topic.activities.length > 0 ? (
                                                topic.activities.map((act) => (
                                                   <div key={act.id} className="relative pl-7 group">
                                                      <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-4 h-px bg-glass-border"></div>
                                                      <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-primary bg-background shadow-[0_0_8px_rgba(var(--primary),0.8)] z-10"></div>
                                                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-glass-border group-hover:border-primary/50 transition-colors shadow-sm">
                                                         <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                               {act.type === 'video' ? <Play size={14} /> : <BookOpen size={14} />}
                                                            </div>
                                                            <span className="text-[10px] font-black tracking-widest text-main truncate max-w-[120px]">{act.name}</span>
                                                         </div>
                                                      </div>
                                                   </div>
                                                ))
                                             ) : (
                                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest pl-7 italic opacity-50">Empty topic</p>
                                             )}

                                             <button onClick={() => { setActiveTopicId(topic.id); setShowActivityModal(true); }} className="ml-7 mt-2 py-2 px-4 bg-primary/5 text-primary border border-primary/20 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all inline-flex items-center gap-2">
                                                <Plus size={10} /> Add Activity
                                             </button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              {/* Right Panel: Active View */}
                              <div className="flex-grow min-w-0">
                                 {activeCourseView === 'dashboard' ? (
                                    <div className="bg-surface border border-glass-border rounded-[32px] p-12 text-center space-y-6 shadow-xl">
                                       <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto">
                                          <LayoutGrid size={40} />
                                       </div>
                                       <h3 className="text-2xl font-black text-main uppercase italic">Topic {activeTopicId} Content</h3>
                                       <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">Add activities and materials to this section using the button in the sidebar.</p>

                                       <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                                          <div className="bg-white/5 border border-glass-border p-6 rounded-2xl text-left hover:border-primary transition-all cursor-pointer group flex flex-col h-full" onClick={() => { setSelectedActivity('video'); setActiveCourseView('add-activity'); }}>
                                             <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Play size={18} /></div>
                                             <h4 className="text-xs font-black text-main uppercase">Add Video</h4>
                                             <p className="text-[10px] text-muted mt-1 uppercase font-bold flex-grow">Upload MP4 or Link URL</p>
                                          </div>
                                          <div className="bg-white/5 border border-glass-border p-6 rounded-2xl text-left hover:border-primary transition-all cursor-pointer group flex flex-col h-full" onClick={() => { setSelectedActivity('pdf'); setActiveCourseView('add-activity'); }}>
                                             <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><FileText size={18} /></div>
                                             <h4 className="text-xs font-black text-main uppercase">PDF Uploader</h4>
                                             <p className="text-[10px] text-muted mt-1 uppercase font-bold flex-grow">Upload PDF documents and manuals</p>
                                          </div>
                                          <div className="bg-white/5 border border-glass-border p-6 rounded-2xl text-left hover:border-primary transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden" onClick={() => { setSelectedActivity('quiz'); setActiveCourseView('add-activity'); }}>
                                             <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[8px] font-black uppercase tracking-widest">AI Powered</div>
                                             <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><BrainCircuit size={18} /></div>
                                             <h4 className="text-xs font-black text-main uppercase">AI Quiz</h4>
                                             <p className="text-[10px] text-muted mt-1 uppercase font-bold flex-grow">Auto-generate from topic content</p>
                                          </div>
                                          <div className="bg-white/5 border border-glass-border p-6 rounded-2xl text-left hover:border-primary transition-all cursor-pointer group flex flex-col h-full" onClick={() => { setSelectedActivity('assignment'); setActiveCourseView('add-activity'); }}>
                                             <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><PenTool size={18} /></div>
                                             <h4 className="text-xs font-black text-main uppercase">Assignment</h4>
                                             <p className="text-[10px] text-muted mt-1 uppercase font-bold flex-grow">Collect files or text submissions</p>
                                          </div>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="bg-surface border border-glass-border rounded-[32px] shadow-xl overflow-hidden min-w-0">
                                       <div className="p-8 border-b border-glass-border flex items-center gap-4 bg-white/5">
                                          <button onClick={() => setActiveCourseView('dashboard')} className="p-2 bg-background hover:bg-white/10 rounded-xl border border-glass-border transition-all"><ChevronRight size={18} className="rotate-180" /></button>
                                          <div>
                                             <h3 className="text-xl font-black text-main uppercase italic">Adding {selectedActivity} to {courseTopics.find(t => t.id === activeTopicId)?.name}</h3>
                                             <p className="text-muted text-[10px] uppercase font-bold tracking-widest mt-1">Configure your content details below</p>
                                          </div>
                                       </div>
                                       <div className="p-10 space-y-12 pb-32">
                                          {/* General Section */}
                                          <div className="space-y-6">
                                             <h4 className="text-[12px] font-black uppercase text-main tracking-widest border-l-4 border-primary pl-4">General</h4>
                                             <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                   <span className="text-[9px] font-black uppercase text-muted tracking-widest">Activity Name <span className="text-red-500 text-lg leading-none">*</span></span>
                                                   <Info size={10} className="text-muted/50" />
                                                </div>
                                                <input
                                                   type="text"
                                                   value={selectedActivity === 'pdf' ? pdfActivityForm.name : videoActivityForm.name}
                                                   onChange={e => selectedActivity === 'pdf' ? setPdfActivityForm({ ...pdfActivityForm, name: e.target.value }) : setVideoActivityForm({ ...videoActivityForm, name: e.target.value })}
                                                   className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 text-xs font-bold focus:border-primary transition-all outline-none rounded-2xl shadow-inner"
                                                   placeholder={`Enter activity name...`}
                                                />
                                             </div>
                                             <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                   <span className="text-[9px] font-black uppercase text-muted tracking-widest">Description (optional)</span>
                                                   <Info size={10} className="text-muted/50" />
                                                </div>
                                                <div className="border border-glass-border rounded-[24px] bg-background/50 overflow-hidden shadow-inner focus-within:border-primary/50 transition-colors">
                                                   <div className="flex items-center gap-2 p-4 bg-surface border-b border-glass-border flex-wrap">
                                                      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                                         <button className="p-2 hover:bg-white/10 rounded-md transition-colors"><Type size={14} /></button>
                                                         <button className="p-2 hover:bg-white/10 rounded-md transition-colors font-serif font-black">A</button>
                                                      </div>
                                                      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                                         <button className="p-2 hover:bg-white/10 rounded-md transition-colors font-bold text-sm">B</button>
                                                         <button className="p-2 hover:bg-white/10 rounded-md transition-colors italic text-sm">I</button>
                                                      </div>
                                                      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                                         <button className="p-2 hover:bg-white/10 rounded-md transition-colors"><List size={14} /></button>
                                                      </div>
                                                   </div>
                                                   <textarea
                                                      value={selectedActivity === 'pdf' ? pdfActivityForm.description : videoActivityForm.description}
                                                      onChange={e => selectedActivity === 'pdf' ? setPdfActivityForm({ ...pdfActivityForm, description: e.target.value }) : setVideoActivityForm({ ...videoActivityForm, description: e.target.value })}
                                                      className="w-full h-40 bg-transparent p-6 text-xs font-bold outline-none resize-none custom-scrollbar"
                                                      placeholder="Enter activity description..."
                                                   />
                                                </div>
                                             </div>
                                             <label className="flex items-center gap-4 group cursor-pointer w-max">
                                                <div onClick={() => selectedActivity === 'pdf' ? setPdfActivityForm({ ...pdfActivityForm, displayDescription: !pdfActivityForm.displayDescription }) : setVideoActivityForm({ ...videoActivityForm, displayDescription: !videoActivityForm.displayDescription })} className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${(selectedActivity === 'pdf' ? pdfActivityForm.displayDescription : videoActivityForm.displayDescription) ? 'bg-primary border-primary' : 'border-glass-border group-hover:border-primary'}`}>
                                                   {(selectedActivity === 'pdf' ? pdfActivityForm.displayDescription : videoActivityForm.displayDescription) && <Plus size={14} className="text-white rotate-45" />}
                                                </div>
                                                <span className="text-[10px] font-bold text-main/80 uppercase tracking-widest">Display description on course page</span>
                                             </label>

                                             {selectedActivity === 'pdf' && (
                                                <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                                   <div className="space-y-3">
                                                      <div className="flex items-center gap-2">
                                                         <span className="text-[9px] font-black uppercase text-muted tracking-widest">Display folder contents</span>
                                                         <Info size={10} className="text-muted/50" />
                                                      </div>
                                                      <select
                                                         value={pdfActivityForm.displayContents}
                                                         onChange={e => setPdfActivityForm({ ...pdfActivityForm, displayContents: e.target.value })}
                                                         className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 text-xs font-bold focus:border-primary transition-all outline-none rounded-2xl shadow-inner appearance-none"
                                                      >
                                                         <option value="separate">On a separate page</option>
                                                         <option value="inline">Inline on course page</option>
                                                      </select>
                                                   </div>
                                                   <div className="space-y-4">
                                                      <label className="flex items-center gap-4 group cursor-pointer w-max">
                                                         <div onClick={() => setPdfActivityForm({ ...pdfActivityForm, showSubfolders: !pdfActivityForm.showSubfolders })} className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${pdfActivityForm.showSubfolders ? 'bg-primary border-primary' : 'border-glass-border group-hover:border-primary'}`}>
                                                            {pdfActivityForm.showSubfolders && <Plus size={14} className="text-white rotate-45" />}
                                                         </div>
                                                         <span className="text-[10px] font-bold text-main/80 uppercase tracking-widest">Show sub-folders expanded</span>
                                                      </label>
                                                      <label className="flex items-center gap-4 group cursor-pointer w-max">
                                                         <div onClick={() => setPdfActivityForm({ ...pdfActivityForm, openInNewTab: !pdfActivityForm.openInNewTab })} className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${pdfActivityForm.openInNewTab ? 'bg-primary border-primary' : 'border-glass-border group-hover:border-primary'}`}>
                                                            {pdfActivityForm.openInNewTab && <Plus size={14} className="text-white rotate-45" />}
                                                         </div>
                                                         <span className="text-[10px] font-bold text-main/80 uppercase tracking-widest">Open PDFs in new tabs/windows</span>
                                                      </label>
                                                   </div>
                                                </div>
                                             )}
                                          </div>

                                          {/* PDF Section */}
                                          {selectedActivity === 'pdf' && (
                                             <div className="space-y-6">
                                                <h4 className="text-[12px] font-black uppercase text-main tracking-widest border-l-4 border-primary pl-4">PDF</h4>
                                                <div className="space-y-4">
                                                   <label className="text-[10px] font-black uppercase text-main tracking-widest ml-1"><span className="text-red-500">*</span> PDFs <Info size={12} className="inline text-muted/50" /></label>
                                                   <div
                                                      onClick={() => activityFileInputRef.current?.click()}
                                                      className="w-full h-64 border-2 border-dashed border-glass-border bg-background/30 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group shadow-inner relative overflow-hidden"
                                                   >
                                                      <input
                                                         type="file"
                                                         ref={activityFileInputRef}
                                                         className="hidden"
                                                         accept="application/pdf"
                                                         onChange={(e) => handleActivityFileUpload(e, 'pdfUrl')}
                                                      />
                                                      {pdfActivityForm.pdfUrl ? (
                                                         <div className="text-center p-6">
                                                            <div className="p-4 bg-primary/10 rounded-2xl mb-4 inline-block">
                                                               <FileText size={32} className="text-primary" />
                                                            </div>
                                                            <p className="text-xs font-black text-main uppercase">PDF Uploaded Successfully</p>
                                                            <p className="text-[10px] text-muted mt-1 truncate max-w-xs">{pdfActivityForm.pdfUrl}</p>
                                                            <button
                                                               onClick={(e) => { e.stopPropagation(); setPdfActivityForm({ ...pdfActivityForm, pdfUrl: '' }); }}
                                                               className="mt-4 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                                            >
                                                               Remove File
                                                            </button>
                                                         </div>
                                                      ) : (
                                                         <>
                                                            <div className="p-5 bg-surface rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
                                                               <UploadCloud size={32} className="text-primary" />
                                                            </div>
                                                            <div className="text-center">
                                                               <span className="text-sm font-black text-main">Drag and drop PDF here, or click to <span className="text-primary hover:underline">browse</span></span>
                                                               <p className="text-[10px] font-bold text-muted mt-2 uppercase tracking-widest opacity-60">File Format: PDF Only</p>
                                                            </div>
                                                         </>
                                                      )}
                                                   </div>
                                                </div>
                                             </div>
                                          )}

                                          {/* Video Section */}
                                          {selectedActivity === 'video' && (
                                             <div className="space-y-6">
                                                <h4 className="text-[12px] font-black uppercase text-main tracking-widest border-l-4 border-primary pl-4">Video</h4>
                                                <div className="flex bg-background/50 border border-glass-border rounded-2xl w-full max-w-2xl overflow-hidden p-1.5 shadow-inner">
                                                   <button
                                                      onClick={() => setVideoActivityForm({ ...videoActivityForm, videoType: 'upload' })}
                                                      className={`flex-1 px-6 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${videoActivityForm.videoType === 'upload' ? 'bg-surface text-primary shadow-lg border border-glass-border' : 'text-muted hover:text-main'}`}
                                                   >
                                                      <UploadCloud size={16} /> Upload File
                                                   </button>
                                                   <button
                                                      onClick={() => setVideoActivityForm({ ...videoActivityForm, videoType: 'link' })}
                                                      className={`flex-1 px-6 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${videoActivityForm.videoType === 'link' ? 'bg-surface text-primary shadow-lg border border-glass-border' : 'text-muted hover:text-main'}`}
                                                   >
                                                      <Link size={16} /> Video Link
                                                   </button>
                                                </div>

                                                {videoActivityForm.videoType === 'upload' ? (
                                                   <div className="space-y-4">
                                                      <label className="text-[10px] font-black uppercase text-main tracking-widest ml-1"><span className="text-red-500">*</span> Video file <Info size={12} className="inline text-muted/50" /></label>
                                                      <div
                                                         onClick={() => activityFileInputRef.current?.click()}
                                                         className="w-full h-64 border-2 border-dashed border-glass-border bg-background/30 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group shadow-inner relative overflow-hidden"
                                                      >
                                                         <input
                                                            type="file"
                                                            ref={activityFileInputRef}
                                                            className="hidden"
                                                            accept="video/*"
                                                            onChange={(e) => handleActivityFileUpload(e, 'videoUrl')}
                                                         />
                                                         {videoActivityForm.videoUrl && videoActivityForm.videoUrl.includes('uploads/') ? (
                                                            <div className="text-center p-6">
                                                               <div className="p-4 bg-primary/10 rounded-2xl mb-4 inline-block">
                                                                  <Video size={32} className="text-primary" />
                                                               </div>
                                                               <p className="text-xs font-black text-main uppercase">Video Uploaded Successfully</p>
                                                               <p className="text-[10px] text-muted mt-1 truncate max-w-xs">{videoActivityForm.videoUrl}</p>
                                                               <button
                                                                  onClick={(e) => { e.stopPropagation(); setVideoActivityForm({ ...videoActivityForm, videoUrl: '' }); }}
                                                                  className="mt-4 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                                               >
                                                                  Remove File
                                                               </button>
                                                            </div>
                                                         ) : (
                                                            <>
                                                               <div className="p-5 bg-surface rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
                                                                  <UploadCloud size={32} className="text-primary" />
                                                               </div>
                                                               <div className="text-center">
                                                                  <span className="text-sm font-black text-main">Drag and drop video here, or click to <span className="text-primary hover:underline">browse</span></span>
                                                                  <p className="text-[10px] font-bold text-muted mt-2 uppercase tracking-widest opacity-60">Supports MP4, MOV, AVI • Max file size: 500MB</p>
                                                               </div>
                                                            </>
                                                         )}
                                                      </div>
                                                   </div>
                                                ) : (
                                                   <div className="space-y-4">
                                                      <label className="text-[10px] font-black uppercase text-main tracking-widest ml-1"><span className="text-red-500">*</span> Video URL <Info size={12} className="inline text-muted/50" /></label>
                                                      <div className="relative">
                                                         <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                                         <input
                                                            type="text"
                                                            value={videoActivityForm.videoUrl}
                                                            onChange={e => setVideoActivityForm({ ...videoActivityForm, videoUrl: e.target.value })}
                                                            className="academy-input w-full h-16 bg-background/50 border border-glass-border px-16 text-xs font-bold focus:border-primary transition-all outline-none rounded-2xl shadow-inner"
                                                            placeholder="Paste YouTube, Vimeo, or MP4 URL here..."
                                                         />
                                                      </div>
                                                      <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-2 opacity-80">Note: External videos may have platform-specific restrictions.</p>
                                                   </div>
                                                )}
                                             </div>
                                          )}

                                          {/* Advanced Settings */}
                                          <div className="space-y-6 pt-10 border-t border-glass-border">
                                             <div className="flex items-center gap-3">
                                                <ChevronUp size={20} className="text-primary" />
                                                <h4 className="text-[12px] font-black uppercase text-main tracking-[0.2em]">Advanced Settings</h4>
                                             </div>

                                             <div className="space-y-4">
                                                {/* Video Specific Settings */}
                                                {selectedActivity === 'video' && (
                                                   <div className="border border-glass-border rounded-[32px] overflow-hidden bg-surface shadow-xl">
                                                      <div
                                                         onClick={() => setActiveAdvancedSection(activeAdvancedSection === 'video' ? '' : 'video')}
                                                         className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${activeAdvancedSection === 'video' ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                                                      >
                                                         <span className="text-xs font-black uppercase tracking-widest text-main">Video Options</span>
                                                         <ChevronDown size={18} className={`transition-transform duration-300 ${activeAdvancedSection === 'video' ? 'rotate-180' : ''}`} />
                                                      </div>

                                                      {activeAdvancedSection === 'video' && (
                                                         <div className="p-10 space-y-10 animate-in slide-in-from-top-4 duration-300">
                                                            <div className="space-y-4">
                                                               <div className="flex items-center gap-2">
                                                                  <span className="text-[10px] font-black uppercase text-main tracking-widest">Video player size</span>
                                                                  <Info size={12} className="text-muted/50" />
                                                               </div>
                                                               <div className="flex items-center gap-6">
                                                                  <div className="relative flex-1 max-w-[200px]">
                                                                     <input
                                                                        type="number"
                                                                        value={videoActivityForm.playerSizeWidth}
                                                                        onChange={e => setVideoActivityForm({ ...videoActivityForm, playerSizeWidth: e.target.value })}
                                                                        className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 pr-12 text-xs font-bold focus:border-primary transition-all outline-none rounded-xl"
                                                                     />
                                                                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted uppercase">px</span>
                                                                  </div>
                                                                  <X size={14} className="text-muted opacity-40" />
                                                                  <div className="relative flex-1 max-w-[200px]">
                                                                     <input
                                                                        type="number"
                                                                        value={videoActivityForm.playerSizeHeight}
                                                                        onChange={e => setVideoActivityForm({ ...videoActivityForm, playerSizeHeight: e.target.value })}
                                                                        className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 pr-12 text-xs font-bold focus:border-primary transition-all outline-none rounded-xl"
                                                                     />
                                                                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted uppercase">px</span>
                                                                  </div>
                                                               </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-10">
                                                               <div className="space-y-4">
                                                                  <div className="flex items-center gap-2">
                                                                     <span className="text-[10px] font-black uppercase text-main tracking-widest">Move forward</span>
                                                                     <Info size={12} className="text-muted/50" />
                                                                  </div>
                                                                  <CompactToggle
                                                                     label={videoActivityForm.moveForward ? "Enabled" : "Disabled"}
                                                                     checked={videoActivityForm.moveForward}
                                                                     onChange={v => setVideoActivityForm({ ...videoActivityForm, moveForward: v })}
                                                                  />
                                                               </div>
                                                               <div className="space-y-4">
                                                                  <div className="flex items-center gap-2">
                                                                     <span className="text-[10px] font-black uppercase text-main tracking-widest">Responsive</span>
                                                                     <Info size={12} className="text-muted/50" />
                                                                  </div>
                                                                  <CompactToggle
                                                                     label={videoActivityForm.responsive ? "Enabled" : "Disabled"}
                                                                     checked={videoActivityForm.responsive}
                                                                     onChange={v => setVideoActivityForm({ ...videoActivityForm, responsive: v })}
                                                                  />
                                                               </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                               <div className="flex items-center gap-2">
                                                                  <span className="text-[10px] font-black uppercase text-main tracking-widest">Poster image</span>
                                                                  <Info size={12} className="text-muted/50" />
                                                               </div>
                                                               <input
                                                                  type="file"
                                                                  ref={posterImageInputRef}
                                                                  className="hidden"
                                                                  accept="image/*"
                                                                  onChange={(e) => handleActivityFileUpload(e, 'posterImageUrl')}
                                                               />
                                                               <div
                                                                  onClick={() => posterImageInputRef.current?.click()}
                                                                  className="w-full h-48 border-2 border-dashed border-glass-border bg-background/30 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-all cursor-pointer group shadow-inner relative overflow-hidden"
                                                               >
                                                                  {videoActivityForm.posterImageUrl ? (
                                                                     <img src={videoActivityForm.posterImageUrl} className="w-full h-full object-cover" />
                                                                  ) : (
                                                                     <>
                                                                        <UploadCloud size={24} className="text-muted group-hover:text-primary transition-colors" />
                                                                        <div className="text-center">
                                                                           <p className="text-[11px] font-black text-main uppercase tracking-widest">Drag and drop image here, or click to <span className="text-primary underline">browse</span></p>
                                                                           <p className="text-[9px] font-bold text-muted mt-1 uppercase tracking-widest opacity-60">Supports JPG, JPEG, PNG • Max file size: 5MB</p>
                                                                        </div>
                                                                     </>
                                                                  )}
                                                               </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                               <div className="flex items-center gap-2">
                                                                  <span className="text-[10px] font-black uppercase text-main tracking-widest">Captions</span>
                                                                  <Info size={12} className="text-muted/50" />
                                                               </div>
                                                               <div className="relative">
                                                                  <ScrollText className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                                                  <input
                                                                     type="text"
                                                                     className="academy-input w-full h-14 bg-background/50 border border-glass-border px-16 text-xs font-bold focus:border-primary transition-all outline-none rounded-xl shadow-inner"
                                                                     placeholder="Upload or link VTT/SRT captions file..."
                                                                  />
                                                               </div>
                                                            </div>
                                                         </div>
                                                      )}
                                                   </div>
                                                )}

                                                {/* Restrict Access Section */}
                                                <div className="border border-glass-border rounded-[32px] overflow-hidden bg-surface shadow-xl">
                                                   <div
                                                      onClick={() => setActiveAdvancedSection(activeAdvancedSection === 'restrictions' ? '' : 'restrictions')}
                                                      className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${activeAdvancedSection === 'restrictions' ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                                                   >
                                                      <span className="text-xs font-black uppercase tracking-widest text-main">Restrict Access</span>
                                                      <ChevronDown size={18} className={`transition-transform duration-300 ${activeAdvancedSection === 'restrictions' ? 'rotate-180' : ''}`} />
                                                   </div>

                                                   {activeAdvancedSection === 'restrictions' && (
                                                      <div className="p-10 space-y-8 animate-in slide-in-from-top-4 duration-300">
                                                         <div className="flex items-start gap-10">
                                                            <span className="w-40 text-[10px] font-black uppercase text-muted tracking-widest pt-2">Access restrictions</span>
                                                            <div className="flex-grow space-y-6">
                                                               {(selectedActivity === 'pdf' ? pdfActivityForm.restrictions : videoActivityForm.restrictions).length > 0 ? (
                                                                  <div className="space-y-3">
                                                                     {(selectedActivity === 'pdf' ? pdfActivityForm.restrictions : videoActivityForm.restrictions).map((r, idx) => (
                                                                        <div key={idx} className="flex items-center justify-between p-4 bg-background border border-glass-border rounded-xl">
                                                                           <div className="flex items-center gap-3">
                                                                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                                 <ShieldCheck size={14} />
                                                                              </div>
                                                                              <span className="text-[10px] font-black text-main uppercase tracking-widest">{r.title}</span>
                                                                           </div>
                                                                           <button
                                                                              onClick={() => {
                                                                                 const newRestrictions = (selectedActivity === 'pdf' ? pdfActivityForm.restrictions : videoActivityForm.restrictions).filter((_, i) => i !== idx);
                                                                                 selectedActivity === 'pdf' ? setPdfActivityForm({ ...pdfActivityForm, restrictions: newRestrictions }) : setVideoActivityForm({ ...videoActivityForm, restrictions: newRestrictions });
                                                                              }}
                                                                              className="text-red-500 hover:text-red-600 p-2"
                                                                           >
                                                                              <X size={14} />
                                                                           </button>
                                                                        </div>
                                                                     ))}
                                                                     <button
                                                                        onClick={() => setShowRestrictionModal(true)}
                                                                        className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline mt-2"
                                                                     >
                                                                        + Add another restriction
                                                                     </button>
                                                                  </div>
                                                               ) : (
                                                                  <div className="p-6 bg-background/50 border border-glass-border rounded-2xl border-dashed flex flex-col items-center justify-center gap-3">
                                                                     <span className="text-xs font-bold text-muted italic">No restrictions added yet</span>
                                                                     <button
                                                                        onClick={() => setShowRestrictionModal(true)}
                                                                        className="px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                                                                     >
                                                                        Add restriction...
                                                                     </button>
                                                                  </div>
                                                               )}
                                                            </div>
                                                         </div>
                                                      </div>
                                                   )}
                                                </div>

                                                {/* Activity Completion Section */}
                                                <div className="border border-glass-border rounded-[32px] overflow-hidden bg-surface shadow-xl">
                                                   <div
                                                      onClick={() => setActiveAdvancedSection(activeAdvancedSection === 'completion' ? '' : 'completion')}
                                                      className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${activeAdvancedSection === 'completion' ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                                                   >
                                                      <span className="text-xs font-black uppercase tracking-widest text-main">Activity Completion</span>
                                                      <ChevronDown size={18} className={`transition-transform duration-300 ${activeAdvancedSection === 'completion' ? 'rotate-180' : ''}`} />
                                                   </div>

                                                   {activeAdvancedSection === 'completion' && (
                                                      <div className="p-10 space-y-10 animate-in slide-in-from-top-4 duration-300">
                                                         <div className="flex items-center gap-10">
                                                            <div className="w-48 flex items-center gap-2">
                                                               <span className="text-[10px] font-black uppercase text-muted tracking-widest">Completion tracking</span>
                                                               <Info size={12} className="text-muted/50" />
                                                            </div>
                                                            <div className="relative flex-grow max-w-xl">
                                                               <select
                                                                  value={selectedActivity === 'pdf' ? pdfActivityForm.completionTracking : videoActivityForm.completionTracking}
                                                                  onChange={e => selectedActivity === 'pdf' ? setPdfActivityForm({ ...pdfActivityForm, completionTracking: e.target.value }) : setVideoActivityForm({ ...videoActivityForm, completionTracking: e.target.value })}
                                                                  className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 pr-12 text-xs font-bold appearance-none focus:border-primary transition-all outline-none rounded-xl shadow-inner"
                                                               >
                                                                  <option value="none">Do not indicate activity completion</option>
                                                                  <option value="manual">Students can manually mark the activity as completed</option>
                                                                  <option value="conditions">Show activity as complete when conditions are met</option>
                                                               </select>
                                                               <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                                                            </div>
                                                         </div>

                                                         {(selectedActivity === 'pdf' ? pdfActivityForm.completionTracking : videoActivityForm.completionTracking) === 'conditions' && (
                                                            <div className="flex items-center gap-10 pl-10 border-l-2 border-primary/20">
                                                               <span className="w-40 text-[10px] font-black uppercase text-muted tracking-widest">Require View</span>
                                                               <label className="flex items-center gap-4 group cursor-pointer w-max">
                                                                  <div onClick={() => selectedActivity === 'pdf' ? setPdfActivityForm({ ...pdfActivityForm, requireView: !pdfActivityForm.requireView }) : setVideoActivityForm({ ...videoActivityForm, requireView: !videoActivityForm.requireView })} className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${(selectedActivity === 'pdf' ? pdfActivityForm.requireView : videoActivityForm.requireView) ? 'bg-primary border-primary' : 'border-glass-border group-hover:border-primary'}`}>
                                                                     {(selectedActivity === 'pdf' ? pdfActivityForm.requireView : videoActivityForm.requireView) && <Plus size={14} className="text-white rotate-45" />}
                                                                  </div>
                                                                  <span className="text-xs font-black text-main/80 uppercase tracking-widest">Student must view this activity to complete it</span>
                                                               </label>
                                                            </div>
                                                         )}

                                                         <div className="flex items-center gap-10">
                                                            <div className="w-48 flex items-center gap-2">
                                                               <span className="text-[10px] font-black uppercase text-muted tracking-widest">Course completion</span>
                                                               <Info size={12} className="text-muted/50" />
                                                            </div>
                                                            <label className="flex items-center gap-4 group cursor-pointer w-max">
                                                               <div onClick={() => selectedActivity === 'pdf' ? setPdfActivityForm({ ...pdfActivityForm, courseCompletion: !pdfActivityForm.courseCompletion }) : setVideoActivityForm({ ...videoActivityForm, courseCompletion: !videoActivityForm.courseCompletion })} className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${(selectedActivity === 'pdf' ? pdfActivityForm.courseCompletion : videoActivityForm.courseCompletion) ? 'bg-primary border-primary' : 'border-glass-border group-hover:border-primary'}`}>
                                                                  {(selectedActivity === 'pdf' ? pdfActivityForm.courseCompletion : videoActivityForm.courseCompletion) && <Plus size={14} className="text-white rotate-45" />}
                                                               </div>
                                                               <span className="text-xs font-black text-main/80 uppercase tracking-widest">Must be completed to complete course</span>
                                                            </label>
                                                         </div>

                                                         <div className="flex items-center gap-10">
                                                            <div className="w-48 flex items-center gap-2">
                                                               <span className="text-[10px] font-black uppercase text-muted tracking-widest">Set completion date</span>
                                                               <Info size={12} className="text-muted/50" />
                                                            </div>
                                                            <div className="flex items-center gap-6">
                                                               <CompactToggle
                                                                  label={(selectedActivity === 'pdf' ? pdfActivityForm.completionDateEnabled : videoActivityForm.completionDateEnabled) ? "Enabled" : "Disabled"}
                                                                  checked={selectedActivity === 'pdf' ? pdfActivityForm.completionDateEnabled : videoActivityForm.completionDateEnabled}
                                                                  onChange={v => selectedActivity === 'pdf' ? setPdfActivityForm({ ...pdfActivityForm, completionDateEnabled: v }) : setVideoActivityForm({ ...videoActivityForm, completionDateEnabled: v })}
                                                               />
                                                               {(selectedActivity === 'pdf' ? pdfActivityForm.completionDateEnabled : videoActivityForm.completionDateEnabled) && (
                                                                  <input
                                                                     type="datetime-local"
                                                                     value={selectedActivity === 'pdf' ? pdfActivityForm.completionDate : videoActivityForm.completionDate}
                                                                     onChange={e => selectedActivity === 'pdf' ? setPdfActivityForm({ ...pdfActivityForm, completionDate: e.target.value }) : setVideoActivityForm({ ...videoActivityForm, completionDate: e.target.value })}
                                                                     className="academy-input bg-background/50 border border-glass-border px-6 py-3 text-xs font-black uppercase rounded-xl outline-none focus:border-primary transition-all shadow-inner"
                                                                  />
                                                               )}
                                                            </div>
                                                         </div>
                                                      </div>
                                                   )}
                                                </div>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="fixed bottom-0 right-0 left-[384px] p-6 bg-background/80 backdrop-blur-xl border-t border-glass-border flex gap-4 z-[50] justify-end">
                                          <button
                                             onClick={handleSaveActivity}
                                             disabled={loading || !(selectedActivity === 'pdf' ? pdfActivityForm.name : videoActivityForm.name)}
                                             className="px-10 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                                          >
                                             {loading && <Loader2 size={14} className="animate-spin" />}
                                             Save & Enroll User
                                          </button>
                                          <button
                                             onClick={handleSaveActivity}
                                             disabled={loading || !(selectedActivity === 'pdf' ? pdfActivityForm.name : videoActivityForm.name)}
                                             className="px-10 py-4 bg-surface border border-glass-border text-main rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-white/5 transition-all disabled:opacity-50"
                                          >
                                             Save And Display
                                          </button>
                                          <button onClick={() => setActiveCourseView('dashboard')} className="px-10 py-4 bg-white/5 text-muted rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:text-main transition-all">Cancel</button>
                                       </div>
                                    </div>
                                 )}

                              </div>
                           </div>
                        </div>
                     )}

                     {courseStep === 5 && (
                        <div className="animate-in slide-in-from-bottom-5 duration-700 fade-in pb-20">
                           <div className="flex items-center justify-between mb-8">
                              <div className="flex gap-4 items-center">
                                 <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                                    <UserPlus size={24} />
                                 </div>
                                 <div>
                                    <h3 className="text-xl font-black text-main uppercase italic">Enroll Participants</h3>
                                    <p className="text-muted text-[10px] uppercase font-bold tracking-widest mt-1">Select users to give them access to this course</p>
                                 </div>
                              </div>
                           </div>

                           <div className="bg-surface border border-glass-border rounded-[32px] p-10 shadow-xl space-y-8">
                              <div className="space-y-4">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-main tracking-widest">Quick Select Groups</span>
                                    <Info size={12} className="text-muted/50" />
                                 </div>
                                 <div className="flex gap-4">
                                    {[
                                       { id: 5, name: 'Students', icon: <Users size={16} />, color: 'bg-blue-500' },
                                       { id: 3, name: 'Teachers', icon: <ShieldCheck size={16} />, color: 'bg-orange-500' }
                                    ].map(group => (
                                       <button
                                          key={group.id}
                                          onClick={() => {
                                             const usersInGroup = data.users.filter(u => {
                                                const assignment = data.systemAssignments?.find(a => parseInt(a.userid) === parseInt(u.id));
                                                const roleId = assignment ? parseInt(assignment.roleid) : 5; // Default to student
                                                return roleId === group.id;
                                             });
                                             const ids = usersInGroup.map(u => u.id);
                                             setEnrolledUserIds([...new Set([...enrolledUserIds, ...ids])]);
                                             const newRoles = { ...enrolledRoles };
                                             ids.forEach(id => { newRoles[id] = group.id; });
                                             setEnrolledRoles(newRoles);
                                             alert(`Selected all ${group.name}`);
                                          }}
                                          className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-glass-border rounded-2xl hover:border-primary transition-all group"
                                       >
                                          <div className={`w-8 h-8 rounded-xl ${group.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                             {group.icon}
                                          </div>
                                          <span className="text-[10px] font-black uppercase text-main tracking-widest">{group.name}</span>
                                       </button>
                                    ))}
                                    <button
                                       onClick={() => { setEnrolledUserIds([]); setEnrolledRoles({}); }}
                                       className="px-6 py-3 text-[10px] font-black uppercase text-red-500 tracking-widest hover:underline ml-auto"
                                    >
                                       Clear All
                                    </button>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-6 max-h-[500px] overflow-y-auto p-4 custom-scrollbar">
                                 {data.users.map(u => (
                                    <div
                                       key={u.id}
                                       className={`p-6 rounded-3xl border transition-all flex items-center justify-between ${enrolledUserIds.includes(u.id) ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'bg-background border-glass-border hover:border-primary/50'}`}
                                    >
                                       <div className="flex items-center gap-4 cursor-pointer flex-grow" onClick={() => {
                                          if (enrolledUserIds.includes(u.id)) {
                                             setEnrolledUserIds(enrolledUserIds.filter(id => id !== u.id));
                                          } else {
                                             setEnrolledUserIds([...enrolledUserIds, u.id]);
                                             if (!enrolledRoles[u.id]) setEnrolledRoles({ ...enrolledRoles, [u.id]: 5 });
                                          }
                                       }}>
                                          <div className="w-10 h-10 rounded-full bg-surface border border-glass-border flex items-center justify-center font-black text-primary">{u.fullname?.[0] || 'U'}</div>
                                          <div>
                                             <p className="text-xs font-black text-main uppercase tracking-widest">{u.fullname}</p>
                                             <p className="text-[10px] text-muted font-bold">{u.email}</p>
                                          </div>
                                       </div>

                                       <div className="flex items-center gap-4">
                                          <div
                                             onClick={() => {
                                                if (enrolledUserIds.includes(u.id)) {
                                                   setEnrolledUserIds(enrolledUserIds.filter(id => id !== u.id));
                                                } else {
                                                   setEnrolledUserIds([...enrolledUserIds, u.id]);
                                                   if (!enrolledRoles[u.id]) setEnrolledRoles({ ...enrolledRoles, [u.id]: 5 });
                                                }
                                             }}
                                             className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${enrolledUserIds.includes(u.id) ? 'bg-primary border-primary text-white shadow-lg' : 'border-glass-border'}`}>
                                             {enrolledUserIds.includes(u.id) && <Check size={18} />}
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>

                              <div className="flex justify-between items-center pt-8 border-t border-glass-border">
                                 <div className="text-[10px] font-black uppercase text-muted tracking-widest">
                                    Selected: <span className="text-primary">{enrolledUserIds.length} users</span>
                                 </div>
                                 <div className="flex gap-4">
                                    <button onClick={() => setCourseStep(4)} className="px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-background border border-glass-border text-muted hover:text-main">Back</button>
                                    <button onClick={() => setCourseStep(6)} className="px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105">Next: Review & Publish</button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {courseStep === 6 && (
                        <div className="animate-in slide-in-from-bottom-5 duration-700 fade-in pb-20">
                           <div className="bg-surface border border-glass-border rounded-[32px] overflow-hidden shadow-2xl">
                              <div className="h-64 bg-primary relative">
                                 {courseForm.imageurl ? <img src={courseForm.imageurl} className="w-full h-full object-cover opacity-60" /> : null}
                                 <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                                 <div className="absolute bottom-10 left-10">
                                    <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4 inline-block border border-white/10">Final Review</span>
                                    <h2 className="text-4xl font-black text-white italic tracking-tight">{courseForm.fullname}</h2>
                                 </div>
                              </div>

                              <div className="p-10 space-y-10">
                                 <div className="grid grid-cols-3 gap-8">
                                    <div className="bg-background/50 p-6 rounded-3xl border border-glass-border">
                                       <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-2">Structure</p>
                                       <p className="text-lg font-black text-main">{courseTopics.length} Topics</p>
                                    </div>
                                    <div className="bg-background/50 p-6 rounded-3xl border border-glass-border">
                                       <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-2">Content</p>
                                       <p className="text-lg font-black text-main">{courseTopics.reduce((acc, t) => acc + t.activities.length, 0)} Activities</p>
                                    </div>
                                    <div className="bg-background/50 p-6 rounded-3xl border border-glass-border">
                                       <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-2">Participants</p>
                                       <p className="text-lg font-black text-main">{enrolledUserIds.length} Enrolled</p>
                                    </div>
                                 </div>

                                 <div className="flex justify-end gap-6 pt-10 border-t border-glass-border">
                                    <button onClick={() => setCourseStep(5)} className="px-12 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-background border border-glass-border text-muted hover:text-main">Back to Enrollment</button>
                                    <button onClick={handlePublishCourse} disabled={loading} className="px-12 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 flex items-center gap-4">
                                       {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                       Publish Course to Moodle
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                  </div>
               )}

               {subTab === 'Categories' && (
                  <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
                     <div className="bg-surface border border-glass-border rounded-3xl p-10 shadow-xl space-y-8">
                        <div className="flex items-center justify-between border-b border-glass-border pb-6">
                           <div>
                              <h3 className="text-2xl font-black text-main italic uppercase tracking-tight">Add A Category</h3>
                              <p className="text-muted text-[10px] uppercase tracking-widest font-bold mt-1">Create a new organizational category for your courses.</p>
                           </div>
                           <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/10">
                              <Tag size={24} />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                 <Info size={14} className="text-primary" />
                                 <span className="text-[9px] font-black uppercase text-muted tracking-widest">Parent Category</span>
                              </div>
                              <div className="relative">
                                 <select
                                    value={categoryForm.parent}
                                    onChange={e => setCategoryForm({ ...categoryForm, parent: e.target.value })}
                                    className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 pr-12 text-xs font-bold appearance-none focus:border-primary transition-all outline-none rounded-2xl"
                                 >
                                    <option value="0">Default</option>
                                    {data.categories.map(c => (
                                       <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                 </select>
                                 <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                              </div>
                           </div>

                           <CompactInput
                              label="Category Name"
                              req
                              value={categoryForm.name}
                              onChange={v => setCategoryForm({ ...categoryForm, name: v })}
                           />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <CompactInput
                              label="Category ID Number"
                              value={categoryForm.idnumber}
                              onChange={v => setCategoryForm({ ...categoryForm, idnumber: v })}
                              icon={<Info size={14} className="text-primary" />}
                           />
                        </div>

                        <div className="space-y-4">
                           <label className="text-[9px] font-black uppercase text-muted tracking-widest flex items-center gap-2">Description</label>
                           <div className="border border-glass-border rounded-[24px] bg-background/50 overflow-hidden shadow-inner">
                              <div className="flex items-center gap-2 p-4 bg-surface border-b border-glass-border flex-wrap">
                                 <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                    <button className="p-2 hover:bg-white/10 rounded-md transition-colors"><Type size={14} /></button>
                                    <button className="p-2 hover:bg-white/10 rounded-md transition-colors font-serif font-black">A</button>
                                 </div>
                                 <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                    <button className="p-2 hover:bg-white/10 rounded-md transition-colors font-bold">B</button>
                                    <button className="p-2 hover:bg-white/10 rounded-md transition-colors italic">I</button>
                                 </div>
                                 <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                    <button className="p-2 hover:bg-white/10 rounded-md transition-colors"><List size={14} /></button>
                                    <button className="p-2 hover:bg-white/10 rounded-md transition-colors"><Link size={14} /></button>
                                    <button className="p-2 hover:bg-white/10 rounded-md transition-colors"><Image size={14} /></button>
                                    <button className="p-2 hover:bg-white/10 rounded-md transition-colors"><Video size={14} /></button>
                                 </div>
                              </div>
                              <textarea
                                 value={categoryForm.description}
                                 onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                 className="w-full h-48 bg-transparent p-8 text-xs font-bold outline-none resize-none custom-scrollbar"
                                 placeholder="Provide a description for this category..."
                              />
                           </div>
                        </div>

                        <div className="pt-8 border-t border-glass-border flex justify-end">
                           <button
                              onClick={handleCreateCategory}
                              disabled={loading || !categoryForm.name}
                              className="px-12 py-5 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                           >
                              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                              Create Category
                           </button>
                        </div>
                     </div>

                     <div className="bg-surface border border-glass-border rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-8 border-b border-glass-border bg-white/5">
                           <h4 className="text-sm font-black italic uppercase tracking-wider">Existing Categories</h4>
                        </div>
                        <table className="w-full text-left border-collapse text-[10px]">
                           <thead>
                              <tr className="border-b border-glass-border bg-white/5 uppercase text-[8px] font-black tracking-widest text-primary/60">
                                 <th className="p-6">Category Name</th>
                                 <th className="p-6">ID Number</th>
                                 <th className="p-6">Course Count</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-glass-border font-bold">
                              {data.categories?.map(c => (
                                 <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-6">
                                       <span className="text-main uppercase tracking-tighter">{c.name}</span>
                                    </td>
                                    <td className="p-6 text-muted uppercase">
                                       {c.idnumber || '—'}
                                    </td>
                                    <td className="p-6">
                                       <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] uppercase">{c.coursecount || 0} Courses</span>
                                    </td>
                                 </tr>
                              ))}
                              {data.categories?.length === 0 && (
                                 <tr><td colSpan="3" className="p-10 text-center text-muted uppercase text-[8px] tracking-widest">No categories found</td></tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* ── HIGH-DENSITY PROFESSIONAL USER PORTAL ── */}
         {showModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
               <div className="bg-surface w-full max-w-5xl border border-glass-border rounded-3xl shadow-3xl flex h-[80vh] overflow-hidden">

                  <div className="w-64 bg-surface-hover/30 border-r border-glass-border flex flex-col p-6">
                     <div className="mb-8 text-primary">{showModal.includes('Course') ? <BookOpen size={32} /> : <UserPlus size={32} />}</div>
                     <h3 className="text-lg font-black italic uppercase mb-6 text-main/90">{showModal}</h3>
                     <nav className="space-y-1.5">
                        {showModal === 'Edit Course' ? (
                           <ModalNav active={true} icon={<ScrollText size={14} />} label="General Info" onClick={() => { }} />
                        ) : (
                           <>
                              <ModalNav active={modalSection === 'general'} icon={<ScrollText size={14} />} label="General" onClick={() => setModalSection('general')} />
                              <ModalNav active={modalSection === 'userpicture'} icon={<Camera size={14} />} label="User Picture" onClick={() => setModalSection('userpicture')} />
                              <ModalNav active={modalSection === 'optional'} icon={<LayoutGrid size={14} />} label="Institutional" onClick={() => setModalSection('optional')} />
                           </>
                        )}
                     </nav>
                  </div>

                  <div className="flex-grow flex flex-col min-w-0 relative">
                     <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 p-2.5 bg-background border border-glass-border rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all z-10 focus:outline-none"><X size={20} /></button>

                     <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                        {showModal === 'Edit Course' ? (
                           <div className="space-y-8 animate-in fade-in duration-500">
                              <div className="grid grid-cols-1 gap-6 p-6 bg-background/30 rounded-2xl border border-glass-border">
                                 <CompactInput label="Course Fullname" value={courseForm.fullname} onChange={v => setCourseForm({ ...courseForm, fullname: v })} req />
                                 <CompactSelect label="Category" value={courseForm.categoryid} options={[{ v: '', l: 'Select Category' }, ...data.categories.map(c => ({ v: c.id, l: c.name }))]} onChange={v => setCourseForm({ ...courseForm, categoryid: v })} />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black uppercase text-muted tracking-widest">Course Summary</label>
                                 <textarea value={courseForm.summary} onChange={e => setCourseForm({ ...courseForm, summary: e.target.value })} className="academy-input w-full h-48 bg-background/50 border border-glass-border p-6 text-xs font-bold focus:border-primary transition-all outline-none resize-none" placeholder="Describe what students will learn in this course" />
                              </div>
                           </div>
                        ) : modalSection === 'general' && (
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
                        <button onClick={handleInitialize} className="bg-primary text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"> {showModal === 'Add User' ? 'Initialize account' : 'Update Record'} </button>
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
                           <div
                              key={res.title}
                              onClick={() => {
                                 setVideoActivityForm({
                                    ...videoActivityForm,
                                    restrictions: [...videoActivityForm.restrictions, { title: res.title, desc: res.desc }]
                                 });
                                 setShowRestrictionModal(false);
                              }}
                              className="flex gap-6 p-4 hover:bg-sky-50 cursor-pointer rounded-2xl transition-all items-center border border-transparent hover:border-sky-100"
                           >
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

function StatCard({ icon, label, value, sub }) {
   return (
      <div className="academy-card p-6 flex items-center gap-6 group hover:border-primary/50 transition-all">
         <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
            {icon}
         </div>
         <div>
            <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-1">{label}</p>
            <h3 className="text-2xl font-black text-main tabular-nums">{value}</h3>
            <p className="text-[8px] font-bold text-primary/60 uppercase tracking-widest mt-1">{sub}</p>
         </div>
      </div>
   );
}

function LegendItem({ color, label, value }) {
   return (
      <div className="flex items-center justify-between gap-6 w-full max-w-[160px]">
         <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[9px] font-black text-muted uppercase tracking-wider whitespace-nowrap">{label}</span>
         </div>
         <span className="text-[10px] font-black text-main tabular-nums">{value}</span>
      </div>
   );
}

function StatItem({ label, value, color = "text-main" }) {
   return (
      <div className="space-y-1">
         <p className="text-[9px] font-black uppercase text-muted tracking-widest">{label}</p>
         <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${color}`}>{value}</span>
            <Info size={10} className="text-muted/30" />
         </div>
      </div>
   );
}

function TopCourseRow({ name, views, enrolled, status }) {
   return (
      <div className="grid grid-cols-5 items-center px-4 py-3 rounded-xl hover:bg-white/5 transition-all group">
         <div className="col-span-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface border border-glass-border flex items-center justify-center text-muted group-hover:text-primary transition-colors">
               <BookOpen size={14} />
            </div>
            <span className="text-[10px] font-bold text-main truncate max-w-[150px]">{name}</span>
         </div>
         <div className="text-[10px] font-black text-primary">{views}</div>
         <div className="text-[10px] font-black text-main">{enrolled}</div>
         <div>
            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${status === 'Success' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>{status}</span>
         </div>
      </div>
   );
}

