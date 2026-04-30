const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

const baseUrl = process.env.MOODLE_URL || 'http://moodle.test';
const token = process.env.MOODLE_WS_TOKEN || '6219356d21396a8682054c7d0ccf825e';

async function run() {
  try {
    // 1️⃣ Get course structure
    const courseRes = await axios.post(
      `${baseUrl}/webservice/rest/server.php`,
      qs.stringify({
        wstoken: token,
        wsfunction: 'core_course_get_contents',
        moodlewsrestformat: 'json',
        courseid: 86
      })
    );

    const courseData = courseRes.data;

    // 2️⃣ Get URL activities (FIXED ✅)
    const urlRes = await axios.post(
      `${baseUrl}/webservice/rest/server.php`,
      qs.stringify({
        wstoken: token,
        wsfunction: 'mod_url_get_urls_by_courses',
        moodlewsrestformat: 'json',
        courseids: [86]   // ✅ FIX HERE
      })
    );

    const urlData = urlRes.data.urls || [];

    console.log(JSON.stringify(courseData, null, 2));

  } catch (e) {
    console.error(e.response?.data || e.message);
  }
}

run();