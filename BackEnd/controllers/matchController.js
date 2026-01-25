const Match = require("../models/Match.js");
const Team = require("../models/Team.js");
const Venue = require("../models/Venue.js");
const Competition = require("../models/Competition.js");
const fs = require('fs');
const path = require('path');

const logErrorToFile = (error) => {
  const logPath = path.join(__dirname, '..', 'backend_error.log');
  const logMessage = `${new Date().toISOString()} - ${error.message}\n${error.stack}\n\n`;
  fs.appendFileSync(logPath, logMessage);
};

// Create a new match
const createMatch = async (req, res) => {
  try {
    const { homeTeam, awayTeam, date, time, venue, competition } = req.body;

    // Check for venue as ID or name
    let venueId = venue;
    let venueName = venue;

    // Try to find venue by ID first
    const venueDoc = await Venue.findById(venue);
    if (venueDoc) {
      venueId = venueDoc._id;
      venueName = venueDoc.name;
    } else {
      // Try to find venue by name
      const venueByName = await Venue.findOne({ name: venue });
      if (venueByName) {
        venueId = venueByName._id;
        venueName = venueByName.name;
      } else {
        return res.status(404).json({ message: "Venue not found. Please select a valid venue." });
      }
    }

    if (!homeTeam || !awayTeam || !date || !time || !venue || !competition) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const matchData = {
      homeTeam,
      awayTeam,
      date,
      time,
      venue: venueId, // Store venue ID
      venueName: venueName, // Also store venue name for compatibility
      competition,
      createdBy: req.user._id,
    };

    // Try to find team IDs from team names
    try {
      const homeTeamDoc = await Team.findOne({ name: homeTeam });
      const awayTeamDoc = await Team.findOne({ name: awayTeam });

      if (homeTeamDoc) matchData.homeTeamId = homeTeamDoc._id;
      if (awayTeamDoc) matchData.awayTeamId = awayTeamDoc._id;
    } catch (error) {
      console.log("Could not find team IDs, continuing without them:", error.message);
    }

    // Add image URL if file was uploaded
    if (req.file) {
      matchData.image = `/uploads/matches/${req.file.filename}`;
    }

    const match = await Match.create(matchData);

    res.status(201).json({
      message: "Match created successfully",
      match,
    });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all matches
const getAllMatches = async (req, res) => {
  console.log('GET /api/matches request received');
  try {
    const matches = await Match.find()
      .populate('venue', 'name sections') // Populate venue with sections
      .sort({ date: 1 });

    console.log(`Found ${matches.length} matches`);

    // Convert to plain objects
    const matchesPlain = matches.map(match => match.toObject());

    // Try to populate team data if IDs exist
    console.log('Populating team data...');
    const matchesWithTeams = await Promise.all(
      matchesPlain.map(async (match) => {
        const result = { ...match };

        // Populate home team
        if (match.homeTeamId) {
          try {
            const homeTeam = await Team.findById(match.homeTeamId).select('name logo');
            if (homeTeam) {
              result.homeTeamId = homeTeam;
            }
          } catch (error) {
            console.log(`Could not populate home team ${match.homeTeamId}:`, error.message);
          }
        }

        // Populate away team
        if (match.awayTeamId) {
          try {
            const awayTeam = await Team.findById(match.awayTeamId).select('name logo');
            if (awayTeam) {
              result.awayTeamId = awayTeam;
            }
          } catch (error) {
            console.log(`Could not populate away team ${match.awayTeamId}:`, error.message);
          }
        }

        // Attach competition image
        if (match.competition) {
          try {
            const competitionDoc = await Competition.findOne({ name: match.competition }).select('image');
            if (competitionDoc) {
              result.competitionImage = competitionDoc.image;
            }
          } catch (error) {
            console.log(`Could not find competition image for ${match.competition}:`, error.message);
          }
        }

        return result;
      })
    );

    console.log('Sending matches response');
    res.status(200).json(matchesWithTeams);
  } catch (error) {
    console.error("Error fetching matches:", error);
    logErrorToFile(error);
    res.status(500).json({ message: "Server error", error: error.message, stack: error.stack });
  }
};

// Get single match by ID
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('venue', 'name sections'); // Populate venue with sections

    if (!match) return res.status(404).json({ message: "Match not found" });

    const matchObj = match.toObject();

    // Populate team data if IDs exist
    if (match.homeTeamId) {
      try {
        const homeTeam = await Team.findById(match.homeTeamId).select('name logo');
        if (homeTeam) {
          matchObj.homeTeamId = homeTeam;
        }
      } catch (error) {
        console.log(`Could not populate home team:`, error.message);
      }
    }

    if (match.awayTeamId) {
      try {
        const awayTeam = await Team.findById(match.awayTeamId).select('name logo');
        if (awayTeam) {
          matchObj.awayTeamId = awayTeam;
        }
      } catch (error) {
        console.log(`Could not populate away team:`, error.message);
      }
    }

    // Attach competition image
    if (match.competition) {
      try {
        const competitionDoc = await Competition.findOne({ name: match.competition }).select('image');
        if (competitionDoc) {
          matchObj.competitionImage = competitionDoc.image;
        }
      } catch (error) {
        console.log(`Could not find competition image for ${match.competition}:`, error.message);
      }
    }

    res.status(200).json(matchObj);
  } catch (error) {
    console.error("Error fetching match:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update match
const updateMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Update basic fields
    Object.assign(match, req.body);

    // Check and update venue if changed
    if (req.body.venue && req.body.venue !== match.venue.toString()) {
      let venueId = req.body.venue;
      let venueName = req.body.venue;

      // Try to find venue by ID
      const venueDoc = await Venue.findById(req.body.venue);
      if (venueDoc) {
        venueId = venueDoc._id;
        venueName = venueDoc.name;
      } else {
        // Try to find venue by name
        const venueByName = await Venue.findOne({ name: req.body.venue });
        if (venueByName) {
          venueId = venueByName._id;
          venueName = venueByName.name;
        } else {
          return res.status(404).json({ message: "Venue not found" });
        }
      }

      match.venue = venueId;
      match.venueName = venueName;
    }

    // Try to update team IDs if team names changed
    if (req.body.homeTeam && req.body.homeTeam !== match.homeTeam) {
      const homeTeamDoc = await Team.findOne({ name: req.body.homeTeam });
      if (homeTeamDoc) {
        match.homeTeamId = homeTeamDoc._id;
      }
    }

    if (req.body.awayTeam && req.body.awayTeam !== match.awayTeam) {
      const awayTeamDoc = await Team.findOne({ name: req.body.awayTeam });
      if (awayTeamDoc) {
        match.awayTeamId = awayTeamDoc._id;
      }
    }

    // Update image if new file was uploaded
    if (req.file) {
      // Delete old image if exists
      if (match.image) {
        const oldImagePath = path.join(__dirname, '..', match.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      match.image = `/uploads/matches/${req.file.filename}`;
    }

    await match.save();

    res.status(200).json({ message: "Match updated", match });
  } catch (error) {
    console.error("Error updating match:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete match
const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Delete image if exists
    if (match.image) {
      const imagePath = path.join(__dirname, '..', match.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await match.deleteOne();
    res.status(200).json({ message: "Match deleted successfully" });
  } catch (error) {
    console.error("Error deleting match:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createMatch, getAllMatches, updateMatch, deleteMatch, getMatchById };