// backend/controllers/employeeController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, company, department } = req.body;
    const updated = await User.findByIdAndUpdate(
      userId,
      { name, company, department },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}
// backend/controllers/employeeController.js


export async function getAllEmployees(req, res) {
  try {
    const employees = await User.find().select('-password').populate('payrollStructure');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createEmployee(req, res) {
  try {
    const { name, email, password, company, department, role, joiningDate } = req.body;
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, company, department, role, joiningDate });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}


