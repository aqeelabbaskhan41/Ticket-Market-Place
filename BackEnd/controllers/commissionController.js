const CommissionSettings = require('../models/CommissionSettings');
const User = require('../models/User');

// Get commission settings
exports.getCommissionSettings = async (req, res) => {
  try {
    const settings = await CommissionSettings.getSettings();
    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching commission settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching commission settings'
    });
  }
};

// Update commission settings with validation
exports.updateCommissionSettings = async (req, res) => {
  try {
    const { level1, level2, level3, dynamicCommissions, allowCustomCommissions } = req.body;
    
    // Validate commission rates for fixed levels
    if (level1 && (level1.commissionRate < 0 || level1.commissionRate > 1)) {
      return res.status(400).json({
        success: false,
        message: 'Level 1 commission rate must be between 0 and 1 (0% to 100%)'
      });
    }
    if (level2 && (level2.commissionRate < 0 || level2.commissionRate > 1)) {
      return res.status(400).json({
        success: false,
        message: 'Level 2 commission rate must be between 0 and 1 (0% to 100%)'
      });
    }
    if (level3 && (level3.commissionRate < 0 || level3.commissionRate > 1)) {
      return res.status(400).json({
        success: false,
        message: 'Level 3 commission rate must be between 0 and 1 (0% to 100%)'
      });
    }

    // Validate dynamic commissions
    if (dynamicCommissions && Array.isArray(dynamicCommissions)) {
      for (const commission of dynamicCommissions) {
        if (commission.commissionRate < 0 || commission.commissionRate > 1) {
          return res.status(400).json({
            success: false,
            message: `Commission rate for ${commission.levelName} must be between 0 and 1 (0% to 100%)`
          });
        }
      }
    }

    let settings = await CommissionSettings.findOne();
    if (!settings) {
      settings = new CommissionSettings();
    }

    if (level1) {
      settings.level1 = { 
        ...settings.level1, 
        ...level1,
        name: level1.name || settings.level1.name
      };
    }
    if (level2) {
      settings.level2 = { 
        ...settings.level2, 
        ...level2,
        name: level2.name || settings.level2.name
      };
    }
    if (level3) {
      settings.level3 = { 
        ...settings.level3, 
        ...level3,
        name: level3.name || settings.level3.name
      };
    }

    // Update dynamic commissions
    if (dynamicCommissions !== undefined) {
      settings.dynamicCommissions = dynamicCommissions;
    }

    if (allowCustomCommissions !== undefined) {
      settings.allowCustomCommissions = allowCustomCommissions;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Commission settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating commission settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating commission settings'
    });
  }
};

// Get user's specific commission rate
exports.getMyCommission = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const settings = await CommissionSettings.getSettings();
    const commissionRate = await CommissionSettings.getUserCommissionRate(user);
    
    let userCommission;
    
    // Check if user has custom commission
    if (user.isCustomCommission && user.customCommissionRate !== null) {
      userCommission = {
        rate: user.customCommissionRate,
        levelName: 'Custom Rate',
        description: 'Personalized commission rate',
        isCustom: true,
        role: user.role || 'buyer'
      };
    } else {
      // Use level-based commission
      const levelInfo = settings[user.level] || settings.level1;
      userCommission = {
        rate: commissionRate,
        levelName: levelInfo.name,
        description: `${levelInfo.name} level commission`,
        isCustom: false,
        role: user.role || 'buyer'
      };
    }

    res.status(200).json({
      success: true,
      commission: userCommission
    });
  } catch (error) {
    console.error('Error fetching user commission:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching commission information'
    });
  }
};

