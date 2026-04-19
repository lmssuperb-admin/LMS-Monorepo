const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const baseUrl = process.env.MOODLE_URL;
const token = process.env.MOODLE_WS_TOKEN;
const endpoint = `${baseUrl}/webservice/rest/server.php`;

async function test(params) {
    console.log("Testing with params:", JSON.stringify(params));
    try {
        const res = await axios({
            method: 'post',
            url: endpoint,
            params: {
                wstoken: token,
                wsfunction: 'core_role_assign_roles',
                moodlewsrestformat: 'json',
                ...params
            }
        });
        console.log("Response:", JSON.stringify(res.data));
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function runTests() {
    // Attempt 1: contextlevel/instanceid
    console.log("\n--- Attempt 1: contextlevel/instanceid ---");
    await test({
        'assignments[0][roleid]': 3,
        'assignments[0][userid]': 4,
        'assignments[0][contextlevel]': 'system',
        'assignments[0][instanceid]': 0
    });

    // Attempt 2: contextid=1
    console.log("\n--- Attempt 2: contextid=1 ---");
    await test({
        'assignments[0][roleid]': 3,
        'assignments[0][userid]': 4,
        'assignments[0][contextid]': 1
    });
}

runTests();
