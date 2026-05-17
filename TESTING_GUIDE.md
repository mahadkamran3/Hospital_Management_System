# Hospital Appointment Management System - Quick Start Guide

## System Requirements

- Node.js (v14+)
- MongoDB (Local or Atlas)
- React 18+
- npm or yarn package manager

## Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

**Create `.env` file** in backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/hospital_appointments
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

**Start MongoDB** (if local):
```bash
mongod
```

**Start Backend Server**:
```bash
npm start
# Or for development with auto-reload
npm run dev
```

Backend should run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend should run on `http://localhost:5173`

### 3. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This will populate the database with sample doctors and data.

---

## Testing New Features

### Feature 1: Doctor Registration with Available Slots

#### Manual Testing:

1. **Login as Admin**:
   - Go to http://localhost:5173/login
   - Use test admin credentials (from seed data)
   - Navigate to Admin Dashboard

2. **Register Doctor**:
   - Click "Add Doctor" button
   - Fill in all required fields:
     - Name: "Dr. Ahmed Khan"
     - Specialization: "Cardiology"
     - Phone: "0300-1234567"
     - Experience: "10"
     - Consultation Fee: "2000"
     - **Available Slots: 5** (NEW FIELD)
   - Click "Save"
   - Verify doctor is added with correct slots

#### API Testing:

```bash
# Create doctor with availableSlots
curl -X POST http://localhost:5000/api/doctors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Ahmed Khan",
    "specialization": "Cardiology",
    "phone": "0300-1234567",
    "experience": 10,
    "consultationFee": 2000,
    "availableSlots": 5
  }'
```

---

### Feature 2: Appointment Booking with Slot Management

#### Manual Testing:

1. **Navigate to Appointments Page**:
   - Click "Appointments" in navbar
   - Click "Book New Appointment"

2. **Book Appointment**:
   - Select Doctor Name
   - Enter Patient Name
   - Select Date (today or future)
   - System will check availableSlots
   - Click "Book"
   - **Verify**: Doctor's availableSlots decreased by 1

3. **Verify Slot Decrease**:
   - Go to Doctor Report
   - Search for the doctor
   - Confirm availableSlots = previous - 1

#### Testing Full Slots:

1. Continue booking appointments until availableSlots = 0
2. Try to book one more
3. **Verify Error**: "No available appointment slots"

#### API Testing:

```bash
# Book appointment
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "John Doe",
    "doctorName": "Dr. Ahmed Khan",
    "date": "2025-01-20",
    "department": "Cardiology",
    "phone": "0300-9876543"
  }'
```

---

### Feature 3: Appointment Cancellation & Slot Restoration

#### Manual Testing:

1. **View Appointments**:
   - Go to Appointments page
   - Find a booked appointment

2. **Cancel Appointment**:
   - Click "Cancel" button
   - Confirm cancellation
   - **Verify Success Message**

3. **Verify Slot Increase**:
   - Go to Doctor Report
   - Search for same doctor
   - **Confirm**: availableSlots increased by 1

#### API Testing:

```bash
# Cancel appointment
curl -X DELETE http://localhost:5000/api/appointments/APPOINTMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Feature 4: Doctor Report Page

#### Accessing Doctor Report:

1. **Navigate to Report**:
   - Click "Report" in navbar
   - Or go to `http://localhost:5173/doctor-report`

2. **View Report Features**:
   - ✅ Total doctors count card
   - ✅ Total available slots card
   - ✅ Average slots per doctor card
   - ✅ Average experience card
   - ✅ Comprehensive doctor table with:
     - Doctor ID
     - Name
     - Specialization (chip)
     - Available Slots (color-coded)
     - Contact
     - Experience
     - Qualification
     - Consultation Fee

#### Testing Filters & Sorting:

1. **Filter by Specialization**:
   - Select specialization from dropdown
   - Table updates to show only that specialization

2. **Sort Options**:
   - Click "Sort By" dropdown
   - Try sorting by:
     - Name (A-Z)
     - Specialization
     - Available Slots (highest first)
     - Experience (highest first)

3. **Search by Doctor ID**:
   - Copy a Doctor ID from table (e.g., "507f1f77bcf86cd799439011")
   - Paste in search box
   - Table filters to show only that doctor

4. **CSV Export**:
   - Click "Download" button
   - Verify CSV file downloads with all doctor data

#### Slot Status Indicators:

Color coding for available slots:
- 🟢 **Green (Success)**: 10+ slots
- 🟡 **Yellow (Warning)**: 5-9 slots
- 🔴 **Red (Error)**: 1-4 slots
- ⚫ **Full**: 0 slots

---

### Feature 5: Doctor Search by ID

#### Accessing Search Page:

1. **Navigate to Search**:
   - Click "Search" in navbar
   - Or go to `http://localhost:5173/search-doctor`

2. **Search for Doctor**:
   - Copy Doctor ID from Doctor Report
   - Paste in search box
   - Click "Search"

3. **View Doctor Details**:
   - Doctor ID (full ID displayed)
   - Name with specialization chips
   - Contact information (phone, email)
   - Experience and qualification
   - Consultation fee
   - Available appointment slots with status

#### Testing Error Cases:

1. **Empty Search**:
   - Try searching without ID
   - **Verify Error**: "Please enter a Doctor ID"

2. **Invalid ID**:
   - Enter random text
   - **Verify Error**: "Doctor not found"

3. **Inactive Doctor**:
   - Deactivate a doctor from admin
   - Try searching
   - **Verify Error**: "Doctor is inactive"

#### Testing Appointment Booking:

1. **Find Doctor with Slots**:
   - Search for a doctor
   - Verify availableSlots > 0

