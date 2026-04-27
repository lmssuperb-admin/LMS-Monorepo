const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

const baseUrl = process.env.MOODLE_URL;
const token = process.env.MOODLE_WS_TOKEN;
const courseId = 41; 

async function test() {
    const params = {
        wstoken: token,
        wsfunction: 'core_course_get_contents',
        moodlewsrestformat: 'json',
        courseid: courseId
    };

    try {
        const res = await axios.post(`${baseUrl}/webservice/rest/server.php`, qs.stringify(params));
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

test();
