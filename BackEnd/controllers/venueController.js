const Venue = require("../models/Venue.js");
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Create a new venue
const createVenue = async (req, res) => {
  try {
    const { name, sections } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Venue name is required." });
    }

    // Parse sections if it's a string
    let sectionsArray = [];
    if (sections) {
      try {
        sectionsArray = typeof sections === 'string' ? JSON.parse(sections) : sections;
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid sections format. Must be valid JSON." });
      }
    }

    // Validate sections structure
    if (sectionsArray.length > 0) {
      for (const section of sectionsArray) {
        if (!section.name || !section.image) {
          return res.status(400).json({
            message: "Each section must have a name and image URL"
          });
        }
      }
    }

    const venue = await Venue.create({
      name,
      sections: sectionsArray,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Venue created successfully",
      venue,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Venue already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all venues
const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ name: 1 });
    res.status(200).json(venues);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single venue with sections
const getVenueWithSections = async (req, res) => {
  try {
    const { id } = req.params;

    const venue = await Venue.findById(id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    res.status(200).json(venue);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update venue
const updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: "Venue not found" });

    // Update basic fields
    if (req.body.name) venue.name = req.body.name;

    // Update sections if provided
    if (req.body.sections !== undefined) {
      try {
        venue.sections = typeof req.body.sections === 'string'
          ? JSON.parse(req.body.sections)
          : req.body.sections;

        // Validate sections structure
        if (venue.sections.length > 0) {
          for (const section of venue.sections) {
            if (!section.name || !section.image) {
              return res.status(400).json({
                message: "Each section must have a name and image URL"
              });
            }
          }
        }
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid sections format. Must be valid JSON." });
      }
    }

    await venue.save();

    res.status(200).json({ message: "Venue updated", venue });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Venue already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete venue
const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: "Venue not found" });

    // Delete section images from filesystem
    if (venue.sections && venue.sections.length > 0) {
      for (const section of venue.sections) {
        if (section.image && section.image.startsWith('/uploads/venue-sections/')) {
          const imagePath = path.join(__dirname, '..', section.image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      }
    }

    await venue.deleteOne();
    res.status(200).json({ message: "Venue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Upload section image
const uploadSectionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      // Delete uploaded file
      const filePath = path.join(__dirname, '../uploads/venue-sections', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ message: "Only JPG, PNG, and WebP images are allowed" });
    }

    const imageUrl = `/uploads/venue-sections/${req.file.filename}`;

    res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename,
      message: "Image uploaded successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add or update section to venue
const addOrUpdateSection = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { name, image, description } = req.body;

    if (!name || !image) {
      return res.status(400).json({ message: "Section name and image are required" });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    // Validate section name is from allowed categories
    const allowedSections = [
      "Central Longside Lower",
      "Longside Lower",
      "Shortside Lower",
      "Central Longside Upper",
      "Longside Upper",
      "Shortside Upper",
      "Away Section",
      "VIP Packages"
    ];

    if (!allowedSections.includes(name)) {
      return res.status(400).json({
        message: "Invalid section name. Must be one of: " + allowedSections.join(', ')
      });
    }

    // Check if section already exists
    const sectionIndex = venue.sections.findIndex(s => s.name === name);

    // Delete old image if updating
    if (sectionIndex >= 0 && venue.sections[sectionIndex].image !== image) {
      const oldImagePath = venue.sections[sectionIndex].image;
      if (oldImagePath && oldImagePath.startsWith('/uploads/venue-sections/')) {
        const fullPath = path.join(__dirname, '..', oldImagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    if (sectionIndex >= 0) {
      // Update existing section
      venue.sections[sectionIndex] = {
        name,
        image,
        description: description || venue.sections[sectionIndex].description
      };
    } else {
      // Add new section
      venue.sections.push({
        name,
        image,
        description: description || ''
      });
    }

    await venue.save();

    res.status(200).json({
      message: sectionIndex >= 0 ? "Section updated successfully" : "Section added successfully",
      venue
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove section from venue
const removeSection = async (req, res) => {
  try {
    const { venueId, sectionName } = req.params;

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    // Find section to get image path for deletion
    const sectionToRemove = venue.sections.find(s => s.name === sectionName);
    if (!sectionToRemove) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Delete image file if exists
    if (sectionToRemove.image && sectionToRemove.image.startsWith('/uploads/venue-sections/')) {
      const imagePath = path.join(__dirname, '..', sectionToRemove.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Filter out the section to remove
    venue.sections = venue.sections.filter(s => s.name !== sectionName);

    await venue.save();

    res.status(200).json({
      message: "Section removed successfully",
      venue
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get section image by venue and section name
const getSectionImage = async (req, res) => {
  try {
    const { venueId, sectionName } = req.params;

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const section = venue.sections.find(s => s.name === sectionName);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.status(200).json({
      success: true,
      section: {
        name: section.name,
        image: section.image,
        description: section.description
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createVenue,
  getAllVenues,
  getVenueWithSections,
  updateVenue,
  deleteVenue,
  uploadSectionImage,
  addOrUpdateSection,
  removeSection,
  getSectionImage
};