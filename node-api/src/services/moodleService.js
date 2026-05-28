const axios = require('axios');
const qs = require('qs');

class MoodleService {
  constructor() {
    this.baseUrl = (process.env.MOODLE_URL || '').trim().replace(/^"|"$/g, '');
    this.token = (process.env.MOODLE_WS_TOKEN || '').trim().replace(/^"|"$/g, '');
    try {
      this.restEndpoint = new URL('/webservice/rest/server.php', this.baseUrl).toString();
    } catch {
      this.restEndpoint = '';
    }
  }

  async request(wsfunction, params = {}) {
    if (!this.baseUrl) {
      throw new Error('Missing MOODLE_URL environment variable');
    }
    if (!this.token) {
      throw new Error('Missing MOODLE_WS_TOKEN environment variable');
    }
    if (!this.restEndpoint) {
      throw new Error(`Invalid MOODLE_URL value: ${this.baseUrl}`);
    }
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

  async createUser(userData) {
    const users = await this.request('core_user_create_users', {
      users: [{
        username: userData.username,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        auth: userData.auth || 'manual',
        city: userData.city || '',
        country: userData.country || 'IN',
        idnumber: userData.idnumber || '',
        institution: userData.institution || '',
        department: userData.department || '',
        phone1: userData.phone1 || '',
        phone2: userData.phone2 || '',
        address: userData.address || '',
        description: userData.description || '',
        suspended: userData.suspended ? 1 : 0,
        preferences: userData.forcechange
          ? [{ type: 'auth_forcepasswordchange', value: '1' }]
          : undefined,
      }],
    });
    return Array.isArray(users) ? users : [users];
  }

  async updateUser(userData) {
    return this.request('core_user_update_users', {
      users: [{
        id: parseInt(userData.id, 10),
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        city: userData.city,
        country: userData.country,
        idnumber: userData.idnumber,
        institution: userData.institution,
        department: userData.department,
        phone1: userData.phone1,
        phone2: userData.phone2,
        address: userData.address,
        description: userData.description,
        suspended: userData.suspended ? 1 : 0,
      }],
    });
  }

  async getUserCourses(userid) {
    const courses = await this.request('core_enrol_get_users_courses', {
      userid: parseInt(userid, 10),
      returnusercount: 0,
    });
    return Array.isArray(courses) ? courses : [];
  }

  async getUserTimeline(userid) {
    const courses = await this.getUserCourses(userid);
    return courses.slice(0, 10).map(c => ({
      id: c.id,
      title: c.fullname || c.shortname,
      type: 'course',
    }));
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

  // ------------------ COHORTS ------------------

  _arrayParams(key, values) {
    const params = {};
    values.forEach((value, index) => {
      params[`${key}[${index}]`] = value;
    });
    return params;
  }

  async getCohorts(search = '') {
    const raw = await this.request('core_cohort_get_cohorts', {});
    const list = Array.isArray(raw) ? raw : [];

    const filtered = search
      ? list.filter(c =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.idnumber?.toLowerCase().includes(search.toLowerCase())
        )
      : list;

    if (!filtered.length) return [];

    const memberData = await this.request('core_cohort_get_cohort_members', {
      ...this._arrayParams('cohortids', filtered.map(c => c.id)),
    });

    const memberCounts = {};
    (memberData || []).forEach(entry => {
      memberCounts[entry.cohortid] = entry.userids?.length || 0;
    });

    return filtered.map(cohort => ({
      id: cohort.id,
      name: cohort.name,
      idnumber: cohort.idnumber,
      description: cohort.description || '',
      visible: cohort.visible,
      memberCount: memberCounts[cohort.id] || 0,
      timecreated: cohort.timecreated || cohort.timemodified || null,
      timemodified: cohort.timemodified || null,
      enrollmentDate: cohort.timecreated || cohort.timemodified || null,
    }));
  }

  async createCohort({ name, description = '', idnumber }) {
    const safeIdnumber =
      idnumber ||
      `${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`;

    const created = await this.request('core_cohort_create_cohorts', {
      'cohorts[0][categorytype][type]': 'system',
      'cohorts[0][categorytype][value]': '0',
      'cohorts[0][name]': name,
      'cohorts[0][idnumber]': safeIdnumber,
      'cohorts[0][description]': description,
      'cohorts[0][descriptionformat]': 1,
      'cohorts[0][visible]': 1,
    });

    const cohort = Array.isArray(created) ? created[0] : created;
    return {
      ...cohort,
      memberCount: 0,
      timecreated: Math.floor(Date.now() / 1000),
    };
  }

  async deleteCohorts(cohortids) {
    const ids = cohortids.map(id => parseInt(id, 10)).filter(Boolean);
    return this.request('core_cohort_delete_cohorts', {
      ...this._arrayParams('cohortids', ids),
    });
  }

  async addCohortMembers(cohortid, userids) {
    const params = {};
    userids.forEach((userid, index) => {
      params[`members[${index}][cohorttype][type]`] = 'id';
      params[`members[${index}][cohorttype][value]`] = cohortid;
      params[`members[${index}][usertype][type]`] = 'id';
      params[`members[${index}][usertype][value]`] = parseInt(userid, 10);
    });
    return this.request('core_cohort_add_cohort_members', params);
  }
}

module.exports = new MoodleService();