import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Complaint from './models/Complaint.js';

async function testSingleUpdate(complaintId = null, newAmount = 70) {
  try {
    await connectDB();
    
    // Use specific ID or get first complaint
    const targetId = complaintId || (await Complaint.findOne().sort({createdAt: -1}))?._id;
    
    if (!targetId) {
      console.log('No complaints found!');
      process.exit(1);
    }
    
    console.log(`Targeting complaint ID: ${targetId}`);
    
    const complaint = await Complaint.findById(targetId);
    console.log('Before:', complaint.estimatedAmount);
    
    complaint.estimatedAmount = newAmount;
    await complaint.save();
    
    const updated = await Complaint.findById(targetId);
    console.log('After:', updated.estimatedAmount);
    console.log('✅ Single complaint updated to ₹', newAmount);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Test with first complaint
testSingleUpdate(null, 70);

