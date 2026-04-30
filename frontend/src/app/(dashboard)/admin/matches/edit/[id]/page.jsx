'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaFutbol,
  FaArrowLeft,
  FaCalendar,
  FaMapMarkerAlt,
  FaTrophy,
  FaUsers,
  FaImage,
  FaExclamationTriangle,
  FaSave,
} from 'react-icons/fa';

export default function EditMatchPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    competition: '',
    venue: '',
    matchDate: '',
  });

  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [sameTeamError, setSameTeamError] = useState('');
  const [selectedVenueName, setSelectedVenueName] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = API_BASE_URL.replace('/api', '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  // Fetch match + reference data in parallel
  useEffect(() => {
    async function fetchAll() {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: token ? `Bearer ${token}` : '' };

        const [matchRes, teamsRes, venuesRes, competitionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/matches/${id}`, { headers }),
          fetch(`${API_BASE_URL}/teams`, { headers }),
          fetch(`${API_BASE_URL}/venues`, { headers }),
          fetch(`${API_BASE_URL}/competitions`, { headers }),
        ]);

        const [matchData, teamsData, venuesData, competitionsData] = await Promise.all([
          matchRes.json(),
          teamsRes.json(),
          venuesRes.json(),
          competitionsRes.json(),
        ]);

        if (!matchRes.ok) throw new Error(matchData.message || 'Failed to load match');

        setTeams(Array.isArray(teamsData) ? teamsData : []);
        setVenues(Array.isArray(venuesData) ? venuesData : []);
        setCompetitions(Array.isArray(competitionsData) ? competitionsData : []);

        // Resolve venue ID — match.venue may be a populated object or a raw ID
        const venueId =
          typeof matchData.venue === 'object' && matchData.venue !== null
            ? matchData.venue._id
            : matchData.venue;

        const venueName =
          typeof matchData.venue === 'object' && matchData.venue !== null
            ? matchData.venue.name
            : matchData.venueName || '';

        // Build datetime-local string from date + time fields
        // date is ISO string (e.g. "2025-12-25T00:00:00.000Z"), time is "HH:MM:SS"
        let matchDateValue = '';
        if (matchData.date) {
          const dateStr = new Date(matchData.date).toISOString().split('T')[0]; // "YYYY-MM-DD"
          const timeStr = matchData.time ? matchData.time.substring(0, 5) : '00:00'; // "HH:MM"
          matchDateValue = `${dateStr}T${timeStr}`;
        }

        setFormData({
          homeTeam: matchData.homeTeam || '',
          awayTeam: matchData.awayTeam || '',
          competition: matchData.competition || '',
          venue: venueId || '',
          matchDate: matchDateValue,
        });

        setSelectedVenueName(venueName);

        if (matchData.image) {
          setExistingImage(matchData.image);
          setImagePreview(getImageUrl(matchData.image));
        }
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setFetchLoading(false);
      }
    }

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'venue') {
      const selectedVenue = venues.find((v) => v._id === value);
      if (selectedVenue) {
        setFormData((prev) => ({ ...prev, venue: selectedVenue._id }));
        setSelectedVenueName(selectedVenue.name);
      }
    } else {
      const newFormData = { ...formData, [name]: value };
      setFormData(newFormData);

      if (
        (name === 'homeTeam' || name === 'awayTeam') &&
        newFormData.homeTeam &&
        newFormData.awayTeam
      ) {
        setSameTeamError(
          newFormData.homeTeam === newFormData.awayTeam
            ? 'Home team and away team cannot be the same'
            : ''
        );
      } else {
        setSameTeamError('');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (formData.homeTeam && formData.awayTeam && formData.homeTeam === formData.awayTeam) {
      setSameTeamError('Home team and away team cannot be the same');
      return false;
    }
    if (
      !formData.homeTeam ||
      !formData.awayTeam ||
      !formData.competition ||
      !formData.venue ||
      !formData.matchDate
    ) {
      setError('All fields are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const dateObj = new Date(formData.matchDate);

      const body = new FormData();
      body.append('homeTeam', formData.homeTeam);
      body.append('awayTeam', formData.awayTeam);
      body.append('competition', formData.competition);
      body.append('venue', formData.venue);
      body.append('date', dateObj.toISOString().split('T')[0]);
      body.append('time', dateObj.toTimeString().split(' ')[0]);
      if (image) body.append('image', image);

      const res = await fetch(`${API_BASE_URL}/matches/${id}`, {
        method: 'PUT',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update match');

      router.push(`/admin/matches/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAwayTeams = () =>
    formData.homeTeam ? teams.filter((t) => t.name !== formData.homeTeam) : teams;

  const getFilteredHomeTeams = () =>
    formData.awayTeam ? teams.filter((t) => t.name !== formData.awayTeam) : teams;

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
        <span className="ml-3 text-white">Loading match data...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => router.push(`/admin/matches/${id}`)}
          className="inline-flex items-center text-blue-200 hover:text-white font-medium mb-4 transition-colors duration-200 group"
        >
          <FaArrowLeft className="mr-2 text-blue-300 group-hover:text-white transition-colors" />
          Back to Match Details
        </button>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
              <FaFutbol className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Match</h1>
              <p className="text-blue-200 mt-1">Update match details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-8 border border-white/20">
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <FaExclamationTriangle className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" encType="multipart/form-data">
          {/* Teams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Home Team */}
            <div>
              <label className="text-sm font-medium text-blue-200 mb-2 flex items-center">
                <FaUsers className="mr-2 text-blue-400 text-sm" />
                Home Team
              </label>
              <div className="relative">
                <select
                  name="homeTeam"
                  value={formData.homeTeam}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none"
                >
                  <option value="" className="text-gray-900">Select Home Team</option>
                  {getFilteredHomeTeams().map((team) => (
                    <option key={team._id} value={team.name} className="text-gray-900">
                      {team.name}
                    </option>
                  ))}
                </select>
                <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-sm" />
              </div>
            </div>

            {/* Away Team */}
            <div>
              <label className="text-sm font-medium text-blue-200 mb-2 flex items-center">
                <FaUsers className="mr-2 text-blue-400 text-sm" />
                Away Team
              </label>
              <div className="relative">
                <select
                  name="awayTeam"
                  value={formData.awayTeam}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none"
                >
                  <option value="" className="text-gray-900">Select Away Team</option>
                  {getFilteredAwayTeams().map((team) => (
                    <option key={team._id} value={team.name} className="text-gray-900">
                      {team.name}
                    </option>
                  ))}
                </select>
                <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-sm" />
              </div>
            </div>
          </div>

          {/* Same Team Error */}
          {sameTeamError && (
            <div className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <FaExclamationTriangle className="flex-shrink-0" />
              {sameTeamError}
            </div>
          )}

          {/* Competition */}
          <div>
            <label className="text-sm font-medium text-blue-200 mb-2 flex items-center">
              <FaTrophy className="mr-2 text-blue-400 text-sm" />
              Competition
            </label>
            <div className="relative">
              <select
                name="competition"
                value={formData.competition}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none"
              >
                <option value="" className="text-gray-900">Select Competition</option>
                {competitions.map((c) => (
                  <option key={c._id} value={c.name} className="text-gray-900">
                    {c.name}
                  </option>
                ))}
              </select>
              <FaTrophy className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-sm" />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="text-sm font-medium text-blue-200 mb-2 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-400 text-sm" />
              Venue *
            </label>
            <div className="relative">
              <select
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none"
              >
                <option value="" className="text-gray-900">Select Venue</option>
                {venues.map((v) => (
                  <option key={v._id} value={v._id} className="text-gray-900">
                    {v.name} {v.sections?.length > 0 ? `(${v.sections.length} sections)` : ''}
                  </option>
                ))}
              </select>
              <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-sm" />
            </div>
            {selectedVenueName && (
              <div className="mt-2 text-blue-300 text-sm flex items-center gap-2">
                <span className="bg-blue-500/20 px-2 py-1 rounded">Selected: {selectedVenueName}</span>
                {venues.find((v) => v._id === formData.venue)?.sections?.length > 0 && (
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                    Has {venues.find((v) => v._id === formData.venue)?.sections?.length} section images
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Match Date & Time */}
          <div>
            <label className="text-sm font-medium text-blue-200 mb-2 flex items-center">
              <FaCalendar className="mr-2 text-blue-400 text-sm" />
              Match Date & Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                name="matchDate"
                value={formData.matchDate}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none"
              />
              <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-sm" />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium text-blue-200 mb-2 flex items-center">
              <FaImage className="mr-2 text-blue-400 text-sm" />
              Match Image
            </label>
            <div className="space-y-4">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
              />
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-blue-200 mb-2">
                    {image ? 'New image preview:' : 'Current image:'}
                  </p>
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/20">
                    <img
                      src={imagePreview}
                      alt="Match preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {!image && existingImage && (
                    <p className="text-xs text-blue-300 mt-1">
                      Leave blank to keep the current image
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/admin/matches/${id}`)}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <FaArrowLeft className="text-sm" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!sameTeamError}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="text-sm" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
