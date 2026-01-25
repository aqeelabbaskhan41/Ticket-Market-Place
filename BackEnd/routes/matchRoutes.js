const express = require("express");
const {
  createMatch,
  getAllMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
} = require("../controllers/matchController.js");
const { protect } = require("../middleware/auth.js");
const upload = require("../middleware/upload.js"); // This imports the default export

const router = express.Router();

// Public route - anyone can see matches
router.get("/", getAllMatches);
router.get("/:id", getMatchById);

// Admin-only routes - using the default upload (for match images)
router.post("/", protect, upload.single('image'), createMatch);
router.put("/:id", protect, upload.single('image'), updateMatch);
router.delete("/:id", protect, deleteMatch);

module.exports = router;