'use client';

import { useState, useEffect } from 'react';
import { 
  FaBell, FaCheckDouble, FaTrash, FaInfoCircle, 
  FaTicketAlt, FaStore, FaClock, FaCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Server error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, link) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));

      if (link) {
        router.push(link);
      }
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-400/30">
            <FaBell className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
        </div>
        
        {notifications.length > 0 && (
          <button 
            onClick={markAllRead}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-lg border border-blue-400/20 transition-all"
          >
            <FaCheckDouble /> Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/30 text-red-300 p-4 rounded-xl mb-6 flex items-center gap-3">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <FaBell className="mx-auto h-12 w-12 text-gray-500 mb-4 opacity-30" />
            <h3 className="text-xl font-semibold text-white mb-2">No notifications yet</h3>
            <p className="text-blue-200">We'll notify you when something important happens.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif._id}
              className={`group relative bg-white/5 backdrop-blur-xl border rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:bg-white/10 ${
                !notif.read ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10'
              }`}
            >
              <div className="flex gap-4">
                <div 
                  onClick={() => markAsRead(notif._id, notif.link)}
                  className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer ${
                    notif.type === 'sale' ? 'bg-green-500/20 text-green-400' :
                    notif.type === 'delivery' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {notif.type === 'sale' && <FaStore size={18} />}
                  {notif.type === 'delivery' && <FaTicketAlt size={18} />}
                  {(notif.type !== 'sale' && notif.type !== 'delivery') && <FaInfoCircle size={18} />}
                </div>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => markAsRead(notif._id, notif.link)}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-base font-semibold ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && <FaCircle className="text-blue-500 w-2 h-2 mt-2" />}
                  </div>
                  <p className="text-sm text-blue-100/70 mb-2 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-3 text-xs text-blue-300/50">
                    <span className="flex items-center gap-1">
                      <FaClock className="text-[10px]" /> {formatTime(notif.createdAt)}
                    </span>
                    {notif.read && <span className="text-green-500/50 flex items-center gap-1"><FaCheckDouble /> Read</span>}
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif._id);
                  }}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Delete notification"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
