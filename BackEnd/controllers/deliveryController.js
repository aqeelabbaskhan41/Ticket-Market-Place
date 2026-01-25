const SoldTicket = require('../models/SoldTicket');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Configure Multer is done in routes, here we handle the logic

exports.deliverTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { deliveryMethod, ...details } = req.body;

        console.log('Delivering ticket:', id);
        console.log('Method:', deliveryMethod);
        console.log('Details:', details);
        console.log('Files:', req.files);

        const soldTicket = await SoldTicket.findById(id);
        if (!soldTicket) {
            return res.status(404).json({ message: 'Sold ticket not found' });
        }

        // Verify seller owns this ticket
        // In a real middleware we would check req.user._id, assuming it's available
        // if (soldTicket.seller.toString() !== req.user.userId) {
        //   return res.status(403).json({ message: 'Not authorized' });
        // }

        const updateData = {
            status: 'delivered',
            deliveryDate: new Date(),
            deliveryDetails: {
                type: deliveryMethod,
            }
        };

        // Handle different delivery methods
        if (deliveryMethod === 'E-Ticket (PDF)' || deliveryMethod === 'Image Ticket') {
            if (req.files && req.files.length > 0) {
                updateData.deliveryDetails.filePaths = req.files.map(f => f.path);
            } else {
                return res.status(400).json({ message: `${deliveryMethod === 'Image Ticket' ? 'Image' : 'PDF'} file is required` });
            }
        } else if (deliveryMethod === 'Mobile Tickets') {
            updateData.deliveryDetails.mobileLinks = {
                general: details.generalLink,
                ios: details.iosLink,
                android: details.androidLink
            };
        } else if (deliveryMethod === 'Official App Login') {
            updateData.deliveryDetails.appLogin = {
                username: details.appUsername,
                password: details.appPassword,
                notes: details.appNotes
            };
        } else if (deliveryMethod === 'Physical Ticket – Post') {
            updateData.deliveryDetails.postal = {
                trackingNumber: details.trackingNumber,
                courier: details.courierName
            };
        } else if (deliveryMethod === 'Physical Ticket – Matchday Collection') {
            updateData.deliveryDetails.collection = {
                location: details.collectionLocation,
                contactName: details.contactPerson,
                contactPhone: details.contactPhone,
                time: details.collectionTime
            };
        }

        const updatedTicket = await SoldTicket.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        // --- NOTIFICATION Logic ---
        try {
            const matchName = soldTicket.match ? `${soldTicket.match.homeTeam} vs ${soldTicket.match.awayTeam}` : 'your match';

            await Notification.create({
                recipient: soldTicket.buyer,
                type: 'delivery',
                title: 'Ticket Delivered! 🎟️',
                message: `Your ticket for ${matchName} has been delivered. Access it now in My Tickets.`,
                relatedId: updatedTicket._id,
                link: '/buyer/tickets/' + updatedTicket._id
            });
            console.log('Notification created for buyer');
        } catch (notifError) {
            console.error('Error creating buyer notification:', notifError);
            // Proceed
        }
        // ---------------------------

        res.status(200).json({
            message: 'Ticket delivered successfully',
            ticket: updatedTicket
        });

    } catch (error) {
        console.error('Delivery Error:', error);
        res.status(500).json({ message: 'Server error during delivery', error: error.message });
    }
};

exports.downloadTicket = async (req, res) => {
    try {
        const { id, fileIndex } = req.params;
        const soldTicket = await SoldTicket.findById(id);

        if (!soldTicket || !soldTicket.deliveryDetails || !soldTicket.deliveryDetails.filePaths) {
            return res.status(404).json({ message: 'Ticket file not found' });
        }

        const relativePath = soldTicket.deliveryDetails.filePaths[fileIndex || 0];
        const path = require('path');
        const fs = require('fs');

        // Resolve absolute path from project root or current working directory
        const filePath = path.resolve(relativePath);

        if (!fs.existsSync(filePath)) {
            console.error('File not found at path:', filePath);
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ message: 'Error downloading file' });
    }
};
