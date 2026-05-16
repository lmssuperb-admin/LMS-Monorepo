const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../learningpaths.json');

// Ensure DB exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

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
      courses: req.body.courses || []
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
      updatedAt: new Date().toISOString()
    };
    
    savePaths(paths);
    res.json(paths[index]);
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
