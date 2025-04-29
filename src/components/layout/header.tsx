'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBasket, User, LogOut, Settings, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Theme Toggle Component (Modified for server/client consistency)
function ThemeToggle() {
    // Initialize state based on potential localStorage value or system preference
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            return savedTheme === 'dark' || (!savedTheme && prefersDark);
        }
        return false; // Default to light theme on server or if window is undefined
    });

    // Effect to apply the theme class and update localStorage when isDark changes
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);


    const toggleTheme = () => {
        setIsDark(prev => !prev);
    }

    // Ensure the button only renders client-side after initial state check
     const [isMounted, setIsMounted] = useState(false);
     useEffect(() => {
        setIsMounted(true);
     }, []);

     if (!isMounted) {
        // Render a placeholder or null on the server/initial client render
        return <Skeleton className="h-10 w-10 rounded-md" />;
     }


    return (
         <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
    )
}


export default function Header() {
  const router = useRouter();
  const { user, logout, token, isLoading } = useAuth(); // Use auth context

  const handleLogout = () => {
    logout();
    // Redirect to login page after logout
    router.push('/login');
  };

  // Generate initials robustly
  const getInitials = (email?: string): string => {
    if (!email) return '?';
    const namePart = email.split('@')[0];
    return namePart.substring(0, 2).toUpperCase();
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ShoppingBasket className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">GroceryWise</span>
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 flex-1">
          {/* Add other navigation links here if needed */}
          {token && !isLoading && ( // Only show if logged in and not loading
             <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Dashboard
             </Link>
          )}
        </nav>
        <div className="flex items-center space-x-2 ml-auto"> {/* Use ml-auto to push to the right */}
           <ThemeToggle />
          {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" /> // Show skeleton while loading auth state
          ) : token && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                   <Avatar className="h-8 w-8 border">
                     {/* Optional: Add AvatarImage if you store profile pictures */}
                     {/* <AvatarImage src={user.avatarUrl} alt={user.name || user.email} /> */}
                     <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                   </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {/* Use user.name if available, otherwise fallback */}
                    {/* <p className="text-sm font-medium leading-none">{user.name || 'User'}</p> */}
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
