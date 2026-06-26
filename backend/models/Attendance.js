const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Please reference an employee'],
    },
    employeeName: {
      type: String,
      required: [true, 'Please add an employee name'],
    },
    date: {
      type: String,
      required: [true, 'Please add a date string (YYYY-MM-DD)'],
    },
    time: {
      type: String,
      required: [true, 'Please add a time string'],
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave', 'Half Day', 'Work From Home'],
      required: [true, 'Please set attendance status'],
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance for the same employee on the same date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
