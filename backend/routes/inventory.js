// routes/inventory.js
const express = require("express");
const Inventory = require("../models/Inventory");
const { auth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Normal user: save inventory
router.post("/", auth, async (req, res) => {
  try {
    const inv = new Inventory(req.body);
    await inv.save();
    res.json({ message: "Inventory saved", id: inv._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: get inventory (month-wise, default current month)
router.get("/", auth, requireAdmin, async (req, res) => {
  try {
    let { year, month } = req.query; // month as "01".."12"

    const now = new Date();

    // if not provided, use current month/year
    if (!year || !month) {
      year = String(now.getFullYear());
      month = String(now.getMonth() + 1).padStart(2, "0");
    }

    const y = parseInt(year, 10);
    const m = parseInt(month, 10); // 1–12

    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return res.status(400).json({ message: "Invalid year/month" });
    }

    // start of month (UTC) and start of next month
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));

    const filter = {
      submittedDateTime: { $gte: start, $lt: end },
    };

    const list = await Inventory.find(filter)
      .sort({ submittedDateTime: -1 })
      .exec();

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
