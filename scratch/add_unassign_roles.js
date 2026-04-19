const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Admin', 'Desktop', 'LMS-Monorepo', 'frontend', 'app', 'admin', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Initialize systemAssignments in state
content = content.replace(/categories: \[\], cohorts: \[\], roles: \[\] \}\);/, 'categories: [], cohorts: [], roles: [], systemAssignments: [] });');

// 2. Add handleUnassignRole
const assignRoleMarker = /const handleAssignRole = async \(\) => \{[\s\S]+?setLoading\(false\);\s+?\};/;
const unassignRoleFn = `
  const handleUnassignRole = async (userid, roleid) => {
    if (!confirm('Are you sure you want to revoke this role?')) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/roles/unassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid, roleid, contextlevel: 'system', instanceid: 0 })
      }).then(r => r.json());
      if (res.error) throw new Error(res.error);
      alert('Role Revoked Successfully!');
      // Refresh assignments
      fetchTabData();
    } catch (err) { alert('Revocation failed: ' + err.message); }
    setLoading(false);
  };
`;

content = content.replace(assignRoleMarker, (match) => match + unassignRoleFn);

// 3. Add global assignments table in Assign system roles section
const infoBoxMarker = /<div className="p-8 bg-primary\/5 rounded-\[32px\] border border-primary\/10 flex items-start gap-6">[\s\S]+?<\/div>/;
const assignmentsTable = `
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
`;

content = content.replace(infoBoxMarker, (match) => match + assignmentsTable);

fs.writeFileSync(filePath, content);
console.log('Successfully updated page.js with unassign functionality');
