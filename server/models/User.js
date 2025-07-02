import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String },
  department: { type: String },
  role: { type: String, default: 'employee' },
  joiningDate: { type: Date },
  payrollStructure: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollStructure' },
});

const User = mongoose.model('User', userSchema);
export default User;
