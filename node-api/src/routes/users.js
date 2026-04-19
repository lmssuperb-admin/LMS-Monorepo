const express = require('express');
const router = express.Router();
const moodleService = require('../services/moodleService');

// --- 🏠 Student Routes ---
router.get('/me/courses', async (req, res) => {
  const { userid } = req.query;
  try {
    const courses = await moodleService.getUserCourses(userid);
    res.json(courses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me/timeline', async (req, res) => {
  const { userid } = req.query;
  try {
    const timeline = await moodleService.getUserTimeline(userid);
    res.json(timeline);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 🏛️ Admin Routes ---
router.get('/', async (req, res) => {
  try {
    const data = await moodleService.getUsers();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { roleid, ...userData } = req.body;
  try {
    const users = await moodleService.createUser(userData);
    const newUser = users[0];
    
    if (roleid && newUser && newUser.id) {
       try {
         await moodleService.assignRole(newUser.id, roleid);
       } catch (roleErr) {
         console.error('⚠️ User created but role assignment failed:', roleErr.message);
       }
    }
    
    res.json(newUser);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    await moodleService.updateUser({ id: req.params.id, ...req.body });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/cohorts', async (req, res) => {
  try {
    const cohorts = await moodleService.getCohorts();
    res.json(cohorts || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
