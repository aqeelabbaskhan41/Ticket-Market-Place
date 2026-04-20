const User = require("../models/User");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { createNotification } = require("./notificationController");


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
    const { email, password, name, username, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Check username uniqueness if provided
    if (username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
    }

    // Determine if current request is from admin
    const isAdminRequest = req.user && req.user.role === "admin";

    // Regular registrations are always buyers and auto-approved
    // Admin can still create users with specific roles via admin panel
    const role = isAdminRequest ? (req.body.role || "buyer") : "buyer";
    const userStatus = "approved";

    const user = await User.create({
      email,
      password,
      username: username || undefined,
      role,
      activeRole: "buyer",
      status: userStatus,
      profile: {
        fullName: name,
        phone,
      },
      buyerData: {
        purchaseHistory: [],
        favoriteSellers: [],
        totalSpent: 0,
        cart: []
      },
    });

    const token = generateToken(user);

    const userResponse = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      activeRole: user.activeRole,
      status: user.status,
      profile: user.profile,
      points: user.points || 0,
      canSwitchRoles: false,
      buyerData: user.buyerData,
    };

    res.status(201).json({
      success: true,
      message: "Registration successful. Welcome!",
      token,
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
    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
    }

    // Seller pending check — buyers are always approved
    if (user.role === 'seller' && user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: "Your seller account is pending admin approval. You can still login as a buyer once approved.",
      });
    }

    // Generate token with both role and activeRole
    const token = generateToken(user);

    // Build user response based on role
    const userResponse = {
      id: user._id,
      email: user.email,
      username: user.username,
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

// Request to become a seller (BUYERS ONLY)
exports.requestSellerRole = async (req, res) => {
  try {
    const { businessName, phone, bankName, accountNumber, accountHolder } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'seller') {
      return res.status(400).json({
        success: false,
        message: 'You are already a seller'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot request to be sellers'
      });
    }

    if (!businessName) {
      return res.status(400).json({
        success: false,
        message: 'Business name is required'
      });
    }

    // Update user role to pending seller
    user.role = 'seller';
    user.status = 'pending';
    user.activeRole = 'buyer'; // Keep them in buyer mode until approved
    // Initialize seller data
    user.sellerData = {
      businessName,
      listings: [],
      totalSales: 0,
      totalEarnings: 0,
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      bankDetails: {
        bankName: bankName || '',
        accountNumber: accountNumber || '',
        accountHolder: accountHolder || ''
      }
    };

    // Update phone if provided
    if (phone) {
      user.profile.phone = phone;
    }

    await user.save();

    // Notify admins of new seller request
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'system',
        'Seller Role Request',
        `User ${user.email} has requested to become a seller${businessName ? ` for "${businessName}"` : ''}.`,
        '/admin/approvals',
        user._id
      );
    }

    res.status(200).json({
      success: true,
      message: 'Request to become a seller submitted successfully. Awaiting admin approval.',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        activeRole: user.activeRole,
        sellerData: user.sellerData
      }
    });
  } catch (error) {
    console.error('Request seller role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during seller role request'
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

// Register / Login with Google
exports.googleLogin = async (req, res) => {

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token is required",
      });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find user by googleId or email
    let user = await User.findOne({ 
      $or: [
        { googleId },
        { email }
      ]
    });

    if (user) {
      // If user exists but doesn't have googleId linked, link it now
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user if not found
      user = await User.create({
        email,
        googleId,
        role: "buyer",
        activeRole: "buyer",
        status: "approved", // Auto-approve Google users since email is verified
        profile: {
          fullName: name,
          avatar: picture // Ensure schema supports avatar or just skip
        },
        buyerData: {
          purchaseHistory: [],
          favoriteSellers: [],
          totalSpent: 0,
          cart: []
        }
      });
    }

    // Check if account is suspended
    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Build user response
    const userResponse = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      activeRole: user.activeRole,
      status: user.status,
      profile: user.profile,
      points: user.points || 0,
      canSwitchRoles: user.role === 'seller'
    };

    // Add role-specific data
    if (user.role === 'seller') {
      userResponse.buyerData = user.buyerData;
      userResponse.sellerData = user.sellerData;
    } else if (user.role === 'buyer') {
      userResponse.buyerData = user.buyerData;
    }

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      needsUsername: !user.username, // flag for frontend to prompt username setup
      message: "Google login successful"
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during Google login",
    });
  }
};

