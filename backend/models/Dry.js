// backend/models/Dry.js
const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    shop: { type: String, required: true },
    qty: { type: Number, required: true },
  },
  { _id: false }
);

const drySchema = new mongoose.Schema(
  {
    submittedDateTime: { type: Date, required: true },

    // Array of stores for this dry delivery entry
    stores: {
      type: [storeSchema],
      default: [],
    },

    // optional: who created this entry
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("Dry", drySchema);
