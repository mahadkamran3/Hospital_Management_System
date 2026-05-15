process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_tests';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

let mongoServer;

const buildUser = async (overrides = {}) => {
  const data = {
    name: overrides.name || 'Test User',
    email: overrides.email || `user${Date.now()}@example.com`,
    password: overrides.password || 'Password1',
    role: overrides.role || 'user'
  };
  return await User.create(data);
};

const loginUser = async (email, password) => {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  return response.body.token;
};

const createAppointmentRecord = async (user, overrides = {}) => {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1);
  const appointment = new Appointment({
    patientName: overrides.patientName || 'Test Patient',
    doctorName: overrides.doctorName || 'Dr. Sample',
    date: overrides.date || defaultDate.toISOString().split('T')[0],
    time: overrides.time || '09:00 AM',
    department: overrides.department || 'General Medicine',
    phone: overrides.phone || '0300-1234567',
    notes: overrides.notes || 'Some notes',
    status: overrides.status || 'scheduled',
    createdBy: user._id
  });
  return await appointment.save();
};

const createDoctorRecord = async (adminUser, overrides = {}) => {
  const doctor = new Doctor({
    name: overrides.name || 'Dr. Tester',
    email: overrides.email || `doctor.${Date.now()}@example.com`,
    phone: overrides.phone || '0300-1234567',
    specialization: overrides.specialization || 'Cardiology',
    qualification: overrides.qualification || 'MBBS',
    experience: overrides.experience || 5,
    consultationFee: overrides.consultationFee || 2000,
    availableDays: overrides.availableDays || ['Monday', 'Tuesday', 'Wednesday'],
    availableTimeStart: overrides.availableTimeStart || '09:00 AM',
    availableTimeEnd: overrides.availableTimeEnd || '05:00 PM',
    createdBy: adminUser._id
  });
  return await doctor.save();
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'testdb' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Appointment.deleteMany({});
  await Doctor.deleteMany({});
});

