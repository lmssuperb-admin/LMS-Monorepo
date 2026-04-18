const axios = require('axios');
require('dotenv').config();

// 🛑 PASTE YOUR MANUAL TOKEN HERE
const moodleToken = process.env.MOODLE_WS_TOKEN || '10a6555e0566465cf68f9099d522fe7f';
const moodleUrl = process.env.MOODLE_URL || 'http://moodle.test';

async function testToken() {
  console.log(`🚀 Testing Moodle MASTER TOKEN...`);
  console.log(`URL: ${moodleUrl}`);

  try {
    const res = await axios({
      method: 'get',
      url: `${moodleUrl}/webservice/rest/server.php`,
      params: {
        wstoken: moodleToken,
        wsfunction: 'core_webservice_get_site_info',
        moodlewsrestformat: 'json'
      }
    });

    console.log('\n--- MOODLE SITE INFO ---');
    console.log(JSON.stringify(res.data, null, 2));

    if (res.data.userid) {
      console.log('\n✅ SUCCESS! Connection is Alive.');
    } else {
      console.log('\n❌ ERROR: Your Token was rejected.');
    }
  } catch (e) {
    console.log('\n❌ SYSTEM ERROR: Failed to reach Moodle.');
  }
}

testToken();
