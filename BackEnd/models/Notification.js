const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['sale', 'delivery', 'system', 'issue'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        // Dynamic ref based on type, usually SoldTicket or Transaction
    },
    link: {
        type: String // Frontend route to redirect to
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for fast retrieval of user's notifications
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