// Register / Login with Facebook
exports.facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Facebook access token is required",
      });
    }

    // Verify Facebook access token
    const fbResponse = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`);
    const fbData = await fbResponse.json();

    if (fbData.error) {
      return res.status(400).json({
        success: false,
        message: "Invalid Facebook token",
      });
    }

    const { id: facebookId, email, name, picture } = fbData;

    // Find user by facebookId or email
    let user = await User.findOne({ 
      $or: [
        { facebookId },
        { email }
      ]
    });

    if (user) {
      // If user exists but doesn't have facebookId linked, link it now
      if (!user.facebookId) {
        user.facebookId = facebookId;
        await user.save();
      }
    } else {
      // Create new user if not found
      user = await User.create({
        email: email || `${facebookId}@facebook.com`, // Facebook doesn't always return email
        facebookId,
        role: "buyer",
        activeRole: "buyer",
        status: "approved", // Auto-approve Facebook users
        profile: {
          fullName: name,
          avatar: picture?.data?.url
        },
        buyerData: {
          purchaseHistory: [],
          favoriteSellers: [],
          totalSpent: 0,
          cart: []
        }
      });
    }

    // Check if account is suspended
    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Build user response
    const userResponse = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      activeRole: user.activeRole,
      status: user.status,
      profile: user.profile,
      points: user.points || 0,
      canSwitchRoles: user.role === 'seller'
    };

    // Add role-specific data
    if (user.role === 'seller') {
      userResponse.buyerData = user.buyerData;
      userResponse.sellerData = user.sellerData;
    } else if (user.role === 'buyer') {
      userResponse.buyerData = user.buyerData;
    }

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      needsUsername: !user.username, // flag for frontend to prompt username setup
      message: "Facebook login successful"
    });
  } catch (error) {
    console.error("Facebook Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during Facebook login",
    });
  }
};


// Set username (for OAuth users who don't have one yet)
exports.setUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters'
      });
    }

    const trimmed = username.trim().toLowerCase();

    const existing = await User.findOne({ username: trimmed });
    if (existing && existing._id.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username: trimmed },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Username set successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        activeRole: user.activeRole,
        status: user.status,
        profile: user.profile,
        points: user.points || 0,
        canSwitchRoles: user.role === 'seller'
      }
    });
  } catch (error) {
    console.error('Set username error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error setting username'
    });
  }
};

// Facebook OAuth callback — exchange code for access token then login
exports.facebookCallback = async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code || !redirectUri) {
      return res.status(400).json({ success: false, message: 'Missing code or redirectUri' });
    }

    // Exchange code for access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.status(400).json({ success: false, message: tokenData.error.message || 'Failed to exchange Facebook code' });
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile
    const fbRes = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`);
    const fbData = await fbRes.json();

    if (fbData.error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch Facebook profile' });
    }

    const { id: facebookId, email, name, picture } = fbData;

    let user = await User.findOne({ $or: [{ facebookId }, { email }] });

    if (user) {
      if (!user.facebookId) {
        user.facebookId = facebookId;
        await user.save();
      }
    } else {
      user = await User.create({
        email: email || `${facebookId}@facebook.com`,
        facebookId,
        role: 'buyer',
        activeRole: 'buyer',
        status: 'approved',
        profile: { fullName: name, avatar: picture?.data?.url },
        buyerData: { purchaseHistory: [], favoriteSellers: [], totalSpent: 0, cart: [] }
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }

    const token = generateToken(user);

    const userResponse = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      activeRole: user.activeRole,
      status: user.status,
      profile: user.profile,
      points: user.points || 0,
      canSwitchRoles: user.role === 'seller'
    };

    if (user.role === 'seller') {
      userResponse.buyerData = user.buyerData;
      userResponse.sellerData = user.sellerData;
    } else {
      userResponse.buyerData = user.buyerData;
    }

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      needsUsername: !user.username,
      message: 'Facebook login successful'
    });
  } catch (error) {
    console.error('Facebook Callback Error:', error);
    res.status(500).json({ success: false, message: 'Server error during Facebook login' });
  }
};
