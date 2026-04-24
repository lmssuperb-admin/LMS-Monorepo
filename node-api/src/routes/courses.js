const express = require('express');
const router = express.Router();
const moodleService = require('../services/moodleService');

router.get('/', async (req, res) => {
  try {
    const courses = await moodleService.getCourses();
    res.json(courses || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/categories', async (req, res) => {
  try {
    const cats = await moodleService.getCategories();
    res.json(cats || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/categories', async (req, res) => {
  try {
    const cats = await moodleService.createCategory(req.body);
    res.json(cats[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const content = await moodleService.getCourseContents(req.params.id);
    res.json(content || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const courses = await moodleService.createCourse(req.body);
    res.json(courses[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await moodleService.deleteCourses([req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
