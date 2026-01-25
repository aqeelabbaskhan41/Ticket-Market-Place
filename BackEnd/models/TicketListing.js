const mongoose = require("mongoose");

const ticketListingSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sectionImage: {
      type: String // Will store the image URL/path for this section
    },
    // Event Information
    category: {
      type: String,
      required: true,
      trim: true
    },
    blockArea: { type: String, required: true, trim: true },
    restriction: {
      type: String,
      enum: ["Clear View", "Restricted View"],
      default: "Clear View",
    },

    // Delivery Method
    deliveryMethod: {
      type: String,
      enum: [
        "E-Ticket (PDF)",
        "Mobile Tickets",
        "Image Ticket",
        "Physical Ticket – Post",
        "Physical Ticket – Matchday Collection",
      ],
      required: true,
    },

    // Ticket Details
    quantity: { type: Number, required: true, min: 1 },
    splitType: {
      type: String,
      enum: [
        "Singles",
        "Pairs",
        "3 Seats Together",
        "4 Seats Together",
        "5 Seats Together",
        "6 Seats Together",
      ],
      default: "Singles",
    },
    note: { type: String, trim: true },

    // Age Band
    ageBand: {
      type: String,
      enum: [
        "Adult",
        "Junior",
        "Senior",
        "Adult + Junior",
        "Adult + Senior",
      ],
      required: true,
    },

    // Pricing
    price: { type: Number, required: true, min: 0 }, // Points per ticket

    status: {
      type: String,
      enum: ["active", "sold", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TicketListing", ticketListingSchema);
