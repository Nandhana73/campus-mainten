import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  collegeId: { type: String, required: true },
  role: { type: String, default: "student" },
  block: { type: String, required: true },
  roomNo: { type: String, required: true },
  problemType: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "Pending" },
  priority: { type: String, default: "Medium" }, // AI-detected priority: High, Medium, Low
  bill: { type: String, default: "" }  // Store bill file path
}, { timestamps: true });

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
