const mongoose = require('mongoose');

const commissionSettingsSchema = new mongoose.Schema({
  level1: {
    name: { type: String, default: 'Standard' },
    commissionRate: { type: Number, default: 0.10 } // 10%
  },
  level2: {
    name: { type: String, default: 'Premium' },
    commissionRate: { type: Number, default: 0.08 } // 8%
  },
  level3: {
    name: { type: String, default: 'VIP' },
    commissionRate: { type: Number, default: 0.06 } // 6%
  },
  // DYNAMIC COMMISSION SETTINGS - ADDED
  dynamicCommissions: [{
    levelName: { type: String, required: true },
    levelNumber: { type: Number, required: true },
    commissionRate: { type: Number, required: true, min: 0, max: 1 },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
  }],
  allowCustomCommissions: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Only one document should exist
commissionSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Get commission rate for a user (dynamic or level-based)
commissionSettingsSchema.statics.getUserCommissionRate = async function(user) {
  const settings = await this.getSettings();
  
  // If user has custom commission, use that
  if (user.isCustomCommission && user.customCommissionRate !== null) {
    return user.customCommissionRate;
  }
  
  // Check dynamic commissions first
  if (settings.dynamicCommissions && settings.dynamicCommissions.length > 0) {
    const dynamicLevel = settings.dynamicCommissions.find(dl => dl.levelName === user.level);
    if (dynamicLevel && dynamicLevel.isActive) {
      return dynamicLevel.commissionRate;
    }
  }
  
  // Fallback to fixed levels
  return settings[user.level]?.commissionRate || 0.10;
};

module.exports = mongoose.model('CommissionSettings', commissionSettingsSchema);