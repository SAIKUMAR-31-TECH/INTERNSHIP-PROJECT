const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');

dotenv.config();

// Helper to get formatted date string with offset
const getOffsetDateString = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().split('T')[0];
};

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_tracker');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Create Admin User
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'Admin',
    });
    console.log('Seeded Admin user.');

    // 2. Create Employee Users and Roster
    const employeeData = [
      { name: 'Rahul Sharma', email: 'rahul@example.com', department: 'Engineering', designation: 'Software Engineer' },
      { name: 'Priya Patel', email: 'priya@example.com', department: 'Human Resources (HR)', designation: 'HR Manager' },
      { name: 'Amit Verma', email: 'amit@example.com', department: 'Sales', designation: 'Sales Executive' },
      { name: 'Sneha Reddy', email: 'sneha@example.com', department: 'Quality Assurance (QA)', designation: 'QA Engineer' },
      { name: 'Vikram Malhotra', email: 'vikram@example.com', department: 'Marketing', designation: 'Marketing Lead' },
    ];

    const seededEmployees = [];
    for (const emp of employeeData) {
      const createdEmp = await Employee.create(emp);
      seededEmployees.push(createdEmp);

      // Create a User account for each employee so they can log in
      await User.create({
        name: emp.name,
        email: emp.email,
        password: `${emp.email.split('@')[0]}123`, // e.g., rahul123
        role: 'Employee',
      });
    }
    console.log(`Seeded ${seededEmployees.length} employee accounts & roster entries.`);

    // Map names to ObjectIds for attendance seeding
    const empMap = {};
    seededEmployees.forEach((emp) => {
      empMap[emp.name] = emp._id;
    });

    // 3. Seed Attendance Records (matching past 5 days from original React client seed)
    const t0 = getOffsetDateString(0); // Today
    const t1 = getOffsetDateString(1); // Yesterday
    const t2 = getOffsetDateString(2); // 2 days ago
    const t3 = getOffsetDateString(3); // 3 days ago
    const t4 = getOffsetDateString(4); // 4 days ago
    const t5 = getOffsetDateString(5); // 5 days ago

    const attendanceRecords = [
      // Today
      { employeeId: empMap['Rahul Sharma'], date: t0, status: 'Present' },
      { employeeId: empMap['Priya Patel'], date: t0, status: 'Present' },
      { employeeId: empMap['Amit Verma'], date: t0, status: 'Present' },
      { employeeId: empMap['Sneha Reddy'], date: t0, status: 'Leave' },
      { employeeId: empMap['Vikram Malhotra'], date: t0, status: 'Absent' },
      // Yesterday
      { employeeId: empMap['Rahul Sharma'], date: t1, status: 'Present' },
      { employeeId: empMap['Priya Patel'], date: t1, status: 'Leave' },
      { employeeId: empMap['Amit Verma'], date: t1, status: 'Present' },
      { employeeId: empMap['Sneha Reddy'], date: t1, status: 'Present' },
      { employeeId: empMap['Vikram Malhotra'], date: t1, status: 'Present' },
      // 2 days ago
      { employeeId: empMap['Rahul Sharma'], date: t2, status: 'Absent' },
      { employeeId: empMap['Priya Patel'], date: t2, status: 'Present' },
      { employeeId: empMap['Amit Verma'], date: t2, status: 'Present' },
      { employeeId: empMap['Sneha Reddy'], date: t2, status: 'Present' },
      { employeeId: empMap['Vikram Malhotra'], date: t2, status: 'Absent' },
      // 3 days ago
      { employeeId: empMap['Rahul Sharma'], date: t3, status: 'Present' },
      { employeeId: empMap['Priya Patel'], date: t3, status: 'Present' },
      { employeeId: empMap['Amit Verma'], date: t3, status: 'Present' },
      { employeeId: empMap['Sneha Reddy'], date: t3, status: 'Present' },
      { employeeId: empMap['Vikram Malhotra'], date: t3, status: 'Present' },
      // 4 days ago
      { employeeId: empMap['Rahul Sharma'], date: t4, status: 'Present' },
      { employeeId: empMap['Priya Patel'], date: t4, status: 'Leave' },
      { employeeId: empMap['Amit Verma'], date: t4, status: 'Present' },
      { employeeId: empMap['Sneha Reddy'], date: t4, status: 'Present' },
      { employeeId: empMap['Vikram Malhotra'], date: t4, status: 'Present' },
      // 5 days ago
      { employeeId: empMap['Rahul Sharma'], date: t5, status: 'Present' },
      { employeeId: empMap['Priya Patel'], date: t5, status: 'Present' },
      { employeeId: empMap['Amit Verma'], date: t5, status: 'Leave' },
      { employeeId: empMap['Sneha Reddy'], date: t5, status: 'Present' },
      { employeeId: empMap['Vikram Malhotra'], date: t5, status: 'Absent' },
    ];

    await Attendance.insertMany(attendanceRecords);
    console.log(`Seeded ${attendanceRecords.length} attendance records.`);

    console.log('Seeding process completed successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
