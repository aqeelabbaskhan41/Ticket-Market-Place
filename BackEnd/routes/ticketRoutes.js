const express = require("express");
const router = express.Router();
const {
  createTicketListing,
  getTicketListingsByMatch,
  getTicketListingById,
  updateTicketListing,
  deleteTicketListing,
  getSellerTickets,
  purchaseTicket,
  getPurchasedTickets,
  getSalesHistory,
  updateDeliveryStatus,
  reportTicketIssue,
  resolveDispute,
  getAdminDisputes,
  getAdminCommissionSummary,
  manualReleaseEscrow,
  runEscrowReleaseNow,
  getPurchasedTicketById
} = require("../controllers/ticketController");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/match/:matchId", getTicketListingsByMatch);
router.get("/:id", getTicketListingById);

// Seller routes
router.post("/", protect, createTicketListing);
router.put("/:id", protect, updateTicketListing);
router.delete("/:id", protect, deleteTicketListing);
router.get("/seller/listings", protect, getSellerTickets);
router.get("/seller/sales", protect, getSalesHistory);
router.put("/delivery/:ticketId", protect, updateDeliveryStatus);

// Buyer routes
router.post("/:id/purchase", protect, purchaseTicket);
router.get("/buyer/purchased", protect, getPurchasedTickets);
router.get("/buyer/purchased/:id", protect, getPurchasedTicketById);
router.post("/buyer/report-issue/:ticketId", protect, reportTicketIssue);

// Admin routes
router.get("/admin/disputes", protect, getAdminDisputes);
router.post("/admin/resolve-dispute/:transactionId", protect, resolveDispute);
router.get("/admin/commission-summary", protect, getAdminCommissionSummary);
router.post("/admin/release-escrow/:transactionId", protect, manualReleaseEscrow);
router.post("/admin/run-escrow-release", protect, runEscrowReleaseNow);

module.exports = router;