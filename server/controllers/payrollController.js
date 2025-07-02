import PayrollStructure from '../models/PayrollStructure.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import mongoose from 'mongoose';

export async function getStructures(req, res) {
  try {
    const structures = await PayrollStructure.find();
    res.json(structures);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createStructure(req, res) {
  try {
    const { name, heads } = req.body;
    if (!name || !Array.isArray(heads) || heads.length === 0) {
      return res.status(400).json({ message: 'Name and at least one head required' });
    }
    const structure = new PayrollStructure({ name, heads });
    await structure.save();
    res.status(201).json(structure);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
}

export async function updateStructure(req, res) {
  try {
    const updated = await PayrollStructure.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Payroll structure not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
}

export async function deleteStructure(req, res) {
  try {
    const deleted = await PayrollStructure.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Structure not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
}

export async function assignPayrollStructure(req, res) {
  try {
    const { employeeId, payrollStructureId } = req.body;

    if (!employeeId || !payrollStructureId) {
      return res.status(400).json({ message: 'employeeId and payrollStructureId are required' });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid employeeId format' });
    }
    if (!mongoose.Types.ObjectId.isValid(payrollStructureId)) {
      return res.status(400).json({ message: 'Invalid payrollStructureId format' });
    }

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if payroll structure exists
    const payrollStructure = await PayrollStructure.findById(payrollStructureId);
    if (!payrollStructure) {
      return res.status(404).json({ message: 'Payroll structure not found' });
    }

    const user = await User.findByIdAndUpdate(
      employeeId,
      { payrollStructure: payrollStructureId },
      { new: true, runValidators: true }
    ).select('-password').populate('payrollStructure');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Payroll structure assigned successfully', user });
  } catch (err) {
    console.error('Assign payroll structure error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function getEmployeePayroll(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('payrollStructure');

    if (!user || !user.payrollStructure) {
      return res.status(404).json({ message: 'Payroll structure not assigned' });
    }

    // Date range: first to last day of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      employeeId: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    let totalMinutes = 0;
    attendance.forEach(a => {
      if (a.totalMinutes) totalMinutes += a.totalMinutes;
    });

    res.json({
      payrollStructure: user.payrollStructure,
      totalMinutes,
      attendanceCount: attendance.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
