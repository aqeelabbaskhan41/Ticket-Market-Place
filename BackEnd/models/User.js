const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'seller', 'buyer'], 
    default: 'buyer' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'suspended'], 
    default: 'pending' 
  },
  points: { type: Number, default: 0 },

  // NEW: Role switching for sellers only
  activeRole: {
    type: String,
    enum: ['seller', 'buyer'],
    default: function() {
      // Sellers default to seller mode, others to their actual role
      return this.role === 'seller' ? 'seller' : this.role;
    }
  },

  // Profile information (shared across roles)
  profile: {
    fullName: { type: String, required: true },
    phone: String,
    address: String
  },

  // Buyer-specific data (sellers also have this when acting as buyers)
  buyerData: {
    purchaseHistory: [{
      ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
      purchaseDate: Date,
      quantity: Number,
      totalPrice: Number,
      status: { type: String, enum: ['active', 'used', 'cancelled'], default: 'active' }
    }],
    favoriteSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    totalSpent: { type: Number, default: 0 },
    cart: [{
      ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
      quantity: Number,
      addedAt: { type: Date, default: Date.now }
    }]
  },

  // Seller-specific data (only for actual sellers)
  sellerData: {
    listings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
    totalSales: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      accountHolder: String
    }
  },

  // Common fields
  level: { 
    type: String, 
    enum: ['level1', 'level2', 'level3'], 
    default: 'level1' 
  },
  totalWithdrawn: { type: Number, default: 0 },
  withdrawalHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Withdrawal'
  }],

  // Commission fields (for sellers)
  customCommissionRate: { type: Number, default: null },
  isCustomCommission: { type: Boolean, default: false }
}, { timestamps: true });

// Password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to switch roles (SELLERS ONLY)
userSchema.methods.switchRole = function(newRole) {
  // Only sellers can switch roles
  if (this.role !== 'seller') {
    throw new Error('Only sellers can switch roles');
  }
  
  if (!['buyer', 'seller'].includes(newRole)) {
    throw new Error('Invalid role. Must be either buyer or seller');
  }
  
  this.activeRole = newRole;
  return this.save();
};

// Virtual for checking if user can switch roles
userSchema.virtual('canSwitchRoles').get(function() {
  return this.role === 'seller'; // Only sellers can switch
});

// Virtual for getting appropriate data based on active role
userSchema.virtual('currentData').get(function() {
  return this.activeRole === 'buyer' ? this.buyerData : this.sellerData;
});

module.exports = mongoose.model('User', userSchema);