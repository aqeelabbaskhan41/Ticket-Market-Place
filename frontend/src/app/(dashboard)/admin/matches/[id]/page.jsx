'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaFutbol, 
  FaArrowLeft, 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaTrophy, 
  FaTicketAlt,
  FaUsers,
  FaMoneyBillWave,
  FaUser,
  FaClock,
  FaEdit,
  FaTrash,
  FaEye,
  FaShare,
  FaImage,
  FaTag
} from 'react-icons/fa';

export default function AdminMatchDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    async function fetchMatch() {
      setLoading(true);
      setError('');
      setImageError(false);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/matches/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch match');
        
        console.log('Match data:', data);
        console.log('Venue data:', data.venue);
        setMatch(data);
      } catch (err) {
        setError(err.message || 'Something went wrong');
        console.error('Error fetching match:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatch();
  }, [id]);

  // Helper function to safely get venue name
  const getVenueName = (match) => {
    if (!match) return 'Unknown Venue';
    
    // If venue is an object with name property
    if (typeof match.venue === 'object' && match.venue !== null) {
      return match.venue.name || 'Unknown Venue';
    }
    
    // Fallback to venueName or venue string
    return match.venueName || match.venue || 'Unknown Venue';
  };

  // Get venue sections
  const getVenueSections = (match) => {
    if (!match) return [];
    
    if (typeof match.venue === 'object' && match.venue !== null && match.venue.sections) {
      return match.venue.sections;
    }
    
    return [];
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

  // Team logo component
  const TeamLogo = ({ teamData, teamName, size = "large" }) => {
    const logoUrl = getTeamLogoUrl(teamData);
    
    const sizeClass = size === "large" ? "w-16 h-16" : size === "medium" ? "w-12 h-12" : "w-8 h-8";
    const textSize = size === "large" ? "text-lg" : size === "medium" ? "text-sm" : "text-xs";
    
    if (!logoUrl) {
      const getInitials = (name) => {
        if (!name) return 'T';
        const words = name.split(' ');
        if (words.length === 1) return name.substring(0, 2).toUpperCase();
        return (words[0][0] + (words[words.length - 1][0] || '')).toUpperCase();
      };
      
      return (
        <div className={`${sizeClass} bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-white/20 rounded-full flex items-center justify-center`}>
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
        className={`${sizeClass} rounded-full border-2 border-white/30 object-cover`}
        crossOrigin="anonymous"
      />
    );
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
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${color}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date: "25 Dec 08:51"
  const formatMatchDateTime = (dateString, timeString) => {
    if (!dateString) return { day: 'N/A', month: '', time: '', fullDate: '' };
    
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const time = timeString ? timeString.substring(0, 5) : '';
    
    const fullDate = date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return { day, month, time, fullDate };
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/matches/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      
      if (!res.ok) throw new Error('Failed to delete match');
      
      router.push('/admin/matches');
    } catch (err) {
      alert('Error deleting match: ' + err.message);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/matches/edit/${id}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      <span className="ml-3 text-white">Loading match details...</span>
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-6 max-w-md mx-auto">
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-400/30">
          <FaFutbol className="text-xl text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Match</h3>
        <p className="text-red-300 mb-4">{error}</p>
        <button 
          onClick={() => router.push('/admin/matches')}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-2 rounded-lg transition-colors"
        >
          Back to Matches
        </button>
      </div>
    </div>
  );

  if (!match) return (
    <div className="text-center py-20">
      <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-6 max-w-md mx-auto">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
          <FaFutbol className="text-xl text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Match Not Found</h3>
        <p className="text-blue-300 mb-4">The requested match could not be found.</p>
        <button 
          onClick={() => router.push('/admin/matches')}
          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-2 rounded-lg transition-colors"
        >
          Back to Matches
        </button>
      </div>
    </div>
  );

  const { day, month, time, fullDate } = formatMatchDateTime(match.date, match.time);
  const matchImageUrl = getImageUrl(match.image);
  const venueSections = getVenueSections(match);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => router.push('/admin/matches')}
          className="flex items-center text-blue-200 hover:text-white font-medium mb-4 transition-colors duration-200 group"
        >
          <FaArrowLeft className="mr-2 text-blue-300 group-hover:text-white transition-colors" />
          Back to Matches
        </button>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                <FaFutbol className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {match.homeTeam} vs {match.awayTeam}
                </h1>
                <p className="text-blue-200 mt-1">Match Details</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(match)}
            </div>
          </div>
        </div>
      </div>

      {/* Match Image Section */}
      {matchImageUrl && (
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
              {imageError ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
                  <FaImage className="text-6xl text-white/60 mb-4" />
                  <p className="text-white text-lg">Match Image</p>
                  <p className="text-blue-200 text-sm mt-2">{match.homeTeam} vs {match.awayTeam}</p>
                </div>
              ) : (
                <img 
                  src={matchImageUrl}
                  alt={`${match.homeTeam} vs ${match.awayTeam}`}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  crossOrigin="anonymous"
                />
              )}
              
              {/* Overlay info on image */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-xl sm:text-2xl">
                      {match.homeTeam} vs {match.awayTeam}
                    </div>
                    <div className="text-blue-200 text-sm sm:text-base">
                      {day} {month} • {time} • {match.competition}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Team Information */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
            <FaUsers className="mr-2 text-blue-400" />
            Team Information
          </h2>
          
          <div className="space-y-6">
            {/* Teams with logos */}
            <div className="flex items-center justify-between py-4 border-b border-white/10">
              <div className="flex flex-col items-center flex-1">
                <TeamLogo teamData={match.homeTeamId} teamName={match.homeTeam} size="large" />
                <span className="text-white font-bold text-lg mt-3">{match.homeTeam}</span>
                <span className="text-blue-300 text-sm">Home Team</span>
              </div>
              
              <div className="flex flex-col items-center mx-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-full w-14 h-14 flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-lg">VS</span>
                </div>
                <span className="text-blue-300 text-xs">vs</span>
              </div>
              
              <div className="flex flex-col items-center flex-1">
                <TeamLogo teamData={match.awayTeamId} teamName={match.awayTeam} size="large" />
                <span className="text-white font-bold text-lg mt-3">{match.awayTeam}</span>
                <span className="text-blue-300 text-sm">Away Team</span>
              </div>
            </div>

            {/* Competition and Venue */}
            <div className="space-y-3">
              <DetailItem 
                icon={match.competitionImage ? (
                  <img 
                    src={getImageUrl(match.competitionImage)} 
                    alt={match.competition} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <FaTrophy className="text-yellow-400" />
                )}
                label="Competition"
                value={match.competition || 'No competition'}
              />
              <DetailItem 
                icon={<FaMapMarkerAlt className="text-green-400" />}
                label="Venue"
                value={getVenueName(match)}
              />
            </div>

            {/* Venue Sections if available */}
            {venueSections.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-md font-semibold text-white mb-2">Stadium Sections ({venueSections.length})</h3>
                <div className="grid grid-cols-2 gap-2">
                  {venueSections.slice(0, 4).map((section, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/5 rounded px-2 py-1.5">
                      <span className="text-blue-200 text-xs truncate">{section.name}</span>
                    </div>
                  ))}
                  {venueSections.length > 4 && (
                    <div className="text-blue-300 text-xs px-2 py-1.5">
                      +{venueSections.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Match Timing & Details */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
            <FaCalendar className="mr-2 text-purple-400" />
            Match Schedule
          </h2>
          
          <div className="space-y-6">
            {/* Date/Time Display */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-center mb-2">
                <FaCalendar className="text-2xl text-purple-400 mr-3" />
                <div className="text-center">
                  <div className="text-white font-bold text-3xl">{day}</div>
                  <div className="text-blue-200 text-lg uppercase">{month}</div>
                </div>
              </div>
              {time && (
                <div className="flex items-center justify-center mt-3 pt-3 border-t border-white/10">
                  <FaClock className="text-blue-400 mr-2" />
                  <span className="text-white font-bold text-lg">{time}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <DetailItem 
                icon={<FaCalendar className="text-purple-400" />}
                label="Full Date"
                value={fullDate}
              />
              {time && (
                <DetailItem 
                  icon={<FaClock className="text-blue-400" />}
                  label="Match Time"
                  value={time}
                />
              )}
              <DetailItem 
                icon={<FaUser className="text-green-400" />}
                label="Created By"
                value={match.createdBy?.name || 'Admin'}
              />
              <DetailItem 
                icon={<FaTag className="text-yellow-400" />}
                label="Match ID"
                value={match._id?.substring(0, 8) || 'N/A'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Information */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
          <FaTicketAlt className="mr-2 text-green-400" />
          Ticket Information
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total Listings"
            value={match.totalListings || 0}
            icon={<FaTicketAlt className="text-green-400" />}
            color="green"
          />
          <StatCard 
            label="Total Tickets"
            value={match.totalTickets || 0}
            icon={<FaUsers className="text-blue-400" />}
            color="blue"
          />
          <StatCard 
            label="Avg. Price"
            value={`${Math.round(((match.minPrice || 0) + (match.maxPrice || 0)) / 2) || 0} pts`}
            icon={<FaMoneyBillWave className="text-yellow-400" />}
            color="yellow"
          />
          <StatCard 
            label="Price Range"
            value={`${match.minPrice || 0} - ${match.maxPrice || 0} pts`}
            icon={<FaTag className="text-purple-400" />}
            color="purple"
          />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Additional Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard 
            label="Total Views"
            value={match.views || 0}
            color="blue"
            small={true}
          />
          <StatCard 
            label="Success Rate"
            value={`${match.successRate || 0}%`}
            color="green"
            small={true}
          />
          <StatCard 
            label="Days Until"
            value={match.daysUntil || 'N/A'}
            color="purple"
            small={true}
          />
          <StatCard 
            label="Created"
            value={match.createdAt ? new Date(match.createdAt).toLocaleDateString() : 'N/A'}
            color="yellow"
            small={true}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            onClick={() => router.push(`/admin/tickets?match=${id}`)}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 hover:text-blue-200 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <FaEye className="group-hover:scale-110 transition-transform" />
            View All Listings
          </button>
          <button 
            onClick={handleEdit}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-green-300 hover:text-green-200 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <FaEdit className="group-hover:scale-110 transition-transform" />
            Edit Match
          </button>
          <button 
            onClick={() => alert('Share functionality coming soon!')}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-300 hover:text-purple-200 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <FaShare className="group-hover:scale-110 transition-transform" />
            Share Match
          </button>
          <button 
            onClick={handleDelete}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 hover:text-red-200 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <FaTrash className="group-hover:scale-110 transition-transform" />
            Delete Match
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Detail Item Component
function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
      <div className="flex items-center">
        <div className="w-8 h-8 flex items-center justify-center mr-3">
          {icon}
        </div>
        <span className="text-blue-200 text-sm font-medium">{label}</span>
      </div>
      <span className="text-white text-sm font-semibold text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ label, value, icon, color, small = false }) {
  const colorConfig = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div className={`bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors ${small ? 'text-center' : ''}`}>
      <div className={`flex ${small ? 'flex-col items-center' : 'items-center justify-between'} mb-2`}>
        {icon && (
          <div className={`${small ? 'mb-2' : ''}`}>
            {icon}
          </div>
        )}
        <div className={`${colorConfig[color]} ${small ? 'text-2xl' : 'text-3xl'} font-bold`}>
          {value}
        </div>
      </div>
      <div className="text-blue-200 text-xs font-medium">{label}</div>
    </div>
  );
}