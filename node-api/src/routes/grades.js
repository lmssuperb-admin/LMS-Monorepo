const express = require('express');
const router = express.Router();
const moodleService = require('../services/moodleService');

router.get('/:userid', async (req, res, next) => {
  try {
    const courseid = req.query.courseid || 0;
    const grades = await moodleService.getUserGrades(req.params.userid, courseid);
    res.json(grades);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
