const TicketListing = require("../models/TicketListing");
const Match = require("../models/Match");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const SoldTicket = require("../models/SoldTicket");
const CommissionSettings = require("../models/CommissionSettings");
const Venue = require("../models/Venue");
const Competition = require("../models/Competition");

// Create a ticket listing
exports.createTicketListing = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { match, category, blockArea, restriction, deliveryMethod, quantity, splitType, note, ageBand, price } = req.body;

    // Get match to find venue
    const matchData = await Match.findById(match).populate('venue');

    if (!matchData) {
      return res.status(404).json({ message: "Match not found" });
    }

    let sectionImage = null;

    // Get venue and find section image
    if (matchData.venue && matchData.venue.sections) {
      const section = matchData.venue.sections.find(s => s.name === category);
      if (section) {
        sectionImage = section.image;
      }
    }

    const ticket = new TicketListing({
      match,
      seller: sellerId,
      category,
      blockArea,
      restriction,
      deliveryMethod,
      quantity,
      splitType,
      note,
      ageBand,
      price,
      sectionImage // Add the section image
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all ticket listings for a match
exports.getTicketListingsByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const listings = await TicketListing.find({
      match: matchId,
      status: 'active',
      quantity: { $gt: 0 }
    })
      .populate("seller", "profile.fullName email")
      .select('+sectionImage'); // Include sectionImage in response

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single listing by ID
exports.getTicketListingById = async (req, res) => {
  try {
    const listing = await TicketListing.findById(req.params.id)
      .populate("seller", "profile.fullName email")
      .select('+sectionImage'); // Include sectionImage in response

    if (!listing) return res.status(404).json({ message: "Listing not found." });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update ticket listing
exports.updateTicketListing = async (req, res) => {
  try {
    const listing = await TicketListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const allowedFields = [
      'category', 'blockArea', 'restriction',
      'quantity', 'splitType', 'ageBand',
      'price', 'note', 'status', 'sectionImage' // Add sectionImage
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    const updatedListing = await listing.save();
    res.status(200).json(updatedListing);
  } catch (error) {
    console.error('Error updating ticket listing:', error);
    res.status(500).json({ message: 'Server error while updating ticket listing' });
  }
};

// Delete listing
exports.deleteTicketListing = async (req, res) => {
  try {
    const listing = await TicketListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found." });

    if (listing.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await TicketListing.deleteOne({ _id: req.params.id });
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all tickets for the logged-in seller
exports.getSellerTickets = async (req, res) => {
  try {
    const tickets = await TicketListing.find({ seller: req.user.id })
      .populate('match', 'homeTeam awayTeam date venue')
      .select('+sectionImage') // Include sectionImage
      .sort({ createdAt: -1 });

    const formattedTickets = tickets.map(ticket => ({
      ...ticket._doc,
      matchName: ticket.match ? `${ticket.match.homeTeam} vs ${ticket.match.awayTeam} - ${new Date(ticket.match.date).toLocaleDateString()}` : 'N/A'
    }));

    res.json(formattedTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Calculate commission based on user's specific rate (DYNAMIC)
const calculateCommission = async (buyerId) => {
  try {
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      console.log('Buyer not found, using default commission rate');
      return 0.10; // Default fallback
    }

    // Use the dynamic commission system - get the actual commission rate for this user
    const commissionSettings = await CommissionSettings.findOne();
    if (!commissionSettings) {
      console.log('Commission settings not found, using default');
      return 0.10;
    }

    let commissionRate = 0.10; // Default fallback

    // Check if user has custom commission
    if (buyer.isCustomCommission && buyer.customCommissionRate !== undefined) {
      commissionRate = buyer.customCommissionRate;
      console.log(`Using custom commission rate for user ${buyer.email}: ${commissionRate}`);
    } else {
      // Use level-based commission
      const userLevel = buyer.level || 'level1';
      const levelSetting = commissionSettings.levels.find(l => l.level === userLevel);

      if (levelSetting) {
        commissionRate = levelSetting.commissionRate;
        console.log(`Using level-based commission for user ${buyer.email} (${userLevel}): ${commissionRate}`);
      } else {
        console.log(`Level setting not found for ${userLevel}, using default`);
      }
    }

    console.log(`Final commission rate for user ${buyer.email}: ${commissionRate}`);
    return commissionRate;
  } catch (error) {
    console.error('Error calculating commission:', error);
    // Fallback rate
    return 0.10;
  }
};

const Notification = require('../models/Notification'); // Add Import

// Purchase Ticket Function with Dynamic Commission
exports.purchaseTicket = async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const ticketId = req.params.id;
    const buyerId = req.user.id;

    console.log('=== PURCHASE ATTEMPT ===');
    console.log('Ticket ID:', ticketId);
    console.log('Buyer ID:', buyerId);
    console.log('Quantity:', quantity);

    // Find the ticket listing
    let ticketListing = await TicketListing.findById(ticketId).populate('match');

    if (!ticketListing) {
      return res.status(404).json({
        success: false,
        message: 'Ticket listing not found'
      });
    }

    let matchData = ticketListing.match;
    if (!matchData) {
      return res.status(400).json({
        success: false,
        message: 'Match information not found for this ticket'
      });
    }

    const matchDate = matchData.date;
    if (!matchDate) {
      return res.status(400).json({
        success: false,
        message: 'Match date is missing for this ticket'
      });
    }

    // Check if ticket is available
    if (ticketListing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not available for purchase'
      });
    }

    if (ticketListing.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${ticketListing.quantity} tickets available`
      });
    }

    // Get buyer info
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate commission based on user's dynamic rate
    const commissionRate = await calculateCommission(buyerId);
    const baseCost = ticketListing.price * quantity;
    const commission = Math.round(baseCost * commissionRate);
    const totalCost = baseCost + commission;

    // Check points balance
    if (buyer.points < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points balance. You have ${buyer.points} points but need ${totalCost} points`
      });
    }

    console.log('All checks passed, proceeding with purchase...');
    console.log('Buyer Level:', buyer.level);
    console.log('Commission Rate:', commissionRate);
    console.log('Base Cost:', baseCost);
    console.log('Commission:', commission);
    console.log('Total Cost:', totalCost);

    // Generate unique purchaseId
    const purchaseId = `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('Generated Purchase ID:', purchaseId);

    // Perform purchase operations
    // 1. Deduct points from buyer immediately
    buyer.points -= totalCost;
    await buyer.save();
    console.log('Points deducted from buyer');

    // 2. Update ticket quantity - FIXED: Handle quantity becoming 0
    const newQuantity = ticketListing.quantity - quantity;

    if (newQuantity === 0) {
      // Use direct update to bypass validation when quantity becomes 0
      await TicketListing.findByIdAndUpdate(
        ticketId,
        {
          quantity: 0,
          status: 'sold'
        },
        {
          runValidators: false // Skip validation for quantity
        }
      );
      console.log('Ticket quantity updated to 0 and status set to sold');
    } else {
      // If quantity is still > 0, update normally
      await TicketListing.findByIdAndUpdate(
        ticketId,
        { quantity: newQuantity }
      );
      console.log('Ticket quantity updated to:', newQuantity);
    }

    // 3. Create transaction record with pending status (points in escrow)
    const transaction = await Transaction.create({
      ticket: ticketId,
      buyer: buyerId,
      seller: ticketListing.seller,
      quantity,
      unitPrice: ticketListing.price,
      totalPrice: baseCost,
      commissionRate: commissionRate,
      commissionAmount: commission,
      totalCost: totalCost,
      status: 'pending', // Points in escrow
      matchDate: matchData.date,
      buyerLevel: buyer.level,
      autoReleaseDate: new Date(new Date(matchData.date).setDate(new Date(matchData.date).getDate() + 7))
    });
    console.log('Transaction created:', transaction._id);

    // 4. Create sold ticket record
    const soldTicketData = {
      originalTicket: ticketId,
      buyer: buyerId,
      seller: ticketListing.seller,
      match: ticketListing.match,
      category: ticketListing.category,
      blockArea: ticketListing.blockArea,
      restriction: ticketListing.restriction,
      deliveryMethod: ticketListing.deliveryMethod,
      ageBand: ticketListing.ageBand,
      price: ticketListing.price,
      quantity,
      purchaseDate: new Date(),
      status: 'pending_delivery',
      purchaseId: purchaseId
    };

    // Use findOneAndUpdate with upsert to handle unique constraint gracefully
    const soldTicket = await SoldTicket.findOneAndUpdate(
      { purchaseId: purchaseId },
      soldTicketData,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('Sold ticket created/updated:', soldTicket._id, 'Purchase ID:', purchaseId);

    // --- NOTIFICATION Logic ---
    try {
      if (ticketListing.seller.toString() !== buyerId) { // Confirm seller is different from buyer
        await Notification.create({
          recipient: ticketListing.seller,
          type: 'sale',
          title: 'New Ticket Sale! 🎉',
          message: `You sold ${quantity} ticket(s) for ${matchData.homeTeam} vs ${matchData.awayTeam}. Please deliver the tickets now.`,
          relatedId: soldTicket._id,
          link: '/seller/deliveries?action=deliver&saleId=' + soldTicket._id
        });
        console.log('Notification created for seller');
      }
    } catch (notifError) {
      console.error('Error creating seller notification:', notifError);
      // Proceed without failing the purchase
    }
    // ---------------------------

    console.log('=== PURCHASE COMPLETED SUCCESSFULLY ===');

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${quantity} ticket(s)`,
      transaction: {
        id: transaction._id,
        totalCost,
        totalPrice: baseCost,
        commission: commission,
        commissionRate: commissionRate * 100,
        buyerLevel: buyer.level,
        quantity,
        ticketDetails: {
          match: `${matchData.homeTeam} vs ${matchData.awayTeam}`,
          venue: matchData.venueName || matchData.venue,
          category: ticketListing.category,
          blockArea: ticketListing.blockArea,
          sectionImage: ticketListing.sectionImage // Include section image
        }
      },
      soldTicketId: soldTicket._id,
      purchaseId: purchaseId
    });

  } catch (error) {
    console.error('=== PURCHASE ERROR ===', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    if (error.code === 11000) {
      // Handle duplicate key error by retrying with a new purchaseId
      console.log('Duplicate purchaseId detected, this should not happen with unique generation');
      return res.status(400).json({
        success: false,
        message: 'Purchase conflict detected. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during purchase: ' + error.message
    });
  }
}

// Get purchased tickets for the logged-in buyer with point status
exports.getPurchasedTickets = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const purchasedTickets = await SoldTicket.find({ buyer: buyerId })
      .populate({
        path: 'match',
        select: 'homeTeam awayTeam venue venueName date competition',
        populate: {
          path: 'venue',
          select: 'name sections'
        }
      })
      .populate('seller', 'profile.fullName email')
      .sort({ purchaseDate: -1 });

    const competitions = await Competition.find({});
    const competitionMap = {};
    competitions.forEach(c => {
      competitionMap[c.name] = c.image;
    });

    // Get transaction data for point status
    const transactions = await Transaction.find({
      buyer: buyerId
    }).select('ticket status issueReported issueCategory issueDescription autoReleaseDate commissionAmount totalCost buyerLevel escrowReleasedAt');

    // Format the response with point status
    const formattedTickets = purchasedTickets.map(ticket => {
      const transaction = transactions.find(t =>
        t.ticket && t.ticket.toString() === ticket.originalTicket?.toString()
      );

      // Calculate days until auto-release
      let daysUntilRelease = null;
      let pointStatus = 'completed';

      if (transaction) {
        if (transaction.status === 'pending') {
          pointStatus = 'in_escrow';
          if (transaction.autoReleaseDate) {
            const now = new Date();
            const releaseDate = new Date(transaction.autoReleaseDate);
            daysUntilRelease = Math.ceil((releaseDate - now) / (1000 * 60 * 60 * 24));
            daysUntilRelease = Math.max(0, daysUntilRelease); // Don't show negative days
          }
        } else if (transaction.status === 'under_review') {
          pointStatus = 'under_review';
        } else if (transaction.status === 'refunded') {
          pointStatus = 'refunded';
        } else if (transaction.status === 'completed') {
          pointStatus = 'completed';
        } else if (transaction.status === 'partial_settlement') {
          pointStatus = 'partial_settlement';
        }
      }

      // Determine if user can report issue
      const canReportIssue = ticket.status === 'delivered' &&
        transaction &&
        !transaction.issueReported &&
        transaction.status === 'pending';

      // Get section image from match venue or original ticket
      let sectionImage = ticket.sectionImage;
      if (!sectionImage && ticket.match && ticket.match.venue && ticket.match.venue.sections) {
        const section = ticket.match.venue.sections.find(s => s.name === ticket.category);
        if (section) {
          sectionImage = section.image;
        }
      }

      return {
        _id: ticket._id,
        purchaseId: `PUR-${ticket._id.toString().slice(-6).toUpperCase()}`,
        match: ticket.match ? `${ticket.match.homeTeam} vs ${ticket.match.awayTeam}` : 'Match not found',
        venue: ticket.match?.venueName || ticket.match?.venue?.name || 'Venue not available',
        category: ticket.category,
        block: ticket.blockArea,
        quantity: ticket.quantity,
        pricePerTicket: ticket.price,
        totalPoints: ticket.price * ticket.quantity,
        commission: transaction?.commissionAmount || 0,
        commissionRate: transaction ? transaction.commissionRate * 100 : 0,
        buyerLevel: transaction?.buyerLevel || 'level1',
        totalPaid: transaction?.totalCost || (ticket.price * ticket.quantity),
        status: ticket.status,
        deliveryMethod: ticket.deliveryMethod,
        purchaseDate: ticket.purchaseDate,
        sellerName: 'Verified Seller',
        sectionImage: sectionImage, // Add section image
        sectionDescription: ticket.match?.venue?.sections?.find(s => s.name === ticket.category)?.description || '',
        competitionImage: ticket.match?.competition ? competitionMap[ticket.match.competition] : null,

        // Point system status
        pointStatus: pointStatus,
        daysUntilRelease: daysUntilRelease,
        issueReported: transaction?.issueReported || false,
        issueCategory: transaction?.issueCategory,
        issueDescription: transaction?.issueDescription,
        canReportIssue: canReportIssue,
        transactionId: transaction?._id,
        escrowReleasedAt: transaction?.escrowReleasedAt
      };
    });

    res.status(200).json({
      success: true,
      tickets: formattedTickets
    });
  } catch (error) {
    console.error('Error fetching purchased tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching purchased tickets'
    });
  }
};

// Get single purchased ticket by ID
exports.getPurchasedTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    const ticket = await SoldTicket.findOne({ _id: id, buyer: buyerId })
      .populate({
        path: 'match',
        select: 'homeTeam awayTeam venue venueName date competition',
        populate: {
          path: 'venue',
          select: 'name sections'
        }
      })
      .populate('seller', 'profile.fullName email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    let competitionImage = null;
    if (ticket.match?.competition) {
      const comp = await Competition.findOne({ name: ticket.match.competition });
      if (comp) competitionImage = comp.image;
    }

    // Get transaction for point status
    const transaction = await Transaction.findOne({
      ticket: ticket.originalTicket,
      buyer: buyerId
    });

    let pointStatus = 'completed';
    let daysUntilRelease = null;

    if (transaction) {
      if (transaction.status === 'pending') {
        pointStatus = 'in_escrow';
        if (transaction.autoReleaseDate) {
          const now = new Date();
          const releaseDate = new Date(transaction.autoReleaseDate);
          daysUntilRelease = Math.ceil((releaseDate - now) / (1000 * 60 * 60 * 24));
          daysUntilRelease = Math.max(0, daysUntilRelease);
        }
      } else if (transaction.status === 'under_review') transaction.status = 'under_review';
      else if (transaction.status === 'refunded') transaction.status = 'refunded';
      else if (transaction.status === 'completed') transaction.status = 'completed';
    }

    const canReportIssue = ticket.status === 'delivered' &&
      transaction &&
      !transaction.issueReported &&
      transaction.status === 'pending';

    let sectionImage = ticket.sectionImage;
    if (!sectionImage && ticket.match && ticket.match.venue && ticket.match.venue.sections) {
      const section = ticket.match.venue.sections.find(s => s.name === ticket.category);
      if (section) {
        sectionImage = section.image;
      }
    }

    const formattedTicket = {
      _id: ticket._id,
      purchaseId: `PUR-${ticket._id.toString().slice(-6).toUpperCase()}`,
      match: ticket.match ? `${ticket.match.homeTeam} vs ${ticket.match.awayTeam}` : 'Match not found',
      matchDate: ticket.match?.date,
      venue: ticket.match?.venueName || ticket.match?.venue?.name || 'Venue not available',
      category: ticket.category,
      block: ticket.blockArea,
      row: ticket.row, // Assuming row might exist in future or schema
      seats: ticket.seats, // Assuming seats might exist
      quantity: ticket.quantity,
      pricePerTicket: ticket.price,
      totalPoints: ticket.price * ticket.quantity,
      status: ticket.status,
      deliveryMethod: ticket.deliveryMethod,
      deliveryDetails: ticket.deliveryDetails, // CRITICAL: Include delivery details
      deliveryDate: ticket.deliveryDate,
      purchaseDate: ticket.purchaseDate,
      sellerName: 'Verified Seller',
      sectionImage: sectionImage,
      competitionImage: competitionImage,

      pointStatus,
      daysUntilRelease,
      issueReported: transaction?.issueReported || false,
      canReportIssue,
      transactionId: transaction?._id
    };

    res.status(200).json({ success: true, ticket: formattedTicket });

  } catch (error) {
    console.error('Error fetching purchased ticket:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Report Issue with Ticket
exports.reportTicketIssue = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { category, description, urgency } = req.body;
    const buyerId = req.user.id;

    console.log('=== REPORTING ISSUE ===');
    console.log('Ticket ID:', ticketId);
    console.log('Buyer ID:', buyerId);
    console.log('Issue Data:', { category, description, urgency });

    // Find the sold ticket
    const soldTicket = await SoldTicket.findById(ticketId)
      .populate('match', 'homeTeam awayTeam venue date')
      .populate('seller', 'profile.fullName email');

    if (!soldTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Verify buyer owns this ticket
    if (soldTicket.buyer.toString() !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to report issue for this ticket'
      });
    }

    // Check if ticket is delivered
    if (soldTicket.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only report issues for delivered tickets'
      });
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      ticket: soldTicket.originalTicket,
      buyer: buyerId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if already reported
    if (transaction.issueReported) {
      return res.status(400).json({
        success: false,
        message: 'Issue already reported for this ticket'
      });
    }

    // Check if points are still in escrow
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot report issue - points are no longer in escrow'
      });
    }

    // Update transaction with detailed issue info
    transaction.issueReported = true;
    transaction.issueCategory = category;
    transaction.issueDescription = description;
    transaction.issueUrgency = urgency;
    transaction.status = 'under_review';
    transaction.issueReportedAt = new Date();
    await transaction.save();

    console.log('Issue reported successfully for transaction:', transaction._id);

    res.status(200).json({
      success: true,
      message: 'Issue reported successfully. Admin will review your case.',
      transaction: {
        id: transaction._id,
        status: transaction.status
      }
    });
  } catch (error) {
    console.error('Error reporting ticket issue:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reporting ticket issue'
    });
  }
};

