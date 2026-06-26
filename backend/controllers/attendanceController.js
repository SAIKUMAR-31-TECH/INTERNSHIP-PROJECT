const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Get all attendance records (Admin) or own records (Employee)
// @route   GET /api/attendance
// @access  Protected
const getAttendance = async (req, res, next) => {
  try {
    let records = [];

    if (req.user.role === 'Admin') {
      records = await Attendance.find({}).sort({ date: -1, createdAt: -1 });
    } else {
      // Find employee that matches user email
      const employee = await Employee.findOne({ email: req.user.email });
      if (!employee) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      
      records = await Attendance.find({ employeeId: employee._id }).sort({ date: -1 });
    }

    // Map _id to id for frontend compatibility
    const mappedRecords = records.map((rec) => {
      const obj = rec.toObject();
      return {
        id: rec._id.toString(),
        employeeId: rec.employeeId.toString(),
        date: rec.date,
        status: rec.status,
        createdAt: rec.createdAt,
      };
    });

    res.status(200).json({ success: true, count: mappedRecords.length, data: mappedRecords });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new attendance record
// @route   POST /api/attendance
// @access  Protected
const createAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status } = req.body;

    if (!employeeId || !date || !status) {
      res.status(400);
      throw new Error('Please enter employeeId, date, and status');
    }

    // Role-based verification: Employees can only mark their own attendance
    if (req.user.role === 'Employee') {
      const employee = await Employee.findOne({ email: req.user.email });
      if (!employee || employee._id.toString() !== employeeId) {
        res.status(403);
        throw new Error('Access denied: You can only record attendance for yourself');
      }
    }

    // Check duplicate record for same date and employee
    const duplicate = await Attendance.findOne({ employeeId, date });
    if (duplicate) {
      res.status(400);
      throw new Error('Attendance has already been marked for this employee on this date');
    }

    const record = await Attendance.create({
      employeeId,
      date,
      status,
    });

    const mappedRecord = {
      id: record._id.toString(),
      employeeId: record.employeeId.toString(),
      date: record.date,
      status: record.status,
      createdAt: record.createdAt,
    };

    res.status(201).json({ success: true, data: mappedRecord });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Protected
const updateAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status } = req.body;

    let record = await Attendance.findById(req.params.id);
    if (!record) {
      res.status(404);
      throw new Error('Attendance record not found');
    }

    // Role check: Only admin can edit or change past records, or employee if allowed (Admin only is requested: "Admin: Manage Attendance", "Employee: View Own Attendance")
    if (req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Access denied: Only Admins can edit attendance records');
    }

    // Check duplicate (but exclude this record itself)
    const duplicate = await Attendance.findOne({
      employeeId,
      date,
      _id: { $ne: req.params.id },
    });
    if (duplicate) {
      res.status(400);
      throw new Error('Attendance has already been marked for this employee on this date');
    }

    record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { employeeId, date, status },
      { new: true, runValidators: true }
    );

    const mappedRecord = {
      id: record._id.toString(),
      employeeId: record.employeeId.toString(),
      date: record.date,
      status: record.status,
      createdAt: record.createdAt,
    };

    res.status(200).json({ success: true, data: mappedRecord });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Protected (Admin only)
const deleteAttendance = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Access denied: Only Admins can delete attendance records');
    }

    const record = await Attendance.findById(req.params.id);
    if (!record) {
      res.status(404);
      throw new Error('Attendance record not found');
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Attendance record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};
