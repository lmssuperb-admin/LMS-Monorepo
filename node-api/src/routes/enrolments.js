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

module.exports = router;
