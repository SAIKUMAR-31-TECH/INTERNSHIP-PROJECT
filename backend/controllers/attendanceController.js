const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Get all attendance records (Admin only)
// @route   GET /api/attendance
// @access  Protected
const getAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({}).sort({ date: -1, createdAt: -1 });

    const mappedRecords = records.map((rec) => {
      return {
        id: rec._id.toString(),
        employeeId: rec.employeeId.toString(),
        employeeName: rec.employeeName,
        date: rec.date,
        time: rec.time,
        status: rec.status,
        managerId: rec.managerId ? rec.managerId.toString() : null,
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

    // Check duplicate record for same date and employee
    const duplicate = await Attendance.findOne({ employeeId, date });
    if (duplicate) {
      res.status(400);
      throw new Error('Attendance has already been marked for this employee on this date');
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const record = await Attendance.create({
      employeeId,
      employeeName: employee.name,
      date,
      time,
      status,
      managerId: req.user._id,
    });

    const mappedRecord = {
      id: record._id.toString(),
      employeeId: record.employeeId.toString(),
      employeeName: record.employeeName,
      date: record.date,
      time: record.time,
      status: record.status,
      managerId: record.managerId ? record.managerId.toString() : null,
      createdAt: record.createdAt,
    };

    res.status(201).json({ success: true, data: mappedRecord });
  } catch (error) {
    next(error);
  }
};

// @desc    Save bulk attendance records
// @route   POST /api/attendance/bulk
// @access  Protected (Admin/Manager only)
const saveBulkAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      res.status(400);
      throw new Error('Please enter date and records array');
    }

    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const managerId = req.user._id;
    const processedRecords = [];

    for (const rec of records) {
      const { employeeId, status } = rec;

      if (!employeeId || !status) continue;

      const employee = await Employee.findById(employeeId);
      if (!employee) continue;

      // Find if record already exists for date + employee
      const existing = await Attendance.findOne({ employeeId, date });

      if (existing) {
        existing.status = status;
        existing.time = time;
        existing.managerId = managerId;
        existing.employeeName = employee.name;
        await existing.save();
        processedRecords.push(existing);
      } else {
        const newRecord = await Attendance.create({
          employeeId,
          employeeName: employee.name,
          date,
          time,
          status,
          managerId,
        });
        processedRecords.push(newRecord);
      }
    }

    res.status(200).json({
      success: true,
      count: processedRecords.length,
      data: processedRecords,
    });
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

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    record = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        employeeId,
        employeeName: employee.name,
        date,
        time,
        status,
        managerId: req.user._id,
      },
      { new: true, runValidators: true }
    );

    const mappedRecord = {
      id: record._id.toString(),
      employeeId: record.employeeId.toString(),
      employeeName: record.employeeName,
      date: record.date,
      time: record.time,
      status: record.status,
      managerId: record.managerId ? record.managerId.toString() : null,
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
  saveBulkAttendance,
  updateAttendance,
  deleteAttendance,
};