describe('Backend API', () => {
  it('returns welcome payload at root and health endpoint', async () => {
    const root = await request(app).get('/');
    expect(root.status).toBe(200);
    expect(root.body.success).toBe(true);
    expect(root.body.message).toMatch(/Welcome to project/i);

    const health = await request(app).get('/health');
    expect(health.status).toBe(200);
    expect(health.body.success).toBe(true);
    expect(health.body.message).toContain('healthy');
  });

  describe('Auth routes', () => {
    it('registers a new user and returns a token', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Password1'
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('alice@example.com');
    });

    it('fails registration when validation is invalid', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'A',
        email: 'not-an-email',
        password: '123'
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('logs in an existing user and rejects invalid credentials', async () => {
      const user = await buildUser({ email: 'login@example.com', password: 'Password1' });
      const valid = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Password1' });
      expect(valid.status).toBe(200);
      expect(valid.body.token).toBeDefined();
      expect(valid.body.user.email).toBe(user.email);

      const invalid = await request(app).post('/api/auth/login').send({ email: user.email, password: 'wrongpass' });
      expect(invalid.status).toBe(401);
      expect(invalid.body.success).toBe(false);
    });

    it('returns authenticated user data with /me and accepts logout', async () => {
      const user = await buildUser({ email: 'me@example.com', password: 'Password1' });
      const token = await loginUser(user.email, 'Password1');

      const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect(me.status).toBe(200);
      expect(me.body.user.email).toBe(user.email);

      const logout = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
      expect(logout.status).toBe(200);
      expect(logout.body.success).toBe(true);
    });

    it('rejects requests without a bearer token', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/No token provided/i);
    });
  });

  describe('Appointment routes', () => {
    it('creates an appointment and prevents duplicate doctor schedule', async () => {
      const user = await buildUser({ email: 'appt@example.com', password: 'Password1' });
      const token = await loginUser(user.email, 'Password1');

      const appointmentData = {
        patientName: 'Patient X',
        doctorName: 'Dr. House',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '10:00 AM',
        department: 'Cardiology',
        phone: '0300-2345678',
        notes: 'First visit'
      };

      const createResponse = await request(app).post('/api/appointments').set('Authorization', `Bearer ${token}`).send(appointmentData);
      expect(createResponse.status).toBe(201);
      expect(createResponse.body.appointment.patientName).toBe('Patient X');

      const duplicate = await request(app).post('/api/appointments').set('Authorization', `Bearer ${token}`).send(appointmentData);
      expect(duplicate.status).toBe(400);
      expect(duplicate.body.message).toMatch(/already has an appointment/i);
    });

    it('rejects appointment creation with a past date', async () => {
      const user = await buildUser({ email: 'past@example.com', password: 'Password1' });
      const token = await loginUser(user.email, 'Password1');

      const response = await request(app).post('/api/appointments').set('Authorization', `Bearer ${token}`).send({
        patientName: 'Late Patient',
        doctorName: 'Dr. Time',
        date: '2000-01-01',
        time: '10:00 AM',
        department: 'Cardiology',
        phone: '0300-2345678'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/validation failed/i);
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.some(err => err.msg && /today or a future date/i.test(err.msg))).toBe(true);
    });

    it('returns only the authenticated user appointments for /api/appointments/my', async () => {
      const userA = await buildUser({ email: 'usera@example.com', password: 'Password1' });
      const userB = await buildUser({ email: 'userb@example.com', password: 'Password1' });
      await createAppointmentRecord(userA, { patientName: 'A Patient' });
      await createAppointmentRecord(userB, { patientName: 'B Patient' });

      const token = await loginUser(userA.email, 'Password1');
      const response = await request(app).get('/api/appointments/my').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.appointments[0].patientName).toBe('A Patient');
    });

    it('prevents viewing another user appointment by id', async () => {
      const userA = await buildUser({ email: 'owner@example.com', password: 'Password1' });
      const userB = await buildUser({ email: 'visitor@example.com', password: 'Password1' });
      const appointment = await createAppointmentRecord(userA, { patientName: 'Secret Patient' });

      const token = await loginUser(userB.email, 'Password1');
      const response = await request(app).get(`/api/appointments/${appointment._id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Access denied/i);
    });

    it('updates an appointment, changes status, and deletes it successfully', async () => {
      const user = await buildUser({ email: 'update@example.com', password: 'Password1' });
      const token = await loginUser(user.email, 'Password1');
      const appointment = await createAppointmentRecord(user, { patientName: 'Update Me' });

      const updateRes = await request(app).put(`/api/appointments/${appointment._id}`).set('Authorization', `Bearer ${token}`).send({ patientName: 'Updated Name', status: 'completed' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.appointment.patientName).toBe('Updated Name');
      expect(updateRes.body.appointment.status).toBe('completed');

      const statusRes = await request(app).patch(`/api/appointments/${appointment._id}/status`).set('Authorization', `Bearer ${token}`).send({ status: 'cancelled' });
      expect(statusRes.status).toBe(200);
      expect(statusRes.body.appointment.status).toBe('cancelled');

      const deleteRes = await request(app).delete(`/api/appointments/${appointment._id}`).set('Authorization', `Bearer ${token}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toMatch(/deleted successfully/i);
    });
  });

  describe('Doctor routes', () => {
    it('allows authenticated users to list active doctors', async () => {
      const user = await buildUser({ email: 'listdoc@example.com', password: 'Password1' });
      const token = await loginUser(user.email, 'Password1');
      await createDoctorRecord(user, { isActive: true });

      const response = await request(app).get('/api/doctors').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
    });

    it('requires admin privileges to create, update, delete, and toggle doctor status', async () => {
      const admin = await buildUser({ email: 'admindoc@example.com', password: 'Password1', role: 'admin' });
      const adminToken = await loginUser(admin.email, 'Password1');
      const doctorData = {
        name: 'Dr. Admin',
        email: 'dr.admin@example.com',
        phone: '0300-7654321',
        specialization: 'Dermatology',
        qualification: 'MBBS',
        experience: 8,
        consultationFee: 2500
      };

      const createRes = await request(app).post('/api/doctors').set('Authorization', `Bearer ${adminToken}`).send(doctorData);
      expect(createRes.status).toBe(201);
      expect(createRes.body.doctor.name).toBe('Dr. Admin');

      const doctorId = createRes.body.doctor._id;
      const updateRes = await request(app).put(`/api/doctors/${doctorId}`).set('Authorization', `Bearer ${adminToken}`).send({ consultationFee: 3000 });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.doctor.consultationFee).toBe(3000);

      const toggleRes = await request(app).patch(`/api/doctors/${doctorId}/toggle-status`).set('Authorization', `Bearer ${adminToken}`);
      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.doctor.isActive).toBe(false);

      const deleteRes = await request(app).delete(`/api/doctors/${doctorId}`).set('Authorization', `Bearer ${adminToken}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toMatch(/deleted successfully/i);
    });
  });

  describe('Admin routes', () => {
    it('returns dashboard and user listings only for admin users', async () => {
      const admin = await buildUser({ email: 'adminroute@example.com', password: 'Password1', role: 'admin' });
      const user = await buildUser({ email: 'normal@example.com', password: 'Password1', role: 'user' });
      const adminToken = await loginUser(admin.email, 'Password1');
      const userToken = await loginUser(user.email, 'Password1');

      const dashboard = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${adminToken}`);
      expect(dashboard.status).toBe(200);
      expect(dashboard.body.success).toBe(true);
      expect(dashboard.body.dashboard).toBeDefined();

      const users = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
      expect(users.status).toBe(200);
      expect(users.body.totalCount).toBe(2);

      const forbidden = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${userToken}`);
      expect(forbidden.status).toBe(403);
    });

    it('fetches a user and prevents self-role/removal mistakes', async () => {
      const admin = await buildUser({ email: 'admin2@example.com', password: 'Password1', role: 'admin' });
      const user = await buildUser({ email: 'user2@example.com', password: 'Password1' });
      const adminToken = await loginUser(admin.email, 'Password1');

      const detail = await request(app).get(`/api/admin/users/${user._id}`).set('Authorization', `Bearer ${adminToken}`);
      expect(detail.status).toBe(200);
      expect(detail.body.user.email).toBe(user.email);

      const selfRole = await request(app).put(`/api/admin/users/${admin._id}/role`).set('Authorization', `Bearer ${adminToken}`).send({ role: 'user' });
      expect(selfRole.status).toBe(400);
      expect(selfRole.body.message).toMatch(/cannot change your own admin role/i);

      const invalidRole = await request(app).put(`/api/admin/users/${user._id}/role`).set('Authorization', `Bearer ${adminToken}`).send({ role: 'invalid' });
      expect(invalidRole.status).toBe(400);

      const roleUpdate = await request(app).put(`/api/admin/users/${user._id}/role`).set('Authorization', `Bearer ${adminToken}`).send({ role: 'admin' });
      expect(roleUpdate.status).toBe(200);
      expect(roleUpdate.body.user.role).toBe('admin');

      const selfDelete = await request(app).delete(`/api/admin/users/${admin._id}`).set('Authorization', `Bearer ${adminToken}`);
      expect(selfDelete.status).toBe(400);
      expect(selfDelete.body.message).toMatch(/cannot delete your own account/i);

      const deleteUser = await request(app).delete(`/api/admin/users/${user._id}`).set('Authorization', `Bearer ${adminToken}`);
      expect(deleteUser.status).toBe(200);
      expect(deleteUser.body.success).toBe(true);
    });
  });

  describe('Model and validation behavior', () => {
    it('hashes passwords and comparePassword returns true for correct passwords', async () => {
      const user = await buildUser({ email: 'hash@example.com', password: 'Password1' });
      expect(user.password).not.toBe('Password1');
      const compare = await user.comparePassword('Password1');
      expect(compare).toBe(true);
    });

    it('fails to create a doctor with invalid specialization', async () => {
      const admin = await buildUser({ email: 'admin3@example.com', password: 'Password1', role: 'admin' });
      const token = await loginUser(admin.email, 'Password1');
      const response = await request(app).post('/api/doctors').set('Authorization', `Bearer ${token}`).send({
        name: 'Dr. Invalid',
        phone: '0300-1234567',
        specialization: 'InvalidSpecialty',
        qualification: 'MBBS',
        experience: 2,
        consultationFee: 1500
      });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
