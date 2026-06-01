require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const systemRoutes = require('./routes/system');
const roleRoutes = require('./routes/roles');
const enrolmentsRoutes = require('./routes/enrolments');
const learningPathRoutes = require('./routes/learningpaths');
const cohortRoutes = require('./routes/cohorts');
const progressRoutes = require('./routes/progress');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

const path = require('path');

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked request from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Expose Static Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/enrolments', enrolmentsRoutes);
app.use('/api/learningpaths', learningPathRoutes);
app.use('/api/cohorts', cohortRoutes);
app.use('/api/progress', progressRoutes);

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
