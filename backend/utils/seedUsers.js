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

    // Minimal seed - only VDA sample. Others dynamically created.
    // Removed unwanted test passwords/creds (plum/ac/elec etc.)
    const users = [
      {
        id: 'vda23cs052',
        collegeId: 'vda23cs052',
        password: 'vda', // dummy matching backend
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
