const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    minlength: [2, 'Patient name must be at least 2 characters'],
    maxlength: [100, 'Patient name cannot exceed 100 characters']
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Appointment date is required']
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Medicine', 'Gynecology', 'Dermatology', 'ENT', 'Ophthalmology'],
      message: '{VALUE} is not a valid department'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['scheduled', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'scheduled'
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^0[0-9]{3}-[0-9]{7}$/, 'Please enter a valid Pakistani phone number (e.g., 0300-1234567)']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

appointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

appointmentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
