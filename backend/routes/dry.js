// backend/routes/dry.js
const express = require("express");
const router = express.Router();
const Dry = require("../models/Dry");
// const auth = require("../middleware/auth"); // comment out until fixed

// GET /api/dry?year=2025&month=12
router.get("/", async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = {};

    if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10) - 1; // JS month 0–11
      const start = new Date(Date.UTC(y, m, 1));
      const end = new Date(Date.UTC(y, m + 1, 1));
      query.submittedDateTime = { $gte: start, $lt: end };
    }

    const docs = await Dry.find(query).sort({ submittedDateTime: -1 });
    res.json(docs);
  } catch (err) {
    console.error("Dry GET error", err);
    res.status(500).json({ message: "Dry delivery fetch error" });
  }
});

// you can also POST later if needed
// router.post("/", async (req, res) => { ... });

module.exports = router;
