const User = require('../models/User');

// Switch user role (SELLERS ONLY)
exports.switchRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.id;

    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either buyer or seller'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ONLY SELLERS can switch roles
    if (user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can switch roles between buyer and seller modes'
      });
    }

    // Switch role
    await user.switchRole(role);

    // Get updated user with appropriate data
    const updatedUser = await User.findById(userId).select('-password');

    res.json({
      success: true,
      message: `Switched to ${role} mode successfully`,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role, // Actual role (always 'seller' for switchers)
        activeRole: updatedUser.activeRole, // Current active mode
        canSwitchRoles: updatedUser.canSwitchRoles, // Virtual property
        status: updatedUser.status,
        profile: updatedUser.profile,
        points: updatedUser.points,
        // Include both datasets since seller needs access to both
        buyerData: updatedUser.buyerData,
        sellerData: updatedUser.sellerData
      }
    });

  } catch (error) {
    console.error('Role switch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during role switch'
    });
  }
};

// Get current user with active role data
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For sellers, return both datasets since they need access to both
    // For buyers/admins, return only relevant data
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role, // Actual role
      activeRole: user.activeRole, // Current active mode
      canSwitchRoles: user.role === 'seller', // Only sellers can switch
      status: user.status,
      points: user.points,
      profile: user.profile,
    };

    // Sellers get access to both buyer and seller data
    if (user.role === 'seller') {
      userResponse.buyerData = user.buyerData;
      userResponse.sellerData = user.sellerData;
    } 
    // Buyers only get buyer data
    else if (user.role === 'buyer') {
      userResponse.buyerData = user.buyerData;
    }
    // Admins might need different data structure
    else if (user.role === 'admin') {
      userResponse.adminData = {}; // Add admin-specific data if needed
    }

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user data'
    });
  }
};