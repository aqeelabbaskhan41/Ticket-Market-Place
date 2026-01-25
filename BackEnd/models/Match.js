const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  homeTeamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: false, // Make it optional for existing data
  },
  awayTeamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: false, // Make it optional for existing data
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  venueName: {
    type: String, // Keep venue name for backward compatibility
    required: true
  },
  competition: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Store the image path
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalListings: {
    type: Number,
    default: 0,
  },
  totalTickets: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  strictPopulate: false, // Add this to allow population even if schema doesn't have the field
});

module.exports = mongoose.model('Match', matchSchema);