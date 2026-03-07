import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Complaint from "../models/complaint.js";

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for bill uploads - save to maintenance_uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure directory exists before saving
    const dest = path.join(__dirname, "../maintenance_uploads");
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ==================== AI PRIORITY DETECTION ====================
const detectPriority = (description, problemType) => {
  const text = (description + " " + problemType).toLowerCase();
  
  // High priority keywords - urgent issues
  const highPriorityKeywords = [
    "fire", "smoke", "gas leak", "electrical shock", "flood", "flooding",
    "no water", "burst pipe", "security", "emergency", "dangerous",
    "broken glass", "window crack", "door lock broken", "roof leak",
    "severe", "critical", "urgent", "immediate"
  ];
  
  // Low priority keywords - minor issues
  const lowPriorityKeywords = [
    "paint", "wall", "minor", "slow", "tiny", "little", "cosmetic",
    "cleaning", "dust", "replacing", "paint", "fan slow", "light dim"
  ];
  
  // Check for high priority
  for (const keyword of highPriorityKeywords) {
    if (text.includes(keyword)) {
      return "High";
    }
  }
  
  // Check for low priority
  for (const keyword of lowPriorityKeywords) {
    if (text.includes(keyword)) {
      return "Low";
    }
  }
  
  // Default to Medium
  return "Medium";
};
// ==================== END AI PRIORITY DETECTION ====================

// GET /api/complaint -> All complaints
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// GET /api/complaint/debug -> Debug route to see all complaints with their collegeIds
router.get("/debug", async (req, res) => {
  try {
    const complaints = await Complaint.find().select("collegeId name block roomNo").sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// GET /api/complaint/by/:collegeId -> Get complaints by collegeId
router.get("/by/:collegeId", async (req, res) => {
  try {
    const complaints = await Complaint.find({ collegeId: req.params.collegeId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// PATCH /api/complaint/:id -> Update complaint status
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ message: "Status updated successfully", complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating status" });
  }
});

// POST /api/complaint/:id/bill -> Upload bill for a complaint
router.post("/:id/bill", upload.single("bill"), async (req, res) => {
  try {
    console.log("Upload request received for ID:", req.params.id);
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const billPath = "/maintenance_uploads/" + req.file.filename;
    console.log("Looking for complaint with ID:", req.params.id);
    
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { bill: billPath },
      { new: true }
    );
    
    console.log("Complaint found:", complaint);
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json({ message: "Bill uploaded successfully", bill: billPath, complaint });
  } catch (err) {
    console.error("Error uploading bill:", err);
    res.status(500).json({ message: "Error uploading bill: " + err.message });
  }
});

// POST /api/complaint -> Create new complaint
router.post("/", async (req, res) => {
  try {
    const { name, collegeId, role, block, roomNo, problemType, description } = req.body;
    
    // AI detects priority automatically
    const detectedPriority = detectPriority(description, problemType);
    console.log("AI Priority Detection:", detectedPriority);
    
    const newComplaint = new Complaint({
      name,
      collegeId,
      role,
      block,
      roomNo,
      problemType,
      description,
      status: "Pending",
      priority: detectedPriority  // AI adds priority
    });
    
    await newComplaint.save();
    res.status(201).json({ 
      message: "Complaint submitted successfully", 
      complaint: newComplaint,
      aiDetected: { priority: detectedPriority }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting complaint" });
  }
});

export default router;
