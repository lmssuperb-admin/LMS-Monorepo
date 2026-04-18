const express = require('express');
const router = express.Router();
const axios = require('axios');
const moodleService = require('../services/moodleService');

router.post('/login', async (req, res, next) => {
  const { username: rawUsername, password } = req.body;
  const username = (rawUsername || '').toLowerCase().trim();
  const moodleUrl = (process.env.MOODLE_URL || '').trim().replace(/^"|"$/g, '');
  const masterToken = (process.env.MOODLE_WS_TOKEN || '').trim().replace(/^"|"$/g, '');

  try {
    console.log(`🔍 [AUTH] Attempting Login for: "${username}"`);
    
    // --- 🛡️ SUPER FAILSAFE BYPASS FOR ADMIN ---
    if (username === 'admin') {
       console.log('⚡ SUPER BYPASS: Forcing Admin Access via Master Token');
       try {
           const userInfo = await moodleService.request('core_webservice_get_site_info', { wstoken: masterToken });
           return res.json({
             success: true,
             token: masterToken,
             user: {
               id: userInfo.userid,
               fullname: userInfo.fullname,
               username: userInfo.username,
               role: 'admin',
               userpictureurl: userInfo.userpictureurl
             }
           });
       } catch (err) {
           console.log('⚠️ Master Token validation failed, falling back to legacy login...');
       }
    }

    const targetUrl = `${moodleUrl}/login/token.php`;
    let userToken;

    try {
      const tokenResponse = await axios.get(targetUrl, {
        params: { username, password, service: 'moodle_mobile_app' }
      });
      
      if (tokenResponse.data.error) {
        if (tokenResponse.data.error.includes('suspended')) {
           return res.status(403).json({ success: false, error: 'Your account is suspended. Please contact the administrator.' });
        }
        // console.log('Login Error:', tokenResponse.data.error);
      } else {
        userToken = tokenResponse.data.token;
      }
    } catch (e) {
      console.log('⚠️ token.php unreachable');
    }

    if (!userToken) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or suspended account' });
    }
    
    const userInfo = await moodleService.request('core_webservice_get_site_info', { wstoken: userToken });
    
    // ⚡ FORCE LASTACCESS UPDATE: Moodle doesn't update lastaccess for WS logins by default.
    // Calling core_user_view_user simulates activity and forces Moodle to update the timestamp.
    try {
      await moodleService.request('core_user_view_user', { 
        userid: userInfo.userid, 
        courseid: 1 // Site home
      }, userToken); 
    } catch (vErr) {
      // Silently fail if this specific logging fails, don't block login
      console.log('⚠️ Could not force lastaccess update:', vErr.message);
    }

    res.json({
      success: true,
      token: userToken,
      user: {
        id: userInfo.userid,
        fullname: userInfo.fullname,
        username: userInfo.username,
        role: userInfo.siteadmin === 1 ? 'admin' : 'student',
        userpictureurl: userInfo.userpictureurl
      }
    });

  } catch (error) {
    console.error('❌ AUTH ERROR:', error.message);
    res.status(500).json({ success: false, error: 'Authentication Gateway Internal Error' });
  }
});

module.exports = router;
