const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Security middlewares
app.use(helmet());

// Enable CORS (restrict in production via FRONTEND_URL)
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use(morgan('dev'));

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files middleware for uploaded screenshots
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root welcome message
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Doctor Hub API Services. Use /api/health for system status.'
  });
});

// Register API routes
app.use('/api', routes);

// Handle 404 - Not Found
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

module.exports = app;
