import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider

// Assign font variables directly to be used in the className
const geistSansFont = GeistSans;
const geistMonoFont = GeistMono;

export const metadata: Metadata = {
  title: 'GroceryWise',
  description: 'Manage your groceries wisely.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSansFont.variable} ${geistMonoFont.variable}`}>
      {/* Apply font variables to the html tag */}
      <body className={`antialiased min-h-screen flex flex-col`}>
        <AuthProvider> {/* Wrap the application with AuthProvider */}
          {/* Main content area - loading handled within AuthProvider/AppLayout */}
          <div className="flex-grow flex flex-col">
             {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
