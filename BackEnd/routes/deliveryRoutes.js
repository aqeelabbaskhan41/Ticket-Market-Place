const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for PDF uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadDir = 'uploads/tickets/pdf';

        // Check if the delivery method is 'Image Ticket'
        // This comes from the URL or could be in the body if sent before files
        // But since it's a multipart request, we can check for image mime types
        if (file.mimetype.startsWith('image/')) {
            uploadDir = 'uploads/tickets/images';
        }

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const prefix = file.mimetype.startsWith('image/') ? 'image-' : 'ticket-';
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Middleware to verify token (assuming you have one, if not we can skip for now or use a dummy)
// const auth = require('../middleware/auth'); 

// Route to deliver a ticket
// Using 'upload.array' to allow multiple files if needed, or single if preferred. 
// Field name 'files' must match frontend.
router.post('/deliver/:id', upload.array('files', 5), deliveryController.deliverTicket);

// Route to download a ticket file
// Route to download a ticket file
router.get('/download/:id', deliveryController.downloadTicket);
router.get('/download/:id/:fileIndex', deliveryController.downloadTicket);

module.exports = router;
