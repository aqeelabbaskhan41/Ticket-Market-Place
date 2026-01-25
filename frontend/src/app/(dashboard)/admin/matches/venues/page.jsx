'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaBuilding, FaPlus, FaEdit, FaTrash, FaArrowLeft, 
  FaUsers, FaTrophy, FaFutbol, FaImage, FaTimes, 
  FaUpload, FaCamera, FaCheck, FaEye
} from 'react-icons/fa';

export default function VenuesManagement() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ 
    name: '',
    sections: [] // Initialize with empty sections array
  });
  const [formLoading, setFormLoading] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    name: '',
    image: '',
    description: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Seat Categories State
  const [seatCategories, setSeatCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    fetchVenues();
    fetchSeatCategories();
  }, []);

  const fetchSeatCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/seat-categories`);
      if (res.ok) {
        const data = await res.json();
        setSeatCategories(data);
      }
    } catch (error) {
      console.error('Error fetching seat categories:', error);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    setCategoryLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE_URL}/seat-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(categoryForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add category');

      setCategoryForm({ name: '' });
      fetchSeatCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setCategoryLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Are you sure? This will remove the category from the options list.')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/seat-categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) throw new Error('Failed to delete category');
      fetchSeatCategories();
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const fetchVenues = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/venues`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      setVenues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setError('Failed to load venues');
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
        throw new Error('Venue name is required');
      }

      const url = editingVenue ? `${API_BASE_URL}/venues/${editingVenue._id}` : `${API_BASE_URL}/venues`;
      const method = editingVenue ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save venue');

      setFormData({ name: '', sections: [] });
      setEditingVenue(null);
      fetchVenues();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setFormData({ 
      name: venue.name, 
      sections: venue.sections || [] 
    });
  };

  const handleDelete = async (venueId) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_BASE_URL}/venues/${venueId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) throw new Error('Failed to delete venue');

      fetchVenues();
    } catch (error) {
      setError('Failed to delete venue');
    }
  };

  const cancelEdit = () => {
    setEditingVenue(null);
    setFormData({ name: '', sections: [] });
  };

  // Section Management Functions
  const openAddSectionModal = (venue) => {
    setSelectedVenue(venue);
    setSectionForm({
      name: '',
      image: '',
      description: ''
    });
    setShowSectionModal(true);
  };

  const openEditSectionModal = (venue, section) => {
    setSelectedVenue(venue);
    setSectionForm({
      name: section.name,
      image: section.image,
      description: section.description || ''
    });
    setShowSectionModal(true);
  };

  const closeSectionModal = () => {
    setShowSectionModal(false);
    setSelectedVenue(null);
    setSectionForm({
      name: '',
      image: '',
      description: ''
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE_URL}/venues/upload-section-image`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to upload image');

      setSectionForm(prev => ({
        ...prev,
        image: data.imageUrl
      }));
    } catch (err) {
      setError('Failed to upload image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const saveSection = async () => {
    if (!selectedVenue) return;

    if (!sectionForm.name || !sectionForm.image) {
      setError('Section name and image are required');
      return;
    }

    setFormLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE_URL}/venues/${selectedVenue._id}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(sectionForm),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save section');

      // Update local state
      const updatedVenues = venues.map(venue => {
        if (venue._id === selectedVenue._id) {
          return data.venue;
        }
        return venue;
      });
      setVenues(updatedVenues);

      // If editing current venue, update form data
      if (editingVenue && editingVenue._id === selectedVenue._id) {
        setFormData(prev => ({
          ...prev,
          sections: data.venue.sections || []
        }));
      }

      closeSectionModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const deleteSection = async (venueId, sectionName) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE_URL}/venues/${venueId}/sections/${sectionName}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) throw new Error('Failed to delete section');

      // Update local state
      const updatedVenues = venues.map(venue => {
        if (venue._id === venueId) {
          const updatedSections = venue.sections.filter(s => s.name !== sectionName);
          return { ...venue, sections: updatedSections };
        }
        return venue;
      });
      setVenues(updatedVenues);

      // If editing current venue, update form data
      if (editingVenue && editingVenue._id === venueId) {
        setFormData(prev => ({
          ...prev,
          sections: prev.sections.filter(s => s.name !== sectionName)
        }));
      }
    } catch (error) {
      setError('Failed to delete section');
    }
  };

  const viewVenueSections = (venue) => {
    setSelectedVenue(venue);
    // You could implement a modal to view all sections
    alert(`Viewing sections for ${venue.name}\nTotal sections: ${venue.sections?.length || 0}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading venues...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                <FaBuilding className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Venues</h1>
                <p className="text-blue-200 mt-1">Add and manage stadiums & venues with section images</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
               <button
                  onClick={() => setShowCategoryModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <FaPlus size={12} /> Manage Categories
               </button>
              <div>
                <div className="text-2xl font-bold text-white">{venues.length}</div>
                <div className="text-blue-200 text-sm">Total Venues</div>
              </div>
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
          active={true}
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
          {editingVenue ? 'Edit Venue' : 'Add New Venue'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-blue-200 mb-2 block">
              Venue Name *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                placeholder="e.g., Old Trafford Stadium"
              />
              <button
                type="submit"
                disabled={formLoading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {formLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FaPlus className="text-sm" />
                )}
                {editingVenue ? 'Update' : 'Add'} Venue
              </button>
              {editingVenue && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Sections Management (only when editing) */}
          {editingVenue && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Stadium Sections</h3>
                <button
                  type="button"
                  onClick={() => openAddSectionModal(editingVenue)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm"
                >
                  <FaPlus className="text-xs" /> Add Section
                </button>
              </div>

              {formData.sections && formData.sections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.sections.map((section, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-blue-400/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                              {section.name}
                            </span>
                            {section.description && (
                              <span className="text-blue-200 text-xs">{section.description}</span>
                            )}
                          </div>
                          {section.image && (
                            <div className="mb-2">
                              <div className="text-blue-200 text-xs mb-1">Preview:</div>
                              <div className="relative w-16 h-16 rounded overflow-hidden border border-white/20">
                                <img 
                                  src={`${API_BASE_URL.replace('/api', '')}${section.image}`} 
                                  alt={section.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '/placeholder-image.jpg';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button
                            type="button"
                            onClick={() => openEditSectionModal(editingVenue, section)}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors"
                            title="Edit section"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSection(editingVenue._id, section.name)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                            title="Delete section"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-white/5 rounded-lg border border-white/10">
                  <FaImage className="text-3xl text-blue-300 mx-auto mb-3" />
                  <p className="text-blue-200 mb-2">No sections added yet</p>
                  <p className="text-blue-300 text-sm">Add sections to help sellers and buyers visualize stadium areas</p>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Venues List */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">All Venues ({venues.length})</h2>
        
        {venues.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-400/30">
              <FaBuilding className="text-2xl text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No venues found</h3>
            <p className="text-blue-200">Add your first venue to get started.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {venues.map((venue) => (
              <div
                key={venue._id}
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 border border-green-400/30">
                      <FaBuilding className="text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{venue.name}</h3>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                          {venue.sections?.length || 0} sections
                        </span>
                      </div>
                      <p className="text-blue-200 text-sm mb-3">
                        Created {new Date(venue.createdAt).toLocaleDateString()}
                      </p>
                      
                      {/* Sections Preview */}
                      {venue.sections && venue.sections.length > 0 && (
                        <div className="mt-3">
                          <p className="text-blue-200 text-xs font-medium mb-2">Sections:</p>
                          <div className="flex flex-wrap gap-2">
                            {venue.sections.slice(0, 3).map((section, index) => (
                              <div key={index} className="flex items-center gap-1 bg-white/5 rounded px-2 py-1">
                                <span className="text-blue-300 text-xs">{section.name}</span>
                                {section.image && (
                                  <div className="w-4 h-4 rounded overflow-hidden">
                                    <img 
                                      src={`${API_BASE_URL.replace('/api', '')}${section.image}`} 
                                      alt={section.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = '/placeholder-image.jpg';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                            {venue.sections.length > 3 && (
                              <span className="text-blue-300 text-xs px-2 py-1 bg-white/5 rounded">
                                +{venue.sections.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(venue)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                        title="Edit venue"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteSection(venue._id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                        title="Delete venue"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAddSectionModal(venue)}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all duration-200 text-xs"
                        title="Add section"
                      >
                        <FaPlus size={12} /> Section
                      </button>
                      {venue.sections && venue.sections.length > 0 && (
                        <button
                          onClick={() => viewVenueSections(venue)}
                          className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition-all duration-200 text-xs"
                          title="View sections"
                        >
                          <FaEye size={12} /> View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Modal */}
      {showSectionModal && selectedVenue && (
        <SectionModal
          venue={selectedVenue}
          sectionForm={sectionForm}
          setSectionForm={setSectionForm}
          uploadingImage={uploadingImage}
          handleImageUpload={handleImageUpload}
          saveSection={saveSection}
          closeSectionModal={closeSectionModal}
          sectionCategories={seatCategories.map(c => c.name)}
          formLoading={formLoading}
          error={error}
        />
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full animate-in fade-in-90 zoom-in-90 p-6">
            <div className="flex items-center justify-between mb-6 border-b border-white/20 pb-4">
              <h3 className="text-xl font-bold text-white">Manage Seat Categories</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={addCategory} className="flex gap-2 mb-6">
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="New Category Name"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={categoryLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                {categoryLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <FaPlus />}
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {seatCategories.map(category => (
                <div key={category._id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10">
                  <span className="text-white">{category.name}</span>
                  <button
                    onClick={() => deleteCategory(category._id)}
                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}
              {seatCategories.length === 0 && (
                <p className="text-blue-200 text-center py-4">No categories found.</p>
              )}
            </div>
          </div>
        </div>
      )}
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

function SectionModal({ 
  venue, 
  sectionForm, 
  setSectionForm, 
  uploadingImage, 
  handleImageUpload, 
  saveSection, 
  closeSectionModal,
  sectionCategories,
  formLoading,
  error
}) {
  const getImagePreview = () => {
    if (!sectionForm.image) return null;
    
    // Check if it's a full URL or just a path
    if (sectionForm.image.startsWith('http') || sectionForm.image.startsWith('/')) {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = sectionForm.image.startsWith('http') 
        ? sectionForm.image 
        : `${API_BASE_URL.replace('/api', '')}${sectionForm.image}`;
      
      return fullUrl;
    }
    return null;
  };

  const imagePreview = getImagePreview();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full animate-in fade-in-90 zoom-in-90">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h3 className="text-xl font-bold text-white">
            {sectionForm.name ? 'Edit Section' : 'Add New Section'} - {venue.name}
          </h3>
          <button
            onClick={closeSectionModal}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Section Name */}
            <div>
              <label className="text-sm font-medium text-blue-200 mb-2 block">
                Section Category *
              </label>
              <select
                value={sectionForm.name}
                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
              >
                <option value="" className="text-gray-900">Select Section Category</option>
                {sectionCategories.map(category => (
                  <option key={category} value={category} className="text-gray-900">
                    {category}
                  </option>
                ))}
              </select>
              <p className="text-blue-300 text-xs mt-1">
                This should match ticket categories
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-blue-200 mb-2 block">
                Section Image *
              </label>
              
              {imagePreview ? (
                <div className="mb-3">
                  <p className="text-blue-300 text-xs mb-2">Preview:</p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/20">
                    <img 
                      src={imagePreview} 
                      alt="Section preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setSectionForm({ ...sectionForm, image: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-blue-400/50 transition-colors">
                  <FaCamera className="text-3xl text-blue-300 mx-auto mb-3" />
                  <p className="text-blue-200 mb-2">Upload stadium section image</p>
                  <p className="text-blue-300 text-xs mb-4">
                    Upload a clear image of this stadium section (e.g., Longside view)
                  </p>
                  <label className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200">
                    <FaUpload className="inline mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  {uploadingImage && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      <span className="text-blue-300 text-sm">Uploading image...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-blue-200 mb-2 block">
                Description (Optional)
              </label>
              <textarea
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                placeholder="Brief description of this stadium section..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-white/20">
            <button
              onClick={closeSectionModal}
              className="flex-1 py-2.5 px-4 bg-gray-600/50 hover:bg-gray-600/70 text-gray-200 rounded-lg font-medium transition-all duration-200 border border-gray-500/30"
            >
              Cancel
            </button>
            <button
              onClick={saveSection}
              disabled={formLoading || !sectionForm.name || !sectionForm.image}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaCheck size={16} />
                  Save Section
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}