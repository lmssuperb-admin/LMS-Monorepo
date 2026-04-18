const express = require('express');
const router = express.Router();
const moodleService = require('../services/moodleService');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Return the public URL for the uploaded file
  const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

router.get('/roles', async (req, res) => {
  try {
    const roles = await moodleService.getRoles();
    res.json(roles || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/info', async (req, res) => {
  try {
    const info = await moodleService.getSiteInfo();
    res.json(info || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
