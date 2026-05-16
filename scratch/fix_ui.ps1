$path = "frontend/app/admin/page.js"
$content = Get-Content $path
$startList = 0
$endList = 0
$startAdd = 0
$endAdd = 0

for ($i = 0; $i -lt $content.Length; $i++) {
    if ($content[$i] -like "*LIST LEARNING PATHS*") { $startList = $i }
    if ($content[$i] -like "*No learning paths found*") { $endList = $i + 2 }
    if ($content[$i] -like "*Create New Learning Path*") { $startAdd = $i }
    if ($content[$i] -like "*Create Path</button>*") { $endAdd = $i + 2 }
}

# This is a bit risky but let's try to be precise with the blocks
# Actually, I'll just replace the whole subTab blocks by looking for the patterns

# I'll just use a simpler approach: replace substrings
$newUI = @"
                {subTab === 'Learning Paths' && (
                   <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="flex justify-between items-center bg-surface/60 p-6 rounded-3xl border border-glass-border shadow-sm">
                         <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tight text-main">Learning Paths</h3>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Manage structured educational journeys</p>
                         </div>
                         <button onClick={() => { setSubTab('Add Path'); setPathStep(1); }} className="bg-primary text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                            <Plus size={16} /> Create New Path
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                         {data.learningpaths?.map(path => (
                            <div key={path.id} className="academy-card p-8 group hover:border-primary/50 transition-all flex flex-col h-full">
                               <div className="flex justify-between items-start mb-6">
                                  <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform"><MapPin size={24} /></div>
                                  <button onClick={() => handleDeletePath(path.id)} className="p-2 text-muted hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                               </div>
                               <h4 className="text-lg font-black italic uppercase tracking-tight text-main mb-2">{path.name}</h4>
                               <p className="text-xs font-medium text-muted leading-relaxed line-clamp-3 mb-8 flex-grow">{path.description || 'No description provided.'}</p>
                               <div className="flex items-center justify-between pt-6 border-t border-glass-border">
                                  <div className="flex flex-col">
                                     <span className="text-[10px] font-black uppercase text-primary tracking-widest">Courses</span>
                                     <span className="text-xs font-bold text-main">{path.courses?.length || 0} Modules</span>
                                  </div>
                                  <button className="px-6 py-2 bg-white/5 hover:bg-primary hover:text-white border border-glass-border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Manage Path</button>
                               </div>
                            </div>
                         ))}
                         {(!data.learningpaths || data.learningpaths.length === 0) && (
                            <div className="col-span-full p-20 text-center border-2 border-dashed border-glass-border rounded-[40px] opacity-40">
                               <MapPin size={48} className="mx-auto mb-4" />
                               <p className="text-sm font-black uppercase tracking-[0.2em]">No learning paths found</p>
                            </div>
                         )}
                      </div>
                   </div>
                )}

                {subTab === 'Add Path' && (
                   <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
                      {/* Step Progress Bar */}
                      <div className="flex items-center justify-between px-10">
                         {[1, 2, 3].map((step) => (
                            <React.Fragment key={step}>
                               <div className="flex flex-col items-center gap-3 relative z-10">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-500 ${pathStep >= step ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-surface border border-glass-border text-muted'}`}>
                                     {pathStep > step ? <Check size={24} /> : step}
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${pathStep >= step ? 'text-primary' : 'text-muted'}`}>
                                     {step === 1 ? 'Details' : step === 2 ? 'Courses' : 'Review'}
                                  </span>
                               </div>
                               {step < 3 && <div className={`flex-grow h-1 mx-4 rounded-full transition-all duration-700 ${pathStep > step ? 'bg-primary' : 'bg-glass-border'}`} />}
                            </React.Fragment>
                         ))}
                      </div>

                      {pathStep === 1 && (
                         <div className="bg-surface border border-glass-border rounded-[40px] p-12 shadow-2xl space-y-10 animate-in fade-in duration-500">
                            <div className="space-y-2 border-b border-glass-border pb-8">
                               <h3 className="text-2xl font-black italic uppercase text-main tracking-tight">Path Details</h3>
                               <p className="text-xs font-bold text-muted uppercase tracking-widest">Define the core identity of your learning journey</p>
                            </div>
                            <div className="space-y-8">
                               <CompactInput label="Path Name" value={newPathForm.name} onChange={v => setNewPathForm({ ...newPathForm, name: v })} req />
                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase text-muted tracking-widest ml-1">Path Description</label>
                                  <textarea
                                     value={newPathForm.description}
                                     onChange={e => setNewPathForm({ ...newPathForm, description: e.target.value })}
                                     className="w-full h-48 bg-background/50 border border-glass-border rounded-[24px] p-8 text-xs font-bold focus:border-primary transition-all outline-none resize-none shadow-inner"
                                     placeholder="Describe the learning objectives and outcomes..."
                                  />
                               </div>
                            </div>
                            <div className="flex justify-end pt-10">
                               <button onClick={() => setPathStep(2)} disabled={!newPathForm.name} className="px-12 py-5 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all disabled:opacity-50">Continue to Courses</button>
                            </div>
                         </div>
                      )}

                      {pathStep === 2 && (
                         <div className="bg-surface border border-glass-border rounded-[40px] p-12 shadow-2xl space-y-10 animate-in fade-in duration-500">
                            <div className="flex justify-between items-end border-b border-glass-border pb-8">
                               <div className="space-y-2">
                                  <h3 className="text-2xl font-black italic uppercase text-main tracking-tight">Curriculum Selection</h3>
                                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Select courses that belong to this path</p>
                               </div>
                               <div className="text-[10px] font-black uppercase text-primary bg-primary/10 px-6 py-2 rounded-full border border-primary/20">Selected: {selectedPathCourses.length}</div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                               {data.courses?.map(course => (
                                  <div key={course.id} onClick={() => {
                                     if (selectedPathCourses.includes(course.id)) setSelectedPathCourses(selectedPathCourses.filter(id => id !== course.id));
                                     else setSelectedPathCourses([...selectedPathCourses, course.id]);
                                  }} className={`p-6 rounded-[24px] border transition-all cursor-pointer flex items-center justify-between ${selectedPathCourses.includes(course.id) ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' : 'bg-background/50 border-glass-border hover:border-primary/40'}`}>
                                     <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${selectedPathCourses.includes(course.id) ? 'bg-primary' : 'bg-surface'}`}>
                                           <BookOpen size={20} className={selectedPathCourses.includes(course.id) ? 'text-white' : 'text-muted'} />
                                        </div>
                                        <div>
                                           <p className="text-xs font-black uppercase text-main tracking-widest">{course.fullname}</p>
                                           <p className="text-[9px] font-bold text-muted uppercase mt-1">{course.shortname}</p>
                                        </div>
                                     </div>
                                     {selectedPathCourses.includes(course.id) && <Check className="text-primary" size={20} />}
                                  </div>
                               ))}
                            </div>

                            <div className="flex justify-between pt-10">
                               <button onClick={() => setPathStep(1)} className="px-10 py-5 bg-background border border-glass-border text-muted rounded-3xl font-black text-xs uppercase tracking-widest">Back</button>
                               <button onClick={() => setPathStep(3)} className="px-12 py-5 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all">Review Path</button>
                            </div>
                         </div>
                      )}

                      {pathStep === 3 && (
                         <div className="bg-surface border border-glass-border rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in duration-500">
                            <div className="h-48 bg-primary/20 p-12 flex items-end">
                               <div>
                                  <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 inline-block">Final Review</span>
                                  <h2 className="text-3xl font-black text-main italic uppercase tracking-tight">{newPathForm.name}</h2>
                                </div>
                             </div>
                             <div className="p-12 space-y-12">
                                <div className="grid grid-cols-2 gap-12">
                                   <div className="space-y-4">
                                      <p className="text-[10px] font-black uppercase text-muted tracking-widest">Description</p>
                                      <p className="text-sm font-medium text-main/80 leading-relaxed italic">"{newPathForm.description || 'No description provided.'}"</p>
                                   </div>
                                   <div className="space-y-4">
                                      <p className="text-[10px] font-black uppercase text-muted tracking-widest">Included Courses</p>
                                      <div className="space-y-2">
                                         {selectedPathCourses.map(id => {
                                            const course = data.courses.find(c => c.id === id);
                                            return <div key={id} className="text-[11px] font-bold text-main flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-glass-border"><BookOpen size={14} className="text-primary" /> {course?.fullname}</div>
                                         })}
                                         {selectedPathCourses.length === 0 && <p className="text-xs text-muted italic">No courses selected.</p>}
                                      </div>
                                   </div>
                                </div>
                                <div className="flex justify-between pt-10 border-t border-glass-border">
                                   <button onClick={() => setPathStep(2)} className="px-10 py-5 bg-background border border-glass-border text-muted rounded-3xl font-black text-xs uppercase tracking-widest">Back</button>
                                   <button onClick={handleCreatePath} disabled={loading} className="px-16 py-5 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 flex items-center gap-4">
                                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                      Finalize & Publish Path
                                   </button>
                                </div>
                             </div>
                          </div>
                       )}
                )}
"@

# We need to find the whole block from subTab === 'Learning Paths' to the end of subTab === 'Add Path'
$startText = "subTab === 'Learning Paths'"
$endText = "subTab === 'Add Path'"

# This is getting complex. Let's just use a simpler marker.
# I'll just write the whole file if I can, but it's too big.
# I'll use the line numbers I found.

$linesToRemove = $endAdd - $startList + 1
$content = (Get-Content $path -Raw) -replace '(?s)\s*{subTab === ''Learning Paths''.*?subTab === ''Add Path''.*?}\s*\)', $newUI
# Wait, regex is better
Set-Content $path $newUI # NO! This will overwrite the whole file.

# I'll just use the line numbers from Select-String
$newContent = $content[0..($startList-2)] + $newUI + $content[($endAdd+1)..($content.Length-1)]
Set-Content $path $newContent
