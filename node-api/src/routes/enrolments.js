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
    const body = req.body || {};

    // Accept either an explicit array of enrolments, or userIds + courseIds + roleid
    let enrolments = Array.isArray(body.enrolments) ? body.enrolments : null;

    if (!enrolments) {
      const { userIds = [], courseIds = [], roleid = 5, timestart = 0, timeend = 0 } = body;
      if (!Array.isArray(userIds) || !Array.isArray(courseIds) || userIds.length === 0 || courseIds.length === 0) {
        return res.status(400).json({ error: 'Missing userIds or courseIds' });
      }

      enrolments = [];
      for (const uid of userIds) {
        for (const cid of courseIds) {
          enrolments.push({ userid: parseInt(uid, 10), courseid: parseInt(cid, 10), roleid: parseInt(roleid, 10) || 5, timestart: parseInt(timestart, 10) || 0, timeend: parseInt(timeend, 10) || 0 });
        }
      }
    }

    // Basic validation and normalization
    enrolments = enrolments.map(e => ({
      userid: parseInt(e.userid, 10),
      courseid: parseInt(e.courseid, 10),
      roleid: parseInt(e.roleid, 10) || 5,
      timestart: e.timestart ? parseInt(e.timestart, 10) : 0,
      timeend: e.timeend ? parseInt(e.timeend, 10) : 0,
    })).filter(e => !Number.isNaN(e.userid) && !Number.isNaN(e.courseid));

    if (!enrolments.length) return res.status(400).json({ error: 'No valid enrolments provided' });

    const result = await moodleService.manualEnrolUsers(enrolments);
    res.json({ ok: true, result });
  } catch (err) {
    // surface Moodle error message clearly
    console.error('Enroll error:', err.message || err);
    return res.status(500).json({ error: err.message || 'Enrollment failed' });
  }
});

module.exports = router;
