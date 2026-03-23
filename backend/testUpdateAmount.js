import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Complaint from './models/Complaint.js';

async function testUpdate() {
  try {
    await connectDB();
    const complaint = await Complaint.findById('69abb096eb9d1b466693c38f');
    console.log('Before:', complaint.estimatedAmount);
    
    complaint.estimatedAmount = 5000;
    await complaint.save();
    
    const updated = await Complaint.findById('69abb096eb9d1b466693c38f');
    console.log('After:', updated.estimatedAmount);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testUpdate();

