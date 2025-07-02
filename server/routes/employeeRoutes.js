// backend/routes/employeeRoutes.js
import express from 'express';
import { getProfile, updateProfile, getAllEmployees, createEmployee, deleteEmployee } from '../controllers/employeeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Employee profile (any authenticated user)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin: list all employees
router.get('/all', protect, adminOnly, getAllEmployees);
// Admin: add employee
router.post('/', protect, adminOnly, createEmployee);
// Admin: delete employee
router.delete('/:id', protect, adminOnly, deleteEmployee);



export default router;
