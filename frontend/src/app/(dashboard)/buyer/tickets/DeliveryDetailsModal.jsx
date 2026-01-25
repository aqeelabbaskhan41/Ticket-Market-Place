'use client';

import { FaTimes, FaCopy, FaExternalLinkAlt, FaMapMarkerAlt, FaTruck, FaMobileAlt, FaUserLock } from 'react-icons/fa';

export default function DeliveryDetailsModal({ isOpen, onClose, ticket }) {
  if (!isOpen || !ticket || !ticket.deliveryDetails) return null;

  const { type, mobileLinks, appLogin, postal, collection } = ticket.deliveryDetails;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const renderContent = () => {
    switch (type) {
      case 'Mobile Tickets':
        return (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <FaMobileAlt className="text-3xl text-blue-400 mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">Mobile Ticket Links</h4>
              <p className="text-blue-200 text-sm mb-4">
                Click the links below to access your tickets on your mobile device.
              </p>
              
              <div className="space-y-3">
                {mobileLinks.general && (
                  <a 
                    href={mobileLinks.general} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Open Ticket Link
                  </a>
                )}
                {mobileLinks.ios && (
                  <a 
                    href={mobileLinks.ios} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-gray-800 hover:bg-gray-700 text-white text-center py-2.5 rounded-lg font-medium transition-colors border border-gray-600"
                  >
                    Open iOS Ticket
                  </a>
                )}
                {mobileLinks.android && (
                  <a 
                    href={mobileLinks.android} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 hover:bg-green-500 text-white text-center py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Open Android Ticket
                  </a>
                )}
              </div>
            </div>
          </div>
        );

      case 'Official App Login':
        return (
          <div className="space-y-4">
             <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <FaUserLock className="text-3xl text-purple-400 mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">App Login Credentials</h4>
              <p className="text-blue-200 text-sm mb-4">
                Use these details to log in to the official ticketing app.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-blue-300 uppercase font-semibold">Username / Email</label>
                  <div className="flex bg-black/30 rounded-lg border border-white/10 mt-1">
                    <input 
                      readOnly 
                      value={appLogin.username} 
                      className="bg-transparent flex-1 px-3 py-2 text-white outline-none"
                    />
                    <button 
                      onClick={() => copyToClipboard(appLogin.username)}
                      className="px-3 text-blue-400 hover:text-white transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-blue-300 uppercase font-semibold">Password</label>
                  <div className="flex bg-black/30 rounded-lg border border-white/10 mt-1">
                    <input 
                      readOnly 
                      value={appLogin.password} 
                      type="text"
                      className="bg-transparent flex-1 px-3 py-2 text-white outline-none"
                    />
                    <button 
                      onClick={() => copyToClipboard(appLogin.password)}
                      className="px-3 text-blue-400 hover:text-white transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                {appLogin.notes && (
                  <div>
                    <label className="text-xs text-blue-300 uppercase font-semibold">Notes</label>
                    <p className="text-white bg-black/30 p-3 rounded-lg border border-white/10 mt-1 text-sm">
                      {appLogin.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'Physical Ticket – Post':
        return (
          <div className="space-y-4">
             <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <FaTruck className="text-3xl text-orange-400 mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">Delivery Tracking</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-blue-200">Courier</span>
                  <span className="text-white font-medium">{postal.courier}</span>
                </div>
                <div>
                  <label className="text-xs text-blue-300 uppercase font-semibold">Tracking Number</label>
                  <div className="flex bg-black/30 rounded-lg border border-white/10 mt-1">
                    <input 
                      readOnly 
                      value={postal.trackingNumber} 
                      className="bg-transparent flex-1 px-3 py-2 text-white outline-none"
                    />
                    <button 
                      onClick={() => copyToClipboard(postal.trackingNumber)}
                      className="px-3 text-blue-400 hover:text-white transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Physical Ticket – Matchday Collection':
        return (
          <div className="space-y-4">
             <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <FaMapMarkerAlt className="text-3xl text-green-400 mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">Collection Details</h4>
              
              <div className="space-y-3">
                 <div>
                    <label className="text-xs text-blue-300 uppercase font-semibold">Location</label>
                    <p className="text-white text-lg">{collection.location}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-blue-300 uppercase font-semibold">Contact Person</label>
                      <p className="text-white">{collection.contactName}</p>
                    </div>
                    <div>
                      <label className="text-xs text-blue-300 uppercase font-semibold">Phone</label>
                      <p className="text-white">{collection.contactPhone}</p>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs text-blue-300 uppercase font-semibold">Collection Time / Instructions</label>
                    <p className="text-white bg-black/30 p-3 rounded-lg border border-white/10 mt-1 text-sm">
                      {collection.time}
                    </p>
                 </div>
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-white">Detailed delivery information is not available.</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-xl font-bold text-white">Access Your Tickets</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
           {renderContent()}
        </div>
      </div>
    </div>
  );
}
