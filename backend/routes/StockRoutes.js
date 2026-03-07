// routes/stockRoutes.js
import express from "express";
import Stock from "../models/stock.js";

const router = express.Router();

// GET /api/stocks -> All stock items
router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ createdAt: -1 });
    res.json(stocks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching stock" });
  }
});

// PATCH /api/stocks/:id -> Update stock quantity
router.patch("/:id", async (req, res) => {
  try {
    const { qty } = req.body;
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      { qty },
      { new: true }
    );
    res.json({ message: "Stock updated successfully", stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating stock" });
  }
});

// POST /api/stocks -> Create new stock item
router.post("/", async (req, res) => {
  try {
    const { item, qty, location } = req.body;
    if (!item || !location) {
      return res.status(400).json({ message: "Item name and location are required" });
    }
    const newStock = new Stock({
      item,
      qty: qty || 0,
      location
    });
    await newStock.save();
    res.status(201).json({ message: "Stock item created successfully", stock: newStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating stock item" });
  }
});

export default router;
