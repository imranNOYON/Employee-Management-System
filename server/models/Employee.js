// backend/models/Employee.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  company: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee'
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  payrollStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollStructure'
  }
}, {
  timestamps: true
});

export default mongoose.model('Employee', employeeSchema);