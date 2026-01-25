const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      activeRole: user.activeRole,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Build user response based on role
    const userResponse = {
      _id: user._id,
      email: user.email,
      role: user.role, // Actual role (admin, seller, buyer)
      activeRole: user.activeRole, // Current active mode
      status: user.status,
      points: user.points || 0,
      profile: user.profile,
      canSwitchRoles: user.role === 'seller', // Only sellers can switch
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Add role-specific data
    if (user.role === 'seller') {
      // Sellers get access to both buyer and seller data
      userResponse.buyerData = user.buyerData;
      userResponse.sellerData = user.sellerData;
    } else if (user.role === 'buyer') {
      // Buyers only get buyer data
      userResponse.buyerData = user.buyerData;
    }

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user profile"
    });
  }
};

// Register User
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Determine if current request is from admin
    const isAdminRequest = req.user && req.user.role === "admin";
    
    // Determine user status based on role and request type
    let userStatus;
    
    if (isAdminRequest) {
      // Admin-created users are always approved (admins, sellers, buyers)
      userStatus = "approved";
    } else {
      // Regular registration: buyers auto-approved, sellers need approval
      if (role === "buyer") {
        userStatus = "approved"; // Auto-approve buyers
      } else if (role === "seller") {
        userStatus = "pending"; // Sellers need manual approval
      } else {
        userStatus = "pending"; // Default for other roles
      }
    }

    // Set activeRole based on actual role
    let activeRole = role || "buyer";

    // Create user with appropriate status and role data
    const user = await User.create({
      email,
      password,
      role: role || "buyer",
      activeRole: activeRole,
      status: userStatus,
      profile: {
        name,
        phone,
      },
      // Initialize empty data structures
      buyerData: {
        purchaseHistory: [],
        favoriteSellers: [],
        totalSpent: 0,
        cart: []
      },
      ...(role === 'seller' && {
        sellerData: {
          listings: [],
          totalSales: 0,
          totalEarnings: 0,
          rating: 0,
          reviewCount: 0,
          isVerified: false,
          bankDetails: {}
        }
      })
    });

    // Generate token (only if user is approved)
    let token = null;
    if (user.status === "approved") {
      token = generateToken(user);
    }

    // Prepare response message based on status
    let message = "Registration successful";
    if (isAdminRequest) {
      message = "User created and auto-approved by admin";
    } else if (user.status === "pending") {
      message = "Registration successful. Awaiting admin approval.";
    } else {
      message = "Registration successful. Account is now active.";
    }

    // Build user response for registration
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      activeRole: user.activeRole,
      status: user.status,
      profile: user.profile,
      canSwitchRoles: user.role === 'seller'
    };

    // Add initial data based on role
    if (user.role === 'seller' && user.status === 'approved') {
      userResponse.buyerData = user.buyerData;
      userResponse.sellerData = user.sellerData;
    } else if (user.role === 'buyer') {
      userResponse.buyerData = user.buyerData;
    }

    res.status(201).json({
      success: true,
      message,
      token, // Token will be null for pending sellers
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is approved
    if (user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Account pending admin approval. Please wait for approval to access your account.",
      });
    }

    // Generate token with both role and activeRole
    const token = generateToken(user);

    // Build user response based on role
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role, // Actual role
      activeRole: user.activeRole, // Current active mode
      status: user.status,
      profile: user.profile,
      points: user.points || 0,
      canSwitchRoles: user.role === 'seller' // Only sellers can switch
    };

    // Add role-specific data
    if (user.role === 'seller') {
      // Sellers get access to both datasets
      userResponse.buyerData = user.buyerData;
      userResponse.sellerData = user.sellerData;
    } else if (user.role === 'buyer') {
      // Buyers only get buyer data
      userResponse.buyerData = user.buyerData;
    }

    res.json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

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

    // Don't switch if already in that role
    if (user.activeRole === role) {
      return res.status(400).json({
        success: false,
        message: `Already in ${role} mode`
      });
    }

    // Switch role
    user.activeRole = role;
    await user.save();

    // Generate new token with updated activeRole
    const token = generateToken(user);

    // Get updated user
    const updatedUser = await User.findById(userId).select('-password');

    res.json({
      success: true,
      message: `Switched to ${role} mode successfully`,
      token, // Return new token with updated activeRole
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role, // Actual role (always 'seller' for switchers)
        activeRole: updatedUser.activeRole, // Current active mode
        canSwitchRoles: updatedUser.role === 'seller',
        status: updatedUser.status,
        profile: updatedUser.profile,
        points: updatedUser.points,
        // Sellers get both datasets
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

    // Build user response
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role, // Actual role
      activeRole: user.activeRole, // Current active mode
      canSwitchRoles: user.role === 'seller',
      status: user.status,
      points: user.points,
      profile: user.profile,
    };

    // Add role-specific data
    if (user.role === 'seller') {
      // Sellers get access to both buyer and seller data
      userResponse.buyerData = user.buyerData;
      userResponse.sellerData = user.sellerData;
    } else if (user.role === 'buyer') {
      // Buyers only get buyer data
      userResponse.buyerData = user.buyerData;
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