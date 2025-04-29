'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBasket, LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const { user, isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <Card className="w-full max-w-lg shadow-xl border-primary/20">
        <CardHeader className="items-center">
           <ShoppingBasket className="h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-4xl font-bold text-primary tracking-tight">
            Welcome to GroceryWise
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Your smart grocery management solution. Plan, track, and shop efficiently.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6 space-y-4">
          {token && user ? (
            <>
              <p className="text-lg">
                Hello, <span className="font-semibold">{user.email}</span>!
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href="/dashboard">
                  Go to Your Dashboard
                </Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">Get started by logging in or creating an account.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="flex-1">
                  <Link href="/login">
                    <LogIn className="mr-2 h-5 w-5" /> Login
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <Link href="/register">
                     <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