// Get sales history for the logged-in seller with CORRECT point calculation
exports.getSalesHistory = async (req, res) => {
  try {
    const sellerId = req.user.id;

    console.log('=== FETCHING SALES HISTORY ===');
    console.log('Seller ID:', sellerId);

    // Get seller's actual points from User model
    const seller = await User.findById(sellerId);

    if (!seller) {
      console.log('Seller not found');
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    console.log('Seller data from DB:', {
      points: seller.points,
      totalWithdrawn: seller.totalWithdrawn,
      email: seller.email
    });

    const sales = await SoldTicket.find({ seller: sellerId })
      .populate({
        path: 'match',
        select: 'homeTeam awayTeam venue venueName date competition',
        populate: {
          path: 'venue',
          select: 'name sections'
        }
      })
      .populate('buyer', 'profile.fullName email')
      .sort({ purchaseDate: -1 });

    const competitions = await Competition.find({});
    const competitionMap = {};
    competitions.forEach(c => {
      competitionMap[c.name] = c.image;
    });

    console.log('Found sales:', sales.length);

    // Get transactions for point status
    const transactions = await Transaction.find({
      seller: sellerId
    });

    console.log('Found transactions:', transactions.length);
    transactions.forEach(t => {
      console.log(`Transaction: ${t._id}, Status: ${t.status}, Amount: ${t.totalPrice}`);
    });

    // CORRECT POINT CALCULATION:
    // Total Points = seller's actual points in account + withdrawn points
    const totalPoints = (seller.points || 0) + (seller.totalWithdrawn || 0);

    // Available Points = seller's actual points in account (ready for withdrawal)
    const availablePoints = seller.points || 0;

    // Pending Points = points still in escrow (pending transactions)
    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    const pendingPoints = pendingTransactions.reduce((sum, trans) => sum + (trans.totalPrice || 0), 0);

    console.log('Point calculations:', {
      totalPoints,
      availablePoints,
      pendingPoints,
      withdrawnPoints: seller.totalWithdrawn || 0,
      sellerPoints: seller.points,
      sellerTotalWithdrawn: seller.totalWithdrawn
    });

    const formattedSales = sales.map(sale => {
      const transaction = transactions.find(t =>
        t.ticket && t.ticket.toString() === sale.originalTicket?.toString()
      );

      // Get section image for this sale
      let sectionImage = sale.sectionImage;
      if (!sectionImage && sale.match && sale.match.venue && sale.match.venue.sections) {
        const section = sale.match.venue.sections.find(s => s.name === sale.category);
        if (section) {
          sectionImage = section.image;
        }
      }

      return {
        _id: sale._id,
        purchaseId: sale.purchaseId,
        saleId: `SALE-${sale._id.toString().slice(-6).toUpperCase()}`,
        match: sale.match ? `${sale.match.homeTeam} vs ${sale.match.awayTeam}` : 'Match not found',
        buyer: 'Customer',
        category: sale.category,
        quantity: sale.quantity,
        price: sale.price,
        total: sale.price * sale.quantity,
        status: sale.status,
        purchaseDate: sale.purchaseDate,
        deliveryMethod: sale.deliveryMethod,
        sectionImage: sectionImage, // Add section image
        competitionImage: sale.match?.competition ? competitionMap[sale.match.competition] : null,
        pointStatus: transaction?.status || 'unknown',
        autoReleaseDate: transaction?.autoReleaseDate,
        escrowReleasedAt: transaction?.escrowReleasedAt,
        issueReported: transaction?.issueReported || false,
        buyerLevel: transaction?.buyerLevel || 'level1',
        commissionRate: transaction ? transaction.commissionRate * 100 : 0
      };
    });

    const response = {
      success: true,
      sales: formattedSales,
      stats: {
        totalSales: sales.length,
        totalPoints: totalPoints,           // Total lifetime points earned
        availablePoints: availablePoints,   // Points currently in account (ready for withdrawal)
        pendingPoints: pendingPoints,       // Points still in escrow
        withdrawnPoints: seller.totalWithdrawn || 0, // Points already withdrawn
        inEscrowCount: pendingTransactions.length,
        completedCount: transactions.filter(t => t.status === 'completed').length
      }
    };

    console.log('Final API response stats:', response.stats);

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching sales history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sales history: ' + error.message
    });
  }
};

