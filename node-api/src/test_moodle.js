const axios = require('axios');

const MOODLE_URL = 'http://moodle.test';
const TOKEN = '10a6555e0566465cf68f9099d522fe7f';
const restEndpoint = `${MOODLE_URL}/webservice/rest/server.php?wstoken=${TOKEN}&moodlewsrestformat=json`;

async function request(wsfunction, params = {}) {
    const response = await axios({
        method: 'post',
        url: `${restEndpoint}&wsfunction=${wsfunction}`,
        data: params,
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
}

async function test() {
    try {
        console.log("--- Creating Course (JSON) ---");
        const courseRes = await request('core_course_create_courses', {
            courses: [{
                fullname: 'JSON Course ' + Date.now(),
                shortname: 'json-' + Date.now(),
                categoryid: 1,
                format: 'topics'
            }]
        });
        const courseId = courseRes[0].id;
        console.log("Course Created ID:", courseId);

        const contents = await request('core_course_get_contents', { courseid: courseId });
        const sectionId = contents[0].id;
        console.log("Section ID:", sectionId);

        console.log("\n--- Creating Activity (JSON) ---");
        const activityRes = await request('core_course_create_module', {
            modname: 'url',
            courseid: courseId,
            sectionid: sectionId,
            visible: 1,
            options: [
                { name: 'name', value: 'Test JSON' },
                { name: 'externalurl', value: 'https://google.com' }
            ]
        });
        console.log("Activity Created:", JSON.stringify(activityRes, null, 2));

    } catch (err) {
        console.error("Test Failed:", err.message);
    }
}

test();
