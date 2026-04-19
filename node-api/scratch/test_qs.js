const axios = require('axios');
const qs = require('qs');
require('dotenv').config({ path: './.env' });

const endpoint = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
const token = process.env.MOODLE_WS_TOKEN;

async function test() {
    const params = {
        wstoken: token,
        wsfunction: 'core_course_get_courses_by_field',
        moodlewsrestformat: 'json',
        field: 'id',
        value: 1
    };
    
    console.log("Testing core_role_get_assignments with QS...");
    try {
        const res = await axios({
            method: 'post',
            url: endpoint,
            data: qs.stringify(params),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log("Response:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log("Error:", e.message);
    }
}

test();
