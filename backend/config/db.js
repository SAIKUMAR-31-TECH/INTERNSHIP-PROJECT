const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_tracker';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error; // Propagate error so server knows it failed
  }
};

module.exports = connectDB;