// Update ticket delivery status (for sellers)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, ticketUrl, qrCode } = req.body;
    const sellerId = req.user.id;

    const soldTicket = await SoldTicket.findById(ticketId);

    if (!soldTicket) {
      return res.status(404).json({
        success: false,
        message: 'Sold ticket not found'
      });
    }

    // Check if the logged-in user is the seller
    if (soldTicket.seller.toString() !== sellerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ticket'
      });
    }

    // Update fields
    if (status) soldTicket.status = status;
    if (ticketUrl) soldTicket.ticketUrl = ticketUrl;
    if (qrCode) soldTicket.qrCode = qrCode;

    await soldTicket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      ticket: soldTicket
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating ticket status'
    });
  }
};

// Admin: Resolve ticket dispute
exports.resolveDispute = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { decision, notes, penaltyAmount, buyerRefund, sellerPayout } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Get buyer and seller
    const buyer = await User.findById(transaction.buyer);
    const seller = await User.findById(transaction.seller);

    if (!buyer || !seller) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let message = '';

    switch (decision) {
      case 'approve_sale':
        // Release points to seller
        seller.points += transaction.totalPrice;
        transaction.status = 'completed';
        transaction.escrowReleasedAt = new Date();
        message = 'Sale approved - points released to seller';
        break;

      case 'approve_refund':
        // Refund points to buyer
        buyer.points += transaction.totalCost;
        transaction.status = 'refunded';
        message = 'Refund approved - points returned to buyer';
        break;

      case 'partial':
        // Partial settlement
        if (buyerRefund > 0) {
          buyer.points += buyerRefund;
        }
        if (sellerPayout > 0) {
          seller.points += sellerPayout;
        }
        transaction.status = 'partial_settlement';
        message = 'Partial settlement processed';
        break;
    }

    // Save admin decision
    transaction.adminDecision = {
      decision,
      notes,
      decidedAt: new Date(),
      penaltyAmount,
      buyerRefund,
      sellerPayout
    };

    await transaction.save();
    await buyer.save();
    await seller.save();

    res.status(200).json({
      success: true,
      message,
      transaction: transaction
    });

  } catch (error) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resolving dispute'
    });
  }
};

