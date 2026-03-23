import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Complaint from './models/Complaint.js';

async function resetAll() {
  try {
    await connectDB();
    
    // Reset ALL estimatedAmount to 0
    const result = await Complaint.updateMany({}, { estimatedAmount: 0 });
    console.log(`✅ Reset ${result.modifiedCount} complaints to ₹0`);
    
    // Verify
    const first = await Complaint.findOne().sort({createdAt: -1});
    console.log('First complaint now:', first.estimatedAmount);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetAll();
