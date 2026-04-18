const axios = require('axios');

class MoodleService {
  constructor() {
    this.baseUrl = (process.env.MOODLE_URL || '').trim().replace(/^"|"$/g, '');
    this.token = (process.env.MOODLE_WS_TOKEN || '').trim().replace(/^"|"$/g, '');
    this.restEndpoint = `${this.baseUrl}/webservice/rest/server.php`;
  }

  async request(wsfunction, params = {}) {
    const fullParams = { wstoken: this.token, wsfunction: wsfunction, moodlewsrestformat: 'json', ...params };
    console.log(`📡 [MOODLE] Call: ${wsfunction}`);
    // console.log('DEBUG PARAMS:', JSON.stringify(fullParams)); // Uncomment for extreme debugging

    try {
      const response = await axios({
        method: 'post',
        url: this.restEndpoint,
        params: fullParams,
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
