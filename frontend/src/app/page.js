'use client';
import { useState, useEffect } from 'react';
import { FaTicketAlt, FaArrowRight, FaSpinner, FaCalendar, FaMapMarkerAlt, FaFutbol, FaSearch, FaClock, FaTrophy, FaExclamationCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const [teamLogoErrors, setTeamLogoErrors] = useState({});

  useEffect(() => {
    fetchMatches();
  }, []);

  // Helper function to get venue name from object
  const getVenueName = (match) => {
    if (!match) return 'Venue to be announced';

    if (typeof match.venue === 'object' && match.venue !== null) {
      return match.venue.name || 'Venue to be announced';
    }

    return match.venue || match.venueName || 'Venue to be announced';
  };

  // Helper function to get venue sections count
  const getVenueSectionsCount = (match) => {
    if (!match) return 0;

    if (typeof match.venue === 'object' && match.venue !== null && match.venue.sections) {
      return match.venue.sections.length;
    }

    return 0;
  };

  useEffect(() => {
    // Filter matches based on search term
    if (searchTerm.trim() === '') {
      setFilteredMatches(matches);
    } else {
      const filtered = matches.filter(match => {
        const searchLower = searchTerm.toLowerCase();
        const venueName = getVenueName(match);

        return (
          match.homeTeam?.toLowerCase().includes(searchLower) ||
          match.awayTeam?.toLowerCase().includes(searchLower) ||
          match.competition?.toLowerCase().includes(searchLower) ||
          venueName.toLowerCase().includes(searchLower)
        );
      });
      setFilteredMatches(filtered);
    }
  }, [searchTerm, matches]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Get image URL function - Improved
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }

    const baseUrl = API_BASE_URL.includes('/api')
      ? API_BASE_URL.replace('/api', '')
      : API_BASE_URL;

    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`.replace(/([^:]\/)\/+/g, '$1');
  };

  // Get team logo URL
  const getTeamLogoUrl = (teamData) => {
    if (!teamData) return null;

    if (typeof teamData === 'object' && teamData.logo) {
      return getImageUrl(teamData.logo);
    }

    if (typeof teamData === 'string') {
      return getImageUrl(teamData);
    }

    return null;
  };

  const handleImageError = (matchId) => {
    setImageErrors(prev => ({ ...prev, [matchId]: true }));
  };

  const handleTeamLogoError = (teamIdentifier) => {
    setTeamLogoErrors(prev => ({ ...prev, [teamIdentifier]: true }));
  };

  // TeamLogo component - Same as your MatchesPage
  const TeamLogo = ({ teamData, teamName, size = "medium" }) => {
    const logoUrl = getTeamLogoUrl(teamData);
    const uniqueId = teamData?._id || teamData || teamName;
    const hasError = teamLogoErrors[uniqueId];

    const sizeClass = size === "medium" ? "w-12 h-12" : "w-14 h-14";
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
        <div className={`${sizeClass} bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-white/30 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
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

  // Format date: "25 Dec 08:51" - Same as MatchesPage
  const formatMatchDateTime = (dateString) => {
    if (!dateString) return { day: 'N/A', month: '', time: '' };

    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return { day, month, time };
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/matches`);

      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched matches:', data);

      // Sort matches by date (closest first) and take latest 6 matches
      const sortedMatches = data
        .filter(match => match.date) // Filter out matches without date
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 6);

      setMatches(sortedMatches);
      setFilteredMatches(sortedMatches);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (matchId, action) => {
    router.push(`/login?redirect=/matches/${matchId}/${action}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewMatch = (matchId) => {
    router.push(`/buyer/matches/${matchId}/tickets`);
  };

  return (
    <>
      {/* Fixed Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/31160152/pexels-photo-31160152/free-photo-of-vibrant-football-match-at-night-stadium.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")'
        }}
      ></div>

      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-gray-900/70 z-0"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section - No changes needed here */}
        <section className="relative font-['Inter'] min-h-screen flex items-center justify-center">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-2xl mx-auto text-center">

              {/* Logo/Brand */}
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mr-4 shadow-2xl shadow-blue-500/30 backdrop-blur-sm">
                  <FaTicketAlt className="text-white text-2xl" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  TicketHub
                </h1>
              </div>

              {/* Welcome Message */}
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
                Premium Football
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 mt-2 text-3xl md:text-4xl">
                  Experience Awaits
                </span>
              </h2>

              <div className="backdrop-blur-xl bg-white/10 rounded-2xl mb-8 p-6 border border-white/20 shadow-2xl">
                <p className="text-gray-200 leading-relaxed max-w-lg mx-auto font-medium text-lg text-center">
                  Secure your seat for the most electrifying matches.
                  Buy and sell tickets with absolute confidence in our trusted marketplace.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button
                  onClick={() => router.push('/register')}
                  className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 text-lg min-w-[200px] text-center border border-blue-400/30 group overflow-hidden"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="relative bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-300 cursor-pointer shadow-2xl transform hover:-translate-y-1 text-lg min-w-[200px] text-center border border-white/20 backdrop-blur-sm group overflow-hidden"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                </button>
              </div>

              {/* Stats Section */}
              <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                {[
                  { number: '1K+', label: 'Premium Events' },
                  { number: '5K+', label: 'Satisfied Fans' },
                  { number: '100%', label: 'Secure Deals' }
                ].map((stat, index) => (
                  <div key={index} className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
                    <div className="text-2xl font-bold text-blue-400 mb-2">{stat.number}</div>
                    <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Matches Section - UPDATED */}
        <section className="relative py-20 font-['Inter']">
          {/* Background Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Upcoming Matches
              </h2>
              <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10 inline-block">
                <p className="text-blue-200 text-lg max-w-2xl mx-auto font-medium">
                  Don't miss out on the most exciting football matches. Secure your tickets now!
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-blue-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search matches by team, competition, or venue..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-2xl"
                />
                {searchTerm && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <span className="text-blue-300 text-sm bg-blue-500/20 px-2 py-1 rounded-full border border-blue-400/30">
                      {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl">
                  <FaSpinner className="animate-spin text-4xl text-blue-400 mx-auto mb-4" />
                  <p className="text-blue-200 font-medium">Loading matches...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="backdrop-blur-xl bg-red-500/10 rounded-2xl p-8 border border-red-400/20 shadow-2xl inline-block">
                  <FaExclamationCircle className="text-3xl text-red-300 mx-auto mb-4" />
                  <p className="text-red-300 text-lg mb-4 font-medium">Error loading matches: {error}</p>
                  <button
                    onClick={fetchMatches}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto">
                {/* Matches Grid - UPDATED to match your MatchesPage style */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredMatches.length > 0 ? (
                    filteredMatches.map((match) => {
                      const { day, month, time } = formatMatchDateTime(match.date);
                      const matchImageUrl = getImageUrl(match.image);
                      const venueName = getVenueName(match);
                      const venueSectionsCount = getVenueSectionsCount(match);

                      return (
                        <div
                          key={match._id}
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

                            {/* Date overlay */}
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
                          </div>

                          {/* Match Content */}
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

                            {/* Teams with Logos */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-3">
                                {/* Home Team */}
                                <div className="flex flex-col items-center flex-1">
                                  <TeamLogo
                                    teamData={match.homeTeamId}
                                    teamName={match.homeTeam}
                                    size="medium"
                                  />
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
                                  <TeamLogo
                                    teamData={match.awayTeamId}
                                    teamName={match.awayTeam}
                                    size="medium"
                                  />
                                  <span className="text-white text-sm font-semibold text-center line-clamp-2 mt-2 min-h-[2.5rem] flex items-center justify-center">
                                    {match.awayTeam}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Venue - FIXED: Handle venue object properly */}
                            <div className="flex items-start text-blue-200 text-sm mb-5">
                              <FaMapMarkerAlt className="mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                              <div className="leading-tight">
                                <span className="line-clamp-1">
                                  {venueName}
                                </span>
                                {venueSectionsCount > 0 && (
                                  <div className="text-green-300 text-xs mt-1">
                                    ({venueSectionsCount} seat sections)
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mb-3">
                              <button
                                onClick={() => handleActionClick(match._id, 'buy')}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                              >
                                Buy Tickets
                                <FaArrowRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleActionClick(match._id, 'sell')}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn border border-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                              >
                                Sell Tickets
                                <FaArrowRight className="text-sm group-hover/btn:translate-x-1 transition-transform" />
                              </button>
                            </div>

                            {/* View Details Button */}
                            <button
                              onClick={() => handleViewMatch(match._id)}
                              className="w-full flex items-center justify-center gap-2 text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
                            >
                              <FaTicketAlt className="text-sm" />
                              <span>View Match Details</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-16">
                      <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-12 border border-white/10 shadow-2xl inline-block">
                        <div className="text-center">
                          <FaSearch className="text-4xl text-blue-300 mx-auto mb-4" />
                          <p className="text-blue-300 text-xl font-medium mb-2">
                            No matches found
                          </p>
                          <p className="text-blue-200">
                            {searchTerm ? `No results for "${searchTerm}"` : 'No upcoming matches available'}
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* View All Matches Button */}
                {filteredMatches.length > 0 && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => router.push('/buyer/matches')}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 text-lg border border-blue-400/30 inline-flex items-center gap-3"
                    >
                      View All Matches
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/50">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-8 py-8">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <FaTicketAlt className="text-white text-base" />
              </div>
              <span className="text-lg font-bold text-white">TicketHub</span>
            </div>

            <div className="text-blue-300 text-sm backdrop-blur-sm bg-white/5 rounded-lg px-4 py-2 border border-white/10">
              © 2025 TicketHub. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* Add Inter Font */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>
    </>
  );
}