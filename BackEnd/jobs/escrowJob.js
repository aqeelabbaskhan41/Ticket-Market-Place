const cron = require('node-cron');
const { autoReleaseEscrow } = require('../controllers/ticketController');

// Run every hour to check for escrow releases
const startEscrowJob = () => {
  console.log('Starting escrow auto-release job...');
  
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running scheduled escrow release check...');
      const result = await autoReleaseEscrow();
      console.log('Escrow release job completed:', result);
    } catch (error) {
      console.error('Escrow release job failed:', error);
    }
  });

  // Also run once on startup to catch any missed transactions
  setTimeout(async () => {
    try {
      console.log('Running initial escrow release check...');
      const result = await autoReleaseEscrow();
      console.log('Initial escrow release completed:', result);
    } catch (error) {
      console.error('Initial escrow release failed:', error);
    }
  }, 10000); // Run 10 seconds after startup
};

module.exports = { startEscrowJob };