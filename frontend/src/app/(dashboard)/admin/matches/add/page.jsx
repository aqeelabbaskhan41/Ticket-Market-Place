'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaFutbol, FaArrowLeft, FaCalendar, FaMapMarkerAlt, FaTrophy, FaUsers, FaImage, FaExclamationTriangle } from 'react-icons/fa';

export default function AddMatchPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    competition: '',
    venue: '', // This should now store venue ID, not name
    matchDate: '',
  });

  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [sameTeamError, setSameTeamError] = useState('');
  const [selectedVenueName, setSelectedVenueName] = useState(''); // For display purposes

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch teams, venues, and competitions on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('token');
        
        const [teamsRes, venuesRes, competitionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/teams`, {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          }),
          fetch(`${API_BASE_URL}/venues`, {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          }),
          fetch(`${API_BASE_URL}/competitions`, {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          }),
        ]);

        const teamsData = await teamsRes.json();
        const venuesData = await venuesRes.json();
        const competitionsData = await competitionsRes.json();

        setTeams(Array.isArray(teamsData) ? teamsData : []);
        setVenues(Array.isArray(venuesData) ? venuesData : []);
        setCompetitions(Array.isArray(competitionsData) ? competitionsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load teams, venues, or competitions');
      } finally {
        setFetchLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'venue') {
      // Find the venue by ID and set both ID and name
      const selectedVenue = venues.find(v => v._id === value);
      if (selectedVenue) {
        setFormData(prev => ({ 
          ...prev, 
          venue: selectedVenue._id 
        }));
        setSelectedVenueName(selectedVenue.name);
      }
    } else {
      const newFormData = { ...formData, [name]: value };
      setFormData(newFormData);

      // Check if home and away teams are the same
      if ((name === 'homeTeam' || name === 'awayTeam') && newFormData.homeTeam && newFormData.awayTeam) {
        if (newFormData.homeTeam === newFormData.awayTeam) {
          setSameTeamError('Home team and away team cannot be the same');
        } else {
          setSameTeamError('');
        }
      } else {
        setSameTeamError('');
      }
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    if (formData.homeTeam && formData.awayTeam && formData.homeTeam === formData.awayTeam) {
      setSameTeamError('Home team and away team cannot be the same');
      return false;
    }
    
    if (!formData.homeTeam || !formData.awayTeam || !formData.competition || !formData.venue || !formData.matchDate) {
      setError('All fields are required');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    try {
      // Convert matchDate to separate date & time
      const dateObj = new Date(formData.matchDate);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('homeTeam', formData.homeTeam);
      formDataToSend.append('awayTeam', formData.awayTeam);
      formDataToSend.append('competition', formData.competition);
      formDataToSend.append('venue', formData.venue); // Now sending venue ID
      formDataToSend.append('date', dateObj.toISOString().split('T')[0]);
      formDataToSend.append('time', dateObj.toTimeString().split(' ')[0]);
      
      // Append image if selected
      if (image) {
        formDataToSend.append('image', image);
      }

      const res = await fetch(`${API_BASE_URL}/matches`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to create match');

      router.push('/admin/matches');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter teams for away team dropdown (exclude selected home team)
  const getFilteredAwayTeams = () => {
    if (!formData.homeTeam) {
      return teams;
    }
    return teams.filter(team => team.name !== formData.homeTeam);
  };

  // Filter teams for home team dropdown (exclude selected away team)
  const getFilteredHomeTeams = () => {
    if (!formData.awayTeam) {
      return teams;
    }
    return teams.filter(team => team.name !== formData.awayTeam);
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading form data...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => router.push('/admin/matches')}
          className="inline-flex items-center text-blue-200 hover:text-white font-medium mb-4 transition-colors duration-200 group"
        >
          <FaArrowLeft className="mr-2 text-blue-300 group-hover:text-white transition-colors" />
          Back to Matches
        </button>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
              <FaFutbol className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Add New Match</h1>
              <p className="text-blue-200 mt-1">Create a new football match event</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-8 border border-white/20">
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" encType="multipart/form-data">
          {/* Team Information */}
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
                <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
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
                <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
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
                {competitions.map((competition) => (
                  <option key={competition._id} value={competition.name} className="text-gray-900">
                    {competition.name}
                  </option>
                ))}
              </select>
              <FaTrophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
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
                {venues.map((venue) => (
                  <option key={venue._id} value={venue._id} className="text-gray-900">
                    {venue.name} {venue.sections?.length > 0 ? `(${venue.sections.length} sections)` : ''}
                  </option>
                ))}
              </select>
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            </div>
            {selectedVenueName && (
              <div className="mt-2 text-blue-300 text-sm flex items-center gap-2">
                <span className="bg-blue-500/20 px-2 py-1 rounded">Selected: {selectedVenueName}</span>
                {venues.find(v => v._id === formData.venue)?.sections?.length > 0 && (
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                    Has {venues.find(v => v._id === formData.venue)?.sections?.length} section images
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
              <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium text-blue-200 mb-2 flex items-center">
              <FaImage className="mr-2 text-blue-400 text-sm" />
              Match Image (Optional)
            </label>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
                />
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-blue-200 mb-2">Image Preview:</p>
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/20">
                    <img 
                      src={imagePreview} 
                      alt="Match preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/admin/matches')}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <FaArrowLeft className="text-sm" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!sameTeamError}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Match...
                </>
              ) : (
                <>
                  <FaFutbol className="text-sm" />
                  Create Match
                </>
              )}
            </button>
          </div>
        </form>

        {/* Form Tips */}
        <div className="mt-6 sm:mt-8 border-t border-white/20 pt-4 sm:pt-6">
          <h3 className="text-sm font-semibold text-white mb-2">Quick Tips</h3>
          <ul className="text-blue-200 text-xs space-y-1">
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
              Select teams, venues, and competitions from pre-registered options
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
              Home team and away team cannot be the same
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
              Venues with section images will auto-link to tickets
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
              Set the date/time in local match timezone
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
              Supported image formats: JPG, PNG, WebP (max 5MB)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}