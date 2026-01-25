// 'use client';
// import { useState, useEffect } from 'react';
// import { FaUser, FaEnvelope, FaPhone, FaCoins, FaEdit, FaSave, FaTimes, FaUsers, FaShieldAlt, FaChartLine, FaCog } from 'react-icons/fa';

// const AdminProfilePage = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [editMode, setEditMode] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     phone: '',
//     email: ''
//   });
//   const [saving, setSaving] = useState(false);

//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/users/profile`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setUser(data.user);
//         setFormData({
//           firstName: data.user.profile?.firstName || '',
//           lastName: data.user.profile?.lastName || '',
//           phone: data.user.profile?.phone || '',
//           email: data.user.email || ''
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/users/profile`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         setUser(result.user);
//         setEditMode(false);
//         alert('Profile updated successfully!');
//       } else {
//         const error = await response.json();
//         alert(error.message);
//       }
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       alert('Error updating profile');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const getFullName = () => {
//     if (user?.profile?.firstName && user?.profile?.lastName) {
//       return `${user.profile.firstName} ${user.profile.lastName}`;
//     }
//     return user?.profile?.firstName || user?.profile?.lastName || 'User Profile';
//   };

//   if (loading) return (
//     <div className="flex items-center justify-center py-20">
//       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
//       <span className="ml-3 text-white">Loading profile...</span>
//     </div>
//   );

//   if (!user) return (
//     <div className="text-center py-20">
//       <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-6 max-w-md mx-auto">
//         <p className="text-red-300 mb-2 font-semibold">Error loading profile</p>
//         <button 
//           onClick={fetchProfile}
//           className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
//         >
//           Try Again
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="p-4 sm:p-6">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sm:mb-8">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Profile</h1>
//           <p className="text-blue-200 mt-1 sm:mt-2">System administrator dashboard</p>
//         </div>
//         <button
//           onClick={() => editMode ? setEditMode(false) : setEditMode(true)}
//           className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all duration-200 w-full lg:w-auto justify-center"
//         >
//           {editMode ? <FaTimes className="text-sm" /> : <FaEdit className="text-sm" />}
//           {editMode ? 'Cancel' : 'Edit Profile'}
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
//         <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
//           <div className="flex items-center">
//             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-red-400/30">
//               <FaShieldAlt className="text-lg sm:text-xl text-red-400" />
//             </div>
//             <div>
//               <p className="text-xs sm:text-sm font-medium text-blue-200">Role</p>
//               <p className="text-xl sm:text-2xl font-bold text-white capitalize">{user.role}</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
//           <div className="flex items-center">
//             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-green-400/30">
//               <FaCoins className="text-lg sm:text-xl text-green-400" />
//             </div>
//             <div>
//               <p className="text-xs sm:text-sm font-medium text-blue-200">Points</p>
//               <p className="text-xl sm:text-2xl font-bold text-white">{user.points || 0}</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
//           <div className="flex items-center">
//             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-purple-400/30">
//               <FaUsers className="text-lg sm:text-xl text-purple-400" />
//             </div>
//             <div>
//               <p className="text-xs sm:text-sm font-medium text-blue-200">Total Users</p>
//               <p className="text-xl sm:text-2xl font-bold text-white">-</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
//           <div className="flex items-center">
//             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-yellow-400/30">
//               <FaChartLine className="text-lg sm:text-xl text-yellow-400" />
//             </div>
//             <div>
//               <p className="text-xs sm:text-sm font-medium text-blue-200">System Status</p>
//               <p className="text-xl sm:text-2xl font-bold text-white">Active</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Profile Information */}
//       <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Email Field */}
//           <div>
//             <label className="block text-blue-200 text-sm font-medium mb-2 flex items-center gap-2">
//               <FaEnvelope className="text-blue-400" />
//               Email Address
//             </label>
//             {editMode ? (
//               <input
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
//                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 placeholder="Enter your email"
//               />
//             ) : (
//               <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white">
//                 {user.email}
//               </div>
//             )}
//           </div>

//           {/* First Name Field */}
//           <div>
//             <label className="block text-blue-200 text-sm font-medium mb-2">
//               First Name
//             </label>
//             {editMode ? (
//               <input
//                 type="text"
//                 value={formData.firstName}
//                 onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
//                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 placeholder="Enter first name"
//               />
//             ) : (
//               <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white">
//                 {user.profile?.firstName || 'Not set'}
//               </div>
//             )}
//           </div>

//           {/* Last Name Field */}
//           <div>
//             <label className="block text-blue-200 text-sm font-medium mb-2">
//               Last Name
//             </label>
//             {editMode ? (
//               <input
//                 type="text"
//                 value={formData.lastName}
//                 onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
//                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 placeholder="Enter last name"
//               />
//             ) : (
//               <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white">
//                 {user.profile?.lastName || 'Not set'}
//               </div>
//             )}
//           </div>

//           {/* Phone Field */}
//           <div>
//             <label className="block text-blue-200 text-sm font-medium mb-2 flex items-center gap-2">
//               <FaPhone className="text-blue-400" />
//               Phone Number
//             </label>
//             {editMode ? (
//               <input
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
//                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 placeholder="Enter your phone number"
//               />
//             ) : (
//               <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white">
//                 {user.profile?.phone || 'Not set'}
//               </div>
//             )}
//           </div>

//           {/* Full Name Display (Read-only) */}
//           <div>
//             <label className="block text-blue-200 text-sm font-medium mb-2">
//               Full Name
//             </label>
//             <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white">
//               {getFullName()}
//             </div>
//           </div>

//           {/* Member Since */}
//           <div>
//             <label className="block text-blue-200 text-sm font-medium mb-2">
//               Member Since
//             </label>
//             <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white">
//               {new Date(user.createdAt).toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//               })}
//             </div>
//           </div>
//         </div>

//         {/* Admin Specific Info */}
//         <div className="mt-6 pt-6 border-t border-white/20">
//           <h3 className="text-lg font-semibold text-white mb-4">Administrative Access</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="bg-white/5 rounded-lg p-4">
//               <div className="flex items-center gap-3 mb-2">
//                 <FaUsers className="text-blue-400" />
//                 <p className="text-white font-semibold">User Management</p>
//               </div>
//               <p className="text-blue-200 text-sm">Full access to manage all users, sellers, and buyers</p>
//             </div>
//             <div className="bg-white/5 rounded-lg p-4">
//               <div className="flex items-center gap-3 mb-2">
//                 <FaCog className="text-green-400" />
//                 <p className="text-white font-semibold">System Settings</p>
//               </div>
//               <p className="text-blue-200 text-sm">Configure platform settings and commission rates</p>
//             </div>
//             <div className="bg-white/5 rounded-lg p-4">
//               <div className="flex items-center gap-3 mb-2">
//                 <FaChartLine className="text-purple-400" />
//                 <p className="text-white font-semibold">Analytics & Reports</p>
//               </div>
//               <p className="text-blue-200 text-sm">Access to sales data and platform analytics</p>
//             </div>
//             <div className="bg-white/5 rounded-lg p-4">
//               <div className="flex items-center gap-3 mb-2">
//                 <FaShieldAlt className="text-red-400" />
//                 <p className="text-white font-semibold">Security & Moderation</p>
//               </div>
//               <p className="text-blue-200 text-sm">Monitor disputes and ensure platform security</p>
//             </div>
//           </div>
//         </div>

//         {/* Save Button */}
//         {editMode && (
//           <div className="mt-6 flex justify-end">
//             <button
//               onClick={handleSave}
//               disabled={saving}
//               className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
//             >
//               {saving ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <FaSave className="text-sm" />
//                   Save Changes
//                 </>
//               )}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminProfilePage;