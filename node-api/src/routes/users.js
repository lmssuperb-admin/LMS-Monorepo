const express = require('express');
const router = express.Router();
const moodleService = require('../services/moodleService');
const { getUsersManagement } = require('../services/userManagementService');

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
router.get('/manage', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'firstname';
    const sortDir = req.query.sortDir || 'asc';
    const filterByRole = req.query.filterByRole || 'all';
    const rawSearchFields = req.query.searchFields || '';
    const searchFields = ([])
      .concat(rawSearchFields)
      .flatMap((field) => (typeof field === 'string' ? field.split(',') : []))
      .map((field) => field.trim())
      .filter(Boolean);
    const filters = {
      fullName: req.query.fullName || '',
      email: req.query.email || '',
      username: req.query.username || '',
      city: req.query.city || '',
      country: req.query.country || '',
      course: req.query.course || '',
      systemRole: req.query.systemRole || '',
    };

    const data = await getUsersManagement({ page, limit, search, sortBy, sortDir, filterByRole, searchFields, filters });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await moodleService.getUsers();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { roleid, cohortIds, ...userData } = req.body;
  try {
    const users = await moodleService.createUser(userData);
    const newUser = users[0];

    if (roleid && newUser?.id) {
      try {
        await moodleService.assignRole(newUser.id, roleid);
      } catch (roleErr) {
        console.error('⚠️ User created but role assignment failed:', roleErr.message);
      }
    }

    const ids = Array.isArray(cohortIds) ? cohortIds : [];
    if (newUser?.id && ids.length) {
      const cohortStore = require('../services/cohortStore');
      for (const cohortId of ids) {
        try {
          if (cohortStore.isLocalId(cohortId)) {
            cohortStore.addMembers(cohortId, [newUser.id]);
          } else {
            await moodleService.addCohortMembers(parseInt(cohortId, 10), [newUser.id]);
          }
        } catch (cohortErr) {
          console.error(`⚠️ Cohort ${cohortId} assignment failed:`, cohortErr.message);
        }
      }
    }

    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await moodleService.updateUser({ id: req.params.id, ...req.body });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
