const express = require('express');
const router = express.Router();
const {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getAttendance)
  .post(protect, createAttendance);

router
  .route('/:id')
  .put(protect, adminOnly, updateAttendance)
  .delete(protect, adminOnly, deleteAttendance);

module.exports = router;
