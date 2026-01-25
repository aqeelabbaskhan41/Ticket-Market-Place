const User = require("../models/User");
const TicketListing = require("../models/TicketListing");
const Transaction = require("../models/Transaction");
const SoldTicket = require("../models/SoldTicket");
const Match = require("../models/Match");

// Get Admin Dashboard Stats
exports.getAdminDashboard = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get active listings count
    const activeListings = await TicketListing.countDocuments({ status: 'active' });
    
    // Get total transactions count
    const totalTransactions = await Transaction.countDocuments();
    
    // Get pending disputes count
    const pendingDisputes = await Transaction.countDocuments({ 
      status: 'under_review' 
    });

    // Calculate commission earnings
    const commissionData = await Transaction.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'partial_settlement'] }
        }
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: '$commissionAmount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    // Calculate pending commissions (from pending transactions)
    const pendingCommissionData = await Transaction.aggregate([
      {
        $match: {
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          totalPendingCommission: { $sum: '$commissionAmount' }
        }
      }
    ]);

    // Get recent transactions for activity feed
    const recentTransactions = await Transaction.find()
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('ticket')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate total points in circulation (user points + pending commissions)
    const usersPoints = await User.aggregate([
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    // Format activity feed
    const recentActivity = recentTransactions.map(transaction => {
      let type, message;
      
      if (transaction.status === 'pending') {
        type = 'ticket_sold';
        message = `Ticket sold - Transaction #${transaction._id.toString().slice(-6)}`;
      } else if (transaction.status === 'completed') {
        type = 'commission_earned';
        message = `Commission earned from sale #${transaction._id.toString().slice(-6)}`;
      } else if (transaction.status === 'under_review') {
        type = 'dispute_reported';
        message = `Dispute reported for transaction #${transaction._id.toString().slice(-6)}`;
      } else {
        type = 'transaction';
        message = `Transaction #${transaction._id.toString().slice(-6)} ${transaction.status}`;
      }

      return {
        type,
        message,
        points: transaction.commissionAmount,
        time: transaction.createdAt,
        transactionId: transaction._id
      };
    });

    const totalCommission = commissionData[0]?.totalCommission || 0;
    const totalPendingCommission = pendingCommissionData[0]?.totalPendingCommission || 0;
    const totalPointsInCirculation = usersPoints[0]?.totalPoints + totalPendingCommission || 0;

    res.status(200).json({
      success: true,
      data: {
        // Core Metrics
        totalUsers,
        activeListings,
        totalTransactions,
        pendingDisputes,
        
        // Commission Metrics
        commissionEarned: totalCommission,
        pendingCommissions: totalPendingCommission,
        platformCommissionRate: 10, // 10% default
        
        // Points Metrics
        totalPointsInCirculation,
        adminPointsBalance: totalCommission, // Admin's earned commission
        
        // Additional Stats
        successfulTransactions: totalTransactions - pendingDisputes,
        successRate: totalTransactions > 0 ? 
          ((totalTransactions - pendingDisputes) / totalTransactions * 100).toFixed(1) : 0,
        
        // Activity Feed
        recentActivity
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin dashboard data'
    });
  }
};

// Get Commission Report with detailed breakdown
exports.getCommissionReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { period = 'month' } = req.query; // day, week, month, year
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = { 
          createdAt: { 
            $gte: new Date(now.setHours(0, 0, 0, 0)) 
          } 
        };
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { $gte: startOfWeek } };
        break;
      case 'month':
        dateFilter = { 
          createdAt: { 
            $gte: new Date(now.getFullYear(), now.getMonth(), 1) 
          } 
        };
        break;
      case 'year':
        dateFilter = { 
          createdAt: { 
            $gte: new Date(now.getFullYear(), 0, 1) 
          } 
        };
        break;
    }

    const commissionReport = await Transaction.aggregate([
      {
        $match: {
          ...dateFilter,
          status: { $in: ['completed', 'partial_settlement'] }
        }
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: '$commissionAmount' },
          totalSales: { $sum: '$totalPrice' },
          transactionCount: { $sum: 1 },
          averageCommission: { $avg: '$commissionAmount' }
        }
      }
    ]);

    // Get commission by match/category
    const commissionByCategory = await Transaction.aggregate([
      {
        $match: {
          ...dateFilter,
          status: { $in: ['completed', 'partial_settlement'] }
        }
      },
      {
        $lookup: {
          from: 'ticketlistings',
          localField: 'ticket',
          foreignField: '_id',
          as: 'ticketDetails'
        }
      },
      {
        $unwind: '$ticketDetails'
      },
      {
        $group: {
          _id: '$ticketDetails.category',
          totalCommission: { $sum: '$commissionAmount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalCommission: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        summary: commissionReport[0] || {
          totalCommission: 0,
          totalSales: 0,
          transactionCount: 0,
          averageCommission: 0
        },
        byCategory: commissionByCategory
      }
    });

  } catch (error) {
    console.error('Commission report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching commission report'
    });
  }
};

// Get System Overview
exports.getSystemOverview = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    // Transaction statistics
    const transactionStats = await Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalCost' }
        }
      }
    ]);

    // Listing statistics
    const listingStats = await TicketListing.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userStats,
        transactionStats,
        listingStats,
        serverTime: new Date(),
        uptime: process.uptime()
      }
    });

  } catch (error) {
    console.error('System overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system overview'
    });
  }
};