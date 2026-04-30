'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FaTicketAlt,
  FaArrowLeft,
  FaFutbol,
  FaUser,
  FaTag,
  FaMapMarkerAlt,
  FaFilter,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from 'react-icons/fa';

function AdminTicketsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const matchIdFilter = searchParams.get('match');

  const [listings, setListings] = useState([]);
  const [matchInfo, setMatchInfo] = useState(null);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = API_BASE_URL.replace('/api', '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: token ? `Bearer ${token}` : '' };

        if (matchIdFilter) {
          // Fetch listings for a specific match + match info in parallel
          const [listingsRes, matchRes] = await Promise.all([
            fetch(`${API_BASE_URL}/tickets/match/${matchIdFilter}`, { headers }),
            fetch(`${API_BASE_URL}/matches/${matchIdFilter}`, { headers }),
          ]);

          const [listingsData, matchData] = await Promise.all([
            listingsRes.json(),
            matchRes.json(),
          ]);

          if (!listingsRes.ok) throw new Error(listingsData.message || 'Failed to fetch listings');
          setListings(Array.isArray(listingsData) ? listingsData : []);
          if (matchRes.ok) setMatchInfo(matchData);
        } else {
          // Fetch all matches so we can show listings across all matches
          const matchesRes = await fetch(`${API_BASE_URL}/matches`, { headers });
          const matchesData = await matchesRes.json();
          setAllMatches(Array.isArray(matchesData) ? matchesData : []);

          // Fetch listings for every match in parallel
          const allListings = await Promise.all(
            (Array.isArray(matchesData) ? matchesData : []).map(async (m) => {
              try {
                const res = await fetch(`${API_BASE_URL}/tickets/match/${m._id}`, { headers });
                if (!res.ok) return [];
                const data = await res.json();
                // Attach match info to each listing for display
                return (Array.isArray(data) ? data : []).map((l) => ({
                  ...l,
                  _matchInfo: m,
                }));
              } catch {
                return [];
              }
            })
          );
          setListings(allListings.flat());
        }
      } catch (err) {
        setError(err.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchIdFilter]);

  const getMatchLabel = (listing) => {
    if (matchInfo) return `${matchInfo.homeTeam} vs ${matchInfo.awayTeam}`;
    if (listing._matchInfo) return `${listing._matchInfo.homeTeam} vs ${listing._matchInfo.awayTeam}`;
    return 'Unknown Match';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30">
            <FaCheckCircle className="text-xs" /> Active
          </span>
        );
      case 'sold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-400/30">
            <FaTimesCircle className="text-xs" /> Sold
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-400/30">
            <FaTimesCircle className="text-xs" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <FaClock className="text-xs" /> {status}
          </span>
        );
    }
  };

  // Filter listings
  const filtered = listings.filter((l) => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchLabel = getMatchLabel(l).toLowerCase();
    const matchesSearch =
      !search ||
      matchLabel.includes(search.toLowerCase()) ||
      (l.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.blockArea || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.seller?.profile?.fullName || l.seller?.email || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const backHref = '/admin/matches';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
        <span className="ml-3 text-white">Loading listings...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => router.push(backHref)}
          className="inline-flex items-center text-blue-200 hover:text-white font-medium mb-4 transition-colors duration-200 group"
        >
          <FaArrowLeft className="mr-2 text-blue-300 group-hover:text-white transition-colors" />
          {matchIdFilter ? 'Back to Matches' : 'Back to Matches'}
        </button>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                <FaTicketAlt className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {matchInfo
                    ? `${matchInfo.homeTeam} vs ${matchInfo.awayTeam}`
                    : 'All Ticket Listings'}
                </h1>
                <p className="text-blue-200 mt-1">
                  {matchInfo
                    ? `${(() => { const d = new Date(matchInfo.date); return `${d.getDate()}/${d.toLocaleDateString('en-GB',{month:'short'})}/${d.getFullYear()}`; })()} · ${matchInfo.venueName || matchInfo.venue?.name || ''}`
                    : 'Admin overview of all active listings'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 flex-wrap">
              <div className="bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-2 text-center">
                <div className="text-green-300 font-bold text-xl">
                  {listings.filter((l) => l.status === 'active').length}
                </div>
                <div className="text-green-200 text-xs">Active</div>
              </div>
              <div className="bg-gray-500/20 border border-gray-400/30 rounded-xl px-4 py-2 text-center">
                <div className="text-gray-300 font-bold text-xl">
                  {listings.filter((l) => l.status === 'sold').length}
                </div>
                <div className="text-gray-200 text-xs">Sold</div>
              </div>
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl px-4 py-2 text-center">
                <div className="text-blue-300 font-bold text-xl">{listings.length}</div>
                <div className="text-blue-200 text-xs">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-white/20 mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-sm" />
          <input
            type="text"
            placeholder="Search by match, category, block, or seller…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition text-sm outline-none"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-sm" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition text-sm outline-none appearance-none"
          >
            <option value="all" className="text-gray-900">All Statuses</option>
            <option value="active" className="text-gray-900">Active</option>
            <option value="sold" className="text-gray-900">Sold</option>
            <option value="cancelled" className="text-gray-900">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* Listings */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
            <FaTicketAlt className="text-2xl text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No listings found</h3>
          <p className="text-blue-200">
            {listings.length === 0
              ? 'No ticket listings have been created for this match yet.'
              : 'No listings match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <div
              key={listing._id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 hover:shadow-xl"
            >
              {/* Section image */}
              {listing.sectionImage && (
                <div className="h-36 overflow-hidden">
                  <img
                    src={getImageUrl(listing.sectionImage)}
                    alt={listing.category}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 space-y-3">
                {/* Match label (only when showing all matches) */}
                {!matchIdFilter && (
                  <div className="flex items-center gap-2 text-blue-200 text-xs">
                    <FaFutbol className="text-blue-400 flex-shrink-0" />
                    <span className="truncate font-medium">{getMatchLabel(listing)}</span>
                  </div>
                )}

                {/* Category + status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaTag className="text-yellow-400 text-sm flex-shrink-0" />
                    <span className="text-white font-bold">{listing.category}</span>
                  </div>
                  {getStatusBadge(listing.status)}
                </div>

                {/* Block / Area */}
                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <FaMapMarkerAlt className="text-blue-400 flex-shrink-0" />
                  <span>Block: <span className="text-white font-medium">{listing.blockArea}</span></span>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <FaUser className="text-purple-400 flex-shrink-0" />
                  <span className="truncate">
                    {listing.seller?.profile?.fullName || listing.seller?.email || 'Unknown Seller'}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-white font-bold text-sm">{listing.quantity}</div>
                    <div className="text-blue-300 text-xs">Qty</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-yellow-300 font-bold text-sm">{listing.price}</div>
                    <div className="text-blue-300 text-xs">pts each</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-green-300 font-bold text-sm">{listing.price * listing.quantity}</div>
                    <div className="text-blue-300 text-xs">total pts</div>
                  </div>
                </div>

                {/* Extra info */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                    {listing.ageBand}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                    {listing.splitType}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    listing.restriction === 'Clear View'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {listing.restriction}
                  </span>
                </div>

                {/* Delivery method */}
                <div className="text-blue-300 text-xs pt-1 border-t border-white/10">
                  Delivery: <span className="text-white">{listing.deliveryMethod}</span>
                </div>

                {/* Note */}
                {listing.note && (
                  <div className="text-blue-300 text-xs italic">
                    "{listing.note}"
                  </div>
                )}

                {/* Created at */}
                <div className="text-blue-400 text-xs">
                  Listed: {(() => { const d = new Date(listing.createdAt); return `${d.getDate()}/${d.toLocaleDateString('en-GB',{month:'short'})}/${d.getFullYear()}`; })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer count */}
      {filtered.length > 0 && (
        <div className="mt-6 text-center text-blue-300 text-sm">
          Showing {filtered.length} of {listings.length} listing{listings.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
        <span className="ml-3 text-white">Loading...</span>
      </div>
    }>
      <AdminTicketsContent />
    </Suspense>
  );
}
