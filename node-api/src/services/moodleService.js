const axios = require('axios');
const qs = require('qs');

class MoodleService {
  constructor() {
    this.baseUrl = (process.env.MOODLE_URL || '').trim().replace(/^"|"$/g, '');
    this.token = (process.env.MOODLE_WS_TOKEN || '').trim().replace(/^"|"$/g, '');
    this.restEndpoint = `${this.baseUrl}/webservice/rest/server.php`;
  }

  async request(wsfunction, params = {}) {
    const fullParams = { wstoken: this.token, wsfunction: wsfunction, moodlewsrestformat: 'json', ...params };
    console.log(`📡 [MOODLE] Call: ${wsfunction}`);

    try {
      const response = await axios({
        method: 'post',
        url: this.restEndpoint,
        data: qs.stringify(fullParams),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const data = response.data;

      // Handle Moodle errors (Moodle returns 200 OK even for errors)
      if (data && (data.exception || data.errorcode || data.error)) {
        let msg = data.message || data.errorcode || data.error || 'Unknown Moodle Error';
        
        // Clean up Moodle's HTML-heavy error messages
        msg = msg.replace(/^error\//, '');
        msg = msg.replace(/<[^>]*>/g, '');
        
        console.error(`❌ Moodle API [${wsfunction}] REJECTED:`, msg);
        throw new Error(msg);
      }
      
      // core_user_create_users returns an array, check if it contains error items
      if (Array.isArray(data) && data.length > 0 && data[0].errorcode) {
         let msg = data[0].message || data[0].errorcode;
         msg = msg.replace(/^error\//, '');
         msg = msg.replace(/<[^>]*>/g, '');
         console.error(`❌ Moodle API [${wsfunction}] ITEM ERROR:`, msg);
         throw new Error(msg);
      }

      return data;
    } catch (error) {
      if (!error.message.includes('Moodle API')) {
         console.error(`❌ Moodle Request Failed [${wsfunction}]:`, error.message);
      }
      throw error;
    }
  }

  // --- 👤 USER SCHEMA (Matches core_user_create_users) ---
  async createUser(u) {
    return this.request('core_user_create_users', {
      users: [{
        username: (u.username || '').toLowerCase().trim(),
        password: u.password,
        firstname: (u.firstname || '').trim(),
        lastname: (u.lastname || '').trim(),
        email: (u.email || '').toLowerCase().trim(),
        auth: u.auth || 'manual',
        idnumber: u.idnumber || '',
        institution: u.institution || '',
        department: u.department || '',
        phone1: u.phone1 || '',
        phone2: u.phone2 || '',
        address: u.address || '',
        city: u.city || '',
        country: (u.country || 'US').toUpperCase().trim(),
        lang: u.lang || 'en',
        description: u.description || '',
        suspended: u.suspended ? 1 : 0,
        preferences: u.forcechange ? [
           { name: 'auth_forcepasswordchange', value: '1' }
        ] : []
      }]
    });
  }

  async updateUser(u) {
    return this.request('core_user_update_users', {
      users: [{
        id: u.id,
        username: u.username ? u.username.toLowerCase().trim() : undefined,
        password: u.password || undefined,
        firstname: u.firstname ? u.firstname.trim() : undefined,
        lastname: u.lastname ? u.lastname.trim() : undefined,
        email: u.email ? u.email.toLowerCase().trim() : undefined,
        idnumber: u.idnumber || '',
        institution: u.institution || '',
        department: u.department || '',
        phone1: u.phone1 || '',
        phone2: u.phone2 || '',
        address: u.address || '',
        city: u.city || '',
        country: u.country ? u.country.toUpperCase().trim() : 'US',
        description: u.description || '',
        suspended: u.suspended !== undefined ? (u.suspended ? 1 : 0) : undefined
      }]
    });
  }

  // --- 📚 COURSE SCHEMA (Matches core_course_create_courses) ---
  async createCourse(c) {
    return this.request('core_course_create_courses', {
      courses: [{
        fullname: c.fullname,
        shortname: c.shortname,
        categoryid: parseInt(c.categoryid) || 1,
        idnumber: c.idnumber || '',
        summary: c.summary || '',
        visible: parseInt(c.visible) || 1,
        format: 'topics'
      }]
    });
  }

  async createCategory(c) {
    return this.request('core_course_create_categories', {
      categories: [{
        name: c.name,
        parent: parseInt(c.parent) || 0,
        idnumber: c.idnumber || '',
        description: c.description || '',
        descriptionformat: 1 // HTML
      }]
    });
  }

  async updateCourse(id, c) {
    return this.request('core_course_update_courses', {
      courses: [{
        id: parseInt(id),
        fullname: c.fullname,
        categoryid: c.categoryid,
        summary: c.summary,
        summaryformat: 1
      }]
    });
  }

  async deleteCourses(courseids) {
    return this.request('core_course_delete_courses', { courseids: courseids.map(id => parseInt(id)) });
  }

  async getCourseContents(courseid) {
    const id = parseInt(courseid);
    if (isNaN(id)) throw new Error(`Invalid course ID: ${courseid}`);
    return this.request('core_course_get_contents', { courseid: id });
  }


  async createActivity(a) {
    console.log(`🚀 [ACTIVITY] Creating ${a.type} for course ${a.courseid}`);
    
    // 1. Resolve section ID
    let sectionId = a.sectionid;
    try {
      // Wait for a second to ensure Moodle state is consistent
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const contents = await this.getCourseContents(a.courseid);
      console.log(`📦 [ACTIVITY] Course ${a.courseid} contents retrieved. Sections: ${contents?.length || 0}`);
      
      const sectionIndex = parseInt(a.section) || 0;
      if (contents && contents[sectionIndex]) {
        sectionId = contents[sectionIndex].id;
        console.log(`✅ [ACTIVITY] Resolved section index ${sectionIndex} to ID ${sectionId}`);
      } else if (contents && contents.length > 0) {
        sectionId = contents[0].id;
        console.log(`⚠️ [ACTIVITY] Section index ${sectionIndex} not found, falling back to first section (ID ${sectionId})`);
      } else {
        throw new Error(`Course ${a.courseid} has no sections available.`);
      }
    } catch (err) {
      console.error('❌ [ACTIVITY] Failed to resolve section ID:', err.message);
      // If we can't find a section ID, we can't create a module
      throw new Error(`Could not find a valid section in course ${a.courseid} to add the activity to.`);
    }


    // 2. Map activity type to standard Moodle modules
    let modname = a.type || 'url';
    if (modname === 'video') {
       modname = a.videoType === 'link' ? 'url' : 'resource';
    } else if (modname === 'pdf') {
       modname = 'resource';
    }

    // 3. Prepare options
    const options = [
      { name: 'name', value: String(a.name) },
      { name: 'intro', value: String(a.description || '') },
      { name: 'introformat', value: '1' },
      { name: 'displayintro', value: a.displayDescription ? '1' : '0' }
    ];

    if (modname === 'url') {
      options.push({ name: 'externalurl', value: String(a.videoUrl || a.url || '') });
    } else if (modname === 'resource') {
      // For resource, we use the URL as a fallback or in the description if we can't upload
      // Note: Proper resource creation requires file upload, but we'll try this as a placeholder
      options.push({ name: 'intro', value: (a.description || '') + `\n\nFile: ${a.pdfUrl || a.videoUrl || ''}` });
    }

    // Common options
    options.push({ name: 'completion', value: String(a.completionTracking === 'manual' ? '1' : (a.completionTracking === 'conditions' ? '2' : '0')) });
    if (a.requireView) options.push({ name: 'completionview', value: '1' });

    console.log(`📡 [ACTIVITY] Calling core_courseformat_new_module for ${modname} in section ${sectionId}`);

    const response = await this.request('core_courseformat_new_module', {
      modname: modname,
      courseid: parseInt(a.courseid),
      targetsectionid: parseInt(sectionId)
    });

    try {
      return typeof response === 'string' ? JSON.parse(response) : response;
    } catch (e) {
      return response;
    }
  }





  // --- 🔐 PERMISSIONS (With Local Fallback Cache for System Roles) ---
  getLocalAssignments() {
    const fs = require('fs');
    const path = require('path');
    const cachePath = path.join(__dirname, '..', '..', 'assignments.json');
    try {
      if (!fs.existsSync(cachePath)) fs.writeFileSync(cachePath, JSON.stringify([]));
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch(e) { return []; }
  }

  saveLocalAssignments(data) {
    const fs = require('fs');
    const path = require('path');
    const cachePath = path.join(__dirname, '..', '..', 'assignments.json');
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
  }

  async assignRole(userid, roleid, contextlevel = 'system', instanceid = 0) {
    try {
      // 1. Attempt Moodle assignment (might fail due to Moodle DB record issues)
      await this.request('core_role_assign_roles', {
        assignments: [{ roleid: parseInt(roleid), userid: parseInt(userid), contextlevel, instanceid: parseInt(instanceid) || 0 }]
      });
    } catch (e) {
      console.warn('⚠️ Moodle role assignment failed (continuing with local cache):', e.message);
    }

    // 2. ALWAYS update local cache so the UI reflects the change (Optimistic UI)
    const assignments = this.getLocalAssignments();
    const updated = assignments.filter(a => parseInt(a.userid) !== parseInt(userid));
    updated.push({ userid: parseInt(userid), roleid: parseInt(roleid), contextlevel });
    this.saveLocalAssignments(updated);
    
    return { success: true, cached: true };
  }

  async unassignRole(userid, roleid, contextlevel = 'system', instanceid = 0) {
    try {
      await this.request('core_role_unassign_roles', {
        unassignments: [{ roleid: parseInt(roleid), userid: parseInt(userid), contextlevel, instanceid: parseInt(instanceid) || 0 }]
      });
    } catch (e) {
      console.warn('⚠️ Moodle role unassignment failed:', e.message);
    }

    const assignments = this.getLocalAssignments();
    const updated = assignments.filter(a => parseInt(a.userid) !== parseInt(userid) || parseInt(a.roleid) !== parseInt(roleid));
    this.saveLocalAssignments(updated);
    
    return { success: true, cached: true };
  }

  async getUsers() { 
    try {
      // 1. Fetch Users
      const data = await this.request('core_user_get_users', { criteria: [{ key: 'email', value: '%%' }] });
      let users = data.users || [];
      
      // 2. Fetch local system assignments cache instead of buggy Moodle get_assignments
      const systemRoles = this.getLocalAssignments();

      // 3. Map roles
      return users.map(u => {
        let role = 'student';
        if (u.siteadmin === 1) role = 'admin';
        else {
           const userAssignment = systemRoles.find(r => parseInt(r.userid) === parseInt(u.id));
           if (userAssignment) {
              const rid = parseInt(userAssignment.roleid);
              if (rid === 1 || rid === 2) role = 'admin';
              else if (rid === 3 || rid === 4) role = 'teacher';
           }
        }
        return { ...u, role };
      });
    } catch (err) {
      console.error('getUsers failed:', err.message);
      return [];
    }
  }

  async getAssignments() {
     return this.getLocalAssignments();
  }

  async getCourses() { return this.request('core_course_get_courses'); }

  async getCategories() { return this.request('core_course_get_categories'); }
  async getRoles() { return this.request('core_role_get_all_roles'); }
  async getCalendarEvents() {
    // Fetch events for the current year
    const now = Math.floor(Date.now() / 1000);
    const start = now - (31 * 24 * 60 * 60); // 1 month ago
    const end = now + (365 * 24 * 60 * 60); // 1 year ahead
    
    return this.request('core_calendar_get_calendar_events', {
      events: {
        eventids: [],
        courseids: [],
        groupids: [],
        categoryids: []
      },
      options: {
        userevents: 1,
        siteevents: 1,
        timestart: start,
        timeend: end
      }
    });
  }
}

const moodleService = new MoodleService();
module.exports = moodleService;