// Get all disputes for admin
exports.getAdminDisputes = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const disputes = await Transaction.find({
      status: { $in: ['under_review', 'completed', 'refunded', 'partial_settlement'] },
      issueReported: true
    })
      .populate('buyer', 'profile.fullName email')
      .populate('seller', 'profile.fullName email')
      .populate({
        path: 'ticket',
        select: 'match category blockArea sectionImage',
        populate: {
          path: 'match',
          select: 'homeTeam awayTeam venueName'
        }
      })
      .sort({ createdAt: -1 });

    const formattedDisputes = disputes.map(transaction => {
      const ticket = transaction.ticket;
      const match = ticket?.match;

      return {
        transactionId: transaction._id,
        match: match ? `${match.homeTeam} vs ${match.awayTeam}` : 'Match not found',
        venue: match?.venueName || 'Venue not available',
        category: ticket?.category,
        blockArea: ticket?.blockArea,
        sectionImage: ticket?.sectionImage,
        buyerName: transaction.buyer?.profile?.fullName || transaction.buyer?.email,
        sellerName: transaction.seller?.profile?.fullName || transaction.seller?.email,
        totalPrice: transaction.totalPrice,
        commission: transaction.commissionAmount,
        totalCost: transaction.totalCost,
        quantity: transaction.quantity,
        status: transaction.status,
        issueDescription: transaction.issueDescription,
        purchaseDate: transaction.createdAt,
        adminDecision: transaction.adminDecision,
        buyerLevel: transaction.buyerLevel,
        commissionRate: transaction.commissionRate * 100,
        escrowReleasedAt: transaction.escrowReleasedAt
      };
    });

    res.status(200).json({
      success: true,
      disputes: formattedDisputes
    });

  } catch (error) {
    console.error('Error fetching admin disputes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching disputes'
    });
  }
};

