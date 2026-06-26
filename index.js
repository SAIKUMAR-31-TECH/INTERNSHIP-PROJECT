const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const connectDB = require('../backend/config/db');
const app = require('../backend/app');

// Serverless function DB connection caching
let isConnected = false;
const connect = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await connectDB();
  isConnected = true;
};

// Database connection middleware for serverless requests
app.use(async (req, res, next) => {
  try {
    await connect();
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = app;
