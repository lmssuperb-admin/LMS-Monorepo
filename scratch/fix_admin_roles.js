const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Admin', 'Desktop', 'LMS-Monorepo', 'frontend', 'app', 'admin', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Add User Button
const buttonTarget = /profileimageurl: ''\s+?\}\); setShowModal\('Add User'\);\}\} className='bg-primary text-white px-10 py-4 rounded-2xl font-black text-\[10px\] uppercase tracking-widest shadow-xl shadow-primary\/20 hover:scale-105 transition-all'>Add a new user<\/button>/;
const buttonReplacement = `profileimageurl: '', roleid: '' }); if (data.roles.length === 0) fetch('http://localhost:4000/api/roles').then(r => r.json()).then(roles => setData(prev => ({...prev, roles: Array.isArray(roles) ? roles : []}))); setShowModal('Add User');}} className='bg-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all'>Add a new user</button>`;

content = content.replace(buttonTarget, buttonReplacement);

// 2. Add Role Dropdown in Modal
const modalTarget = /<CompactInput label="Password" type="password" value=\{form\.password\} onChange=\{v => setForm\(\{\.\.\.form, password: v\}\)\} \/>\s+?<\/div>/;
const modalReplacement = `<CompactInput label="Password" type="password" value={form.password} onChange={v => setForm({...form, password: v})} />
                              <CompactSelect 
                                label="Initial System Role" 
                                value={form.roleid} 
                                options={[{v:'', l:'None (Default)'}, ...data.roles.map(r => ({v: r.id, l: r.name}))]} 
                                onChange={v => setForm({...form, roleid: v})}
                                icon={<ShieldCheck size={12}/>}
                              />
                           </div>`;

content = content.replace(modalTarget, modalReplacement);

fs.writeFileSync(filePath, content);
console.log('Successfully updated page.js');
