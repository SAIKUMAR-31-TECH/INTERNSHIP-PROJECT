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

    // 2. Create Employee Roster (No login users created)
    const employeeData = [
      { employeeId: 'EMP001', name: 'Rahul Sharma', email: 'rahul@example.com', department: 'Engineering', designation: 'Software Engineer', phone: '9876543210', status: 'Active', joiningDate: new Date('2025-01-15') },
      { employeeId: 'EMP002', name: 'Priya Patel', email: 'priya@example.com', department: 'Human Resources (HR)', designation: 'HR Manager', phone: '9876543211', status: 'Active', joiningDate: new Date('2025-02-10') },
      { employeeId: 'EMP003', name: 'Amit Verma', email: 'amit@example.com', department: 'Sales', designation: 'Sales Executive', phone: '9876543212', status: 'Active', joiningDate: new Date('2025-03-05') },
      { employeeId: 'EMP004', name: 'Sneha Reddy', email: 'sneha@example.com', department: 'Quality Assurance (QA)', designation: 'QA Engineer', phone: '9876543213', status: 'Active', joiningDate: new Date('2025-03-12') },
      { employeeId: 'EMP005', name: 'Vikram Malhotra', email: 'vikram@example.com', department: 'Marketing', designation: 'Marketing Lead', phone: '9876543214', status: 'Active', joiningDate: new Date('2025-04-01') },
    ];

    const seededEmployees = [];
    for (const emp of employeeData) {
      const createdEmp = await Employee.create(emp);
      seededEmployees.push(createdEmp);
    }
    console.log(`Seeded ${seededEmployees.length} employee roster entries.`);

    // Map names to ObjectIds for attendance seeding
    const empMap = {};
    seededEmployees.forEach((emp) => {
      empMap[emp.name] = emp._id;
    });

    // 3. Seed Attendance Records with Time and Employee Names
    const t0 = getOffsetDateString(0); // Today
    const t1 = getOffsetDateString(1); // Yesterday
    const t2 = getOffsetDateString(2); // 2 days ago
    const t3 = getOffsetDateString(3); // 3 days ago
    const t4 = getOffsetDateString(4); // 4 days ago
    const t5 = getOffsetDateString(5); // 5 days ago

    const attendanceRecords = [
      // Today
      { employeeId: empMap['Rahul Sharma'], employeeName: 'Rahul Sharma', date: t0, time: '09:05 AM', status: 'Present' },
      { employeeId: empMap['Priya Patel'], employeeName: 'Priya Patel', date: t0, time: '09:12 AM', status: 'Present' },
      { employeeId: empMap['Amit Verma'], employeeName: 'Amit Verma', date: t0, time: '09:30 AM', status: 'Present' },
      { employeeId: empMap['Sneha Reddy'], employeeName: 'Sneha Reddy', date: t0, time: '10:00 AM', status: 'Leave' },
      { employeeId: empMap['Vikram Malhotra'], employeeName: 'Vikram Malhotra', date: t0, time: '10:15 AM', status: 'Absent' },
      // Yesterday
      { employeeId: empMap['Rahul Sharma'], employeeName: 'Rahul Sharma', date: t1, time: '09:02 AM', status: 'Present' },
      { employeeId: empMap['Priya Patel'], employeeName: 'Priya Patel', date: t1, time: '10:00 AM', status: 'Leave' },
      { employeeId: empMap['Amit Verma'], employeeName: 'Amit Verma', date: t1, time: '09:18 AM', status: 'Present' },
      { employeeId: empMap['Sneha Reddy'], employeeName: 'Sneha Reddy', date: t1, time: '09:20 AM', status: 'Present' },
      { employeeId: empMap['Vikram Malhotra'], employeeName: 'Vikram Malhotra', date: t1, time: '09:15 AM', status: 'Present' },
      // 2 days ago
      { employeeId: empMap['Rahul Sharma'], employeeName: 'Rahul Sharma', date: t2, time: '09:00 AM', status: 'Absent' },
      { employeeId: empMap['Priya Patel'], employeeName: 'Priya Patel', date: t2, time: '09:11 AM', status: 'Present' },
      { employeeId: empMap['Amit Verma'], employeeName: 'Amit Verma', date: t2, time: '09:10 AM', status: 'Present' },
      { employeeId: empMap['Sneha Reddy'], employeeName: 'Sneha Reddy', date: t2, time: '09:22 AM', status: 'Present' },
      { employeeId: empMap['Vikram Malhotra'], employeeName: 'Vikram Malhotra', date: t2, time: '09:00 AM', status: 'Absent' },
      // 3 days ago
      { employeeId: empMap['Rahul Sharma'], employeeName: 'Rahul Sharma', date: t3, time: '08:58 AM', status: 'Present' },
      { employeeId: empMap['Priya Patel'], employeeName: 'Priya Patel', date: t3, time: '09:05 AM', status: 'Present' },
      { employeeId: empMap['Amit Verma'], employeeName: 'Amit Verma', date: t3, time: '09:12 AM', status: 'Present' },
      { employeeId: empMap['Sneha Reddy'], employeeName: 'Sneha Reddy', date: t3, time: '09:10 AM', status: 'Present' },
      { employeeId: empMap['Vikram Malhotra'], employeeName: 'Vikram Malhotra', date: t3, time: '09:08 AM', status: 'Present' },
      // 4 days ago
      { employeeId: empMap['Rahul Sharma'], employeeName: 'Rahul Sharma', date: t4, time: '09:01 AM', status: 'Present' },
      { employeeId: empMap['Priya Patel'], employeeName: 'Priya Patel', date: t4, time: '10:00 AM', status: 'Leave' },
      { employeeId: empMap['Amit Verma'], employeeName: 'Amit Verma', date: t4, time: '09:14 AM', status: 'Present' },
      { employeeId: empMap['Sneha Reddy'], employeeName: 'Sneha Reddy', date: t4, time: '09:08 AM', status: 'Present' },
      { employeeId: empMap['Vikram Malhotra'], employeeName: 'Vikram Malhotra', date: t4, time: '09:05 AM', status: 'Present' },
      // 5 days ago
      { employeeId: empMap['Rahul Sharma'], employeeName: 'Rahul Sharma', date: t5, time: '09:00 AM', status: 'Present' },
      { employeeId: empMap['Priya Patel'], employeeName: 'Priya Patel', date: t5, time: '09:15 AM', status: 'Present' },
      { employeeId: empMap['Amit Verma'], employeeName: 'Amit Verma', date: t5, time: '10:00 AM', status: 'Leave' },
      { employeeId: empMap['Sneha Reddy'], employeeName: 'Sneha Reddy', date: t5, time: '09:05 AM', status: 'Present' },
      { employeeId: empMap['Vikram Malhotra'], employeeName: 'Vikram Malhotra', date: t5, time: '09:00 AM', status: 'Absent' },
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
