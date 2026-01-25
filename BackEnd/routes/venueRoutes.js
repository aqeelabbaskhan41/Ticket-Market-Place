const express = require("express");
const {
  createVenue,
  getAllVenues,
  updateVenue,
  deleteVenue,
  uploadSectionImage,
  addOrUpdateSection,
  removeSection,
  getVenueWithSections,
  getSectionImage
} = require("../controllers/venueController.js");
const { protect, admin } = require("../middleware/auth.js");
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get("/", getAllVenues);
router.get("/:id", getVenueWithSections);
router.get("/:venueId/sections/:sectionName/image", getSectionImage);

// Protected routes (admin only)
router.post("/", protect, admin, createVenue);
router.put("/:id", protect, admin, updateVenue);
router.delete("/:id", protect, admin, deleteVenue);

// Section image routes (admin only)
router.post("/upload-section-image", protect, admin, upload.single('image'), uploadSectionImage);
router.post("/:venueId/sections", protect, admin, addOrUpdateSection);
router.delete("/:venueId/sections/:sectionName", protect, admin, removeSection);

module.exports = router;