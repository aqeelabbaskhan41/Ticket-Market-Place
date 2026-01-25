'use client';

import { useState } from 'react';
import { FaTimes, FaCloudUploadAlt, FaMobileAlt, FaTicketAlt, FaTruck, FaMapMarkerAlt } from 'react-icons/fa';

export default function DeliveryModal({ isOpen, onClose, ticket, onDeliver }) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  
  // Mobile Link State
  const [mobileLinks, setMobileLinks] = useState({
    type: 'general', // general or split
    general: '',
    ios: '',
    android: ''
  });

  // App Login State
  const [appLogin, setAppLogin] = useState({
    username: '',
    password: '',
    notes: ''
  });

  // Postal State
  const [postal, setPostal] = useState({
    trackingNumber: '',
    courierName: ''
  });

  // Collection State
  const [collection, setCollection] = useState({
    contactPerson: '',
    contactPhone: '',
    collectionLocation: '',
    collectionTime: ''
  });

  if (!isOpen || !ticket) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('deliveryMethod', ticket.deliveryMethod || 'E-Ticket (PDF)');

    if (ticket.deliveryMethod === 'E-Ticket (PDF)' || ticket.deliveryMethod === 'Image Ticket' || !ticket.deliveryMethod) { // Default to PDF if not specified
      files.forEach(file => {
        formData.append('files', file);
      });
    } else if (ticket.deliveryMethod === 'Mobile Tickets') {
      if (mobileLinks.type === 'general') {
        formData.append('generalLink', mobileLinks.general);
      } else {
        formData.append('iosLink', mobileLinks.ios);
        formData.append('androidLink', mobileLinks.android);
      }
    } else if (ticket.deliveryMethod === 'Official App Login') {
      formData.append('appUsername', appLogin.username);
      formData.append('appPassword', appLogin.password);
      formData.append('appNotes', appLogin.notes);
    } else if (ticket.deliveryMethod === 'Physical Ticket – Post') {
      formData.append('trackingNumber', postal.trackingNumber);
      formData.append('courierName', postal.courierName);
    } else if (ticket.deliveryMethod === 'Physical Ticket – Matchday Collection') {
      formData.append('contactPerson', collection.contactPerson);
      formData.append('contactPhone', collection.contactPhone);
      formData.append('collectionLocation', collection.collectionLocation);
      formData.append('collectionTime', collection.collectionTime);
    }

    try {
      await onDeliver(ticket._id, formData);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit delivery');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    const method = ticket.deliveryMethod || 'E-Ticket (PDF)';

    switch (method) {
      case 'E-Ticket (PDF)':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-blue-400/50 transition-colors">
              <FaCloudUploadAlt className="mx-auto text-4xl text-blue-400 mb-3" />
              <p className="text-white mb-2">Click or drag PDF tickets here</p>
              <p className="text-blue-200 text-sm mb-4">Maximum size 10MB per file</p>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="text-sm text-blue-200
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-500/20 file:text-blue-300
                  hover:file:bg-blue-600/20"
              />
            </div>
            {files.length > 0 && (
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-white mb-2">Selected files:</p>
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm text-blue-200 flex items-center gap-2">
                       {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      
      case 'Image Ticket':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-blue-400/50 transition-colors">
              <FaCloudUploadAlt className="mx-auto text-4xl text-blue-400 mb-3" />
              <p className="text-white mb-2">Click or drag Ticket Images here</p>
              <p className="text-blue-200 text-sm mb-4">PNG, JPG, JPEG allowed (Max 10MB)</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="text-sm text-blue-200
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-500/20 file:text-blue-300
                  hover:file:bg-blue-600/20"
              />
            </div>
            {files.length > 0 && (
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-white mb-2">Selected images:</p>
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm text-blue-200 flex items-center gap-2">
                       {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'Mobile Tickets':
        return (
          <div className="space-y-4">
            <div className="flex bg-white/5 p-1 rounded-lg mb-4">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mobileLinks.type === 'general' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:text-white'
                }`}
                onClick={() => setMobileLinks({ ...mobileLinks, type: 'general' })}
              >
                Single Link
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mobileLinks.type === 'split' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:text-white'
                }`}
                onClick={() => setMobileLinks({ ...mobileLinks, type: 'split' })}
              >
                Separate Links (iOS/Android)
              </button>
            </div>

            {mobileLinks.type === 'general' ? (
              <div>
                <label className="block text-sm text-blue-200 mb-1">Ticket URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={mobileLinks.general}
                  onChange={(e) => setMobileLinks({ ...mobileLinks, general: e.target.value })}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-blue-200 mb-1">iOS Link</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={mobileLinks.ios}
                    onChange={(e) => setMobileLinks({ ...mobileLinks, ios: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-blue-200 mb-1">Android Link</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={mobileLinks.android}
                    onChange={(e) => setMobileLinks({ ...mobileLinks, android: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'Official App Login':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-200 mb-1">Username/Email</label>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={appLogin.username}
                onChange={(e) => setAppLogin({ ...appLogin, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1">Password</label>
              <input
                type="text" // Visible text for clarity in sharing credentials
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={appLogin.password}
                onChange={(e) => setAppLogin({ ...appLogin, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1">Notes (Optional)</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows="3"
                value={appLogin.notes}
                onChange={(e) => setAppLogin({ ...appLogin, notes: e.target.value })}
              />
            </div>
          </div>
        );

      case 'Physical Ticket – Post':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-200 mb-1">Courier Company</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Mail, DHL"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={postal.courierName}
                onChange={(e) => setPostal({ ...postal, courierName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1">Tracking Number</label>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={postal.trackingNumber}
                onChange={(e) => setPostal({ ...postal, trackingNumber: e.target.value })}
              />
            </div>
          </div>
        );

      case 'Physical Ticket – Matchday Collection':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-200 mb-1">Collection Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Ticket Office at Stadium"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={collection.collectionLocation}
                onChange={(e) => setCollection({ ...collection, collectionLocation: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-blue-200 mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={collection.contactPerson}
                  onChange={(e) => setCollection({ ...collection, contactPerson: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-blue-200 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={collection.contactPhone}
                  onChange={(e) => setCollection({ ...collection, contactPhone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1">Collection Time/Instructions</label>
              <textarea
                required
                placeholder="e.g. 2 hours before kickoff"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows="3"
                value={collection.collectionTime}
                onChange={(e) => setCollection({ ...collection, collectionTime: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return <p className="text-white">Unsupported delivery method</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-xl font-bold text-white">Deliver Tickets</h3>
            <p className="text-blue-200 text-sm mt-1">{ticket.match}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider block mb-1">Method</span>
              <span className="text-lg text-white font-medium">{ticket.deliveryMethod || 'E-Ticket (PDF)'}</span>
            </div>
            
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                'Submit Delivery'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
