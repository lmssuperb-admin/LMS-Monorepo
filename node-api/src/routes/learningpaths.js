const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../learningpaths.json');

// Ensure DB exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

const { defaultNotifications, replaceNotificationTags } = require('../utils/notificationDefaults');

const getPaths = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const savePaths = (paths) => fs.writeFileSync(DB_PATH, JSON.stringify(paths, null, 2));

router.get('/', (req, res) => {
  try {
    const paths = getPaths();
    res.json(paths);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', (req, res) => {
  try {
    const paths = getPaths();
    const newPath = {
      id: Date.now().toString(),
      name: req.body.name,
      description: req.body.description,
      createdAt: new Date().toISOString(),
      courses: req.body.courses || [],
      cohorts: req.body.cohorts || [],
      notifications: req.body.notifications || defaultNotifications(),
    };
    paths.push(newPath);
    savePaths(paths);
    res.json(newPath);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', (req, res) => {
  try {
    let paths = getPaths();
    const index = paths.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Path not found' });
    
    paths[index] = {
      ...paths[index],
      name: req.body.name || paths[index].name,
      description: req.body.description || paths[index].description,
      courses: req.body.courses || paths[index].courses,
      cohorts: req.body.cohorts || paths[index].cohorts || [],
      notifications: req.body.notifications || paths[index].notifications || defaultNotifications(),
      updatedAt: new Date().toISOString()
    };
    
    savePaths(paths);
    res.json(paths[index]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/notifications', (req, res) => {
  try {
    const paths = getPaths();
    const path = paths.find(p => p.id === req.params.id);
    if (!path) return res.status(404).json({ error: 'Path not found' });
    res.json(path.notifications || defaultNotifications());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/notifications', (req, res) => {
  try {
    const paths = getPaths();
    const index = paths.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Path not found' });

    const current = paths[index].notifications || defaultNotifications();
    paths[index].notifications = { ...current, ...req.body };
    paths[index].updatedAt = new Date().toISOString();
    savePaths(paths);
    res.json(paths[index].notifications);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/notifications/preview', (req, res) => {
  try {
    const { templateKey, sampleData } = req.body;
    const paths = getPaths();
    const path = paths.find(p => p.id === req.params.id);
    if (!path) return res.status(404).json({ error: 'Path not found' });

    const notifications = path.notifications || defaultNotifications();
    const block = notifications[templateKey];
    if (!block) return res.status(400).json({ error: 'Invalid template key' });

    const data = {
      user_fullname: sampleData?.user_fullname || 'Jane Student',
      learningpath_name: sampleData?.learningpath_name || path.name,
      learningpath_startdate: sampleData?.learningpath_startdate || 'Jan 1, 2026',
      learningpath_enddate: sampleData?.learningpath_enddate || 'Dec 31, 2026',
      learningpath_coursesrequired: sampleData?.learningpath_coursesrequired || String(path.courses?.length || 0),
    };

    res.json({
      subject: replaceNotificationTags(block.subject || '', data),
      body: replaceNotificationTags(block.body || '', data),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    let paths = getPaths();
    paths = paths.filter(p => p.id !== req.params.id);
    savePaths(paths);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
