const axios = require('axios');

class MoodleService {
  constructor() {
    this.baseUrl = (process.env.MOODLE_URL || '').trim().replace(/^"|"$/g, '');
    this.token = (process.env.MOODLE_WS_TOKEN || '').trim().replace(/^"|"$/g, '');
    this.restEndpoint = `${this.baseUrl}/webservice/rest/server.php`;
  }

  async request(wsfunction, params = {}) {
    try {
      const response = await axios({
        method: 'post',
        url: this.restEndpoint,
        params: { wstoken: this.token, wsfunction: wsfunction, moodlewsrestformat: 'json', ...params },
      });
      if (response.data && response.data.exception) throw new Error(response.data.message);
      return response.data;
    } catch (error) {
      console.error(`❌ Moodle API [${wsfunction}]:`, error.message);
      throw error;
    }
  }

  // --- 👤 USER SCHEMA (Matches core_user_create_users) ---
  async createUser(u) {
    return this.request('core_user_create_users', {
      users: [{
        username: u.username.toLowerCase(),
        password: u.password,
        firstname: u.firstname,
        lastname: u.lastname,
        email: u.email,
        auth: u.auth || 'manual',
        idnumber: u.idnumber || '',
        institution: u.institution || '',
        department: u.department || '',
        phone1: u.phone1 || '',
        phone2: u.phone2 || '',
        address: u.address || '',
        city: u.city || '',
        country: u.country || 'US',
        lang: u.lang || 'en',
        description: u.description || '',
        preferences: [
           { name: 'auth_forcepasswordchange', value: u.forcepasswordchange ? '1' : '0' }
        ]
      }]
    });
  }

  async updateUser(u) {
    return this.request('core_user_update_users', {
      users: [{
        id: u.id,
        username: u.username?.toLowerCase(),
        password: u.password || undefined,
        firstname: u.firstname,
        lastname: u.lastname,
        email: u.email,
        idnumber: u.idnumber || '',
        institution: u.institution || '',
        department: u.department || '',
        phone1: u.phone1 || '',
        phone2: u.phone2 || '',
        address: u.address || '',
        city: u.city || '',
        country: u.country || 'US',
        description: u.description || ''
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

  // --- 🔐 PERMISSIONS (Matches core_role_assign_roles) ---
  async assignRole(userid, roleid, contextlevel = 'system', instanceid = 0) {
    return this.request('core_role_assign_roles', {
      assignments: [{ roleid, userid, contextlevel, instanceid }]
    });
  }

  async getUsers() { 
    try {
      const data = await this.request('core_user_get_users', { criteria: [{ key: 'email', value: '%%' }] });
      return data.users || [];
    } catch (err) {
      const data = await this.request('core_user_get_users', { criteria: [] });
      return data.users || [];
    }
  }
  async getCourses() { return this.request('core_course_get_courses'); }
  async getCategories() { return this.request('core_course_get_categories'); }
  async getRoles() { return this.request('core_role_get_all_roles'); }
}

module.exports = new MoodleService();
