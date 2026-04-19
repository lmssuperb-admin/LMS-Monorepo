const axios = require('axios');
const baseUrl = require('dotenv').config({path: './.env'}).parsed.MOODLE_URL || 'http://moodle.test/moodle';
const token = require('dotenv').config({path: './.env'}).parsed.MOODLE_WS_TOKEN || 'a7b3b4f62ca93beadef137eada3b8a1c'; // Replace with actual if known

async function findSystemContext() {
  const restEndpoint = `http://localhost/moodle/webservice/rest/server.php`;
  
  for(let i = 1; i <= 20; i++) {
    try {
      const res = await axios({
        method: 'post',
        url: restEndpoint,
        params: {
          wstoken: 'd8cde659bfce9cd88e36398f6cfbc5c3', // the user's actual token from their running script? Wait, I can just require moodleservice
          wsfunction: 'core_role_get_assignments',
          moodlewsrestformat: 'json',
          contextid: i
        }
      });
      if(res.data && !res.data.exception && !res.data.errorcode) {
        console.log(`Found context ID ${i} with assignments: `, res.data.length);
      }
    } catch (e) {
      // ignore
    }
  }
}

// Better yet, just use MoodleService
const moodleService = require('../src/services/moodleService');
async function test() {
  for(let i=1; i<=20; i++) {
      try {
        const data = await moodleService.request('core_role_get_assignments', { contextid: i });
        if(Array.isArray(data)) {
            console.log(`SUCCESS contextid=${i}, assignments=${data.length}`);
        } else {
             console.log(`FAILED contextid=${i}, msg=${data.message}`);
        }
      } catch (e) {
         console.log(`FAILED contextid=${i}, err=${e.message}`);
      }
  }
}
test();
