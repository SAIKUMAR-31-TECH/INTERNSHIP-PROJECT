const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// @desc    Get all employees (Admin) or own profile (Employee)
// @route   GET /api/employees
// @access  Protected
const getEmployees = async (req, res, next) => {
  try {
    if (req.user.role === 'Admin') {
      const employees = await Employee.find({}).sort({ name: 1 });
      const mapped = employees.map(emp => ({
        id: emp._id.toString(),
        name: emp.name,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        mobile: emp.mobile,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt
      }));
      return res.status(200).json({ success: true, count: mapped.length, data: mapped });
    } else {
      // Find employee that matches user email
      const employee = await Employee.findOne({ email: req.user.email });
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee profile not found for this user account' });
      }
      const mappedEmployee = {
        id: employee._id.toString(),
        name: employee.name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        mobile: employee.mobile,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
      };
      return res.status(200).json({ success: true, data: [mappedEmployee] }); // Return as array for compatibility
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Protected (Admin only)
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, department, designation, mobile } = req.body;

    if (!name || !email) {
      res.status(400);
      throw new Error('Please enter name and email');
    }

    // Check duplicate email
    const exists = await Employee.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error(`An employee with email ${email} already exists`);
    }

    const employee = await Employee.create({
      name,
      email,
      department: department || 'General',
      designation: designation || 'Associate',
      mobile: mobile || '',
    });

    const mapped = {
      id: employee._id.toString(),
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      mobile: employee.mobile,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };

    res.status(201).json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Protected (Admin only)
const updateEmployee = async (req, res, next) => {
  try {
    const { name, email, department, designation, mobile } = req.body;

    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    // If changing email, verify it's not already in use
    if (email && email !== employee.email) {
      const exists = await Employee.findOne({ email });
      if (exists) {
        res.status(400);
        throw new Error('Email is already in use by another employee');
      }
    }

    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, department, designation, mobile },
      { new: true, runValidators: true }
    );

    const mapped = {
      id: employee._id.toString(),
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      mobile: employee.mobile,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };

    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee & cascade delete attendance logs
// @route   DELETE /api/employees/:id
// @access  Protected (Admin only)
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    // Cascade delete employee records
    await Attendance.deleteMany({ employeeId: req.params.id });
    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Employee "${employee.name}" and all their attendance history logs have been deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
