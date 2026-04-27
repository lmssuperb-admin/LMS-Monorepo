const axios = require('axios');
const qs = require('qs');

const MOODLE_URL = 'http://moodle.test';
const TOKEN = '10a6555e0566465cf68f9099d522fe7f';
const restEndpoint = `${MOODLE_URL}/webservice/rest/server.php`;

async function request(wsfunction, params = {}) {
    const fullParams = { wstoken: TOKEN, wsfunction: wsfunction, moodlewsrestformat: 'json', ...params };
    const response = await axios({
        method: 'post',
        url: restEndpoint,
        data: qs.stringify(fullParams),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
}

async function test() {
    try {
        console.log("--- Creating Course ---");
        const courseRes = await request('core_course_create_courses', {
            courses: [{
                fullname: 'Test Course ' + Date.now(),
                shortname: 'test-' + Date.now(),
                categoryid: 1,
                format: 'topics'
            }]
        });
        console.log("Course Created:", JSON.stringify(courseRes, null, 2));
        
        if (courseRes.exception) throw new Error(courseRes.message);
        const courseId = courseRes[0].id;

        console.log("\n--- Getting Contents ---");
        const contents = await request('core_course_get_contents', { courseid: courseId });
        console.log("Contents Count:", contents.length);
        const sectionId = contents[0].id;

        console.log("\n--- Creating Activity (URL) ---");
        const activityRes = await request('core_course_create_module', {
            modname: 'url',
            courseid: courseId,
            sectionid: sectionId,
            visible: 1,
            options: [
                { name: 'name', value: 'Test Activity' },
                { name: 'intro', value: 'Test Description' },
                { name: 'externalurl', value: 'https://google.com' }
            ]
        });
        console.log("Activity Created:", JSON.stringify(activityRes, null, 2));

    } catch (err) {
        console.error("Test Failed:", err.message);
        if (err.response) console.error(err.response.data);
    }
}

test();
