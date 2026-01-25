'use client';

import { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaTrophy, 
  FaSearch, 
  FaFilter,
  FaTicketAlt,
  FaFutbol,
  FaClock,
  FaTag,
  FaImage,
  FaCamera
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ competition: 'all' });
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const [teamLogoErrors, setTeamLogoErrors] = useState({});

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/matches`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch matches');
        setMatches(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  // Helper function to safely get venue name
  const getVenueName = (match) => {
    if (!match) return 'Unknown Venue';
    
    if (typeof match.venue === 'object' && match.venue !== null) {
      return match.venue.name || 'Unknown Venue';
    }
    
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
    
    if (typeof teamData === 'object' && teamData.logo) {
      return getImageUrl(teamData.logo);
    }
    
    return null;
  };

  const handleImageError = (matchId) => {
    setImageErrors(prev => ({ ...prev, [matchId]: true }));
  };

  const handleTeamLogoError = (teamId) => {
    setTeamLogoErrors(prev => ({ ...prev, [teamId]: true }));
  };

  // Team logo component
  const TeamLogo = ({ teamData, teamName, size = "medium" }) => {
    const logoUrl = getTeamLogoUrl(teamData);
    const uniqueId = teamData?._id || teamName;
    
    const hasError = teamLogoErrors[uniqueId];
    
    const sizeClass = size === "medium" ? "w-8 h-8" : "w-10 h-10";
    const textSize = size === "medium" ? "text-xs" : "text-sm";
    
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
        onError={() => handleTeamLogoError(uniqueId)}
        crossOrigin="anonymous"
      />
    );
  };

  // Format date: "25 Dec 08:51"
  const formatMatchDateTime = (dateString, timeString) => {
    if (!dateString) return { day: 'N/A', month: '', time: '' };
    
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const time = timeString ? timeString.substring(0, 5) : '';
    
    return { day, month, time };
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch =
      match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.competition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getVenueName(match).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompetition = filters.competition === 'all' || match.competition === filters.competition;
    return matchesSearch && matchesCompetition;
  });

  // Get unique competitions for filter
  const competitions = ['All', ...new Set(matches.map(m => m.competition).filter(Boolean))].slice(0, 10);

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      <span className="ml-3 text-white">Loading matches...</span>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-20">
      <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-red-300">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Browse Football Matches</h1>
        <p className="text-blue-200 mt-1 sm:mt-2">Find and buy tickets for upcoming football matches</p>
      </div>

      {/* Search + Filter */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            <input
              type="text"
              placeholder="Search teams, competitions, or venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition outline-none"
            />
          </div>
          
          {/* Competition Filter */}
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            <select
              value={filters.competition}
              onChange={(e) => setFilters({ ...filters, competition: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none outline-none"
            >
              {competitions.map(c => (
                <option key={c} value={c === 'All' ? 'all' : c} className="bg-gray-800 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-4 flex items-center gap-4 text-blue-300 text-sm">
          <div className="flex items-center gap-1">
            <FaFutbol className="text-blue-400" />
            <span>{matches.length} total matches</span>
          </div>
          <div className="h-4 w-px bg-white/20"></div>
          <div className="flex items-center gap-1">
            <FaTicketAlt className="text-green-400" />
            <span>{matches.reduce((acc, m) => acc + (m.totalTickets || 0), 0)} tickets available</span>
          </div>
          <div className="h-4 w-px bg-white/20"></div>
          <div className="flex items-center gap-1">
            <FaCamera className="text-yellow-400" />
            <span>{matches.reduce((acc, m) => acc + getVenueSectionsCount(m), 0)} stadium sections</span>
          </div>
        </div>
      </div>

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMatches.map(match => {
          const { day, month, time } = formatMatchDateTime(match.date, match.time);
          const matchImageUrl = getImageUrl(match.image);
          const venueSectionsCount = getVenueSectionsCount(match);
          
          return (
            <div
              key={match._id}
              onClick={() => router.push(`/buyer/matches/${match._id}/tickets`)}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:border-blue-400/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              {/* Match Image - Clean top section */}
              <div className="relative h-48 overflow-hidden">
                {matchImageUrl && !imageErrors[match._id] ? (
                  <img 
                    src={matchImageUrl}
                    alt={`${match.homeTeam} vs ${match.awayTeam}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => handleImageError(match._id)}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
                    <FaFutbol className="text-4xl text-white/80" />
                  </div>
                )}
                
                {/* Status/Date overlay */}
                <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20">
                  <div className="text-center">
                    <div className="text-white font-bold text-lg leading-none">{day}</div>
                    <div className="text-blue-200 text-xs font-medium uppercase">{month}</div>
                  </div>
                </div>
                
                {/* Time overlay */}
                {time && (
                  <div className="absolute top-3 right-3 z-10 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20">
                    <div className="flex items-center gap-1.5 text-white">
                      <FaClock className="text-blue-300 text-xs" />
                      <span className="text-sm font-semibold">{time}</span>
                    </div>
                  </div>
                )}

                {/* Venue Sections Badge */}
                {venueSectionsCount > 0 && (
                  <div className="absolute bottom-3 right-3 z-10 bg-green-500/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-green-400/30">
                    <div className="flex items-center gap-1 text-white text-xs">
                      <FaCamera className="text-white" />
                      <span>{venueSectionsCount} sections</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Match Content - Below image */}
              <div className="p-5">
                {/* Competition */}
                <div className="flex items-center text-blue-200 text-sm mb-4">
                  {match.competitionImage ? (
                    <img 
                      src={getImageUrl(match.competitionImage)} 
                      alt={match.competition} 
                      className="w-5 h-5 object-contain mr-2"
                    />
                  ) : (
                    <FaTrophy className="mr-2 text-yellow-400 flex-shrink-0" />
                  )}
                  <span className="truncate font-medium">{match.competition || 'Friendly Match'}</span>
                </div>

                {/* Teams */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    {/* Home Team */}
                    <div className="flex flex-col items-center flex-1">
                      <TeamLogo teamData={match.homeTeamId} teamName={match.homeTeam} size="medium" />
                      <span className="text-white text-sm font-semibold text-center line-clamp-2 mt-2 min-h-[2.5rem] flex items-center justify-center">
                        {match.homeTeam}
                      </span>
                    </div>
                    
                    {/* VS Badge */}
                    <div className="flex flex-col items-center mx-2">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg px-3 py-1 mb-1">
                        <span className="text-white font-bold text-sm">VS</span>
                      </div>
                    </div>
                    
                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1">
                      <TeamLogo teamData={match.awayTeamId} teamName={match.awayTeam} size="medium" />
                      <span className="text-white text-sm font-semibold text-center line-clamp-2 mt-2 min-h-[2.5rem] flex items-center justify-center">
                        {match.awayTeam}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-start text-blue-200 text-sm mb-5">
                  <FaMapMarkerAlt className="mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight line-clamp-2">
                    {getVenueName(match)}
                    {venueSectionsCount > 0 && (
                      <span className="ml-2 text-green-300 text-xs">
                        ({venueSectionsCount} sections)
                      </span>
                    )}
                  </span>
                </div>

                {/* Ticket Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{match.totalListings || 0}</div>
                    <div className="text-blue-300 text-xs font-medium">Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{match.totalTickets || 0}</div>
                    <div className="text-blue-300 text-xs font-medium">Tickets</div>
                  </div>
                </div>

                {/* View Button */}
                <div className="flex items-center justify-center gap-2 text-blue-300 hover:text-blue-200 transition-colors group/btn">
                  <FaTicketAlt className="text-sm group-hover/btn:scale-110 transition-transform" />
                  <span className="text-sm font-medium">View Tickets</span>
                  {venueSectionsCount > 0 && (
                    <span className="text-green-300 text-xs ml-2">
                      ✓ Section images available
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMatches.length === 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-8 sm:p-12 border border-white/20 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
            <FaFutbol className="text-2xl text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
          <p className="text-blue-200 mb-4">
            {searchTerm || filters.competition !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Check back soon for upcoming matches'
            }
          </p>
          {(searchTerm || filters.competition !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ competition: 'all' });
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-200"
            >
              <FaFilter className="text-sm" />
              Clear Search & Filters
            </button>
          )}
        </div>
      )}

      {/* Footer Stats */}
      {filteredMatches.length > 0 && (
        <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-blue-300">
            <div className="flex items-center gap-4 mb-3 sm:mb-0">
              <div className="flex items-center gap-2">
                <FaTag className="text-blue-400" />
                <span>Showing {filteredMatches.length} of {matches.length} matches</span>
              </div>
              <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <FaTicketAlt className="text-green-400" />
                <span>
                  {filteredMatches.reduce((acc, m) => acc + (m.totalTickets || 0), 0)} tickets available
                </span>
              </div>
              <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <FaCamera className="text-yellow-400" />
                <span>
                  {filteredMatches.reduce((acc, m) => acc + getVenueSectionsCount(m), 0)} stadium sections
                </span>
              </div>
            </div>
            <div className="text-xs">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}