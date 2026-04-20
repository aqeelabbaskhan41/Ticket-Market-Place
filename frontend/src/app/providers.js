'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { RoleProvider } from '../contexts/RoleContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Providers({ children }) {
  console.log('Google Client ID Status:', !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>

      <RoleProvider>
        {children}
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </RoleProvider>
    </GoogleOAuthProvider>
  );
}
