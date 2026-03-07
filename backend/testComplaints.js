import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({ 
  name: String, 
  collegeId: String, 
  role: String, 
  block: String, 
  roomNo: String,
  problemType: String, 
  description: String, 
  status: String,
  bill: String
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);

async function run() {
  await mongoose.connect('mongodb://localhost:27017/campusmaintenance');
  const docs = await Complaint.find().limit(10);
  console.log('Found', docs.length, 'complaints');
  docs.forEach(d => {
    console.log('==================');
    console.log('ID:', d._id);
    console.log('Name:', d.name);
    console.log('College ID:', d.collegeId);
    console.log('Block:', d.block);
    console.log('Room:', d.roomNo);
    console.log('Problem Type:', d.problemType);
    console.log('Description:', d.description);
    console.log('Status:', d.status);
    console.log('Bill:', d.bill || 'none');
  });
  process.exit(0);
}

run().catch(err=>{console.error(err);process.exit(1);});

