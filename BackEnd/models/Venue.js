const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String, // Path to the uploaded image
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: false });

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    sections: [sectionSchema], // Array of stadium sections with images
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Add index for faster section lookups
venueSchema.index({ "sections.name": 1 });

module.exports = mongoose.model("Venue", venueSchema);