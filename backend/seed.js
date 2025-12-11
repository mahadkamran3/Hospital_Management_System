const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Doctor = require('./models/Doctor');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_appointments');
    console.log('✅ MongoDB Connected for seeding...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const maleFirstNames = ['Ahmed', 'Muhammad', 'Ali', 'Hassan', 'Usman', 'Bilal', 'Omar', 'Fahad', 'Saad', 'Hamza', 'Zain', 'Faisal', 'Imran', 'Tariq', 'Kamran', 'Adnan', 'Asim', 'Jawad', 'Shahid', 'Kashif', 'Waqar', 'Rizwan', 'Naveed', 'Junaid', 'Farhan', 'Irfan', 'Shoaib', 'Nadeem', 'Sohail', 'Amir'];
const femaleFirstNames = ['Fatima', 'Ayesha', 'Zainab', 'Maryam', 'Sana', 'Hira', 'Amina', 'Nadia', 'Sara', 'Rabia', 'Mehwish', 'Sidra', 'Anam', 'Nimra', 'Bushra', 'Asma', 'Kiran', 'Sadia', 'Noor', 'Iqra', 'Farah', 'Saira', 'Rubina', 'Nasreen', 'Samina', 'Tahira', 'Uzma', 'Shabnam', 'Parveen', 'Farzana'];
const lastNames = ['Khan', 'Ahmed', 'Ali', 'Hussain', 'Shah', 'Malik', 'Butt', 'Chaudhry', 'Iqbal', 'Siddiqui', 'Qureshi', 'Sheikh', 'Mirza', 'Abbasi', 'Javed', 'Raza', 'Nawaz', 'Akram', 'Riaz', 'Ashraf', 'Rehman', 'Karim', 'Nasir', 'Tariq', 'Zafar', 'Baig', 'Hashmi', 'Bhatti', 'Aslam', 'Farooq'];
const phonePrefixes = ['0300', '0301', '0302', '0303', '0304', '0305', '0306', '0307', '0308', '0309', '0311', '0312', '0313', '0314', '0315', '0316', '0317', '0318', '0320', '0321', '0322', '0323', '0324', '0331', '0332', '0333', '0334', '0335'];
const departments = ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Medicine', 'Gynecology', 'Dermatology', 'ENT', 'Ophthalmology'];
const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'];
const qualifications = ['MBBS, FCPS (Medicine)', 'MBBS, MRCP (UK)', 'MBBS, MD', 'MBBS, FCPS (Surgery)', 'MBBS, MS', 'MBBS, PhD', 'MBBS, FRCS', 'MBBS, DCH', 'MBBS, MCPS'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomPhone = () => `${getRandomElement(phonePrefixes)}-${String(getRandomNumber(1000000, 9999999))}`;

const generateFutureDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
};

const generateDoctors = () => {
  const doctors = [];
  const usedNames = new Set();
  
  departments.forEach((dept, index) => {
    for (let i = 0; i < 2; i++) {
      let firstName, lastName, fullName;
      do {
        firstName = index % 2 === 0 ? getRandomElement(maleFirstNames) : getRandomElement(femaleFirstNames);
        lastName = getRandomElement(lastNames);
        fullName = `Dr. ${firstName} ${lastName}`;
      } while (usedNames.has(fullName));
      
      usedNames.add(fullName);
      
      doctors.push({
        name: fullName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@hospitalia.pk`,
        phone: getRandomPhone(),
        specialization: dept,
        qualification: getRandomElement(qualifications),
        experience: getRandomNumber(3, 25),
        consultationFee: getRandomNumber(1500, 5000),
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].slice(0, getRandomNumber(3, 5)),
        availableTimeStart: '09:00 AM',
        availableTimeEnd: '05:00 PM',
        isActive: true
      });
    }
  });
  
  return doctors;
};

const generateUsers = () => {
  const users = [];
  const usedEmails = new Set();
  
  for (let i = 0; i < 50; i++) {
    const isMale = i % 2 === 0;
    const firstName = isMale ? getRandomElement(maleFirstNames) : getRandomElement(femaleFirstNames);
    const lastName = getRandomElement(lastNames);
    
    let email;
    let emailSuffix = 0;
    
    do {
      const suffix = emailSuffix > 0 ? emailSuffix : '';
      email = `${firstName.toLowerCase()}${suffix}@email.pk`;
      emailSuffix++;
    } while (usedEmails.has(email));
    
    usedEmails.add(email);
    
    users.push({
      name: `${firstName} ${lastName}`,
      email,
      password: 'user123',
      phone: getRandomPhone(),
      role: 'user'
    });
  }
  
  return users;
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Doctor.deleteMany({});
    
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@hospital.pk',
      password: 'admin1',
      phone: '0300-1234567',
      role: 'admin'
    });
    console.log('   ✅ Admin: admin@hospital.pk / admin1');
    
    console.log('👨‍⚕️ Creating doctors...');
    const doctorsData = generateDoctors();
    const doctors = await Doctor.insertMany(doctorsData.map(d => ({ ...d, createdBy: adminUser._id })));
    console.log(`   ✅ Created ${doctors.length} doctors`);
    
    console.log('👥 Creating 50 patient users...');
    const usersData = generateUsers();
    const users = [];
    
    for (const userData of usersData) {
      const user = await User.create(userData);
      users.push(user);
    }
    console.log(`   ✅ Created ${users.length} patient users`);
    
    console.log('📅 Creating appointments...');
    const appointments = [];
    const statuses = ['scheduled', 'completed', 'cancelled'];
    
    for (const user of users) {
      const appointmentCount = getRandomNumber(1, 3);
      
      for (let j = 0; j < appointmentCount; j++) {
        const doctor = getRandomElement(doctors);
        const daysAhead = getRandomNumber(1, 30);
        const date = generateFutureDate(daysAhead);
        
        appointments.push({
          patientName: user.name,
          doctorName: doctor.name,
          date,
          time: getRandomElement(timeSlots),
          department: doctor.specialization,
          phone: user.phone,
          notes: getRandomElement(['Regular checkup', 'Follow-up visit', 'New consultation', 'Test results review', 'Prescription renewal', '']),
          status: j === 0 ? 'scheduled' : getRandomElement(statuses),
          createdBy: user._id
        });
      }
    }
    
    await Appointment.insertMany(appointments);
    console.log(`   ✅ Created ${appointments.length} appointments`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   • Admin User: 1`);
    console.log(`   • Patient Users: ${users.length}`);
    console.log(`   • Doctors: ${doctors.length}`);
    console.log(`   • Appointments: ${appointments.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@hospital.pk / admin1');
    console.log('   Sample User: (check users list) / user123');
    console.log('\n' + '='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
