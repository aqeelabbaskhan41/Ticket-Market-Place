const express = require("express");
const {
  createCompetition,
  getAllCompetitions,
  updateCompetition,
  deleteCompetition,
  uploadCompetitionImage
} = require("../controllers/competitionController.js");
const upload = require('../middleware/upload');
const { protect } = require("../middleware/auth.js");

const router = express.Router();

router.get("/", getAllCompetitions);
router.post("/", protect, createCompetition);
router.post("/upload", protect, upload.single('image'), uploadCompetitionImage);
router.put("/:id", protect, updateCompetition);
router.delete("/:id", protect, deleteCompetition);

module.exports = router;