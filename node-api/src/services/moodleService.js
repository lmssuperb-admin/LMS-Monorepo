const axios = require('axios');
const qs = require('qs');

class MoodleService {
  constructor() {
    this.baseUrl = (process.env.MOODLE_URL || '').trim().replace(/^"|"$/g, '');
    this.token = (process.env.MOODLE_WS_TOKEN || '').trim().replace(/^"|"$/g, '');
    this.restEndpoint = `${this.baseUrl}/webservice/rest/server.php`;
  }

  async request(wsfunction, params = {}) {
    const fullParams = {
      wstoken: this.token,
      wsfunction,
      moodlewsrestformat: 'json',
      ...params
    };

    try {
      const response = await axios.post(
        this.restEndpoint,
        qs.stringify(fullParams),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const data = response.data;

      if (data?.exception || data?.errorcode || data?.error) {
        let msg = data.message || data.errorcode || data.error;
        msg = msg.replace(/^error\//, '').replace(/<[^>]*>/g, '');
        throw new Error(msg);
      }

      if (Array.isArray(data) && data[0]?.errorcode) {
        let msg = data[0].message || data[0].errorcode;
        msg = msg.replace(/^error\//, '').replace(/<[^>]*>/g, '');
        throw new Error(msg);
      }

      return data;
    } catch (error) {
      console.error(`❌ Moodle API Error [${wsfunction}]:`, error.message);
      throw error;
    }
  }

  // ------------------ COURSE ------------------

  async getCourseContents(courseid) {
    const id = parseInt(courseid);
    if (isNaN(id)) throw new Error(`Invalid course ID`);
    return this.request('core_course_get_contents', { courseid: id });
  }

  // 🔥 MAIN FIX: WITH EXTERNAL URL SUPPORT
  async getCourseWithUrls(courseid) {
    const id = parseInt(courseid);
    if (isNaN(id)) throw new Error(`Invalid course ID`);

    // 1️⃣ Course structure
    const contents = await this.request('core_course_get_contents', {
      courseid: id
    });

    // 2️⃣ URL activities
    const urlData = await this.request('mod_url_get_urls_by_courses', {
      courseids: [id]
    });

    // 3️⃣ Map coursemodule → externalurl
    const urlMap = {};
    (urlData.urls || []).forEach(item => {
      urlMap[item.coursemodule] = item.externalurl;
    });

    // 4️⃣ Merge into modules and resolve missing resource files
    const result = await Promise.all(contents.map(async section => ({
      ...section,
      modules: await Promise.all((section.modules || []).map(async mod => {
        let externalurl = urlMap[mod.id] || null;
        let contents = mod.contents || [];

        // 🔥 FALLBACK: If it's a resource but contents are empty, try resolving via bridge
        if (mod.modname === 'resource' && (!contents || contents.length === 0)) {
           try {
              const bridgeRes = await axios.post(`${this.baseUrl}/lms_api.php`, {
                 action: 'get_resource_file',
                 cmid: mod.id
              });
              if (bridgeRes.data?.success && bridgeRes.data?.fileurl) {
                 contents = [{ fileurl: bridgeRes.data.fileurl }];
              }
           } catch (e) {
              console.warn(`⚠️ Failed to resolve resource file for CMID ${mod.id}:`, e.message);
           }
        }

        return {
          ...mod,
          contents,
          externalurl
        };
      }))
    })));

    return result;
  }

  // ------------------ ACTIVITY ------------------

  async createActivity(a) {
    let sectionId;

    // resolve section
    const contents = await this.getCourseContents(a.courseid);
    const sectionIndex = parseInt(a.section) || 0;

    sectionId =
      contents?.[sectionIndex]?.id ||
      contents?.[0]?.id;

    if (!sectionId) {
      throw new Error(`No section found`);
    }

    let modname = a.type || 'url';
    if (['video', 'pdf'].includes(modname)) {
      modname = 'url';
    }

    const response = await this.request('core_courseformat_new_module', {
      modname,
      courseid: parseInt(a.courseid),
      targetsectionid: parseInt(sectionId)
    });

    try {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;

      let newCmId = null;
      const updates = Array.isArray(parsed) ? parsed : parsed?.updates || [];

      const cm = updates.reverse().find(u => u.name === 'cm');
      if (cm?.fields?.id) newCmId = cm.fields.id;

      if (newCmId) {
        await axios.post(`${this.baseUrl}/lms_api.php`, {
          action: 'update_module',
          cmid: newCmId,
          courseid: parseInt(a.courseid),
          name: a.name,
          modname,
          url: a.videoUrl || a.pdfUrl || a.url || ''
        });
      }

      return parsed;
    } catch {
      return response;
    }
  }

  // ------------------ USERS ------------------

  async getUsers() {
    const data = await this.request('core_user_get_users', {
      criteria: [{ key: 'email', value: '%%' }]
    });
    return data.users || [];
  }

  async getCourses() {
    return this.request('core_course_get_courses');
  }

  async getCategories() {
    return this.request('core_course_get_categories');
  }

  async getRoles() {
    return this.request('core_role_get_all_roles');
  }

  async deleteCourses(courseids) {
    return this.request('core_course_delete_courses', { courseids });
  }

  async createCourse(data) {
    return this.request('core_course_create_courses', {
      courses: [{
        fullname: data.fullname,
        shortname: data.shortname,
        categoryid: data.categoryid,
        summary: data.summary || '',
        format: 'topics',
        visible: 1
      }]
    });
  }

  async updateCourse(id, data) {
    return this.request('core_course_update_courses', {
      courses: [{
        id: parseInt(id),
        fullname: data.fullname,
        categoryid: data.categoryid,
        summary: data.summary || '',
        visible: data.visible !== undefined ? data.visible : 1
      }]
    });
  }

  async createCategory(data) {
    return this.request('core_course_create_categories', {
      categories: [{
        name: data.name,
        parent: parseInt(data.parent) || 0,
        idnumber: data.idnumber || '',
        description: data.description || '',
        descriptionformat: 1
      }]
    });
  }

  async syncFileToMoodle(cmid, courseid, localUrl, name) {
    const fs = require('fs');
    const path = require('path');
    const FormData = require('form-data');
    
    // Resolve local path from URL
    const fileName = localUrl.split('/').pop();
    const filePath = path.join(__dirname, '../../uploads', fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Local file not found: ${filePath}`);
    }

    const form = new FormData();
    form.append('action', 'uploadPdf');
    form.append('cmid', cmid);
    form.append('courseid', courseid);
    form.append('pdf', fs.createReadStream(filePath));

    try {
      const response = await axios.post(`${this.baseUrl}/lms_api.php`, form, {
        headers: form.getHeaders()
      });
      return response.data;
    } catch (err) {
      console.error(`❌ Sync to Moodle failed:`, err.message);
      throw err;
    }
  }
  async assignRole(userid, roleid, contextlevel = 'system', instanceid = 0) {
    return this.request('core_role_assign_roles', {
      assignments: [{
        roleid: parseInt(roleid),
        userid: parseInt(userid),
        contextlevel: contextlevel,
        instanceid: parseInt(instanceid) || 0
      }]
    });
  }

  async unassignRole(userid, roleid, contextlevel = 'system', instanceid = 0) {
    return this.request('core_role_unassign_roles', {
      unassignments: [{
        roleid: parseInt(roleid),
        userid: parseInt(userid),
        contextlevel: contextlevel,
        instanceid: parseInt(instanceid) || 0
      }]
    });
  }

  async syncVideoToMoodle(cmid, courseid, localUrl, name) {
    const fs = require('fs');
    const path = require('path');
    const FormData = require('form-data');
    
    const fileName = localUrl.split('/').pop();
    const filePath = path.join(__dirname, '../../uploads', fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Local file not found: ${filePath}`);
    }

    const form = new FormData();
    form.append('action', 'uploadVideo');
    form.append('cmid', cmid);
    form.append('courseid', courseid);
    form.append('video', fs.createReadStream(filePath));

    try {
      const response = await axios.post(`${this.baseUrl}/lms_api.php`, form, {
        headers: form.getHeaders()
      });
      return response.data;
    } catch (err) {
      console.error(`❌ Video sync to Moodle failed:`, err.message);
      throw err;
    }
  }

  async getAssignments(params = {}) {
    // This is a custom bridge call or a complex Moodle query
    // For now, return empty or try to resolve via bridge if we have a handler
    return [];
  }
}

module.exports = new MoodleService();