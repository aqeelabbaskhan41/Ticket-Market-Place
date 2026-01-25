'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTrophy, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaUsers, FaBuilding, FaFutbol } from 'react-icons/fa';

export default function CompetitionsManagement() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/competitions`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      setCompetitions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      setError('Failed to load competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      if (!formData.name.trim()) {
        throw new Error('Competition name is required');
      }

      let imageUrl = formData.image;

      // Upload image if selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const uploadRes = await fetch(`${API_BASE_URL}/competitions/upload`, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: imageFormData,
        });

        if (!uploadRes.ok) throw new Error('Failed to upload image');
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      }

      const url = editingCompetition ? `${API_BASE_URL}/competitions/${editingCompetition._id}` : `${API_BASE_URL}/competitions`;
      const method = editingCompetition ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ 
          name: formData.name.trim(),
          image: imageUrl
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save competition');

      setFormData({ name: '', image: '' });
      setImageFile(null);
      setImagePreview('');
      setEditingCompetition(null);
      fetchCompetitions();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (competition) => {
    setEditingCompetition(competition);
    setFormData({ name: competition.name, image: competition.image || '' });
    setImagePreview(competition.image ? getImageUrl(competition.image) : '');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  const handleDelete = async (competitionId) => {
    if (!confirm('Are you sure you want to delete this competition?')) return;

    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_BASE_URL}/competitions/${competitionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) throw new Error('Failed to delete competition');

      fetchCompetitions();
    } catch (error) {
      setError('Failed to delete competition');
    }
  };

  const cancelEdit = () => {
    setEditingCompetition(null);
    setFormData({ name: '', image: '' });
    setImageFile(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading competitions...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/admin/matches"
          className="inline-flex items-center text-blue-200 hover:text-white font-medium mb-4 transition-colors duration-200 group"
        >
          <FaArrowLeft className="mr-2 text-blue-300 group-hover:text-white transition-colors" />
          Back to Matches
        </Link>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                <FaTrophy className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Competitions</h1>
                <p className="text-blue-200 mt-1">Add and manage tournaments & competitions</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{competitions.length}</div>
              <div className="text-blue-200 text-sm">Total Competitions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Management Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <ManagementCard
          href="/admin/matches/teams"
          icon={<FaUsers className="text-2xl text-blue-400" />}
          title="Manage Teams"
          description="Add and manage teams"
        />
        <ManagementCard
          href="/admin/matches/venues"
          icon={<FaBuilding className="text-2xl text-green-400" />}
          title="Manage Venues"
          description="Add and manage venues"
        />
        <ManagementCard
          href="/admin/matches/competitions"
          icon={<FaTrophy className="text-2xl text-purple-400" />}
          title="Manage Competitions"
          description="Add and manage competitions"
          active={true}
        />
        <ManagementCard
          href="/admin/matches"
          icon={<FaFutbol className="text-2xl text-yellow-400" />}
          title="Manage Matches"
          description="View all matches"
        />
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6 sm:mb-8">
        <h2 className="text-xl font-bold text-white mb-4">
          {editingCompetition ? 'Edit Competition' : 'Add New Competition'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-blue-200 mb-2 block">
              Competition Name
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                required
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                placeholder="e.g., Premier League 2024"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-blue-200 mb-2 block">
              Competition Image/Icon
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FaTrophy className="text-blue-300 text-xl" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-blue-200
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-500/20 file:text-blue-300
                  hover:file:bg-blue-600/20"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={formLoading}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-purple-400 disabled:to-purple-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {formLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FaPlus className="text-sm" />
              )}
              {editingCompetition ? 'Update' : 'Add'} Competition
            </button>
            {editingCompetition && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Competitions List */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">All Competitions ({competitions.length})</h2>
        
        {competitions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-400/30">
              <FaTrophy className="text-2xl text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No competitions found</h3>
            <p className="text-blue-200">Add your first competition to get started.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {competitions.map((competition) => (
              <div
                key={competition._id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3 border border-purple-400/30 overflow-hidden">
                    {competition.image ? (
                      <img src={getImageUrl(competition.image)} alt={competition.name} className="w-full h-full object-cover" />
                    ) : (
                      <FaTrophy className="text-purple-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{competition.name}</h3>
                    <p className="text-blue-200 text-sm">
                      Created {new Date(competition.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(competition)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                    title="Edit competition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(competition._id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    title="Delete competition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ManagementCard({ href, icon, title, description, active = false }) {
  return (
    <Link
      href={href}
      className={`block backdrop-blur-xl rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl ${
        active 
          ? 'bg-white/15 border-white/30' 
          : 'bg-white/10 border-white/20 hover:bg-white/15'
      }`}
    >
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 border ${
          active ? 'bg-white/20 border-white/30' : 'bg-white/10 border-white/20'
        }`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-blue-200 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );
}