// ============================================================================
// NEW ESCROW RELEASE FUNCTIONS
// ============================================================================

// Auto-release escrowed points after autoReleaseDate passes
exports.autoReleaseEscrow = async () => {
  try {
    const now = new Date();
    console.log('=== AUTO RELEASE ESCROW JOB RUNNING ===', now);

    // Find pending transactions where autoReleaseDate has passed and no issue reported
    const pendingTransactions = await Transaction.find({
      status: 'pending',
      autoReleaseDate: { $lte: now },
      issueReported: { $ne: true }
    }).populate('seller', 'points').populate('buyer', 'points level');

    console.log(`Found ${pendingTransactions.length} transactions to process`);

    let releasedCount = 0;
    let commissionCollected = 0;

    for (const transaction of pendingTransactions) {
      try {
        const seller = await User.findById(transaction.seller._id);
        const buyer = await User.findById(transaction.buyer._id);

        if (!seller || !buyer) {
          console.log('Seller or buyer not found for transaction:', transaction._id);
          continue;
        }

        // Release points to seller (base price without commission)
        seller.points += transaction.totalPrice;
        await seller.save();

        // Commission is already deducted from buyer during purchase
        // So commission automatically goes to system/admin
        commissionCollected += transaction.commissionAmount;

        // Update transaction status
        transaction.status = 'completed';
        transaction.escrowReleasedAt = new Date();
        await transaction.save();

        // Update sold ticket status if needed
        await SoldTicket.findOneAndUpdate(
          { originalTicket: transaction.ticket, buyer: transaction.buyer },
          { status: 'completed' }
        );

        releasedCount++;
        console.log(`Released ${transaction.totalPrice} points to seller ${seller._id} for transaction ${transaction._id}`);

      } catch (txError) {
        console.error(`Error processing transaction ${transaction._id}:`, txError);
      }
    }

    console.log(`=== AUTO RELEASE COMPLETED ===`);
    console.log(`Released ${releasedCount} transactions`);
    console.log(`Total commission collected: ${commissionCollected} points`);

    return {
      releasedCount,
      commissionCollected,
      totalProcessed: pendingTransactions.length
    };

  } catch (error) {
    console.error('Error in auto-release escrow job:', error);
    throw error;
  }
};

