const Notification = require('../models/Notification');

// Get all notifications for the logged-in user
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            read: false
        });

        res.status(200).json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

// Mark a single notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error('Error marking notification read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { read: true }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to create notification (internal use)
exports.createNotification = async (recipientId, type, title, message, link, relatedId) => {
    try {
        await Notification.create({
            recipient: recipientId,
            type,
            title,
            message,
            link,
            relatedId
        });
        // In a real app with Socket.io, we would emit the event here
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
