import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({ name: String, collegeId: String, role: String, block: String, problemType: String, description: String, status: String }, { timestamps: true });
const Complaint = mongoose.model('Complaint', complaintSchema);

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/campusmaintenance');
  const docs = await Complaint.find();
  console.log('docs', docs);
  process.exit(0);
}

run().catch(err=>{console.error(err);process.exit(1);});