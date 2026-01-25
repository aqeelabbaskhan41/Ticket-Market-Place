'use client';
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FaArrowLeft, FaTicketAlt, FaMapMarkerAlt, FaCalendarAlt, FaTrophy,
  FaUsers, FaEye, FaShoppingCart, FaStar, FaFutbol, FaCoins,
  FaExclamationTriangle, FaShieldAlt, FaInfoCircle, FaCheckCircle,
  FaTimes, FaChevronLeft, FaChevronRight, FaExpand, FaCompress,
  FaCamera, FaSearchPlus , FaSearch, FaTimesCircle, FaClock,
  FaTag, FaFilter, FaBox, FaClipboardList, FaUser,
  FaShoppingBag, FaCheck, FaAngleRight, FaHeart, FaShareAlt,
  FaThumbsUp, FaArrowUp, FaArrowDown
} from "react-icons/fa";

export default function MatchTickets() {
  const { matchId } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['all']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchasing, setPurchasing] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [userCommission, setUserCommission] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [sectionImageError, setSectionImageError] = useState({});
  const [expandedImage, setExpandedImage] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'list', 'grid'
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (matchId) {
      fetchMatchAndTickets();
      fetchUserInfo();
      fetchUserCommission();
    }
  }, [matchId]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_BASE_URL}/seat-categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(['all', ...data.map(c => c.name)]);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.user.points || 0);
        setUserInfo(data.user);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchUserCommission = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/commission/my-commission`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserCommission(data.commission);
      } else {
        setUserCommission({ rate: 0.10, levelName: 'Standard' });
      }
    } catch (error) {
      console.error('Error fetching user commission:', error);
      setUserCommission({ rate: 0.10, levelName: 'Standard' });
    }
  };

  const fetchMatchAndTickets = async () => {
    try {
      setLoading(true);
      const [matchRes, ticketRes] = await Promise.all([
        fetch(`${API_BASE_URL}/matches/${matchId}`),
        fetch(`${API_BASE_URL}/tickets/match/${matchId}`)
      ]);

      const matchData = await matchRes.json();
      const ticketData = await ticketRes.json();

      if (matchRes.ok) setMatch(matchData);
      if (ticketRes.ok) setTickets(ticketData);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get venue name from object
  const getVenueName = (match) => {
    if (!match) return 'Unknown Venue';
    
    if (typeof match.venue === 'object' && match.venue !== null) {
      return match.venue.name || 'Unknown Venue';
    }
    
    return match.venue || 'Unknown Venue';
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

  // Team logo component
  const TeamLogo = ({ teamData, teamName, size = "medium" }) => {
    const getTeamLogoUrl = (teamData) => {
      if (!teamData) return null;
      
      if (typeof teamData === 'object' && teamData.logo) {
        return getImageUrl(teamData.logo);
      }
      
      return null;
    };
    
    const logoUrl = getTeamLogoUrl(teamData);
    
    const sizeClass = size === "medium" ? "w-8 h-8" : "w-10 h-10";
    const textSize = size === "medium" ? "text-xs" : "text-sm";
    
    if (!logoUrl) {
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
        crossOrigin="anonymous"
      />
    );
  };

  const calculateTotalCost = (ticketPrice) => {
    const commissionRate = userCommission?.rate || 0.10;
    const baseCost = ticketPrice;
    const commission = Math.round(baseCost * commissionRate);
    return {
      baseCost,
      commission,
      totalCost: baseCost + commission,
      commissionRate: commissionRate * 100,
      levelName: userCommission?.levelName || 'Standard'
    };
  };

  const handleSectionImageError = (ticketId) => {
    setSectionImageError(prev => ({ ...prev, [ticketId]: true }));
  };

  const handleBuyClick = async (ticket) => {
    const costBreakdown = calculateTotalCost(ticket.price);
    const canAfford = userPoints >= costBreakdown.totalCost;

    if (!canAfford) {
      alert(`Insufficient points. You need ${costBreakdown.totalCost} points but only have ${userPoints}.`);
      return;
    }

    if (ticket.quantity === 0) {
      alert('This ticket is no longer available.');
      return;
    }

    setSelectedTicket(ticket);
    setShowConfirmation(true);
  };

  const handlePurchase = async () => {
    if (!selectedTicket) return;

    try {
      setPurchasing(selectedTicket._id);
      setShowConfirmation(false);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to purchase tickets');
        setPurchasing(null);
        return;
      }

      const commissionRate = userCommission?.rate || 0.10;
      const baseCost = selectedTicket.price;
      const commission = Math.round(baseCost * commissionRate);
      const totalCost = baseCost + commission;

      if (userPoints < totalCost) {
        alert(`Insufficient points. You need ${totalCost} points but only have ${userPoints}.`);
        setPurchasing(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tickets/${selectedTicket._id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: 1
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTickets(prevTickets => 
          prevTickets.map(t => 
            t._id === selectedTicket._id 
              ? { 
                  ...t, 
                  quantity: t.quantity - 1,
                  status: t.quantity - 1 === 0 ? 'sold' : t.status
                }
              : t
          )
        );
        
        setUserPoints(prev => prev - totalCost);
        
        alert(`Purchase successful! ${data.message}\n\nPoints deducted: ${totalCost} points\n• Ticket price: ${baseCost} points\n• Commission: ${commission} points (${commissionRate * 100}%)\n• Your level: ${userCommission?.levelName || 'Standard'}\n\nYour points are now held in escrow until 7 days after the match.`);
        
        setTimeout(() => {
          router.push('/buyer/tickets');
        }, 2000);
      } else {
        alert(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Error purchasing ticket');
    } finally {
      setPurchasing(null);
      setSelectedTicket(null);
    }
  };

  // Dynamic categories handled by state

  const filteredTickets = selectedCategory === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.category === selectedCategory);

  const getUserLevelBadge = () => {
    if (!userCommission) return null;

    const levelConfig = {
      'Standard': { color: 'bg-gray-500/20 text-gray-300' },
      'Premium': { color: 'bg-blue-500/20 text-blue-300' },
      'VIP': { color: 'bg-purple-500/20 text-purple-300' }
    };
    
    const config = levelConfig[userCommission.levelName] || levelConfig['Standard'];
    
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
          {userCommission.levelName}
        </span>
        <span className="text-blue-300 text-xs">
          {userCommission.rate * 100}% commission
        </span>
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading match details...</span>
      </div>
    );

  if (!match)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Match Not Found</h2>
          <p className="text-red-300 mb-4">The requested match could not be found.</p>
          <button
            onClick={() => router.push("/buyer/matches")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );

  // Format date: "25 Dec 08:51"
  const formatMatchDateTime = (dateString, timeString) => {
    if (!dateString) return { day: 'N/A', month: '', time: '' };
    
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const time = timeString ? timeString.substring(0, 5) : '';
    
    return { day, month, time };
  };

  const { day, month, time } = formatMatchDateTime(match.date, match.time);
  const matchImageUrl = getImageUrl(match.image);
  const venueSectionsCount = getVenueSectionsCount(match);
  const venueName = getVenueName(match);

  return (
    <div className="p-4 sm:p-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/buyer/matches")}
        className="flex items-center gap-2 mb-6 text-blue-200 hover:text-white font-semibold transition-colors duration-200 group"
      >
        <FaArrowLeft className="text-blue-300 group-hover:text-white transition-colors" />
        Back to Matches
      </button>

      {/* Match Image Banner */}
      {matchImageUrl && (
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="relative h-48 sm:h-56 overflow-hidden">
              {imageError ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
                  <div className="flex flex-col items-center">
                    {/* Team Logos */}
                    <div className="flex items-center justify-center gap-6 mb-4">
                      <TeamLogo teamData={match.homeTeamId} teamName={match.homeTeam} size="large" />
                      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg px-4 py-2">
                        <span className="text-white font-bold text-lg">VS</span>
                      </div>
                      <TeamLogo teamData={match.awayTeamId} teamName={match.awayTeam} size="large" />
                    </div>
                    <p className="text-white text-lg font-semibold">{match.homeTeam} vs {match.awayTeam}</p>
                    <p className="text-blue-200 text-sm mt-2">{match.competition}</p>
                  </div>
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
              
              {/* Overlay info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4 sm:p-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <TeamLogo teamData={match.homeTeamId} teamName={match.homeTeam} size="medium" />
                    <span className="text-xl sm:text-2xl font-bold text-white">vs</span>
                    <TeamLogo teamData={match.awayTeamId} teamName={match.awayTeam} size="medium" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {match.homeTeam} vs {match.awayTeam}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-blue-200 text-sm">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="text-blue-300" />
                      <span>{day} {month}</span>
                    </div>
                    {time && (
                      <>
                        <div className="h-4 w-px bg-white/20"></div>
                        <div className="flex items-center gap-1">
                          <FaClock className="text-blue-300" />
                          <span>{time}</span>
                        </div>
                      </>
                    )}
                    <div className="h-4 w-px bg-white/20"></div>
                    <div className="flex items-center gap-1">
                      {match.competitionImage ? (
                        <img 
                          src={getImageUrl(match.competitionImage)} 
                          alt={match.competition} 
                          className="w-5 h-5 object-contain mr-1"
                        />
                      ) : (
                        <FaTrophy className="text-yellow-400" />
                      )}
                      <span>{match.competition}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Details Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Venue Info */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3 border border-blue-400/30">
              <FaMapMarkerAlt className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-200">Venue</p>
              <p className="text-white font-semibold">{venueName}</p>
              {venueSectionsCount > 0 && (
                <div className="flex items-center gap-1 text-green-300 text-xs mt-1">
                  <FaCamera className="text-xs" />
                  <span>{venueSectionsCount} stadium sections available</span>
                </div>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3 border border-purple-400/30">
              <FaCalendarAlt className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-200">Date & Time</p>
              <p className="text-white font-semibold">
                {day} {month} {time && `at ${time}`}
              </p>
              <div className="text-blue-300 text-xs mt-1">
                {new Date(match.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Competition */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-3 border border-yellow-400/30">
              <FaTrophy className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-200">Competition</p>
              <p className="text-white font-semibold">{match.competition}</p>
              <div className="text-blue-300 text-xs mt-1">
                {tickets.length} ticket listings available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Points Balance with Level Info */}
      <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-400/30 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3 border border-blue-400/30">
              <FaCoins className="text-lg text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-200">Your Points Balance</p>
              <p className="text-2xl font-bold text-white">{userPoints.toLocaleString()} points</p>
              {userCommission && (
                <div className="mt-1">
                  {getUserLevelBadge()}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-300">Ready to purchase tickets</p>
            <p className="text-xs text-blue-400 flex items-center justify-end gap-1 mt-1">
              <FaShieldAlt className="text-xs" />
              Points protected by escrow system
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Filter by Category</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    selectedCategory === category
                      ? 'bg-blue-500/20 text-white border-blue-400 shadow-lg'
                      : 'bg-white/5 text-blue-200 border-white/20 hover:bg-blue-500/10 hover:border-blue-400/50'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/20">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'split' 
                  ? 'bg-blue-500/20 text-white' 
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'list' 
                  ? 'bg-blue-500/20 text-white' 
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'grid' 
                  ? 'bg-blue-500/20 text-white' 
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Grid View
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Listings Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Available Tickets
          </h2>
          <p className="text-blue-300 text-sm mt-1">
            Compare seat views and ticket details side-by-side
          </p>
        </div>
        <div className="text-blue-300 text-sm">
          {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'} available
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-8 sm:p-12 border border-white/20 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
            <FaTicketAlt className="text-2xl text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Tickets Available</h3>
          <p className="text-blue-200 mb-4">
            {selectedCategory === 'all' 
              ? 'No tickets listed for this match yet.' 
              : `No tickets available in ${selectedCategory} category.`
            }
          </p>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200"
            >
              View All Categories
            </button>
          )}
        </div>
      ) : viewMode === 'split' ? (
        <div className="space-y-6">
          {filteredTickets.map((ticket) => (
            <EnhancedSeatTicketCard 
              key={ticket._id} 
              ticket={ticket} 
              userPoints={userPoints}
              userInfo={userInfo}
              userCommission={userCommission}
              purchasing={purchasing}
              onBuyClick={handleBuyClick}
              getImageUrl={getImageUrl}
              onImageExpand={(img) => setExpandedImage(img)}
            />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <CompactTicketCard 
              key={ticket._id} 
              ticket={ticket} 
              userPoints={userPoints}
              userInfo={userInfo}
              userCommission={userCommission}
              purchasing={purchasing}
              onBuyClick={handleBuyClick}
              getImageUrl={getImageUrl}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <GridTicketCard 
              key={ticket._id} 
              ticket={ticket} 
              userPoints={userPoints}
              userInfo={userInfo}
              userCommission={userCommission}
              purchasing={purchasing}
              onBuyClick={handleBuyClick}
              getImageUrl={getImageUrl}
              onImageExpand={(img) => setExpandedImage(img)}
            />
          ))}
        </div>
      )}

      {/* Full Image Modal */}
      {expandedImage && (
        <FullImageModal 
          imageUrl={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}

      {/* Horizontal Purchase Confirmation Modal */}
      {showConfirmation && selectedTicket && (
        <EnhancedPurchaseConfirmationModal
          selectedTicket={selectedTicket}
          match={match}
          userPoints={userPoints}
          userInfo={userInfo}
          userCommission={userCommission}
          purchasing={purchasing}
          onClose={() => {
            setShowConfirmation(false);
            setSelectedTicket(null);
          }}
          onConfirm={handlePurchase}
          getImageUrl={getImageUrl}
          getVenueName={getVenueName}
          venueSectionsCount={venueSectionsCount}
          onImageExpand={(img) => setExpandedImage(img)}
        />
      )}
    </div>
  );
}

// Enhanced Seat Ticket Card with full image + info layout
const EnhancedSeatTicketCard = ({ 
  ticket, 
  userPoints, 
  userInfo, 
  userCommission, 
  purchasing, 
  onBuyClick,
  getImageUrl,
  onImageExpand
}) => {
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const loadCost = () => {
      const commissionRate = userCommission?.rate || 0.10;
      const baseCost = ticket.price;
      const commission = Math.round(baseCost * commissionRate);
      const breakdown = {
        baseCost,
        commission,
        totalCost: baseCost + commission,
        commissionRate: commissionRate * 100,
        levelName: userCommission?.levelName || 'Standard'
      };
      setCostBreakdown(breakdown);
    };
    loadCost();
  }, [ticket.price, userCommission]);

  const sectionImage = ticket.sectionImage ? getImageUrl(ticket.sectionImage) : null;
  const canAfford = costBreakdown ? userPoints >= costBreakdown.totalCost : false;

  const getStatusBadge = (status, quantity) => {
    const statusConfig = {
      active: { color: 'bg-green-500/20 text-green-300 border-green-400/30', label: quantity > 0 ? 'Available' : 'Sold' },
      pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', label: 'Pending' },
      sold: { color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', label: 'Sold' }
    };
    const config = statusConfig[status] || statusConfig.active;
    const finalLabel = ticket.quantity === 0 ? 'Sold' : config.label;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {finalLabel}
      </span>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:border-blue-400/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Left Column - Large Seat/Section Image */}
        <div className="lg:w-3/5 p-6 border-b lg:border-b-0 lg:border-r border-white/20">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-white">{ticket.category}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(ticket.status, ticket.quantity)}
                  <span className="text-blue-300 text-sm">
                    {ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'} available
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-400">{ticket.price}</div>
                <div className="text-sm text-blue-300">points each</div>
              </div>
            </div>
          </div>

          {/* Enhanced Seat Image Display */}
          <div className="relative group">
            {sectionImage && !imageError ? (
              <>
                <div 
                  className="relative h-72 rounded-xl overflow-hidden border-2 border-white/20 cursor-zoom-in"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={() => onImageExpand(sectionImage)}
                >
                  <img 
                    src={sectionImage}
                    alt={`${ticket.category} view from ${ticket.blockArea}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImageError(true)}
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white">
                      <p className="font-semibold">{ticket.category}</p>
                      <p className="text-sm text-blue-200">Block: {ticket.blockArea}</p>
                      <p className="text-sm text-blue-200">View: {ticket.restriction}</p>
                    </div>
                  </div>
                  
                  {/* Hover Overlay */}
                  {isHovered && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-black/70 backdrop-blur-sm rounded-full p-3 border border-white/30">
                        <FaExpand className="text-2xl text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Zoom Indicator */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full p-2 border border-white/30">
                    <FaSearchPlus  className="text-white text-sm" />
                  </div>
                </div>
                
                {/* Image Controls */}
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => onImageExpand(sectionImage)}
                    className="flex items-center gap-2 text-blue-300 hover:text-white text-sm transition-colors"
                  >
                    <FaExpand className="text-xs" />
                    Expand view
                  </button>
                  <div className="text-xs text-blue-400">
                    Click to view full size
                  </div>
                </div>
              </>
            ) : (
              <div className="relative h-72 rounded-xl overflow-hidden border-2 border-white/20 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <FaCamera className="text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-300">No section image available</p>
                  <p className="text-gray-400 text-sm mt-1">{ticket.category} • {ticket.blockArea}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Ticket Details */}
        <div className="lg:w-2/5 p-6">
          {/* Ticket Information Grid */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-blue-300 text-xs font-medium mb-1">Block/Area</p>
                <p className="text-white font-semibold">{ticket.blockArea}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-blue-300 text-xs font-medium mb-1">View Restriction</p>
                <p className="text-white font-semibold">{ticket.restriction}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-blue-300 text-xs font-medium mb-1">Delivery Method</p>
                <p className="text-white font-semibold">{ticket.deliveryMethod}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-blue-300 text-xs font-medium mb-1">Age Band</p>
                <p className="text-white font-semibold">{ticket.ageBand}</p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-xs font-medium mb-1">Split Type</p>
                  <p className="text-white font-semibold">{ticket.splitType}</p>
                </div>
                <div>
                  <p className="text-blue-300 text-xs font-medium mb-1">Quantity</p>
                  <p className="text-white font-semibold text-right">{ticket.quantity} tickets</p>
                </div>
              </div>
            </div>
            
            {ticket.note && (
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-400/20">
                <p className="text-blue-300 text-xs font-medium mb-1">Seller's Note</p>
                <p className="text-white text-sm">📝 {ticket.note}</p>
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gradient-to-r from-blue-600/10 to-blue-700/10 rounded-xl p-4 border border-blue-400/20 mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FaCoins className="text-yellow-400" />
              Total Cost Breakdown
            </h4>
            
            {costBreakdown ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300">Ticket Price:</span>
                  <span className="text-white font-medium">{costBreakdown.baseCost} points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-300">Commission ({costBreakdown.commissionRate}%):</span>
                  <span className="text-white font-medium">+{costBreakdown.commission} points</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-blue-400/20">
                  <span className="text-white font-semibold text-lg">Total Cost:</span>
                  <span className="text-yellow-400 font-bold text-2xl">{costBreakdown.totalCost} points</span>
                </div>
                {userCommission && (
                  <div className="flex items-center gap-2 text-xs text-blue-300 mt-2">
                    <FaInfoCircle className="flex-shrink-0" />
                    <span>Your {costBreakdown.levelName} level • {costBreakdown.commissionRate}% commission</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                <span className="ml-2 text-yellow-300 text-sm">Calculating...</span>
              </div>
            )}
          </div>

          {/* Points Check */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-300">Your Balance:</span>
              <span className="text-white font-semibold">{userPoints.toLocaleString()} points</span>
            </div>
            
            {costBreakdown && !canAfford && (
              <div className="bg-red-500/20 rounded-lg p-3 border border-red-400/30">
                <div className="flex items-center gap-2 text-red-300 text-sm">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  <span>You need {costBreakdown.totalCost - userPoints} more points</span>
                </div>
              </div>
            )}
            
            {costBreakdown && canAfford && (
              <div className="bg-green-500/20 rounded-lg p-3 border border-green-400/30">
                <div className="flex items-center gap-2 text-green-300 text-sm">
                  <FaCheck className="flex-shrink-0" />
                  <span>You have enough points to purchase</span>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => onBuyClick(ticket)}
            disabled={purchasing === ticket._id || ticket.quantity === 0 || !costBreakdown}
            className={`group relative w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl active:scale-[0.98] ${
              ticket.quantity > 0 && costBreakdown
                ? 'bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 text-white cursor-pointer'
                : 'bg-gray-800/50 text-gray-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            {/* Background Accent */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative flex items-center justify-between">
              {purchasing === ticket._id ? (
                <div className="flex items-center justify-center w-full gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : !costBreakdown ? (
                <div className="flex items-center justify-center w-full gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Calculating...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-colors ${
                      ticket.quantity > 0 && costBreakdown ? 'bg-white/10' : 'bg-gray-700/20'
                    }`}>
                      <FaShoppingBag className="text-xl" />
                    </div>
                    <div className="text-left">
                      <span className="block text-lg tracking-tight leading-tight">
                        {canAfford ? 'Purchase Ticket' : 'Insufficient Points'}
                      </span>
                      <span className={`text-[10px] uppercase tracking-widest font-bold opacity-60 ${!canAfford ? 'text-red-300' : 'text-green-200'}`}>
                        {canAfford ? 'Secure Purchase' : `Need ${costBreakdown.totalCost - userPoints} more`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-2xl font-black leading-none">{costBreakdown.totalCost}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Points</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <FaAngleRight className="text-xl opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </button>
          
          {/* Protection Info */}
          <div className="mt-3 flex items-center justify-center gap-2 text-blue-400 text-xs">
            <FaShieldAlt className="text-xs" />
            <span>Points protected by escrow system</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact List View Card
const CompactTicketCard = ({ 
  ticket, 
  userPoints, 
  userInfo, 
  userCommission, 
  purchasing, 
  onBuyClick,
  getImageUrl
}) => {
  const [costBreakdown, setCostBreakdown] = useState(null);
  
  useEffect(() => {
    const loadCost = () => {
      const commissionRate = userCommission?.rate || 0.10;
      const baseCost = ticket.price;
      const commission = Math.round(baseCost * commissionRate);
      const breakdown = {
        baseCost,
        commission,
        totalCost: baseCost + commission,
        commissionRate: commissionRate * 100,
        levelName: userCommission?.levelName || 'Standard'
      };
      setCostBreakdown(breakdown);
    };
    loadCost();
  }, [ticket.price, userCommission]);

  const canAfford = costBreakdown ? userPoints >= costBreakdown.totalCost : false;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 hover:border-blue-400/50 transition-all duration-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-right min-w-20">
            <div className="text-2xl font-bold text-yellow-400">{ticket.price}</div>
            <div className="text-xs text-blue-300">points</div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold">{ticket.category}</h4>
            <div className="flex items-center gap-3 text-sm text-blue-300 mt-1">
              <span>{ticket.blockArea}</span>
              <span>•</span>
              <span>{ticket.quantity} tickets</span>
              <span>•</span>
              <span>{ticket.restriction}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {costBreakdown && (
            <div className="text-right">
              <div className="text-white font-semibold">{costBreakdown.totalCost} points total</div>
              <div className="text-xs text-blue-300">incl. {costBreakdown.commissionRate}% commission</div>
            </div>
          )}
          
          <button 
            onClick={() => onBuyClick(ticket)}
            disabled={purchasing === ticket._id || ticket.quantity === 0 || !costBreakdown}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              ticket.quantity > 0 && costBreakdown
                ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
            }`}
          >
            {purchasing === ticket._id ? 'Processing...' : 'Buy'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Grid View Card
const GridTicketCard = ({ 
  ticket, 
  userPoints, 
  userInfo, 
  userCommission, 
  purchasing, 
  onBuyClick,
  getImageUrl,
  onImageExpand
}) => {
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    const loadCost = () => {
      const commissionRate = userCommission?.rate || 0.10;
      const baseCost = ticket.price;
      const commission = Math.round(baseCost * commissionRate);
      const breakdown = {
        baseCost,
        commission,
        totalCost: baseCost + commission,
        commissionRate: commissionRate * 100,
        levelName: userCommission?.levelName || 'Standard'
      };
      setCostBreakdown(breakdown);
    };
    loadCost();
  }, [ticket.price, userCommission]);

  const sectionImage = ticket.sectionImage ? getImageUrl(ticket.sectionImage) : null;
  const canAfford = costBreakdown ? userPoints >= costBreakdown.totalCost : false;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:border-blue-400/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="relative h-48">
        {sectionImage && !imageError ? (
          <img 
            src={sectionImage}
            alt={ticket.category}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <FaTicketAlt className="text-3xl text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full p-2">
          <div className="text-white font-bold text-lg">{ticket.price}</div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        <h4 className="text-white font-semibold text-lg mb-2">{ticket.category}</h4>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-blue-200 text-sm">
            <FaMapMarkerAlt className="mr-2 text-blue-400" />
            <span>{ticket.blockArea}</span>
          </div>
          <div className="flex items-center text-blue-200 text-sm">
            <FaEye className="mr-2 text-blue-400" />
            <span>{ticket.restriction}</span>
          </div>
          <div className="flex items-center text-blue-200 text-sm">
            <FaUsers className="mr-2 text-blue-400" />
            <span>{ticket.quantity} tickets</span>
          </div>
        </div>
        
        {costBreakdown && (
          <div className="mb-4">
            <div className="text-white font-bold text-xl mb-1">{costBreakdown.totalCost} points</div>
            <div className="text-blue-300 text-xs">Total with commission</div>
          </div>
        )}
        
        <button 
          onClick={() => onBuyClick(ticket)}
          disabled={purchasing === ticket._id || ticket.quantity === 0 || !costBreakdown}
          className={`w-full py-2.5 rounded-lg font-medium transition-all ${
            ticket.quantity > 0 && costBreakdown
              ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
              : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
          }`}
        >
          {purchasing === ticket._id ? 'Processing...' : 'Purchase Ticket'}
        </button>
      </div>
    </div>
  );
};

// Full Image Modal Component
const FullImageModal = ({ imageUrl, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(1, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e) => {
    if (zoom === 1) return;
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '0' || e.key === 'r') resetZoom();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="relative w-full h-full max-w-7xl mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm rounded-full p-3 border border-white/20 text-white hover:bg-black/90 transition-colors"
        >
          <FaTimes size={20} />
        </button>

        {/* Zoom Controls */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full p-2 border border-white/20">
          <button
            onClick={() => setZoom(prev => Math.max(1, prev - 0.25))}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            disabled={zoom <= 1}
          >
            <FaSearch className="rotate-180" />
          </button>
          <span className="text-white text-sm px-2">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            disabled={zoom >= 3}
          >
            <FaSearch />
          </button>
          <button
            onClick={resetZoom}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors ml-2"
          >
            <FaCompress />
          </button>
        </div>

        {/* Image Container */}
        <div 
          ref={containerRef}
          className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
        >
          <div
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: zoom === 1 ? 'transform 0.3s ease' : 'none'
            }}
          >
            <img 
              src={imageUrl}
              alt="Full view seat image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-white text-sm">
          <div className="flex items-center gap-4">
            <span>Scroll to zoom • Drag to pan • Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Purchase Confirmation Modal
const EnhancedPurchaseConfirmationModal = ({ 
  selectedTicket, 
  match, 
  userPoints, 
  userInfo, 
  userCommission, 
  purchasing,
  onClose, 
  onConfirm,
  getImageUrl,
  getVenueName,
  venueSectionsCount,
  onImageExpand
}) => {
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadCost = () => {
      const commissionRate = userCommission?.rate || 0.10;
      const baseCost = selectedTicket.price;
      const commission = Math.round(baseCost * commissionRate);
      const breakdown = {
        baseCost,
        commission,
        totalCost: baseCost + commission,
        commissionRate: commissionRate * 100,
        levelName: userCommission?.levelName || 'Standard'
      };
      setCostBreakdown(breakdown);
    };

    loadCost();
  }, [selectedTicket.price, userCommission]);

  const sectionImage = selectedTicket?.sectionImage ? getImageUrl(selectedTicket.sectionImage) : null;
  const venueName = getVenueName(match);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-5xl w-full animate-in fade-in-90 zoom-in-90 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 sticky top-0 bg-gray-900/95 backdrop-blur-xl z-10">
          <div>
            <h3 className="text-xl font-bold text-white">Confirm Ticket Purchase</h3>
            <div className="flex items-center gap-2 mt-1">
              {match.competitionImage ? (
                <img 
                  src={getImageUrl(match.competitionImage)} 
                  alt={match.competition} 
                  className="w-4 h-4 object-contain"
                />
              ) : (
                <FaTrophy className="text-blue-400 text-xs" />
              )}
              <p className="text-blue-300 text-sm">{match.homeTeam} vs {match.awayTeam}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Match & Ticket Info */}
          <div className="flex-1 p-6 border-r-0 lg:border-r border-white/20">
            {/* Seat Image Preview */}
            {sectionImage && !imageError && (
              <div className="mb-6">
                <div className="relative rounded-xl overflow-hidden border-2 border-white/20">
                  <img 
                    src={sectionImage}
                    alt={`${selectedTicket.category} section`}
                    className="w-full h-48 object-cover"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white">
                      <h4 className="font-bold">{selectedTicket.category}</h4>
                      <p className="text-sm text-blue-200">Block: {selectedTicket.blockArea}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onImageExpand(sectionImage)}
                    className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full p-2 border border-white/30 text-white hover:bg-black/90 transition-colors"
                  >
                    <FaExpand size={14} />
                  </button>
                </div>
                <div className="mt-2 text-center text-blue-300 text-sm">
                  <button 
                    onClick={() => onImageExpand(sectionImage)}
                    className="hover:text-white transition-colors"
                  >
                    Click to view full size image
                  </button>
                </div>
              </div>
            )}

            {/* Match Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FaFutbol className="text-blue-400" />
                Match Information
              </h4>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-blue-200">
                    <FaTrophy className="mr-3 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-blue-300 text-xs">Competition</p>
                      <p className="text-white font-medium">{match.competition}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-blue-200">
                    <FaMapMarkerAlt className="mr-3 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-blue-300 text-xs">Venue</p>
                      <p className="text-white font-medium">{venueName}</p>
                      {venueSectionsCount > 0 && (
                        <p className="text-green-300 text-xs mt-1">
                          <FaCamera className="inline mr-1" />
                          {venueSectionsCount} stadium sections
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-blue-200">
                    <FaCalendarAlt className="mr-3 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-blue-300 text-xs">Date & Time</p>
                      <p className="text-white font-medium">
                        {new Date(match.date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-blue-200">
                    <FaUsers className="mr-3 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-blue-300 text-xs">Teams</p>
                      <p className="text-white font-medium">{match.homeTeam} vs {match.awayTeam}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FaTicketAlt className="text-green-400" />
                Ticket Details
              </h4>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-300">Category:</span>
                      <span className="text-white font-medium">{selectedTicket.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Block/Area:</span>
                      <span className="text-white font-medium">{selectedTicket.blockArea}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">View:</span>
                      <span className="text-white font-medium">{selectedTicket.restriction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Age Band:</span>
                      <span className="text-white font-medium">{selectedTicket.ageBand}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-300">Quantity:</span>
                      <span className="text-white font-medium">1 ticket</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Split Type:</span>
                      <span className="text-white font-medium">{selectedTicket.splitType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Delivery:</span>
                      <span className="text-white font-medium">{selectedTicket.deliveryMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Price:</span>
                      <span className="text-white font-medium">{selectedTicket.price} points</span>
                    </div>
                  </div>
                </div>
                {selectedTicket.note && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-blue-300 text-xs font-medium mb-1">Seller's Note</p>
                    <p className="text-white text-sm">📝 {selectedTicket.note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Pricing & Actions */}
          <div className="flex-1 p-6">
            {/* Cost Breakdown */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FaCoins className="text-yellow-400" />
                Cost Breakdown
              </h4>
              <div className="bg-gradient-to-r from-blue-600/10 to-blue-700/10 rounded-xl p-4 border border-blue-400/20">
                {costBreakdown ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Ticket Price:</span>
                      <span className="text-white font-medium">{costBreakdown.baseCost} points</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Commission ({costBreakdown.commissionRate}%):</span>
                      <span className="text-white font-medium">+{costBreakdown.commission} points</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/10">
                      <span className="text-white font-semibold text-lg">Total Cost:</span>
                      <span className="text-yellow-400 font-bold text-2xl">{costBreakdown.totalCost} points</span>
                    </div>
                    {userCommission && (
                      <div className="flex items-center gap-2 text-xs text-blue-300 mt-2">
                        <FaInfoCircle className="flex-shrink-0" />
                        <span>Commission rate based on your {costBreakdown.levelName} level</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                    <span className="ml-2 text-yellow-300 text-sm">Calculating commission...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Balance & Protection */}
            <div className="mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-300">Your Balance:</span>
                  <span className="text-white font-semibold">{userPoints.toLocaleString()} points</span>
                </div>
                {costBreakdown && (
                  <div className={`mt-2 p-2 rounded text-xs ${
                    userPoints >= costBreakdown.totalCost 
                      ? 'bg-green-500/20 text-green-300 border border-green-400/20' 
                      : 'bg-red-500/20 text-red-300 border border-red-400/20'
                  }`}>
                    {userPoints >= costBreakdown.totalCost 
                      ? '✓ You have sufficient points for this purchase'
                      : `✗ You need ${costBreakdown.totalCost - userPoints} more points`
                    }
                  </div>
                )}
              </div>
              <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-400/20">
                <div className="flex items-start gap-2 text-xs text-purple-300">
                  <FaShieldAlt className="mt-0.5 flex-shrink-0" />
                  <span>Your points are protected by escrow and will be released to the seller 7 days after the match.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-600/50 hover:bg-gray-600/70 text-gray-200 rounded-xl font-medium transition-all duration-200 border border-gray-500/30 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={purchasing || !costBreakdown || (costBreakdown && userPoints < costBreakdown.totalCost)}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {purchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing Purchase...
                  </>
                ) : !costBreakdown ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <FaCheckCircle size={16} />
                    Confirm Purchase
                  </>
                )}
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-blue-300">Category</div>
                <div className="text-white font-medium">{selectedTicket.category}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-blue-300">View Quality</div>
                <div className="text-white font-medium">{selectedTicket.restriction}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};