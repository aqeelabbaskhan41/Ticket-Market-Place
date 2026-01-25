const express = require("express");
const router = express.Router();
const {
  getAdminDashboard,
  getCommissionReport,
  getSystemOverview
} = require("../controllers/adminController");
const {
  getCommissionSettings,
  updateCommissionSettings,
  updateUserLevel,
  autoAssignLevels,
  bulkUpdateUserLevels,
  getUsersWithLevels  // Make sure this is imported
} = require("../controllers/commissionController");
const { protect } = require("../middleware/auth");

// All routes are protected and admin-only
router.get("/dashboard", protect, getAdminDashboard);
router.get("/commission-report", protect, getCommissionReport);
router.get("/system-overview", protect, getSystemOverview);

// Commission management routes
router.get("/commission-settings", protect, getCommissionSettings);
router.put("/commission-settings", protect, updateCommissionSettings);
router.get("/users-with-levels", protect, getUsersWithLevels);  // Add this route
router.patch("/users/:userId/level", protect, updateUserLevel);
router.post("/auto-assign-levels", protect, autoAssignLevels);
router.post("/bulk-update-levels", protect, bulkUpdateUserLevels);

module.exports = router;