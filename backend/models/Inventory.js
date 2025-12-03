// models/Inventory.js
const mongoose = require("mongoose");

const laborSchema = new mongoose.Schema(
  {
    name: String,
    cost: Number,
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    name: String,
    unit: String,
    qty: Number,
  },
  { _id: false }
);

const storeSchema = new mongoose.Schema(
  {
    shop: String,
    qty: Number,
  },
  { _id: false }
);

const inventorySchema = new mongoose.Schema({
  submittedDateTime: { type: Date, required: true },
  laborCount: Number,
  startTime: String, // e.g. "10:15"
  endTime: String,
  labors: [laborSchema],
  receiving: [itemSchema],
  loading: [itemSchema],
  stores: [storeSchema],
});

module.exports = mongoose.model("Inventory", inventorySchema);
