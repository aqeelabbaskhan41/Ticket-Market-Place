const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TicketListing',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  commissionRate: {
    type: Number,
    default: 0.10
  },
  commissionAmount: {
    type: Number,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'completed', 'refunded', 'partial_settlement'],
    default: 'pending'
  },
  matchDate: {
    type: Date,
    required: true
  },
  autoReleaseDate: {
    type: Date
  },
  issueReported: {
    type: Boolean,
    default: false
  },
  issueDescription: String,
  adminDecision: {
    decision: {
      type: String,
      enum: ['approve_sale', 'approve_refund', 'partial']
    },
    notes: String,
    decidedAt: Date,
    penaltyAmount: Number,
    buyerRefund: Number,
    sellerPayout: Number
  },
  // NEW ESCROW FIELDS ADDED BELOW - NO EXISTING FIELDS CHANGED
  escrowReleasedAt: {
    type: Date,
    default: null
  },
  adminManuallyReleased: {
    type: Boolean,
    default: false
  },
  adminReleaseBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // track commission type
  commissionType: {
    type: String,
    enum: ['level', 'custom'],
    default: 'level'
  },
  buyerLevel: {
    type: String,
    enum: ['level1', 'level2', 'level3'],
    default: 'level1'
  },
  issueCategory: String,
  issueUrgency: String,
  issueReportedAt: Date
}, {
  timestamps: true
});

// Auto-calculate release date (7 days after match)
transactionSchema.pre('save', function(next) {
  if (this.matchDate && !this.autoReleaseDate) {
    this.autoReleaseDate = new Date(this.matchDate);
    this.autoReleaseDate.setDate(this.autoReleaseDate.getDate() + 7);
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);