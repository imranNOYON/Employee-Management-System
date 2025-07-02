import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  date: { 
    type: String, 
    required: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: props => `${props.value} is not a valid date format (YYYY-MM-DD)`
    }
  },
  clockIn: { 
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v instanceof Date && !isNaN(v);
      },
      message: props => `${props.value} is not a valid date`
    }
  },
  clockOut: { 
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        if (!this.clockIn) return false;
        return v instanceof Date && !isNaN(v) && v > this.clockIn;
      },
      message: props => `Clock out must be after clock in`
    }
  },
  totalMinutes: { 
    type: Number,
    min: 0,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate records
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Virtual for status
attendanceSchema.virtual('status').get(function() {
  if (this.clockIn && this.clockOut) return 'clocked_out';
  if (this.clockIn && !this.clockOut) return 'clocked_in';
  return 'not_marked';
});

// Pre-save hook to calculate total minutes
attendanceSchema.pre('save', function(next) {
  if (this.clockIn && this.clockOut) {
    this.totalMinutes = Math.round((this.clockOut - this.clockIn) / (1000 * 60));
  }
  next();
});

// Add error handling for validation
attendanceSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Attendance record already exists for this date'));
  } else {
    next(error);
  }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;