import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Complaint from './models/Complaint.js';

async function testSave() {
  try {
    await connectDB();
    // Update ALL complaints to have $5,000 estimated amount
    const result = await Complaint.updateMany({}, { estimatedAmount: 5000 });
    console.log(`Updated ${result.modifiedCount} complaints to $5,000`);
    
    // Check first one
    const first = await Complaint.findOne().sort({createdAt: -1});
    console.log('First complaint:', first.estimatedAmount);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testSave();
