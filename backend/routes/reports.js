const express = require('express');
const router = express.Router();
const { exportCSV, exportPDF } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/export/csv', protect, adminOnly, exportCSV);
router.get('/export/pdf', protect, adminOnly, exportPDF);

module.exports = router;
