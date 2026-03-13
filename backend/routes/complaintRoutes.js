import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Complaint from "../models/complaint.js";

const router = express.Router();



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});



// ==================== COMPLAINT ROUTES ====================

// Get all complaints
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// Debug endpoint - get complaints with limited fields
router.get("/debug", async (req, res) => {
  try {
    const complaints = await Complaint.find().select("collegeId name block roomNo").sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// Get complaints by college ID
router.get("/by/:collegeId", async (req, res) => {
  try {
    const complaints = await Complaint.find({ collegeId: req.params.collegeId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// Update complaint status
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ message: "Status updated successfully", complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating status" });
  }
});

// Upload bill for complaint (adds to array of bills)
router.post("/:id/bill", upload.single("bill"), async (req, res) => {
  try {
    console.log("Bill upload request received for ID:", req.params.id);
    console.log("File:", req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const billPath = "/maintenance_uploads/" + req.file.filename;
    console.log("Bill path:", billPath);
    
    // Find complaint first to get current bills
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    
    console.log("Complaint found:", complaint._id);
    
    // Add new bill to array (initialize if needed)
    const currentBills = complaint.bill || [];
    currentBills.push(billPath);
    
    // Update with array of bills
    await Complaint.findByIdAndUpdate(req.params.id, { bill: currentBills });
    
    const updatedComplaint = await Complaint.findById(req.params.id);
    res.json({ message: "Bill uploaded successfully", bills: updatedComplaint.bill, complaint: updatedComplaint });
  } catch (err) {
    console.error("Error uploading bill:", err);
    res.status(500).json({ message: "Error uploading bill: " + err.message });
  }
});

// Upload image for complaint (single image replacement)
router.post("/:id/image", upload.single("image"), async (req, res) => {
  try {
    console.log("Image upload request received for ID:", req.params.id);
    console.log("File:", req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const imagePath = "/maintenance_uploads/" + req.file.filename;
    console.log("Image path:", imagePath);
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    
    // Delete previous image if exists
    if (complaint.image) {
      try {
        const fullPath = path.join(__dirname, "..", complaint.image);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (fileErr) {
        console.error("Error deleting old image:", fileErr);
      }
    }
    
    // Update with new image path
    await Complaint.findByIdAndUpdate(req.params.id, { image: imagePath });
    
    const updatedComplaint = await Complaint.findById(req.params.id);
    res.json({ message: "Image uploaded successfully", image: imagePath, complaint: updatedComplaint });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ message: "Error uploading image: " + err.message });
  }
});


// Delete a specific bill from complaint
router.delete("/:id/bill/:billIndex", async (req, res) => {
  try {
    const billIndex = parseInt(req.params.billIndex);
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    
    const currentBills = complaint.bill || [];
    if (billIndex < 0 || billIndex >= currentBills.length) {
      return res.status(400).json({ message: "Invalid bill index" });
    }
    
    // Get the bill path to delete file
    const billPathToDelete = currentBills[billIndex];
    
    // Remove from array
    currentBills.splice(billIndex, 1);
    
    // Update complaint
    await Complaint.findByIdAndUpdate(req.params.id, { bill: currentBills });
    
    // Try to delete the file from filesystem
    try {
      const fullPath = path.join(__dirname, "..", billPathToDelete);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (fileErr) {
      console.error("Error deleting file:", fileErr);
    }
    
    const updatedComplaint = await Complaint.findById(req.params.id);
    res.json({ message: "Bill deleted successfully", bills: updatedComplaint.bill, complaint: updatedComplaint });
  } catch (err) {
    console.error("Error deleting bill:", err);
    res.status(500).json({ message: "Error deleting bill: " + err.message });
  }
});

// Create new complaint (with optional image upload)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, collegeId, role, block, roomNo, problemType, description } = req.body;
    
    // Get image path if uploaded
    const image = req.file ? "/maintenance_uploads/" + req.file.filename : "";
    
    const newComplaint = new Complaint({
      name, 
      collegeId, 
      role, 
      block, 
      roomNo, 
      problemType, 
      description,
      image: image,
      status: "Pending"
    });
    
    await newComplaint.save();
    
    res.status(201).json({ 
      message: "Complaint submitted successfully", 
      complaint: newComplaint
    });
  } catch (err) {
    console.error("Error submitting complaint:", err);
    res.status(500).json({ message: "Error submitting complaint" });
  }
});

// Delete image from complaint
router.delete("/:id/image", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    
    if (!complaint.image) {
      return res.status(400).json({ message: "No image to delete" });
    }
    
    // Get the image path to delete file
    const imagePathToDelete = complaint.image;
    
    // Update complaint to remove image
    await Complaint.findByIdAndUpdate(req.params.id, { image: "" });
    
    // Try to delete the file from filesystem
    try {
      const fullPath = path.join(__dirname, "..", imagePathToDelete);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (fileErr) {
      console.error("Error deleting file:", fileErr);
    }
    
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({ message: "Error deleting image: " + err.message });
  }
});

// Delete complaint
router.delete("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting complaint" });
  }
});

export default router;

