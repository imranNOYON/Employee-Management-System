import mongoose from 'mongoose';

const headSchema = new mongoose.Schema({
  name: { type: String, required: true },        // e.g. "Basic Salary"
  type: { type: String, enum: ['allowance', 'deduction'], required: true },
  percentage: { type: Number, min: 0, max: 100 },
  fixedAmount: { type: Number, min: 0 },
});

const payrollStructureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  heads: { type: [headSchema], default: [] },
}, {
  timestamps: true
});

export default mongoose.model('PayrollStructure', payrollStructureSchema);
