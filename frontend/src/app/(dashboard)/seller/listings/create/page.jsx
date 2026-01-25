'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaFilePdf, 
  FaMobileAlt, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaPlus,
  FaArrowLeft,
  FaCheck,
  FaImage,
  FaCamera,
  FaTrophy
} from 'react-icons/fa';

export default function CreateListing() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [selectedMatchData, setSelectedMatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sectionImages, setSectionImages] = useState({});
  const [selectedSectionImage, setSelectedSectionImage] = useState(null);
  const [categories, setCategories] = useState([]);

  // Form state for single listing
  const [formData, setFormData] = useState({
    category: '',
    blockArea: '',
    restriction: 'Clear View',
    deliveryMethod: '',
    quantity: 1,
    splitType: 'Singles',
    note: '',
    ageBand: 'Adult',
    price: ''
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_BASE_URL}/seat-categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.map(c => c.name));
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  const restrictions = [
    'Clear View',
    'Restricted View'
  ];

  const deliveryMethods = [
    { value: "E-Ticket (PDF)", label: 'PDF Upload', icon: <FaFilePdf />, color: 'text-red-400' },
    { value: "Mobile Tickets", label: 'Mobile Link', icon: <FaMobileAlt />, color: 'text-green-400' },
    { value: "Image Ticket", label: 'Image Upload', icon: <FaImage />, color: 'text-yellow-400' },
    { value: "Physical Ticket – Post", label: 'Physical Ticket - Post', icon: <FaEnvelope />, color: 'text-blue-400' },
    { value: "Physical Ticket – Matchday Collection", label: 'Matchday Collection', icon: <FaMapMarkerAlt />, color: 'text-purple-400' }
  ];

  const splitTypes = ['Singles','Pairs','3 Seats Together','4 Seats Together','5 Seats Together','6 Seats Together'];
  const ageBands = ['Adult','Junior','Senior','Adult + Junior','Adult + Senior'];

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch matches from backend
  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch(`${API_BASE_URL}/matches`);
        if (!res.ok) throw new Error('Failed to fetch matches');
        const data = await res.json();
        setMatches(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMatches();
  }, []);

  // Handle match selection
  const handleMatchChange = async (e) => {
    const matchId = e.target.value;
    setSelectedMatch(matchId);
    
    if (matchId) {
      // Get match details to access venue sections
      const selectedMatch = matches.find(m => m._id === matchId);
      setSelectedMatchData(selectedMatch);
      
      // Extract section images from venue
      if (selectedMatch?.venue?.sections) {
        const images = {};
        selectedMatch.venue.sections.forEach(section => {
          images[section.name] = section.image;
        });
        setSectionImages(images);
      } else {
        setSectionImages({});
      }
    } else {
      setSelectedMatchData(null);
      setSectionImages({});
    }
    
    // Reset selected section image
    setSelectedSectionImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // When category changes, update the section image preview
    if (name === 'category' && value && sectionImages[value]) {
      setSelectedSectionImage(sectionImages[value]);
    } else if (name === 'category' && !value) {
      setSelectedSectionImage(null);
    }
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) return imagePath;
    
    const baseUrl = API_BASE_URL.replace('/api', '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${baseUrl}${cleanPath}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMatch) {
      alert('Please select a match first');
      return;
    }

    if (!formData.category || !formData.blockArea || !formData.price) {
      alert('Please fill in required fields: Category, Block/Area, and Price');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const submitData = {
        match: selectedMatch,
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      const res = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(submitData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }

      alert('Listing created successfully!');
      router.push('/seller/listings?created=true');
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get venue name safely
  const getVenueName = (match) => {
    if (!match) return 'Unknown Venue';
    
    if (typeof match.venue === 'object' && match.venue !== null) {
      return match.venue.name || 'Unknown Venue';
    }
    
    return match.venueName || match.venue || 'Unknown Venue';
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => router.push('/seller/listings')}
          className="flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-4 transition-colors"
        >
          <FaArrowLeft className="text-sm" />
          Back to Listings
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Listing</h1>
        <p className="text-blue-200 mt-1 sm:mt-2">Add a new ticket listing to the marketplace</p>
      </div>

      {/* Match Selection */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Select Match</h2>
        <select 
          value={selectedMatch} 
          onChange={handleMatchChange}
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
        >
          <option value="" className="text-gray-900">Select Match</option>
          {matches.map(m => (
            <option key={m._id} value={m._id} className="text-gray-900">
              {m.homeTeam} vs {m.awayTeam} - {new Date(m.date).toLocaleDateString()} - {getVenueName(m)}
            </option>
          ))}
        </select>
        
        {selectedMatchData && (
          <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-blue-200 text-sm">
                  Selected: <span className="text-white font-semibold">{selectedMatchData.homeTeam} vs {selectedMatchData.awayTeam}</span>
                </p>
                <p className="text-blue-300 text-xs mt-1 flex items-center gap-2">
                  {selectedMatchData.competitionImage ? (
                    <img 
                      src={getImageUrl(selectedMatchData.competitionImage)} 
                      alt={selectedMatchData.competition} 
                      className="w-4 h-4 object-contain"
                    />
                  ) : (
                    <FaTrophy className="text-blue-400" />
                  )}
                  {new Date(selectedMatchData.date).toLocaleDateString()} • {selectedMatchData.time}
                </p>
                <p className="text-blue-300 text-xs">
                  Venue: {getVenueName(selectedMatchData)}
                </p>
              </div>
              
              {/* Venue Sections Info */}
              {selectedMatchData.venue?.sections && selectedMatchData.venue.sections.length > 0 && (
                <div>
                  <p className="text-blue-300 text-xs flex items-center gap-1">
                    <FaCamera className="text-green-400" />
                    <span className="text-green-300">Stadium has {selectedMatchData.venue.sections.length} section images</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedMatchData.venue.sections.slice(0, 3).map((section, index) => (
                      <span key={index} className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs">
                        {section.name}
                      </span>
                    ))}
                    {selectedMatchData.venue.sections.length > 3 && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                        +{selectedMatchData.venue.sections.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Form */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Listing Details</h2>
        
        {/* Section Image Preview */}
        {selectedSectionImage && (
          <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-400/20">
            <div className="flex items-center gap-3 mb-3">
              <FaImage className="text-green-400" />
              <h3 className="text-white font-semibold">Stadium Section Preview</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative h-48 rounded-lg overflow-hidden border border-white/20">
                  <img 
                    src={getImageUrl(selectedSectionImage)} 
                    alt={formData.category}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-blue-200 text-sm mb-2">
                  <span className="font-semibold text-white">{formData.category}</span> - This is what buyers will see when viewing your tickets.
                </p>
                <p className="text-green-300 text-xs">
                  ✓ Section image automatically linked from venue
                </p>
                <p className="text-blue-300 text-xs mt-2">
                  Make sure your ticket location matches this stadium section for accurate representation.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Category *
                {sectionImages[formData.category] && (
                  <span className="ml-2 text-green-300 text-xs">(Has image)</span>
                )}
              </label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                required
              >
                <option value="" className="text-gray-900">Select Category</option>
                {categories
                  .filter(c => !selectedMatch || sectionImages[c]) // Filter: only show sections with admin-uploaded images if match selected
                  .map(c => (
                  <option key={c} value={c} className="text-gray-900">
                    {c} {sectionImages[c] ? '📷' : ''}
                  </option>
                ))}
              </select>
              {formData.category && !sectionImages[formData.category] && (
                <p className="text-yellow-300 text-xs mt-1">
                  ⚠️ No section image available for this category
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Block/Area *</label>
              <input 
                type="text" 
                name="blockArea" 
                value={formData.blockArea} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                placeholder="e.g., Block 123"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Restriction</label>
              <select 
                name="restriction" 
                value={formData.restriction} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
              >
                {restrictions.map(r => <option key={r} value={r} className="text-gray-900">{r}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Quantity</label>
              <input 
                type="number" 
                name="quantity" 
                value={formData.quantity} 
                onChange={handleInputChange}
                min={1}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Split Type</label>
              <select 
                name="splitType" 
                value={formData.splitType} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
              >
                {splitTypes.map(s => <option key={s} value={s} className="text-gray-900">{s}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Age Band</label>
              <select 
                name="ageBand" 
                value={formData.ageBand} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
              >
                {ageBands.map(a => <option key={a} value={a} className="text-gray-900">{a}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Delivery *</label>
              <select 
                name="deliveryMethod" 
                value={formData.deliveryMethod} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                required
              >
                <option value="" className="text-gray-900">Select Delivery</option>
                {deliveryMethods.map(d => <option key={d.value} value={d.value} className="text-gray-900">{d.label}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Price *</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleInputChange}
                min={1}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                placeholder="Points"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-blue-200 mb-2">Note (Optional)</label>
            <textarea 
              name="note" 
              value={formData.note} 
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
              rows="3"
              placeholder="Add any additional notes about the tickets..."
            />
          </div>

          {/* Summary Box */}
          <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
            <h3 className="text-white font-semibold mb-2">Listing Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="text-blue-200">
                <p><span className="text-blue-300">Match:</span> {selectedMatchData ? `${selectedMatchData.homeTeam} vs ${selectedMatchData.awayTeam}` : 'Not selected'}</p>
                <p><span className="text-blue-300">Category:</span> {formData.category || 'Not selected'}</p>
                <p><span className="text-blue-300">Section Image:</span> {selectedSectionImage ? '✓ Available' : '✗ Not available'}</p>
              </div>
              <div className="text-blue-200">
                <p><span className="text-blue-300">Quantity:</span> {formData.quantity} tickets</p>
                <p><span className="text-blue-300">Price:</span> {formData.price ? `${formData.price} points` : 'Not set'}</p>
                <p><span className="text-blue-300">Total:</span> {formData.price && formData.quantity ? `${formData.price * formData.quantity} points` : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FaCheck className="text-sm" /> 
                  Create Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}