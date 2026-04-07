const User = require('../models/User');
const { createNotification } = require('./notificationController');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    // Notify user if status changed
    if (oldStatus !== status) {
      let title, message, link;
      if (status === 'approved') {
        title = 'Account Approved';
        message = user.role === 'seller' ? 'Your seller account has been approved. You can now list tickets for sale!' : 'Your account has been approved.';
        link = user.role === 'seller' ? '/seller' : '/buyer';
      } else if (status === 'suspended') {
        title = 'Account Suspended';
        message = 'Your account has been suspended. Please contact support for more information.';
        link = '/support';
      }

      if (title) {
        await createNotification(
          user._id,
          'system',
          title,
          message,
          link,
          user._id
        );
      }
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error updating user status' });
  }
};

// Add points to a buyer
exports.addPointsToBuyer = async (req, res) => {
  try {
    const { userId, points } = req.body;

    if (!userId || typeof points !== 'number' || points <= 0) {
      return res.status(400).json({ success: false, message: 'Valid userId and points are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Buyer not found' });

    if (user.role !== 'buyer') {
      return res.status(403).json({ success: false, message: 'Points can only be added to buyers' });
    }

    user.points = (user.points || 0) + points;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Added ${points} points to ${user.profile?.fullName || user.email}`,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error adding points' });
  }
};

// In your userController.js - Add this function
exports.updateUserPoints = async (req, res) => {
  try {
    const { userId, points } = req.body;

    if (!userId || typeof points !== 'number' || points < 0) {
      return res.status(400).json({ success: false, message: 'Valid userId and points are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.points = points;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Updated points to ${points} for ${user.profile?.fullName || user.email}`,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error updating points' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        points: user.points || 0,
        profile: user.profile || {},
        activeRole: user.activeRole,
        level: user.level,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      user.email = email;
    }

    // Update profile fields
    user.profile = {
      ...user.profile,
      fullName: fullName || user.profile?.fullName,
      phone: phone || user.profile?.phone
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        points: user.points,
        status: user.status,
        level: user.level,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};