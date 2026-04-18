const axios = require('axios');
require('dotenv').config();

const moodleToken = (process.env.MOODLE_WS_TOKEN || '').trim().replace(/^"|"$/g, '');
const moodleUrl = (process.env.MOODLE_URL || '').trim().replace(/^"|"$/g, '');

async function checkUsers() {
  console.log(`🔍 Checking Users with: ${moodleToken.substring(0,5)}...`);
  try {
    const res = await axios({
      method: 'get',
      url: `${moodleUrl}/webservice/rest/server.php`,
      params: {
        wstoken: moodleToken,
        wsfunction: 'core_user_get_users',
        moodlewsrestformat: 'json',
        criteria: [{ key: 'email', value: '%%' }] // Try a broader wildcard
      }
    });
    console.log('\n--- DATA RECEIVED ---');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('Error:', err.message);
  }
}

checkUsers();