// Get admin commission summary and payout
exports.getAdminCommissionSummary = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get all completed transactions
    const completedTransactions = await Transaction.find({
      status: 'completed',
      ...dateFilter
    });

    // Calculate totals
    const totalCommission = completedTransactions.reduce((sum, tx) => sum + tx.commissionAmount, 0);
    const totalSales = completedTransactions.reduce((sum, tx) => sum + tx.totalPrice, 0);
    const totalVolume = totalSales + totalCommission;

    // Commission by user level
    const commissionByLevel = {
      level1: completedTransactions.filter(tx => tx.buyerLevel === 'level1').reduce((sum, tx) => sum + tx.commissionAmount, 0),
      level2: completedTransactions.filter(tx => tx.buyerLevel === 'level2').reduce((sum, tx) => sum + tx.commissionAmount, 0),
      level3: completedTransactions.filter(tx => tx.buyerLevel === 'level3').reduce((sum, tx) => sum + tx.commissionAmount, 0)
    };

    // Recent transactions for detail view
    const recentTransactions = await Transaction.find({
      status: 'completed',
      ...dateFilter
    })
      .populate('buyer', 'profile.fullName email level')
      .populate('seller', 'profile.fullName email')
      .populate({
        path: 'ticket',
        select: 'match category blockArea sectionImage',
        populate: {
          path: 'match',
          select: 'homeTeam awayTeam venueName'
        }
      })
      .sort({ escrowReleasedAt: -1 })
      .limit(50);

    const formattedTransactions = recentTransactions.map(tx => {
      const ticket = tx.ticket;
      const match = ticket?.match;

      return {
        transactionId: tx._id,
        purchaseId: `PUR-${tx._id.toString().slice(-6).toUpperCase()}`,
        match: match ? `${match.homeTeam} vs ${match.awayTeam}` : 'Match not found',
        venue: match?.venueName || 'Venue not available',
        buyer: tx.buyer?.profile?.fullName || tx.buyer?.email,
        buyerLevel: tx.buyerLevel,
        seller: tx.seller?.profile?.fullName || tx.seller?.email,
        saleAmount: tx.totalPrice,
        commission: tx.commissionAmount,
        commissionRate: (tx.commissionRate * 100).toFixed(1) + '%',
        total: tx.totalCost,
        sectionImage: ticket?.sectionImage,
        releaseDate: tx.escrowReleasedAt,
        purchaseDate: tx.createdAt
      };
    });

    res.status(200).json({
      success: true,
      summary: {
        totalCommission,
        totalSales,
        totalVolume,
        transactionCount: completedTransactions.length,
        commissionByLevel,
        dateRange: {
          start: startDate,
          end: endDate
        }
      },
      recentTransactions: formattedTransactions
    });

  } catch (error) {
    console.error('Error fetching admin commission summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching commission data'
    });
  }
};

