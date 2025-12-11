const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/dashboard', [auth, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalDoctors = await Doctor.countDocuments({ isActive: true });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysAppointments = await Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } });
    
    const scheduledAppointments = await Appointment.countDocuments({ status: 'scheduled' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    
    const departmentStats = await Appointment.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const statusStats = [
      { _id: 'scheduled', count: scheduledAppointments, color: '#00bfa5' },
      { _id: 'completed', count: completedAppointments, color: '#4caf50' },
      { _id: 'cancelled', count: cancelledAppointments, color: '#ff5252' }
    ];
    
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const count = await Appointment.countDocuments({ date: { $gte: date, $lt: nextDate } });
      weeklyData.push({
        day: date.toLocaleDateString('en-PK', { weekday: 'short' }),
        date: date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }),
        count
      });
    }
    
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const count = await Appointment.countDocuments({ date: { $gte: startOfMonth, $lte: endOfMonth } });
      monthlyData.push({
        month: startOfMonth.toLocaleDateString('en-PK', { month: 'short' }),
        year: startOfMonth.getFullYear(),
        count
      });
    }
    
    const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(10).populate('createdBy', 'name email');
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingAppointments = await Appointment.find({ date: { $gte: today, $lte: nextWeek }, status: 'scheduled' }).sort({ date: 1, time: 1 }).limit(10).populate('createdBy', 'name email');
    
    const adminCount = await User.countDocuments({ role: 'admin' });
    const regularUserCount = await User.countDocuments({ role: 'user' });
    
    const doctorsBySpecialization = await Doctor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const topDoctors = await Appointment.aggregate([
      { $group: { _id: '$doctorName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      dashboard: {
        totalUsers, totalAppointments, totalDoctors, todaysAppointments,
        statusBreakdown: { scheduled: scheduledAppointments, completed: completedAppointments, cancelled: cancelledAppointments },
        charts: { departmentStats, statusStats, weeklyData, monthlyData, doctorsBySpecialization, topDoctors },
        recentAppointments, upcomingAppointments,
        userRoles: { admins: adminCount, users: regularUserCount }
      }
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching dashboard data' });
  }
});

router.get('/users', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') query.role = role;
    
    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

    res.json({
      success: true,
      count: users.length,
      totalCount: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching users' });
  }
});

router.get('/users/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const appointments = await Appointment.find({ createdBy: user._id }).sort({ date: -1 }).limit(20);
    const stats = {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length
    };
    
    res.json({ success: true, user, appointments, stats });
  } catch (error) {
    console.error('Get User Error:', error);
    if (error.kind === 'ObjectId') return res.status(400).json({ success: false, message: 'Invalid user ID' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id/role', [auth, admin], async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (req.user._id.toString() === req.params.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot change your own admin role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error) {
    console.error('Update Role Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/users/:id', [auth, admin], async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await Appointment.deleteMany({ createdBy: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
