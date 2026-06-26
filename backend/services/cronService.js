const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// Create Transporter based on environment variables or mock fallback
const getMailTransporter = async () => {
  // If SMTP configurations are provided in env, use them
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback / Development: Create Ethereal test account or local console logger
  // For safety and zero external network calls during automated testing, we'll return a mock direct-logger transporter
  return {
    sendMail: async (mailOptions) => {
      console.log('==================================================');
      console.log(`[MOCK EMAIL SENT]`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body:\n${mailOptions.text}`);
      console.log('==================================================');
      return { messageId: `mock-${Date.now()}` };
    }
  };
};

const runAttendanceCheck = async () => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    console.log(`[Cron Job] Starting daily attendance reminder check for date: ${todayStr}`);

    // 1. Fetch all active employees
    const employees = await Employee.find({ status: 'Active' });
    
    // 2. Fetch all attendance marked for today
    const todayAttendance = await Attendance.find({ date: todayStr });
    
    // Create set of employee IDs who have marked attendance
    const markedEmployeeIds = new Set(
      todayAttendance.map((rec) => rec.employeeId.toString())
    );

    // 3. Find employees who haven't marked attendance
    const unmarkedEmployees = employees.filter(
      (emp) => !markedEmployeeIds.has(emp._id.toString())
    );

    console.log(`[Cron Job] Found ${unmarkedEmployees.length} employees who have not marked attendance today.`);

    if (unmarkedEmployees.length === 0) {
      console.log(`[Cron Job] All employees have marked attendance today. No emails needed.`);
      return;
    }

    // 4. Setup transporter
    const transporter = await getMailTransporter();

    // 5. Send reminders
    for (const emp of unmarkedEmployees) {
      if (!emp.email) continue;

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Attendance Management System" <noreply@attendance.com>',
        to: emp.email,
        subject: 'Attendance Reminder',
        text: `Dear ${emp.name},

Your attendance has not been marked for today. Please update your attendance record.

Regards,
Attendance Management System`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`[Cron Job] Reminder email sent to ${emp.name} (${emp.email})`);
      } catch (err) {
        console.error(`[Cron Job] Failed to send email to ${emp.email}: ${err.message}`);
      }
    }

    console.log('[Cron Job] Attendance reminder cron check completed.');
  } catch (error) {
    console.error(`[Cron Job Error] ${error.message}`);
  }
};

// Scheduled to run every day at 9:00 AM
const initCronJobs = () => {
  // Pattern: '0 9 * * *' (Every day at 9:00 AM)
  cron.schedule('0 9 * * *', () => {
    runAttendanceCheck();
  });
  console.log('[Cron Service] Attendance reminder scheduled job initialized for 9:00 AM daily.');

  // Also expose a manual trigger for developers/testing if requested via env
  if (process.env.TRIGGER_CRON_ON_START === 'true') {
    console.log('[Cron Service] Triggering attendance check on startup for debugging.');
    runAttendanceCheck();
  }
};

module.exports = { initCronJobs, runAttendanceCheck };
