const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please enter all required fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
    });

    if (user) {
      let employeeId = null;
      if (user.role === 'Employee') {
        let emp = await Employee.findOne({ email: user.email });
        if (!emp) {
          emp = await Employee.create({
            name: user.name,
            email: user.email,
            department: 'General',
            designation: 'Associate',
          });
        }
        employeeId = emp._id.toString();
      }

      return res.status(201).json({
        success: true,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: employeeId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter email and password');
    }

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Find associated employeeId if the role is Employee
      let employeeId = null;
      if (user.role === 'Employee') {
        const emp = await Employee.findOne({ email: user.email });
        if (emp) {
          employeeId = emp._id.toString();
        }
      }

      return res.json({
        success: true,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: employeeId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser };
