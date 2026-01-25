const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create directories if they don't exist
const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Define upload directories
const uploadsDir = path.join(__dirname, '../uploads');
const matchesDir = path.join(__dirname, '../uploads/matches');
const teamLogosDir = path.join(__dirname, '../uploads/teamlogos');
const venueSectionsDir = path.join(__dirname, '../uploads/venue-sections');
const competitionsDir = path.join(__dirname, '../uploads/competitions');

// Create all directories
createDirectory(uploadsDir);
createDirectory(matchesDir);
createDirectory(teamLogosDir);
createDirectory(venueSectionsDir);
createDirectory(competitionsDir);

// Single upload configuration that handles all image types
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on field name and route
    if (file.fieldname === 'logo') {
      cb(null, teamLogosDir);
    } else if (file.fieldname === 'image' && req.baseUrl && req.baseUrl.includes('venues')) {
      cb(null, venueSectionsDir);
    } else if (file.fieldname === 'image' && req.baseUrl && req.baseUrl.includes('competitions')) {
      cb(null, competitionsDir);
    } else {
      cb(null, matchesDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();

    // Determine filename prefix based on field name and context
    if (file.fieldname === 'logo') {
      cb(null, 'logo-' + uniqueSuffix + ext);
    } else if (file.fieldname === 'image' && req.baseUrl && req.baseUrl.includes('venues')) {
      cb(null, 'venue-section-' + uniqueSuffix + ext);
    } else if (file.fieldname === 'image' && req.baseUrl && req.baseUrl.includes('competitions')) {
      cb(null, 'competition-' + uniqueSuffix + ext);
    } else {
      cb(null, 'match-' + uniqueSuffix + ext);
    }
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for all images
  }
});

module.exports = upload;