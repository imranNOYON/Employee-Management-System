import express from 'express';
import {
  clockIn,
  clockOut,
  getAttendance,
  getAttendanceHistory,
  getAllAttendance
} from '../controllers/attendanceController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add error handling middleware for attendance routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// User routes
router.post('/clock-in', protect, asyncHandler(clockIn));
router.post('/clock-out', protect, asyncHandler(clockOut));
router.get('/', protect, asyncHandler(getAttendance));
router.get('/history', protect, asyncHandler(getAttendanceHistory));

// Admin routes
router.get('/all', protect, adminOnly, asyncHandler(getAllAttendance));

// Error handling middleware specific to attendance routes
router.use((error, req, res, next) => {
  console.error('Attendance Route Error:', error);
  
  // Handle specific MongoDB errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate attendance record for this date'
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default router;