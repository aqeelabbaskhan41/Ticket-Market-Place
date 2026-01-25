const express = require("express");
const router = express.Router();
const { getAllCategories, createCategory, deleteCategory } = require("../controllers/seatCategoryController");
const { protect, admin } = require("../middleware/auth");

// Public route to get categories (needed for sellers)
router.get("/", getAllCategories);

// Admin only routes to manage categories
router.post("/", protect, admin, createCategory);
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
