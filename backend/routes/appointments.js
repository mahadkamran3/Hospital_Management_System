const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');

// Fallback time slots used when client does not supply a time
const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
];

const isDateTodayOrFuture = (dateString) => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate >= today;
};

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }
    
    const { status, department, startDate, endDate, search } = req.query;
    
    if (status && status !== 'all') query.status = status;
    if (department && department !== 'all') query.department = department;
    if (startDate) query.date = { ...query.date, $gte: new Date(startDate) };
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const appointments = await Appointment.find(query).sort({ date: 1, time: 1 }).populate('createdBy', 'name email');

    res.json({
      success: true,
      count: appointments.length,
      appointments,
      message: req.user.role !== 'admin' ? 'Showing your appointments only' : 'Showing all appointments (Admin view)'
    });
  } catch (error) {
    console.error('Get Appointments Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching appointments' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ createdBy: req.user._id }).sort({ date: 1, time: 1 }).populate('createdBy', 'name email');
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    console.error('Get My Appointments Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching your appointments' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role !== 'admin') matchQuery.createdBy = req.user._id;
    
    const stats = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          scheduled: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);
    
    const result = stats[0] || { total: 0, scheduled: 0, completed: 0, cancelled: 0 };
    res.json({ success: true, stats: result });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching statistics' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('createdBy', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    if (req.user.role !== 'admin' && appointment.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own appointments.' });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Get Appointment Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error while fetching appointment' });
  }
});

router.post('/', [
  auth,
  body('patientName').trim().notEmpty().withMessage('Patient name is required').isLength({ min: 2, max: 100 }),
  body('doctorName').trim().notEmpty().withMessage('Doctor name is required'),
  body('date').notEmpty().withMessage('Appointment date is required').custom((value) => {
    if (!isDateTodayOrFuture(value)) throw new Error('Appointment date must be today or a future date');
    return true;
  }),
  // time is optional; server will assign a random time if missing
  body('department').notEmpty().isIn(['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Medicine', 'Gynecology', 'Dermatology', 'ENT', 'Ophthalmology']),
  body('phone').notEmpty().matches(/^0[0-9]{3}-[0-9]{7}$/).withMessage('Please enter a valid Pakistani phone number (e.g., 0300-1234567)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    let { patientName, doctorName, date, time, department, phone, notes, status } = req.body;
    
    if (!isDateTodayOrFuture(date)) {
      return res.status(400).json({ success: false, message: 'Appointment date must be today or a future date' });
    }

    // If client did not provide a time, assign a random one from TIME_SLOTS
    if (!time) {
      time = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
      console.log('Server: assigned random time slot', time);
    }

    const existingAppointment = await Appointment.findOne({ doctorName, date: new Date(date), time });
    if (existingAppointment) {
      return res.status(400).json({ success: false, message: `Dr. ${doctorName} already has an appointment at ${time} on this date` });
    }

    // Check if doctor exists and has available slots
    const doctor = await Doctor.findOne({ name: doctorName });
    if (!doctor) {
      return res.status(404).json({ success: false, message: `Doctor '${doctorName}' not found in the system` });
    }
    
    if (doctor.availableSlots <= 0) {
      return res.status(400).json({ success: false, message: `Dr. ${doctorName} has no available appointment slots` });
    }

    const appointment = new Appointment({
      patientName, doctorName, date: new Date(date), time, department, phone, notes: notes || '', status: status || 'scheduled', createdBy: req.user._id
    });

    await appointment.save();
    
    // Decrement available slots for the doctor
    doctor.availableSlots -= 1;
    await doctor.save();
    
    await appointment.populate('createdBy', 'name email');

    res.status(201).json({ success: true, message: 'Appointment created successfully', appointment });
  } catch (error) {
    console.error('Create Appointment Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error while creating appointment' });
  }
});

router.put('/:id', [
  auth,
  body('patientName').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().matches(/^0[0-9]{3}-[0-9]{7}$/),
  body('department').optional().isIn(['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Medicine', 'Gynecology', 'Dermatology', 'ENT', 'Ophthalmology']),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled']),
  body('date').optional().custom((value) => {
    if (value && !isDateTodayOrFuture(value)) throw new Error('Appointment date must be today or a future date');
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const existingAppointment = await Appointment.findById(req.params.id);
    
    if (!existingAppointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    if (req.user.role !== 'admin' && existingAppointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only update your own appointments.' });
    }

    const { patientName, doctorName, date, time, department, phone, notes, status } = req.body;

    if (date && !isDateTodayOrFuture(date)) {
      return res.status(400).json({ success: false, message: 'Appointment date must be today or a future date' });
    }

    const updateFields = {};
    if (patientName) updateFields.patientName = patientName;
    if (doctorName) updateFields.doctorName = doctorName;
    if (date) updateFields.date = new Date(date);
    if (time) updateFields.time = time;
    if (department) updateFields.department = department;
    if (phone) updateFields.phone = phone;
    if (notes !== undefined) updateFields.notes = notes;
    if (status) updateFields.status = status;

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true, runValidators: true }).populate('createdBy', 'name email');

    res.json({ success: true, message: 'Appointment updated successfully', appointment });
  } catch (error) {
    console.error('Update Appointment Error:', error);
    if (error.kind === 'ObjectId') return res.status(400).json({ success: false, message: 'Invalid appointment ID format' });
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error while updating appointment' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    if (req.user.role !== 'admin' && appointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own appointments.' });
    }
    
    // Restore available slots for the doctor
    const doctor = await Doctor.findOne({ name: appointment.doctorName });
    if (doctor) {
      doctor.availableSlots += 1;
      await doctor.save();
    }
    
    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete Appointment Error:', error);
    if (error.kind === 'ObjectId') return res.status(400).json({ success: false, message: 'Invalid appointment ID format' });
    res.status(500).json({ success: false, message: 'Server error while deleting appointment' });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    if (req.user.role !== 'admin' && appointment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    appointment.status = status;
    await appointment.save();
    await appointment.populate('createdBy', 'name email');
    
    res.json({ success: true, message: `Status updated to ${status}`, appointment });
  } catch (error) {
    console.error('Update Status Error:', error);
    if (error.kind === 'ObjectId') return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
