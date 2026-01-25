'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaFutbol,
  FaCalendar,
  FaTicketAlt,
  FaPlus,
  FaEye,
  FaMapMarkerAlt,
  FaTrophy,
  FaUsers,
  FaClock,
  FaBuilding,
} from 'react-icons/fa';

export default function MatchesManagement() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [teamLogoErrors, setTeamLogoErrors] = useState({});

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    async function fetchMatches() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/matches`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Matches data:', data);
        if (data.length > 0) {
          console.log('First match venue data:', data[0].venue);
        }
        setMatches(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  // Helper function to get venue name safely
  const getVenueName = (match) => {
    if (!match) return 'Unknown Venue';
    
    // If venue is an object with name property
    if (typeof match.venue === 'object' && match.venue !== null) {
      return match.venue.name || 'Unknown Venue';
    }
    
    // Fallback to venueName or venue string
    return match.venueName || match.venue || 'Unknown Venue';
  };

  // Helper function to get venue sections count
  const getVenueSectionsCount = (match) => {
    if (!match) return 0;
    
    if (typeof match.venue === 'object' && match.venue !== null && match.venue.sections) {
      return match.venue.sections.length;
    }
    
    return 0;
  };

  const getStatusBadge = (match) => {
    const now = new Date();
    const matchDate = new Date(match.date);
    
    let status = 'upcoming';
    let color = 'bg-blue-500/20 text-blue-300 border-blue-400/30';
    
    if (matchDate < now) {
      status = 'completed';
      color = 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
    
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${color}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format: "25 Dec 08:51"
  const formatMatchDateTime = (dateString, timeString) => {
    if (!dateString) return { day: 'N/A', month: '', time: '' };
    
    const date = new Date(dateString);
    
    // Get day number (25)
    const day = date.getDate();
    
    // Get short month name (Dec)
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    
    // Get time in 24-hour format (08:51)
    const time = timeString ? timeString.substring(0, 5) : '';
    
    return { day, month, time };
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) return imagePath;
    
    const baseUrl = API_BASE_URL.replace('/api', '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${baseUrl}${cleanPath}`;
  };

  // Get team logo URL
  const getTeamLogoUrl = (teamData) => {
    if (!teamData) return null;
    
    // If teamData is a populated object with logo
    if (typeof teamData === 'object' && teamData.logo) {
      return getImageUrl(teamData.logo);
    }
    
    return null;
  };

  // Team logo component with proper loading
  const TeamLogo = ({ teamData, teamName, size = "medium" }) => {
    const logoUrl = getTeamLogoUrl(teamData);
    const uniqueId = teamData?._id || teamName;
    
    const hasError = teamLogoErrors[uniqueId];
    
    const sizeClass = size === "medium" ? "w-10 h-10" : "w-8 h-8";
    const textSize = size === "medium" ? "text-sm" : "text-xs";
    
    if (!logoUrl || hasError) {
      // Get initials for fallback
      const getInitials = (name) => {
        if (!name) return 'T';
        const words = name.split(' ');
        if (words.length === 1) return name.substring(0, 2).toUpperCase();
        return (words[0][0] + (words[words.length - 1][0] || '')).toUpperCase();
      };
      
      return (
        <div className={`${sizeClass} bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-white/20 rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className={`${textSize} text-white font-bold`}>
            {getInitials(teamName)}
          </span>
        </div>
      );
    }

    return (
      <img 
        src={logoUrl}
        alt={teamName}
        className={`${sizeClass} rounded-full border-2 border-white/30 object-cover flex-shrink-0`}
        onError={() => setTeamLogoErrors(prev => ({ ...prev, [uniqueId]: true }))}
        crossOrigin="anonymous"
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading matches...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Matches Management</h1>
          <p className="text-blue-200 mt-1 sm:mt-2">Manage football matches and events</p>
        </div>

        <Link
          href="/admin/matches/add"
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 w-full lg:w-auto"
        >
          <FaPlus className="text-sm" />
          Add New Match
        </Link>
      </div>

      {/* Management Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <ManagementCard
          href="/admin/matches/teams"
          icon={<FaUsers className="text-2xl text-blue-400" />}
          title="Manage Teams"
          description="Add and manage football teams"
          color="blue"
        />
        <ManagementCard
          href="/admin/matches/venues"
          icon={<FaBuilding className="text-2xl text-green-400" />}
          title="Manage Venues"
          description="Add and manage stadiums/venues"
          color="green"
        />
        <ManagementCard
          href="/admin/matches/competitions"
          icon={<FaTrophy className="text-2xl text-purple-400" />}
          title="Manage Competitions"
          description="Add and manage tournaments"
          color="purple"
        />
        <ManagementCard
          href="/admin/matches"
          icon={<FaFutbol className="text-2xl text-yellow-400" />}
          title="Manage Matches"
          description="View all matches"
          color="yellow"
          active={true}
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatsCard
          icon={<FaFutbol className="text-lg sm:text-xl text-blue-400" />}
          label="Total Matches"
          value={matches.length}
          color="blue"
        />
        <StatsCard
          icon={<FaCalendar className="text-lg sm:text-xl text-green-400" />}
          label="Upcoming"
          value={matches.filter((m) => new Date(m.date) > new Date()).length}
          color="green"
        />
        <StatsCard
          icon={<FaTicketAlt className="text-lg sm:text-xl text-purple-400" />}
          label="Active Listings"
          value={matches.reduce((acc, m) => acc + (m.totalListings || 0), 0)}
          color="purple"
        />
        <StatsCard
          icon={<FaTicketAlt className="text-lg sm:text-xl text-yellow-400" />}
          label="Total Tickets"
          value={matches.reduce((acc, m) => acc + (m.totalTickets || 0), 0)}
          color="yellow"
        />
      </div>

      {/* Matches Grid - FIXED LAYOUT */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">All Matches ({matches.length})</h2>
        
        {matches.length === 0 ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
              <FaFutbol className="text-2xl text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
            <p className="text-blue-200 mb-4">Create your first match to get started.</p>
            <Link
              href="/admin/matches/add"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-200"
            >
              <FaPlus />
              Add First Match
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {matches.map((match) => {
              const { day, month, time } = formatMatchDateTime(match.date, match.time);
              
              return (
                <div
                  key={match._id}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 hover:shadow-xl group"
                >
                  {/* 1. IMAGE ONLY ON TOP */}
                  <div className="relative h-48 overflow-hidden">
                    {match.image ? (
                      <img 
                        src={getImageUrl(match.image)}
                        alt={`${match.homeTeam} vs ${match.awayTeam}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageErrors(prev => ({ ...prev, [match._id]: true }))}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
                        <FaFutbol className="text-4xl text-white/80" />
                      </div>
                    )}
                    
                    {/* Only status badge on image */}
                    <div className="absolute top-3 right-3 z-10">
                      {getStatusBadge(match)}
                    </div>
                  </div>

                  {/* 2. ALL CONTENT BELOW IMAGE */}
                  <div className="p-5">
                    {/* Match date/time */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 text-blue-300">
                        <FaCalendar className="text-blue-400" />
                        <span className="font-semibold">{day} {month}</span>
                      </div>
                      {time && (
                        <>
                          <div className="h-4 w-px bg-white/20"></div>
                          <div className="flex items-center gap-2 text-blue-300">
                            <FaClock className="text-blue-400" />
                            <span className="font-semibold">{time}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Teams - FIXED LAYOUT */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        {/* Home Team */}
                        <div className="flex flex-col items-center flex-1">
                          <TeamLogo teamData={match.homeTeamId} teamName={match.homeTeam} size="medium" />
                          <div className="text-center mt-2 max-w-full">
                            <h3 className="text-white font-bold text-sm line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                              {match.homeTeam}
                            </h3>
                            <p className="text-blue-300 text-xs mt-1">Home</p>
                          </div>
                        </div>
                        
                        {/* VS Badge */}
                        <div className="flex flex-col items-center mx-2">
                          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg px-3 py-1.5 mb-1">
                            <span className="text-white font-bold text-sm">VS</span>
                          </div>
                        </div>
                        
                        {/* Away Team */}
                        <div className="flex flex-col items-center flex-1">
                          <TeamLogo teamData={match.awayTeamId} teamName={match.awayTeam} size="medium" />
                          <div className="text-center mt-2 max-w-full">
                            <h3 className="text-white font-bold text-sm line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                              {match.awayTeam}
                            </h3>
                            <p className="text-blue-300 text-xs mt-1">Away</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Competition */}
                    <div className="flex items-center text-blue-200 text-sm mb-3">
                      {match.competitionImage ? (
                        <img 
                          src={getImageUrl(match.competitionImage)} 
                          alt={match.competition} 
                          className="w-5 h-5 object-contain mr-2"
                        />
                      ) : (
                        <FaTrophy className="mr-2 text-blue-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{match.competition || 'No competition'}</span>
                    </div>

                    {/* Venue - FIXED */}
                    <div className="flex items-start text-blue-200 text-sm mb-5">
                      <FaMapMarkerAlt className="mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight line-clamp-2">
                        {getVenueName(match)}
                        {getVenueSectionsCount(match) > 0 && (
                          <span className="ml-2 text-green-300 text-xs">
                            ({getVenueSectionsCount(match)} sections)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/admin/matches/${match._id}`}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group/btn"
                    >
                      <FaEye className="text-sm transition-transform group-hover/btn:scale-110" />
                      View Match Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {matches.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-blue-300">
            <div className="flex items-center gap-4">
              <span>Total: {matches.length} matches</span>
              <span className="hidden sm:block">•</span>
              <span>
                Upcoming: {matches.filter(m => new Date(m.date) > new Date()).length}
              </span>
            </div>
            <span className="text-xs mt-2 sm:mt-0">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ icon, label, value, color }) {
  const colorConfig = {
    blue: 'bg-blue-500/20 border-blue-400/30',
    green: 'bg-green-500/20 border-green-400/30',
    purple: 'bg-purple-500/20 border-purple-400/30',
    yellow: 'bg-yellow-500/20 border-yellow-400/30',
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border ${colorConfig[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-blue-200">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ManagementCard({ href, icon, title, description, color, active = false }) {
  const colorConfig = {
    blue: 'bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/30',
    green: 'bg-green-500/20 border-green-400/30 hover:bg-green-500/30',
    purple: 'bg-purple-500/20 border-purple-400/30 hover:bg-purple-500/30',
    yellow: 'bg-yellow-500/20 border-yellow-400/30 hover:bg-yellow-500/30',
  };

  return (
    <Link
      href={href}
      className={`block backdrop-blur-xl rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl ${
        active ? 'bg-white/15 border-white/30' : colorConfig[color]
      }`}
    >
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 border ${
          active ? 'bg-white/20 border-white/30' : colorConfig[color].replace('hover:bg-', 'bg-').split(' ')[0]
        }`}>
          {icon}
        </div>
        <div>
          <h3 className={`text-lg font-bold ${active ? 'text-white' : 'text-white'}`}>
            {title}
          </h3>
          <p className={`text-sm ${active ? 'text-blue-200' : 'text-blue-200'}`}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}