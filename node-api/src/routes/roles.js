const express = require('express');
const router = express.Router();
const moodleService = require('../services/moodleService');

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await moodleService.getRoles();
    res.json(roles);
  } catch (err) {
    console.log("⚠️ Moodle getRoles failed, using fallback:", err.message);
    res.json([
      { id: 1, name: 'Manager', shortname: 'manager', description: 'Can manage courses and users' },
      { id: 2, name: 'Course creator', shortname: 'coursecreator', description: 'Can create new courses' },
      { id: 3, name: 'Teacher', shortname: 'editingteacher', description: 'Can teach and edit courses' },
      { id: 4, name: 'Non-editing teacher', shortname: 'teacher', description: 'Can teach but not edit' },
      { id: 5, name: 'Student', shortname: 'student', description: 'Can access and enroll in courses' }
    ]);
  }
});

// Assign role to user
router.get('/assignments', async (req, res) => {
  try {
    const data = await moodleService.getAssignments();
    res.json(data);
  } catch (err) { 
    console.log("⚠️ Local get_assignments failed:", err.message);
    res.json([]); 
  }
});

router.post('/assign', async (req, res) => {
  const { userid, roleid, contextlevel, instanceid } = req.body;
  try {
    const data = await moodleService.assignRole(parseInt(userid), parseInt(roleid), contextlevel, parseInt(instanceid) || 0);
    res.json(data || { success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/unassign', async (req, res) => {
  const { userid, roleid, contextlevel, instanceid } = req.body;
  try {
    const data = await moodleService.unassignRole(parseInt(userid), parseInt(roleid), contextlevel, parseInt(instanceid) || 0);
    res.json(data || { success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
