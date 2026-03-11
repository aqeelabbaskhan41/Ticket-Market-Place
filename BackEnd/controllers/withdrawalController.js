const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');

// Create withdrawal request
exports.createWithdrawal = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { amount, bankDetails } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid withdrawal amount is required'
      });
    }

    // Validate bank details
    if (!bankDetails || !bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountHolderName) {
      return res.status(400).json({
        success: false,
        message: 'Bank details are required'
      });
    }

    // Get seller with points
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Check if seller has enough points
    if (seller.points < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points. You have ${seller.points} points but requested ${amount}`
      });
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      seller: sellerId,
      amount: amount,
      pointsUsed: amount,
      bankDetails: bankDetails,
      status: 'pending'
    });

    await withdrawal.save();

    // Add to user's withdrawal history
    seller.withdrawalHistory.push(withdrawal._id);
    await seller.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: withdrawal
    });

  } catch (error) {
    console.error('Error creating withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating withdrawal request'
    });
  }
};

// Get seller's withdrawal history
exports.getMyWithdrawals = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const withdrawals = await Withdrawal.find({ seller: sellerId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      withdrawals: withdrawals
    });

  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching withdrawal history'
    });
  }
};

// Get all pending withdrawals (Admin)
exports.getPendingWithdrawals = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('seller', 'email profile.fullName points')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      withdrawals: withdrawals
    });

  } catch (error) {
    console.error('Error fetching pending withdrawals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending withdrawals'
    });
  }
};

// Admin approve withdrawal - FIXED VERSION
exports.approveWithdrawal = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { withdrawalId } = req.params;
    const { adminNotes } = req.body;

    console.log('=== APPROVING WITHDRAWAL ===');
    console.log('Withdrawal ID:', withdrawalId);

    // First find the withdrawal without populating
    const withdrawal = await Withdrawal.findById(withdrawalId);
    
    if (!withdrawal) {
      console.log('Withdrawal not found');
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found'
      });
    }

    if (withdrawal.status !== 'pending') {
      console.log('Withdrawal status is not pending:', withdrawal.status);
      return res.status(400).json({
        success: false,
        message: 'Withdrawal request is not pending'
      });
    }

    // Find the seller separately to ensure we have the actual document
    const seller = await User.findById(withdrawal.seller);
    
    if (!seller) {
      console.log('Seller not found for withdrawal');
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    console.log('Seller before deduction:', {
      sellerId: seller._id,
      sellerEmail: seller.email,
      currentPoints: seller.points,
      withdrawalAmount: withdrawal.amount
    });

    // Check if seller still has enough points
    if (seller.points < withdrawal.amount) {
      console.log('Insufficient points:', {
        available: seller.points,
        required: withdrawal.amount
      });
      return res.status(400).json({
        success: false,
        message: `Seller no longer has sufficient points. Available: ${seller.points}, Requested: ${withdrawal.amount}`
      });
    }

    // Use atomic update to deduct points and update totalWithdrawn
    const updatedSeller = await User.findByIdAndUpdate(
      withdrawal.seller,
      {
        $inc: { 
          points: -withdrawal.amount,
          totalWithdrawn: withdrawal.amount
        }
      },
      { new: true } // Return the updated document
    );

    if (!updatedSeller) {
      console.log('Failed to update seller points');
      return res.status(500).json({
        success: false,
        message: 'Failed to update seller points'
      });
    }

    console.log('Seller after deduction:', {
      sellerId: updatedSeller._id,
      newPoints: updatedSeller.points,
      totalWithdrawn: updatedSeller.totalWithdrawn
    });

    // Update withdrawal status
    withdrawal.status = 'approved';
    withdrawal.adminNotes = adminNotes;
    withdrawal.approvedBy = req.user.id;
    await withdrawal.save();

    console.log('Withdrawal approved successfully');

    // Populate the withdrawal for response
    const populatedWithdrawal = await Withdrawal.findById(withdrawalId)
      .populate('seller', 'email profile.fullName points')
      .populate('approvedBy', 'email profile.fullName');

    res.status(200).json({
      success: true,
      message: 'Withdrawal approved successfully',
      withdrawal: populatedWithdrawal,
      sellerPoints: updatedSeller.points
    });

  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving withdrawal: ' + error.message
    });
  }
};

// Admin reject withdrawal
exports.rejectWithdrawal = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { withdrawalId } = req.params;
    const { rejectionReason } = req.body;

    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found'
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal request is not pending'
      });
    }

    // Update withdrawal status
    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = rejectionReason;
    withdrawal.approvedBy = req.user.id;

    await withdrawal.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal rejected successfully',
      withdrawal: withdrawal
    });

  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting withdrawal'
    });
  }
};

// Mark withdrawal as completed (after payment sent)
exports.completeWithdrawal = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { withdrawalId } = req.params;

    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found'
      });
    }

    if (withdrawal.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal must be approved first'
      });
    }

    // Mark as completed
    withdrawal.status = 'completed';
    withdrawal.completedAt = new Date();

    await withdrawal.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal marked as completed',
      withdrawal: withdrawal
    });

  } catch (error) {
    console.error('Error completing withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing withdrawal'
    });
  }
};

// Get all withdrawals for admin
exports.getAllWithdrawals = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const withdrawals = await Withdrawal.find()
      .populate('seller', 'email profile.fullName points')
      .populate('approvedBy', 'email profile.fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      withdrawals: withdrawals
    });

  } catch (error) {
    console.error('Error fetching all withdrawals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching withdrawals'
    });
  }
};

// Debug endpoint to check seller points (optional - for testing)
exports.getSellerPointsDebug = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const seller = await User.findById(sellerId).select('points totalWithdrawn email profile.fullName');
    const withdrawals = await Withdrawal.find({ seller: sellerId });

    res.status(200).json({
      success: true,
      seller: seller,
      withdrawals: withdrawals,
      stats: {
        totalWithdrawalRequests: withdrawals.length,
        totalAmountRequested: withdrawals.reduce((sum, w) => sum + w.amount, 0),
        pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
        approvedWithdrawals: withdrawals.filter(w => w.status === 'approved').length
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error: ' + error.message
    });
  }
};