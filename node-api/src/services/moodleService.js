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

    // 4️⃣ Merge into modules
    return contents.map(section => ({
      ...section,
      modules: (section.modules || []).map(mod => ({
        ...mod,
        externalurl: urlMap[mod.id] || null
      }))
    }));
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
}

module.exports = new MoodleService();