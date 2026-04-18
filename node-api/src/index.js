require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const systemRoutes = require('./routes/system');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Expose Static Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/system', systemRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'AcademyAI Node API is fully operational' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 AcademyAI Node API running on http://localhost:${PORT}`);
});
