'use client'; // Required for hooks like useAuth and useRouter

import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import Header from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Loading state component for the entire app layout
function AppLayoutSkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Skeleton className="h-6 w-6 mr-2" />
          <Skeleton className="h-6 w-24 mr-6" />
          <Skeleton className="h-6 w-20 flex-1" />
          <div className="flex items-center space-x-2 ml-auto">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>
      {/* Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </main>
    </>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading,
    // and not already on an auth page (though this layout shouldn't cover auth pages)
    if (!isLoading && !token && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
      console.log('AppLayout: Redirecting to /login');
      router.replace('/login'); // Use replace to avoid adding to history stack
    }
  }, [isLoading, token, router, pathname]);

  // Show layout skeleton while checking authentication status
  if (isLoading) {
    return <AppLayoutSkeleton />;
  }

  // Prevent rendering children if not authenticated (avoids flash of content)
  // The redirect in useEffect will handle navigation
  if (!token) {
     return <AppLayoutSkeleton />; // Continue showing skeleton while redirect happens
  }

  // Render layout and children if authenticated
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </>
  );
}
