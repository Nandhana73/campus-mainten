import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
// Correct import if db.js is inside backend/config/
import connectDB from "./config/db.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import stockRoutes from "./routes/StockRoutes.js";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files - use backend/uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Serve maintenance uploaded files - use backend/maintenance_uploads directory
app.use("/maintenance_uploads", express.static(path.join(__dirname, "maintenance_uploads")));

// Connect MongoDB
connectDB();

// Routes
app.use("/api/complaint", complaintRoutes);
app.use("/api/stocks", stockRoutes);

// Test route
app.get("/", (req, res) => res.send("Server running 💗"));

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
