require('dotenv').config();
const moodleService = require('./src/services/moodleService');

async function test() {
  try {
    const courseId = 36;
    console.log(`Testing core_courseformat_new_module for course ${courseId}...`);
    
    // In Moodle 5.2, forum and url should support quick creation
    const activityData = {
      type: 'url',
      section: 0
    };

    
    const result = await moodleService.createActivity({ ...activityData, courseid: courseId });
    console.log(`Success! Result Type: ${typeof result}`);
    console.log(`Result:`, result);
  } catch (err) {
    console.error(`❌ Error:`, err.message);
  }
}

test();
