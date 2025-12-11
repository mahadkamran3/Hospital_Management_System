const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', auth, async (req, res) => {
  try {
    const { specialization, search, limit = 50 } = req.query;
    let query = { isActive: true };
    
    if (specialization && specialization !== 'all') query.specialization = specialization;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const doctors = await Doctor.find(query).select('-__v').sort({ name: 1 }).limit(parseInt(limit));
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching doctors' });
  }
});

router.get('/all', auth, admin, async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-__v').populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    console.error('Error fetching all doctors:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching doctors' });
  }
});

router.get('/stats', auth, admin, async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ isActive: true });
    const inactiveDoctors = await Doctor.countDocuments({ isActive: false });
    
    const bySpecialization = await Doctor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({ success: true, stats: { total: totalDoctors, active: activeDoctors, inactive: inactiveDoctors, bySpecialization } });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching statistics' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-__v');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    if (error.kind === 'ObjectId') return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    res.status(500).json({ success: false, message: 'Server error while fetching doctor' });
  }
});

router.post('/', auth, admin, async (req, res) => {
  try {
    const { name, email, phone, specialization, qualification, experience, consultationFee, availableDays, availableTimeStart, availableTimeEnd } = req.body;
    
    if (!name || !phone || !specialization || !qualification || experience === undefined || !consultationFee) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    
    const existingDoctor = await Doctor.findOne({ phone });
    if (existingDoctor) return res.status(400).json({ success: false, message: 'A doctor with this phone number already exists' });
    
    if (email) {
      const emailExists = await Doctor.findOne({ email });
      if (emailExists) return res.status(400).json({ success: false, message: 'A doctor with this email already exists' });
    }
    
    const doctor = new Doctor({
      name, email, phone, specialization, qualification, experience, consultationFee, availableDays, availableTimeStart, availableTimeEnd, createdBy: req.user.id
    });
    
    await doctor.save();
    res.status(201).json({ success: true, message: 'Doctor added successfully', doctor });
  } catch (error) {
    console.error('Error creating doctor:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error while creating doctor' });
  }
});

router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { name, email, phone, specialization, qualification, experience, consultationFee, availableDays, availableTimeStart, availableTimeEnd, isActive } = req.body;
    
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    
    if (phone && phone !== doctor.phone) {
      const phoneExists = await Doctor.findOne({ phone, _id: { $ne: req.params.id } });
      if (phoneExists) return res.status(400).json({ success: false, message: 'Another doctor with this phone already exists' });
    }
    
    if (email && email !== doctor.email) {
      const emailExists = await Doctor.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) return res.status(400).json({ success: false, message: 'Another doctor with this email already exists' });
    }
    
    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, {
      name: name || doctor.name,
      email: email !== undefined ? email : doctor.email,
      phone: phone || doctor.phone,
      specialization: specialization || doctor.specialization,
      qualification: qualification || doctor.qualification,
      experience: experience !== undefined ? experience : doctor.experience,
      consultationFee: consultationFee !== undefined ? consultationFee : doctor.consultationFee,
      availableDays: availableDays || doctor.availableDays,
      availableTimeStart: availableTimeStart || doctor.availableTimeStart,
      availableTimeEnd: availableTimeEnd || doctor.availableTimeEnd,
      isActive: isActive !== undefined ? isActive : doctor.isActive
    }, { new: true, runValidators: true });
    
    res.json({ success: true, message: 'Doctor updated successfully', doctor: updatedDoctor });
  } catch (error) {
    console.error('Error updating doctor:', error);
    if (error.kind === 'ObjectId') return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error while updating doctor' });
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    if (error.kind === 'ObjectId') return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    res.status(500).json({ success: false, message: 'Server error while deleting doctor' });
  }
});

router.patch('/:id/toggle-status', auth, admin, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    
    doctor.isActive = !doctor.isActive;
    await doctor.save();
    
    res.json({ success: true, message: `Doctor ${doctor.isActive ? 'activated' : 'deactivated'} successfully`, doctor });
  } catch (error) {
    console.error('Error toggling doctor status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
