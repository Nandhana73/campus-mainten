import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  item: { type: String, required: true },
  qty: { type: Number, required: true },
  location: { type: String, required: true }
}, { timestamps: true });

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;