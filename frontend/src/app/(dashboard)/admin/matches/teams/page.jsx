'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaBuilding, FaTrophy, FaFutbol, FaImage, FaTimes } from 'react-icons/fa';

export default function TeamsManagement() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ 
    name: '',
    logo: null 
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const fileInputRef = useRef(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/teams`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  // Get image URL function
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const baseUrl = API_BASE_URL.includes('/api') 
      ? API_BASE_URL.replace('/api', '') 
      : API_BASE_URL;
    return `${baseUrl}${imagePath}`;
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      if (!formData.name.trim()) {
        throw new Error('Team name is required');
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      
      // Append logo if selected
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      const url = editingTeam ? `${API_BASE_URL}/teams/${editingTeam._id}` : `${API_BASE_URL}/teams`;
      const method = editingTeam ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save team');

      // Reset form
      setFormData({ name: '', logo: null });
      setLogoPreview('');
      setEditingTeam(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      fetchTeams();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({ name: team.name, logo: null });
    setLogoPreview(team.logo ? getImageUrl(team.logo) : '');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) throw new Error('Failed to delete team');

      fetchTeams();
    } catch (error) {
      setError('Failed to delete team');
    }
  };

  const cancelEdit = () => {
    setEditingTeam(null);
    setFormData({ name: '', logo: null });
    setLogoPreview('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const TeamLogo = ({ team, className = "w-10 h-10" }) => {
    const logoUrl = team.logo ? getImageUrl(team.logo) : null;
    
    if (!logoUrl) {
      return (
        <div className={`${className} bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center border border-blue-400/30`}>
          <FaUsers className="text-white text-sm" />
        </div>
      );
    }

    return (
      <img 
        src={logoUrl} 
        alt={team.name}
        className={`${className} rounded-lg object-cover border border-white/20`}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading teams...</span>
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                <FaUsers className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Teams</h1>
                <p className="text-blue-200 mt-1">Add and manage football teams with logos</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{teams.length}</div>
              <div className="text-blue-200 text-sm">Total Teams</div>
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
          active={true}
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
          {editingTeam ? 'Edit Team' : 'Add New Team'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Team Name */}
          <div>
            <label className="text-sm font-medium text-blue-200 mb-2 block">
              Team Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
              placeholder="e.g., Manchester United"
            />
          </div>

          {/* Team Logo Upload */}
          <div>
            <label className="text-sm font-medium text-blue-200 mb-2 block">
              Team Logo (Optional)
            </label>
            
            <div className="space-y-4">
              {/* File Input */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
                />
              </div>
              
              {/* Logo Preview */}
              {(logoPreview || (editingTeam && editingTeam.logo)) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-blue-200">Logo Preview:</p>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                    >
                      <FaTimes className="text-xs" />
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20">
                      <img 
                        src={logoPreview || getImageUrl(editingTeam?.logo)} 
                        alt="Team logo preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-blue-300 text-sm">
                      <p className="font-medium">{formData.name || editingTeam?.name}</p>
                      <p className="text-blue-400 text-xs mt-1">Square images work best</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3 mt-4">
                <p className="text-blue-300 text-xs flex items-start gap-2">
                  <FaImage className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>
                    Upload a square logo (recommended: 500×500px). Supported formats: JPG, PNG, WebP (max 2MB).
                    {editingTeam && editingTeam.logo && !formData.logo && ' Current logo will be kept.'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {formLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {editingTeam ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <FaPlus className="text-sm" />
                  {editingTeam ? 'Update Team' : 'Add Team'}
                </>
              )}
            </button>
            
            {editingTeam && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Teams List */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">All Teams ({teams.length})</h2>
        
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
              <FaUsers className="text-2xl text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No teams found</h3>
            <p className="text-blue-200">Add your first team to get started.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {teams.map((team) => (
              <div
                key={team._id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <TeamLogo team={team} className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{team.name}</h3>
                    <div className="flex items-center gap-3 text-blue-200 text-sm mt-1">
                      <span>
                        Created {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                      {team.logo && (
                        <span className="bg-blue-500/20 px-2 py-0.5 rounded-full text-xs border border-blue-400/30">
                          Has Logo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(team)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-70"
                    title="Edit team"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(team._id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-70"
                    title="Delete team"
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