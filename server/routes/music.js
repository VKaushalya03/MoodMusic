const express = require("express");
const router = express.Router();
const {
  getRecommendation,
  savePlaylist,
  getHistory,
} = require("../controllers/musicController");
const auth = require("../middleware/authMiddleware");

// Public Route (Or Protected if you prefer)
// POST /api/music/recommend
router.post("/recommend", getRecommendation);

// Protected Routes (User must be logged in to save/view history)
// POST /api/music/save
router.post("/save", auth, savePlaylist);

// GET /api/music/history
router.get("/history", auth, getHistory);

module.exports = router;
