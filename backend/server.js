require('./predev');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { initCronJobs } = require('./services/cronService');

// Load environment variables
dotenv.config();

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    const app = express();

    // Middlewares
    app.use(cors({ origin: 'http://localhost:5173' }));
    app.use(express.json());

    // Routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/employees', require('./routes/employees'));
    app.use('/api/attendance', require('./routes/attendance'));
    app.use('/api/reports', require('./routes/reports'));

    // Serve React build output as static files
    app.use(express.static(path.join(__dirname, '../dist')));

    // Catch-all: for any route not matched by API, serve React's index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });

    // Centralized Error Handler Middleware
    app.use(errorHandler);

    // Initialize Cron Jobs
    initCronJobs();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Database connection failed, server cannot start: ${error.message}`);
    process.exit(1);
  }
};

// Start the server execution
startServer();
