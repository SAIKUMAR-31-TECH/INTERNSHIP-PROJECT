const express = require('express');
const router = express.Router();
const {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getEmployees)
  .post(protect, adminOnly, createEmployee);

router
  .route('/:id')
  .put(protect, adminOnly, updateEmployee)
  .delete(protect, adminOnly, deleteEmployee);

module.exports = router;
