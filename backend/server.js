// Load environment variables
require('dotenv').config();

const path = require('path');
const express = require('express');

// Run port-clearing predev script ONLY in local development
if (process.env.NODE_ENV !== 'production') {
  require('./predev');
}

const connectDB = require('./config/db');
const app = require('./app');
const { initCronJobs } = require('./services/cronService');

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Serve React build output as static files (only local server needs this, Vercel handles it natively)
    app.use(express.static(path.join(__dirname, '../dist')));

    // Catch-all: for any route not matched by API, serve React's index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });

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

