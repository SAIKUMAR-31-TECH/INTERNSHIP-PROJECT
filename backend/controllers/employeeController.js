const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// @desc    Get all employees (Admin)
// @route   GET /api/employees
// @access  Protected
const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({}).sort({ name: 1 });
    const mapped = employees.map(emp => ({
      id: emp._id.toString(),
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      phone: emp.phone,
      mobile: emp.phone, // alias for frontend compatibility
      joiningDate: emp.joiningDate,
      status: emp.status,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt
    }));
    return res.status(200).json({ success: true, count: mapped.length, data: mapped });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Protected (Admin only)
const createEmployee = async (req, res, next) => {
  try {
    const { employeeId, name, email, department, designation, phone, mobile, joiningDate, status } = req.body;

    if (!employeeId || !name || !email) {
      res.status(400);
      throw new Error('Please enter employeeId, name, and email');
    }

    // Check duplicate employeeId
    const employeeIdExists = await Employee.findOne({ employeeId });
    if (employeeIdExists) {
      res.status(400);
      throw new Error(`An employee with ID ${employeeId} already exists`);
    }

    // Check duplicate email
    const exists = await Employee.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error(`An employee with email ${email} already exists`);
    }

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      department: department || 'General',
      designation: designation || 'Associate',
      phone: phone || mobile || '',
      joiningDate: joiningDate || Date.now(),
      status: status || 'Active',
    });

    const mapped = {
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      phone: employee.phone,
      mobile: employee.phone, // alias
      joiningDate: employee.joiningDate,
      status: employee.status,
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
    const { employeeId, name, email, department, designation, phone, mobile, joiningDate, status } = req.body;

    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    // If changing employeeId, verify it's not already in use
    if (employeeId && employeeId !== employee.employeeId) {
      const exists = await Employee.findOne({ employeeId });
      if (exists) {
        res.status(400);
        throw new Error('Employee ID is already in use');
      }
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
      {
        employeeId,
        name,
        email,
        department,
        designation,
        phone: phone || mobile || '',
        joiningDate,
        status
      },
      { new: true, runValidators: true }
    );

    const mapped = {
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      phone: employee.phone,
      mobile: employee.phone, // alias
      joiningDate: employee.joiningDate,
      status: employee.status,
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
