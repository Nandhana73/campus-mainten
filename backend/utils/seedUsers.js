import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const seedUsers = async () => {
  try {
    await connectDB();
    console.log('DB connected for seeding');

    // Delete existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hardcoded users from login components - added collegeId
    const users = [
      // Admin
      {
        id: '5678910',
        collegeId: 'admin',
        password: '5678',
        role: 'admin'
      },
      // Maintenance
      {
        id: 'plum4321',
        collegeId: 'plum4321',
        password: 'plum',
        role: 'maintenance'
      },
      {
        id: 'ac4321',
        collegeId: 'ac4321',
        password: 'ac',
        role: 'maintenance'
      },
      {
        id: 'elec4321',
        collegeId: 'elec4321',
        password: 'elec',
        role: 'maintenance'
      },
      {
        id: 'furn4321',
        collegeId: 'furn4321',
        password: 'furn',
        role: 'maintenance'
      },
      {
        id: 'id-1234',
        collegeId: 'id-1234',
        password: '1234',
        role: 'maintenance'
      },
      // Sample student
      {
        id: 'vda23cs052',
        collegeId: 'vda23cs052',
        password: 'pass', // not used
        role: 'student'
      }
    ];

    // Hash passwords and save
    for (let userData of users) {
      const hashedPw = await bcrypt.hash(userData.password, 12);
      const user = new User({
        id: userData.id,
        collegeId: userData.collegeId,
        password: hashedPw,
        role: userData.role
      });
      await user.save();
      console.log(`Seeded ${userData.id} (${userData.role})`);
    }

    console.log('Seeding complete! Test: curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d \'{"id":"5678910","password":"5678"}\'');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedUsers();
