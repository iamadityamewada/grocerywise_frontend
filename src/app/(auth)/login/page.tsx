'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api'; // Using the actual API

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, token, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already logged in
  React.useEffect(() => {
    // Redirect logic moved to AppLayout for consistency
    // if (!authLoading && token) {
    //   router.push('/dashboard');
    // }
  }, []); // Keep useEffect structure


  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    toast({ title: 'Logging in...', description: 'Please wait.' });

    try {
      // Use the actual API call
      const response = await api.login(data);

      // Assuming the login response provides the token directly
      // And we need to fetch user data separately after login
      if (response && response.access_token) {
         // Store token temporarily to fetch user data
         // login function in context will handle final storage
         localStorage.setItem('authToken', response.access_token);

         // Fetch user data using the new token
         try {
            const userData = await api.getCurrentUser(); // Fetch user data
             if (userData) {
                login(response.access_token, userData); // Update AuthContext with token and user data

                toast({
                    title: 'Login Successful',
                    description: 'Redirecting to your dashboard...',
                });

                // Redirect on success
                router.push('/dashboard');
             } else {
                 throw new Error('Failed to fetch user data after login.');
             }
         } catch (userError: any) {
              console.error("Failed to fetch user data:", userError);
              // Logout if user fetch fails to clear inconsistent state
              localStorage.removeItem('authToken');
              toast({
                variant: 'destructive',
                title: 'Login Partially Failed',
                description: 'Could not fetch user details. Please try again.',
              });
              setIsSubmitting(false);
         }

      } else {
        // Handle case where token is not received
        throw new Error('Login successful, but no token received.');
      }

    } catch (error: any) {
      // Clear potentially stored token if login fails
      localStorage.removeItem('authToken');
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        // Use the error message from the API call (handled in api.ts)
        description: error.message || 'Invalid credentials or server error.',
      });
      setIsSubmitting(false); // Keep form enabled on error
    }
    // No finally block needed here as success navigates away or error sets submitting false
  };

  // Loading state handled by AuthProvider/AppLayout
  if (authLoading || token) {
    // Prevent rendering form if already logged in or still loading auth state
    return null; // Or a minimal loading indicator if preferred
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Login to GroceryWise</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} type="email" disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" {...field} type="password" disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline text-primary hover:text-primary/80">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
