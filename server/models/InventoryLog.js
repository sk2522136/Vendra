import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantityChange: { type: Number, required: true }, 
  type: { type: String, enum: ['Sale', 'Purchase', 'Adjustment','Return','Sale Cancellation'], required: true },
  sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
});

const InventoryLog = mongoose.models.inventoryLog || mongoose.model('InventoryLog' ,inventoryLogSchema)

export default InventoryLog;