'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaTicketAlt, 
  FaMapMarkerAlt, 
  FaCalendar, 
  FaDownload, 
  FaMobileAlt, 
  FaKey, 
  FaTruck, 
  FaUser, 
  FaExclamationTriangle,
  FaShieldAlt,
  FaCopy,
  FaEye
} from 'react-icons/fa';

export default function TicketDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = API_BASE_URL.replace('/api', '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      // Using the existing endpoint for single ticket
      const response = await fetch(`${API_BASE_URL}/tickets/buyer/purchased/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTicket(data.ticket);
      } else {
        setError('Failed to load ticket details');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (index) => {
    // For direct PDF download
    const downloadUrl = `${API_BASE_URL}/delivery/download/${ticket._id}/${index}`;
    window.open(downloadUrl, '_blank');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div></div>;
  if (error || !ticket) return <div className="text-center mt-20 text-red-400">{error || 'Ticket not found'}</div>;

  // Render Delivery Content based on Method
  const renderDeliveryContent = () => {
    if (ticket.status !== 'delivered') {
      return (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center">
          <FaTruck className="text-4xl text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Delivery Pending</h3>
          <p className="text-blue-200">The seller has not delivered your tickets yet. You will be notified once they are permitted to upload/transfer the tickets.</p>
          <div className="mt-4 text-sm text-yellow-200/70">
            Expected by: 24-48 hours before match
          </div>
        </div>
      );
    }

    const { deliveryMethod, deliveryDetails } = ticket;

    if (!deliveryDetails) return <div className="text-red-400">Delivery details missing.</div>;

    switch (deliveryMethod) {
      case 'E-Ticket (PDF)':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaDownload className="text-green-400" /> Download Tickets
            </h3>
            {deliveryDetails.filePaths?.map((path, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400">
                    PDF
                  </div>
                  <div>
                    <p className="text-white font-medium">Ticket File {index + 1}</p>
                    <p className="text-xs text-blue-300">Ready to print</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownload(index)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <FaDownload /> Download
                </button>
              </div>
            ))}
          </div>
        );

      case 'Mobile Tickets':
        return (
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaMobileAlt className="text-blue-400" /> Mobile Transfer Links
            </h3>
            <p className="text-sm text-blue-200 mb-4">Click the links below to accept the ticket transfer on your mobile device.</p>
            
            {deliveryDetails.mobileLinks?.general && (
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-xs text-blue-300 mb-1">Ticket Link</p>
                <div className="flex gap-2">
                  <input readOnly value={deliveryDetails.mobileLinks.general} className="bg-black/20 text-white text-sm flex-1 px-3 py-2 rounded border border-white/5" />
                  <a href={deliveryDetails.mobileLinks.general} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center">Open</a>
                </div>
              </div>
            )}
             {/* Handle iOS/Android specific links similarly if needed */}
          </div>
        );

      case 'Official App Login':
        return (
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaKey className="text-yellow-400" /> App Credentials
            </h3>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-4">
              <div>
                <p className="text-xs text-blue-300 mb-1">Username/Email</p>
                <div className="flex gap-2">
                   <span className="text-white font-mono bg-black/20 px-3 py-2 rounded flex-1">{deliveryDetails.appLogin?.username}</span>
                   <button onClick={() => copyToClipboard(deliveryDetails.appLogin?.username)} className="text-blue-400 hover:text-white"><FaCopy /></button>
                </div>
              </div>
              <div>
                <p className="text-xs text-blue-300 mb-1">Password</p>
                <div className="flex gap-2 items-center">
                   <span className="text-white font-mono bg-black/20 px-3 py-2 rounded flex-1">
                     {showPassword ? deliveryDetails.appLogin?.password : '••••••••••••'}
                   </span>
                   <button onClick={() => setShowPassword(!showPassword)} className="text-xs text-blue-400 hover:text-white underline">
                     {showPassword ? 'Hide' : 'Show'}
                   </button>
                   <button onClick={() => copyToClipboard(deliveryDetails.appLogin?.password)} className="text-blue-400 hover:text-white"><FaCopy /></button>
                </div>
              </div>
              {deliveryDetails.appLogin?.notes && (
                 <div>
                   <p className="text-xs text-blue-300 mb-1">Seller Notes</p>
                   <p className="text-white text-sm">{deliveryDetails.appLogin.notes}</p>
                 </div>
              )}
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex gap-3 text-sm text-yellow-200">
               <FaExclamationTriangle className="mt-0.5 flex-shrink-0" /> 
               <p>Please change the password immediately after accessing the account.</p>
            </div>
          </div>
        );
        
      case 'Physical Ticket – Post':
          return (
             <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaTruck className="text-purple-400" /> Shipping Info
                </h3>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <p className="text-xs text-blue-300">Courier</p>
                         <p className="text-white font-medium">{deliveryDetails.postal?.courier}</p>
                      </div>
                      <div>
                         <p className="text-xs text-blue-300">Tracking Number</p>
                         <p className="text-white font-medium font-mono">{deliveryDetails.postal?.trackingNumber}</p>
                      </div>
                   </div>
                </div>
             </div>
          );

      case 'Image Ticket':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaDownload className="text-green-400" /> View/Save Ticket Images
            </h3>
            <p className="text-sm text-blue-200 mb-4">Click the images below to open them in full size.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {deliveryDetails.filePaths?.map((path, index) => (
                <div key={index} className="space-y-2">
                  <div className="aspect-video bg-white/5 rounded-lg border border-white/10 overflow-hidden group relative">
                    <img 
                      src={getImageUrl(path)} 
                      alt={`Ticket ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <a 
                        href={getImageUrl(path)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 rounded-full text-white"
                       >
                         <FaEye />
                       </a>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.open(getImageUrl(path), '_blank')}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs transition-colors border border-white/10 flex items-center justify-center gap-2"
                  >
                    <FaDownload className="text-blue-400" /> Save Image {index + 1}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <p className="text-white">Contact support for delivery properties.</p>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <button onClick={() => router.push('/buyer/tickets')} className="flex items-center text-blue-400 hover:text-white transition-colors mb-4">
        <FaArrowLeft className="mr-2" /> Back to My Tickets
      </button>

      {/* Header Info */}
      <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-4">
            {ticket.competitionImage && (
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/20 shadow-lg mt-1">
                <img 
                  src={getImageUrl(ticket.competitionImage)} 
                  alt="Competition" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{ticket.match}</h1>
              <div className="flex flex-wrap gap-4 text-blue-200">
                <span className="flex items-center gap-2"><FaCalendar /> {new Date(ticket.matchDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-2"><FaMapMarkerAlt /> {ticket.venue}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center min-w-[150px]">
            <p className="text-sm text-blue-300 mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${
              ticket.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {ticket.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Delivery & Access */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Ticket Access</h2>
            {renderDeliveryContent()}
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Ticket Details</h2>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                    <p className="text-blue-300">Category</p>
                    <p className="text-white font-medium">{ticket.category}</p>
                </div>
                <div>
                     <p className="text-blue-300">Block</p>
                    <p className="text-white font-medium">{ticket.block}</p>
                </div>
                 <div>
                     <p className="text-blue-300">Quantity</p>
                    <p className="text-white font-medium">{ticket.quantity}</p>
                </div>
                 <div>
                     <p className="text-blue-300">Order ID</p>
                    <p className="text-white font-mono">{ticket.purchaseId}</p>
                </div>
            </div>
          </div>
        </div>

        {/* Right Col: Protection & Actions */}
        <div className="space-y-6">
          {/* Buyer Protection */}
          <div className="bg-gradient-to-b from-green-500/10 to-green-600/5 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6">
             <div className="flex items-center gap-3 mb-4">
               <FaShieldAlt className="text-2xl text-green-400" />
               <h3 className="text-lg font-bold text-white">Buyer Protection</h3>
             </div>
             <p className="text-sm text-blue-200 mb-4">Your purchase is protected. Money is held in escrow until the match.</p>
             
             {ticket.canReportIssue && (
               <button className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                 <FaExclamationTriangle /> Report an Issue
               </button>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
