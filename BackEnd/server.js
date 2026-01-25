const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require("./routes/matchRoutes.js");
const ticketRoutes = require("./routes/ticketRoutes");
const teamRoutes = require("./routes/teamRoutes");
const venueRoutes = require("./routes/venueRoutes");
const competitionRoutes = require("./routes/competitionRoutes");
const roleRoutes = require('./routes/roleRoutes');
const seatCategoryRoutes = require('./routes/seatCategoryRoutes');
const { startEscrowJob } = require('./jobs/escrowJob');

const createAdmin = require('./create-admin');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/matches', express.static(path.join(__dirname, 'uploads/matches')));
app.use('/uploads/teamlogos', express.static(path.join(__dirname, 'uploads/teamlogos')));
app.use('/uploads/venue-sections', express.static(path.join(__dirname, 'uploads/venue-sections')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/tickets", ticketRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/commission', require('./routes/commission.js'));
app.use('/api/withdrawals', require('./routes/withdrawal'));
app.use('/api/roles', roleRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/seat-categories", seatCategoryRoutes);
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Start scheduled jobs
// startEscrowJob() moved to inside app.listen to ensure DB connection

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Ticket Marketplace API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // 1. Connect to Database FIRST
  await connectDB();

  // 2. Run Admin Creation Script
  await createAdmin();

  // 3. Start scheduled jobs
  startEscrowJob();

  // Seed categories
  try {
    const { seedCategories } = require('./controllers/seatCategoryController');
    await seedCategories();
  } catch (err) {
    console.error('Failed to seed categories:', err);
  }

  console.log(`Team logos: http://localhost:${PORT}/uploads/teamlogos/`);
  console.log(`Match images: http://localhost:${PORT}/uploads/matches/`);
});