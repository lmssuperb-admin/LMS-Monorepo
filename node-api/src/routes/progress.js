const express = require('express');
const router = express.Router();
const progressStore = require('../services/studentProgressStore');
const moodleService = require('../services/moodleService');

router.get('/', (req, res) => {
  const userid = req.query.userid;
  if (!userid) return res.status(400).json({ error: 'userid required' });
  res.json(progressStore.getUserProgress(userid));
});

router.post('/', (req, res) => {
  const { userid, courseId, courseName, action, moduleKey, seconds, source, totalModules } = req.body;
  if (!userid || !courseId || !action) {
    return res.status(400).json({ error: 'userid, courseId, and action are required' });
  }
  const data = progressStore.recordEvent(userid, {
    courseId,
    courseName,
    action,
    moduleKey,
    seconds,
    source,
    totalModules,
  });
  res.json(data);
});

router.get('/recommended', async (req, res) => {
  try {
    let ids = progressStore.getRecommendedIds();
    if (!ids.length) {
      const courses = await moodleService.getCourses();
      ids = (courses || [])
        .filter(c => c.id && c.id !== 1 && c.visible !== 0)
        .slice(0, 3)
        .map(c => c.id);
    }
    res.json(ids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/recommended', (req, res) => {
  const ids = req.body.courseIds || req.body.ids || [];
  progressStore.setRecommendedIds(ids);
  res.json({ success: true, ids: progressStore.getRecommendedIds() });
});

module.exports = router;
