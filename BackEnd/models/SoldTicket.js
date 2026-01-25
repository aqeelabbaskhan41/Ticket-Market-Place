const mongoose = require('mongoose');

const soldTicketSchema = new mongoose.Schema({
  purchaseId: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      return `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  },
  originalTicket: {
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
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  category: String,
  blockArea: String,
  restriction: String,
  deliveryMethod: String,
  ageBand: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending_delivery', 'delivered', 'used', 'cancelled', 'refunded'],
    default: 'pending_delivery'
  },
  deliveryDetails: {
    type: {
      type: String,
      enum: ['E-Ticket (PDF)', 'Mobile Tickets', 'Image Ticket', 'Official App Login', 'Physical Ticket – Post', 'Physical Ticket – Matchday Collection']
    },
    // PDF Upload
    filePaths: [String],

    // Mobile Link
    mobileLinks: {
      general: String,
      ios: String,
      android: String
    },

    // App Login
    appLogin: {
      username: String,
      password: String, // In a real app, this should be encrypted
      notes: String
    },

    // Physical Post
    postal: {
      trackingNumber: String,
      courier: String
    },

    // Matchday Collection
    collection: {
      location: String,
      contactName: String,
      contactPhone: String,
      time: String
    }
  },
  deliveryDate: Date,
  ticketUrl: String,
  qrCode: String,
  notes: String
}, {
  timestamps: true
});

// Create index for better performance
soldTicketSchema.index({ buyer: 1, purchaseDate: -1 });
soldTicketSchema.index({ seller: 1, purchaseDate: -1 });
soldTicketSchema.index({ match: 1 });

module.exports = mongoose.model('SoldTicket', soldTicketSchema);