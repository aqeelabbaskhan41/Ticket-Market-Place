const Team = require("../models/Team.js");
const fs = require('fs');
const path = require('path');

// Create a new team - DEBUG VERSION
const createTeam = async (req, res) => {
  try {
    console.log('=== CREATE TEAM REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);
    
    const { name } = req.body;

    if (!name) {
      console.log('Error: Team name is required');
      return res.status(400).json({ message: "Team name is required." });
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.log('Error: User not authenticated');
      return res.status(401).json({ message: "User not authenticated" });
    }

    const teamData = {
      name,
      createdBy: req.user._id,
    };

    // Add logo URL if file was uploaded
    if (req.file) {
      console.log('File uploaded:', {
        filename: req.file.filename,
        path: req.file.path,
        destination: req.file.destination
      });
      
      teamData.logo = `/uploads/teamlogos/${req.file.filename}`;
      
      // Check if file actually exists
      const filePath = path.join(__dirname, '..', req.file.path);
      console.log('Checking file at:', filePath);
      console.log('File exists:', fs.existsSync(filePath));
    }

    console.log('Team data to create:', teamData);

    const team = await Team.create(teamData);

    console.log('Team created successfully:', team);

    res.status(201).json({
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    console.error('=== CREATE TEAM ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    if (error.code === 11000) {
      console.log('Duplicate team name error');
      return res.status(400).json({ message: "Team already exists" });
    }
    
    // Clean up uploaded file if team creation failed
    if (req.file) {
      try {
        const filePath = path.join(__dirname, '..', req.file.path);
        console.log('Cleaning up file:', filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
};

// Get all teams
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.status(200).json(teams);
  } catch (error) {
    console.error('Error getting teams:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update team
const updateTeam = async (req, res) => {
  try {
    console.log('=== UPDATE TEAM REQUEST ===');
    console.log('Team ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const team = await Team.findById(req.params.id);
    if (!team) {
      console.log('Error: Team not found');
      return res.status(404).json({ message: "Team not found" });
    }

    const oldLogo = team.logo;

    // Update basic fields
    Object.assign(team, req.body);

    // Update logo if new file was uploaded
    if (req.file) {
      team.logo = `/uploads/teamlogos/${req.file.filename}`;
      
      // Delete old logo file if exists
      if (oldLogo) {
        const oldLogoPath = path.join(__dirname, '..', oldLogo);
        console.log('Deleting old logo:', oldLogoPath);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
    }

    await team.save();

    console.log('Team updated successfully:', team);

    res.status(200).json({ message: "Team updated", team });
  } catch (error) {
    console.error('=== UPDATE TEAM ERROR ===');
    console.error('Error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "Team already exists" });
    }
    
    // Clean up uploaded file if update failed
    if (req.file) {
      try {
        const filePath = path.join(__dirname, '..', req.file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete team
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Delete logo file if exists
    if (team.logo) {
      const logoPath = path.join(__dirname, '..', team.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    await team.deleteOne();
    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createTeam, getAllTeams, updateTeam, deleteTeam };