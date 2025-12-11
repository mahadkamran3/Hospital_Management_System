# HospitaliaCare - Hospital Appointment Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) hospital appointment management system with Material-UI dark theme.

## Features

- User Authentication (JWT)
- Role-based Access Control (Admin/User)
- Appointment Booking & Management
- Admin Dashboard with Charts
- Doctor Management
- Dark Theme UI
- Pakistani Phone Number Validation

## Tech Stack

**Frontend:** React, Material-UI, Recharts, Axios, React Router  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB

### Setup

1. **Clone and install dependencies:**
```bash
cd hospitalia-care/backend
npm install

cd ../frontend
npm install
```

2. **Configure environment:**  
Create `.env` file in `backend/` folder:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_appointments
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

3. **Seed Database:**
```bash
cd backend
node seed.js
```

4. **Run Application:**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

5. **Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Login Credentials

| Role  | Email              | Password |
|-------|-------------------|----------|
| Admin | admin@hospital.pk | admin1   |
| User  | (any seeded user) | user123  |

## API Endpoints

**Auth:** `/api/auth` - register, login, logout, me  
**Appointments:** `/api/appointments` - CRUD operations  
**Admin:** `/api/admin` - dashboard, users management  
**Doctors:** `/api/doctors` - doctor management

## Project Structure

```
hospitalia-care/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── seed.js
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── services/
        └── theme/
```
