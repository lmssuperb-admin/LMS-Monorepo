const express = require('express');
const router = express.Router();
const moodleService = require('../services/moodleService');

router.get('/:userid', async (req, res, next) => {
  try {
    const courses = await moodleService.getEnrolledCourses(req.params.userid);
    res.json(courses);
  } catch (error) {
    next(error);
  }
});

router.post('/enroll', async (req, res, next) => {
  try {
    const { userIds = [], courseIds = [], roleid = 5, timestart, timeend } = req.body || {};
    if (!Array.isArray(userIds) || !Array.isArray(courseIds) || userIds.length === 0 || courseIds.length === 0) {
      return res.status(400).json({ error: 'Missing userIds or courseIds' });
    }

    const enrolments = [];
    for (const uid of userIds) {
      for (const cid of courseIds) {
        enrolments.push({ userid: uid, courseid: cid, roleid, timestart: timestart || 0, timeend: timeend || 0 });
      }
    }

    const result = await moodleService.manualEnrolUsers(enrolments);
    res.json({ ok: true, result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
