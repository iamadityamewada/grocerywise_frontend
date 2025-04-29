'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '@/lib/api'; // Import your API utility
import { useRouter } from 'next/navigation'; // Import router for potential redirection

interface User {
  // Define user properties based on backend response (schemas.User)
  id: number;
  email: string;
  is_active: boolean;
  created_at: string; // ISO date string
  updated_at: string | null; // ISO date string or null
  // name?: string; // Optional: Add later if implemented in backend/frontend
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refetchUser: () => Promise<void>; // Add function to refetch user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const router = useRouter(); // Get router instance

  // Function to validate token and fetch user data
   const validateTokenAndFetchUser = useCallback(async (currentToken: string) => {
    setIsLoading(true);
    try {
        // The fetchApi function already handles adding the token from localStorage
        // so no need to manually set it here if api.ts is correctly implemented.

        const userData = await api.getCurrentUser(); // Use getCurrentUser API
        if (userData) {
            setUser(userData);
            setToken(currentToken); // Confirm the token is valid and set it in context state
        } else {
            // If API returns no user for a valid token (should not happen ideally)
            throw new Error('Token valid but failed to fetch user data.');
        }
    } catch (error: any) {
        console.error("Token validation/User fetch failed:", error.message);
        // Clear invalid token and user data
        localStorage.removeItem('authToken');
        // No need to remove 'authUser' as we aren't relying on it primarily
        setToken(null);
        setUser(null);
        // Redirect to login if validation fails and we are not already on login/register page
        // Handled by AppLayout now.
        // if (!['/login', '/register'].includes(router.pathname)) {
        //   router.push('/login');
        // }
    } finally {
      setIsLoading(false);
    }
  }, []); // Removed router dependency as it's handled by layout


  useEffect(() => {
    // Attempt to load token from storage on initial load
    const storedToken = localStorage.getItem('authToken');

    if (storedToken) {
       validateTokenAndFetchUser(storedToken);
    } else {
      setIsLoading(false); // No token found, stop loading
    }
  }, [validateTokenAndFetchUser]); // Run only once on mount

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('authToken', newToken);
    // No need to store user in localStorage, fetch it on load
    // localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsLoading(false); // Ensure loading is false after login
  };

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    // localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    // Redirect to login page after logout
    // Note: Ensure this doesn't conflict with redirects in page components
     router.push('/login');
  }, [router]);

   const refetchUser = useCallback(async () => {
     const currentToken = localStorage.getItem('authToken');
     if (currentToken) {
       await validateTokenAndFetchUser(currentToken);
     } else {
       // No token, ensure logged out state
       logout();
     }
   }, [validateTokenAndFetchUser, logout]);


  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refetchUser }}>
      {/* Removed loading spinner here, handled by AppLayout to prevent flashing */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
