import Attendance from '../models/Attendance.js';
import mongoose from 'mongoose';

export async function clockIn(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const employeeId = req.user.id;
    const date = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Check for existing incomplete record
    const existingRecord = await Attendance.findOne({
      employeeId,
      date,
      clockIn: { $exists: true },
      clockOut: { $exists: false }
    }).session(session);

    if (existingRecord) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'You have already clocked in today without clocking out'
      });
    }

    // Create or update record
    let record = await Attendance.findOne({ employeeId, date }).session(session);
    
    if (!record) {
      record = new Attendance({
        employeeId,
        date,
        clockIn: now
      });
    } else if (!record.clockIn) {
      record.clockIn = now;
    } else {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Clock in already recorded for today'
      });
    }

    await record.save({ session });
    await session.commitTransaction();
    
    res.json({
      success: true,
      message: 'Clock in successful',
      data: {
        _id: record._id,
        date: record.date,
        clockIn: record.clockIn,
        employeeId: record.employeeId
      }
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Clock In Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during clock in',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  } finally {
    session.endSession();
  }
}

export async function clockOut(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const employeeId = req.user.id;
    const date = new Date().toISOString().split('T')[0];
    const now = new Date();

    const record = await Attendance.findOne({
      employeeId,
      date,
      clockIn: { $exists: true }
    }).session(session);

    if (!record) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please clock in first before clocking out'
      });
    }

    if (record.clockOut) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'You have already clocked out today'
      });
    }

    record.clockOut = now;
    record.totalMinutes = Math.round((record.clockOut - record.clockIn) / (1000 * 60));
    
    await record.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Clock out successful',
      data: {
        _id: record._id,
        date: record.date,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        totalMinutes: record.totalMinutes,
        employeeId: record.employeeId
      }
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Clock Out Error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during clock out',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  } finally {
    session.endSession();
  }
}

export async function getAttendance(req, res) {
  try {
    const records = await Attendance.find({ employeeId: req.user.id })
      .sort({ date: -1 })
      .lean();

    res.json({
      success: true,
      records: records || [] // Fixed: Direct records array instead of nested data
    });
  } catch (err) {
    console.error('Get Attendance Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance records',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

export async function getAttendanceHistory(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const records = await Attendance.find({ employeeId: req.user.id })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      records: records || [] // Fixed: Direct records array
    });
  } catch (err) {
    console.error('Get Attendance History Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance history',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

export async function getAllAttendance(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Attendance.find()
        .populate('employeeId', 'name email')
        .sort({ date: -1, clockIn: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments()
    ]);

    const totalPages = Math.ceil(total / limit);

    // Fixed: Match frontend expectation
    res.json({
      success: true,
      records: records || [],
      total,
      totalPages,
      currentPage: page,
      pageSize: limit
    });
  } catch (err) {
    console.error('Get All Attendance Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get all attendance records',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}