// Manual escrow release for admin
exports.manualReleaseEscrow = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate('seller', 'points')
      .populate('buyer', 'points level');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not in pending status'
      });
    }

    if (transaction.issueReported) {
      return res.status(400).json({
        success: false,
        message: 'Cannot release escrow - issue reported for this transaction'
      });
    }

    // Release points to seller
    transaction.seller.points += transaction.totalPrice;
    await transaction.seller.save();

    // Update transaction
    transaction.status = 'completed';
    transaction.escrowReleasedAt = new Date();
    transaction.adminManuallyReleased = true;
    transaction.adminReleaseBy = req.user.id;
    await transaction.save();

    // Update sold ticket
    await SoldTicket.findOneAndUpdate(
      { originalTicket: transaction.ticket, buyer: transaction.buyer },
      { status: 'completed' }
    );

    res.status(200).json({
      success: true,
      message: 'Escrow released manually',
      transaction: {
        id: transaction._id,
        amountReleased: transaction.totalPrice,
        commission: transaction.commissionAmount,
        seller: transaction.seller._id
      }
    });

  } catch (error) {
    console.error('Error in manual escrow release:', error);
    res.status(500).json({
      success: false,
      message: 'Server error releasing escrow'
    });
  }
};

// Run escrow release on demand (for testing)
exports.runEscrowReleaseNow = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const result = await exports.autoReleaseEscrow();

    res.status(200).json({
      success: true,
      message: 'Escrow release job executed successfully',
      result
    });
  } catch (error) {
    console.error('Error running escrow release:', error);
    res.status(500).json({
      success: false,
      message: 'Error running escrow release job'
    });
  }
};