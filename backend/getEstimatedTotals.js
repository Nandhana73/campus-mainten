import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Complaint from './models/Complaint.js';

async function getTotals() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Aggregation pipeline for totals
    const totals = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          totalEstimatedAmount: { $sum: '$estimatedAmount' },
          totalComplaints: { $sum: 1 },
          averageEstimatedAmount: { $avg: '$estimatedAmount' }
        }
      }
    ]);

    if (totals.length > 0) {
      const result = totals[0];
      console.log('\n=== ESTIMATED AMOUNTS SUMMARY ===');
      console.log(`Total Complaints: ${result.totalComplaints}`);
      console.log(`Total Estimated Amount: ₹${result.totalEstimatedAmount.toLocaleString('en-IN')}`);
      console.log(`Average Estimated Amount: ₹${Math.round(result.averageEstimatedAmount || 0).toLocaleString('en-IN')}`);
    } else {
      console.log('No complaints found.');
    }

    // Also get count by status for more insight
    const byStatus = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$estimatedAmount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    console.log('\n=== BY STATUS ===');
    byStatus.forEach(item => {
      console.log(`${item._id}: ${item.count} complaints, ₹${item.totalAmount.toLocaleString('en-IN')}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

getTotals();

