const Competition = require("../models/Competition.js");
const path = require('path');
const fs = require('fs');

// Create a new competition
const createCompetition = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Competition name is required." });
    }

    const competition = await Competition.create({
      name,
      image: req.body.image || '',
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Competition created successfully",
      competition,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Competition already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Get all competitions
const getAllCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find().sort({ name: 1 });
    res.status(200).json(competitions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update competition
const updateCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: "Competition not found" });

    Object.assign(competition, req.body);
    await competition.save();

    res.status(200).json({ message: "Competition updated", competition });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Competition already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Delete competition
const deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: "Competition not found" });

    await competition.deleteOne();
    res.status(200).json({ message: "Competition deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Upload competition image
const uploadCompetitionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const imageUrl = `/uploads/competitions/${req.file.filename}`;

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

module.exports = {
  createCompetition,
  getAllCompetitions,
  updateCompetition,
  deleteCompetition,
  uploadCompetitionImage
};