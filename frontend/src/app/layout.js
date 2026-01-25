import { Inter } from 'next/font/google';
import './globals.css';
import { RoleProvider } from '../contexts/RoleContext';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'TicketHub',
  description: 'Your ticket trading platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-900" suppressHydrationWarning>
        <RoleProvider>
          {children}
        </RoleProvider>
      </body>
    </html>
  );
}