// Set custom commission for user (admin only)
exports.setUserCustomCommission = async (req, res) => {
  try {
    const { userId } = req.params;
    const { commissionRate } = req.body;

    if (commissionRate === undefined || commissionRate < 0 || commissionRate > 1) {
      return res.status(400).json({
        success: false,
        message: 'Commission rate must be between 0 and 1 (0% to 100%)'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user's custom commission
    user.customCommissionRate = commissionRate;
    user.isCustomCommission = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Custom commission rate of ${(commissionRate * 100).toFixed(1)}% set for user`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        customCommissionRate: user.customCommissionRate,
        isCustomCommission: user.isCustomCommission
      }
    });
  } catch (error) {
    console.error('Error setting user custom commission:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting custom commission'
    });
  }
};

// Remove custom commission (revert to level-based)
exports.removeUserCustomCommission = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove custom commission
    user.customCommissionRate = null;
    user.isCustomCommission = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Custom commission removed, using level-based rate',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        customCommissionRate: user.customCommissionRate,
        isCustomCommission: user.isCustomCommission
      }
    });
  } catch (error) {
    console.error('Error removing user custom commission:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing custom commission'
    });
  }
};

// Update individual user level and role
exports.updateUserLevel = async (req, res) => {
  try {
    const { userId } = req.params;
    const { level, role } = req.body;

    // Validate level if provided
    if (level && !['level1', 'level2', 'level3'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be level1, level2, or level3'
      });
    }

    // Validate role if provided
    if (role && !['buyer', 'seller', 'both'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be buyer, seller, or both'
      });
    }

    const updateData = {};
    if (level) updateData.level = level;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User updated successfully${level ? ` (level: ${level})` : ''}${role ? ` (role: ${role})` : ''}`,
      user
    });
  } catch (error) {
    console.error('Error updating user level/role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['buyer', 'seller', 'both'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be buyer, seller, or both'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
};

// Bulk update user levels - UPDATED for all users
exports.bulkUpdateUserLevels = async (req, res) => {
  try {
    const { userIds, level } = req.body;

    if (!['level1', 'level2', 'level3'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be level1, level2, or level3'
      });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    // Updated to include all users (not just buyers)
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { level }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} users to ${level} level`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating user levels:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk updating user levels'
    });
  }
};

// Get all users with their levels (for admin panel) - UPDATED to include all roles
exports.getUsersWithLevels = async (req, res) => {
  try {
    // Get all users (not just buyers)
    const users = await User.find({ 
      role: { $ne: 'admin' } // Exclude admins
    })
      .select('email profile.name level points createdAt customCommissionRate isCustomCommission role')
      .sort({ createdAt: -1 });

    const settings = await CommissionSettings.getSettings();

    const usersWithCommissions = await Promise.all(users.map(async (user) => {
      const commissionRate = await CommissionSettings.getUserCommissionRate(user);
      const levelInfo = settings[user.level] || settings.level1;
      
      return {
        ...user.toObject(),
        levelInfo: levelInfo,
        effectiveCommissionRate: commissionRate,
        commissionType: user.isCustomCommission ? 'custom' : 'level',
        roles: getRolesArray(user.role)
      };
    }));

    res.status(200).json({
      success: true,
      users: usersWithCommissions,
      commissionSettings: settings,
      stats: {
        total: users.length,
        buyers: users.filter(u => u.role === 'buyer').length,
        sellers: users.filter(u => u.role === 'seller').length,
        both: users.filter(u => u.role === 'both').length
      }
    });
  } catch (error) {
    console.error('Error fetching users with levels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Helper function to convert role string to array
const getRolesArray = (role) => {
  if (role === 'both') {
    return ['buyer', 'seller'];
  } else if (role) {
    return [role];
  }
  return ['buyer'];
};

// Auto assign levels (optional - updated for all users)
exports.autoAssignLevels = async (req, res) => {
  try {
    const users = await User.find({ 
      level: { $exists: false },
      role: { $ne: 'admin' } // Exclude admins
    });
    
    let updatedCount = 0;

    for (const user of users) {
      user.level = 'level1';
      await user.save();
      updatedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Levels assigned for ${updatedCount} users (set to level1)`,
      updatedCount
    });
  } catch (error) {
    console.error('Error auto-assigning levels:', error);
    res.status(500).json({
      success: false,
      message: 'Error auto-assigning levels'
    });
  }
};

// Get user commission by role (optional endpoint if you want role-specific rates)
exports.getUserCommissionByRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const settings = await CommissionSettings.getSettings();
    const commissionRate = await CommissionSettings.getUserCommissionRate(user);
    
    const userCommission = {
      rate: commissionRate,
      level: user.level,
      role: user.role || 'buyer',
      isCustom: user.isCustomCommission || false,
      customRate: user.customCommissionRate || null
    };

    res.status(200).json({
      success: true,
      commission: userCommission,
      settings: {
        level1: settings.level1,
        level2: settings.level2,
        level3: settings.level3
      }
    });
  } catch (error) {
    console.error('Error fetching user commission by role:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching commission information'
    });
  }
};