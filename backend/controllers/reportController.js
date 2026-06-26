const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const PDFDocument = require('pdfkit');

// @desc    Export attendance report as CSV
// @route   GET /api/reports/export/csv
// @access  Protected (Admin only)
const exportCSV = async (req, res, next) => {
  try {
    const records = await Attendance.find({})
      .populate('employeeId')
      .sort({ date: -1 });

    const data = records.map((rec) => ({
      'Employee ID': rec.employeeId ? rec.employeeId.employeeId : 'N/A',
      'Employee Name': rec.employeeId ? rec.employeeId.name : 'Unknown',
      'Employee Email': rec.employeeId ? rec.employeeId.email : 'N/A',
      'Department': rec.employeeId ? rec.employeeId.department : 'N/A',
      'Designation': rec.employeeId ? rec.employeeId.designation : 'N/A',
      'Date': rec.date,
      'Time': rec.time || 'N/A',
      'Status': rec.status,
    }));

    const fields = ['Employee ID', 'Employee Name', 'Employee Email', 'Department', 'Designation', 'Date', 'Time', 'Status'];

    let csvContent;
    try {
      const { Parser } = require('json2csv');
      const parser = new Parser({ fields });
      csvContent = parser.parse(data);
    } catch (err) {
      const { parse } = require('json2csv');
      csvContent = parse(data, { fields });
    }

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Export attendance report as PDF
// @route   GET /api/reports/export/pdf
// @access  Protected (Admin only)
const exportPDF = async (req, res, next) => {
  try {
    const records = await Attendance.find({})
      .populate('employeeId')
      .sort({ date: -1 });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.header('Content-Type', 'application/pdf');
    res.attachment(`attendance_report_${new Date().toISOString().split('T')[0]}.pdf`);
    doc.pipe(res);

    // Styling Colors
    const primaryColor = '#4f46e5'; // Indigo
    const textColor = '#1f2937'; // Slate 800
    const lightBg = '#f9fafb'; // Slate 50
    const borderColor = '#e5e7eb'; // Slate 200

    // Title / Header Banner
    doc.fillColor(primaryColor)
       .rect(0, 0, 595.28, 80) // Full width of A4 is 595.28
       .fill();

    doc.fillColor('#ffffff')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('TrackFlow Attendance System', 40, 28);

    doc.fontSize(10)
       .font('Helvetica')
       .text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 400, 35, { align: 'right' });

    doc.moveDown(4);

    // Section Header
    doc.fillColor(textColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Attendance History Report', 40, 100);

    // Summary Info Cards
    const totalRecords = records.length;
    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;
    const leaveCount = records.filter(r => r.status === 'Leave').length;
    const halfDayCount = records.filter(r => r.status === 'Half Day').length;
    const wfhCount = records.filter(r => r.status === 'Work From Home').length;

    doc.rect(40, 125, 515, 55)
       .fillColor(lightBg)
       .fill()
       .rect(40, 125, 515, 55)
       .strokeColor(borderColor)
       .stroke();

    doc.fillColor(textColor)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text(`Total Records: `, 50, 137).font('Helvetica').text(`${totalRecords}`, 120, 137)
       .font('Helvetica-Bold').text(`Present: `, 160, 137).font('Helvetica').text(`${presentCount}`, 200, 137)
       .font('Helvetica-Bold').text(`Absent: `, 235, 137).font('Helvetica').text(`${absentCount}`, 275, 137)
       .font('Helvetica-Bold').text(`On Leave: `, 310, 137).font('Helvetica').text(`${leaveCount}`, 355, 137)
       .font('Helvetica-Bold').text(`Half Day: `, 390, 137).font('Helvetica').text(`${halfDayCount}`, 435, 137)
       .font('Helvetica-Bold').text(`WFH: `, 470, 137).font('Helvetica').text(`${wfhCount}`, 500, 137);

    // Table Headers
    const tableTop = 200;
    const colIdWidth = 65;
    const colNameWidth = 115;
    const colDeptWidth = 95;
    const colDateWidth = 80;
    const colTimeWidth = 80;
    const colStatusWidth = 80;

    const colIdX = 40;
    const colNameX = colIdX + colIdWidth;
    const colDeptX = colNameX + colNameWidth;
    const colDateX = colDeptX + colDeptWidth;
    const colTimeX = colDateX + colDateWidth;
    const colStatusX = colTimeX + colTimeWidth;

    // Draw Header row background
    doc.rect(40, tableTop, 515, 24)
       .fillColor(primaryColor)
       .fill();

    doc.fillColor('#ffffff')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Emp ID', colIdX + 6, tableTop + 7)
       .text('Employee Name', colNameX + 6, tableTop + 7)
       .text('Department', colDeptX + 6, tableTop + 7)
       .text('Date', colDateX + 6, tableTop + 7)
       .text('Time', colTimeX + 6, tableTop + 7)
       .text('Status', colStatusX + 6, tableTop + 7);

    let currentY = tableTop + 24;

    // Draw Rows
    records.forEach((rec, index) => {
      // Create new page if list overflows A4 height
      if (currentY > 740) {
        doc.addPage();
        
        // Redraw Header in new page
        doc.rect(40, 40, 515, 24)
           .fillColor(primaryColor)
           .fill();

        doc.fillColor('#ffffff')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('Emp ID', colIdX + 6, 47)
           .text('Employee Name', colNameX + 6, 47)
           .text('Department', colDeptX + 6, 47)
           .text('Date', colDateX + 6, 47)
           .text('Time', colTimeX + 6, 47)
           .text('Status', colStatusX + 6, 47);

        currentY = 64;
      }

      // Alternate row backgrounds
      if (index % 2 === 1) {
        doc.rect(40, currentY, 515, 20)
           .fillColor('#f3f4f6') // Alternate gray row
           .fill();
      }

      const empId = rec.employeeId ? rec.employeeId.employeeId : 'N/A';
      const empName = rec.employeeId ? rec.employeeId.name : 'Unknown';
      const empDept = rec.employeeId ? rec.employeeId.department : 'N/A';
      const dateStr = rec.date;
      const timeStr = rec.time || 'N/A';
      const statusStr = rec.status;

      // Status text colors
      let statusColor = textColor;
      if (statusStr === 'Present') statusColor = '#10b981'; // Green
      else if (statusStr === 'Absent') statusColor = '#ef4444'; // Red
      else if (statusStr === 'Leave') statusColor = '#f59e0b'; // Amber
      else if (statusStr === 'Half Day') statusColor = '#3b82f6'; // Blue
      else if (statusStr === 'Work From Home') statusColor = '#8b5cf6'; // Purple

      doc.fillColor(textColor)
         .fontSize(8.5)
         .font('Helvetica')
         .text(empId, colIdX + 6, currentY + 6, { width: colIdWidth - 10, lineBreak: false })
         .text(empName, colNameX + 6, currentY + 6, { width: colNameWidth - 10, lineBreak: false })
         .text(empDept, colDeptX + 6, currentY + 6, { width: colDeptWidth - 10, lineBreak: false })
         .text(dateStr, colDateX + 6, currentY + 6)
         .text(timeStr, colTimeX + 6, currentY + 6);

      doc.fillColor(statusColor)
         .font('Helvetica-Bold')
         .text(statusStr, colStatusX + 6, currentY + 6);

      // Draw bottom border
      doc.moveTo(40, currentY + 20)
         .lineTo(555, currentY + 20)
         .strokeColor(borderColor)
         .stroke();

      currentY += 20;
    });

    // Page Footer
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fillColor('#9ca3af')
         .fontSize(8)
         .font('Helvetica')
         .text(
           `Page ${i + 1} of ${totalPages} - TrackFlow Attendance System`,
           40,
           800,
           { align: 'center', width: 515 }
         );
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { exportCSV, exportPDF };
