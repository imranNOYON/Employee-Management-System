import express from 'express';
import {
  getStructures,
  createStructure,
  updateStructure,
  deleteStructure,
  assignPayrollStructure,
  getEmployeePayroll
} from '../controllers/payrollController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.get('/', protect, adminOnly, getStructures);
router.post('/', protect, adminOnly, createStructure);
router.put('/assign', protect, adminOnly, assignPayrollStructure);
router.put('/:id', protect, adminOnly, updateStructure);
router.delete('/:id', protect, adminOnly, deleteStructure);

// Employee route
router.get('/employee', protect, getEmployeePayroll);

export default router;
