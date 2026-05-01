require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS - More flexible for production
app.use(
  cors({
    origin: true, // Reflects the request origin, making it work for any Railway domain
    credentials: true,
  })
);

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Simple Request Logger for Debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

// Logger (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend if it exists
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
});

module.exports = app;
