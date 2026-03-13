import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  collegeId: { type: String, required: true },
  role: { type: String, default: "student" },
  block: { type: String, required: true },
  roomNo: { type: String, required: true },
  problemType: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: "" }, // Single image path
  status: { type: String, default: "Pending" },
  bill: { type: [String], default: [] }
}, { timestamps: true });

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;