2. **Click "Book Appointment"**:
   - Click button in search results
   - Dialog appears with doctor info
   - Click "Proceed to Booking"
   - Redirects to appointment booking page
   - Doctor name pre-filled

#### API Testing:

```bash
# Search doctor by ID
curl -X GET http://localhost:5000/api/doctors/search/by-id/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Feature 6: Logout (Exit)

#### Manual Testing:

1. **Click User Avatar** in navbar (top right)
2. **Select "Logout"** from dropdown
3. **Verify**:
   - Redirected to login page
   - Token removed from localStorage
   - Cannot access protected routes

---

## Test Scenarios

### Scenario 1: Complete Booking Flow

```
1. Create doctor with 3 available slots
2. Book appointment #1 → slots = 2
3. Book appointment #2 → slots = 1
4. Book appointment #3 → slots = 0
5. Try to book #4 → Error: No available slots
6. Cancel appointment #1 → slots = 1
7. Book new appointment → slots = 0
```

### Scenario 2: Doctor Report Analysis

```
1. View Doctor Report page
2. Filter by "Cardiology" specialization
3. Sort by "Available Slots" (highest first)
4. Note total available slots in filtered view
5. Export as CSV
6. Verify CSV contains correct data
```

### Scenario 3: Search & Book

```
1. Go to Doctor Search page
2. Get a doctor ID from report
3. Search for that doctor
4. View full details
5. Click "Book Appointment"
6. Complete booking
7. Return to report - verify slots decreased
```

---

## Database Verification

### Check Doctor with Slots:

```javascript
// In MongoDB client or Compass:
db.doctors.findOne({name: "Dr. Ahmed Khan"})

// Output should include:
// "availableSlots": 5
```

### Check Appointments:

```javascript
db.appointments.find({doctorName: "Dr. Ahmed Khan"})

// Count appointments to match slot reduction
```

---

## Common Issues & Solutions

### Issue 1: "Doctor has no available slots"
**Solution**: 
- Check availableSlots in Doctor Report
- Cancel some appointments to free slots
- Or edit doctor to increase slots

### Issue 2: Slots don't update after booking
**Solution**:
- Refresh the page (F5)
- Clear browser cache
- Check backend logs for errors

### Issue 3: Search returns no results
**Solution**:
- Verify you copied the full Doctor ID correctly
- Check doctor status (must be active)
- Ensure backend is running

### Issue 4: CSV Export downloads empty file
**Solution**:
- Verify doctors exist in database
- Clear filters and try again
- Check browser console for errors

---

## Performance Testing

### Load Testing Doctor Report:

1. Create 100+ doctors in database
2. Go to Doctor Report
3. Test filtering/sorting performance
4. Monitor network tab in Dev Tools

### Concurrent Bookings:

1. Open 2 browser tabs
2. Both try to book last available slot
3. One should fail with error
4. Verify database consistency

---

## Validation Rules

### Doctor Registration:
- ✅ Name: 2-100 characters
- ✅ Phone: Must be unique, Pakistani format (0300-1234567)
- ✅ Experience: 0-60 years
- ✅ Available Slots: Minimum 1

### Appointment Booking:
- ✅ Patient Name: 2-100 characters
- ✅ Date: Must be today or future
- ✅ Phone: Pakistani format
- ✅ Doctor Must Exist
- ✅ Must Have Available Slots

---

## Useful MongoDB Queries

```javascript
// Get all doctors with slot count
db.doctors.find({}, {name: 1, specialization: 1, availableSlots: 1})

// Get doctors with no available slots
db.doctors.find({availableSlots: 0})

// Get total slots across all doctors
db.doctors.aggregate([{$group: {_id: null, totalSlots: {$sum: "$availableSlots"}}}])

// Get appointments for specific doctor
db.appointments.find({doctorName: "Dr. Ahmed Khan"})

// Get appointment statistics
db.appointments.aggregate([
  {$group: {_id: "$status", count: {$sum: 1}}}
])
```

---

## API Collection (Postman)

You can import this into Postman:

```json
{
  "info": {
    "name": "Hospital API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Doctor",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/doctors",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "body": {
          "mode": "raw",
          "raw": "{\"name\": \"Dr. Test\", \"specialization\": \"Cardiology\", \"phone\": \"0300-1234567\", \"experience\": 5, \"consultationFee\": 2000, \"availableSlots\": 10}"
        }
      }
    },
    {
      "name": "Book Appointment",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/appointments"
      }
    },
    {
      "name": "Get Doctor Report",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/doctors/report/all"
      }
    },
    {
      "name": "Search Doctor",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/doctors/search/by-id/{{doctorId}}"
      }
    }
  ]
}
```

---

## Success Checklist

- ✅ Doctor Registration with Available Slots
- ✅ Appointment Booking decrements slots
- ✅ Appointment Cancellation increases slots
- ✅ Doctor Report displays all information
- ✅ Doctor Report has filtering and sorting
- ✅ Doctor Search works by ID
- ✅ Logout functionality works
- ✅ Error messages are user-friendly
- ✅ All pages are responsive
- ✅ Database updates correctly

---

## Next Steps

After successful testing:

1. **Deploy Backend**: Deploy to production server
2. **Deploy Frontend**: Deploy to Vercel or similar
3. **Database Migration**: Migrate to production MongoDB
4. **SSL Certificates**: Add HTTPS
5. **Monitoring**: Set up error tracking
6. **Backups**: Configure database backups

---

## Support

For issues or questions:
1. Check console logs (F12)
2. Review error messages
3. Check MongoDB connection
4. Verify JWT tokens
5. Check CORS settings if cross-origin issues

Happy Testing! 🎉
