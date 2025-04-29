'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // path of error
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { token, isLoading: authLoading } = useAuth(); // Use auth state for redirection
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Redirect if already logged in
  React.useEffect(() => {
     // Redirect logic moved to AppLayout for consistency
    // if (!authLoading && token) {
    //   router.push('/dashboard');
    // }
  }, []);


  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    toast({ title: 'Registering...', description: 'Creating your account.' });

    try {
      // Use the actual API call - only send email and password
      const response = await api.register({ email: data.email, password: data.password });

      // Check if response is valid (FastAPI returns the created user object on success)
      if (response && response.id) {
          toast({
            title: 'Registration Successful',
            description: 'Account created! Please log in.',
          });
          // Redirect on success
          router.push('/login');
      } else {
          // This case might occur if the API returns 201 but no body, or an unexpected format
          console.warn('Registration API response:', response);
          // Throw a more specific error if possible, otherwise a generic one
          throw new Error(response?.detail || 'Registration succeeded but no user data received. Please try logging in.');
      }

    } catch (error: any) {
      console.error("Registration API Error:", error); // Log the full error

      // Default error message
      let errorMessage = 'An error occurred during registration. Please try again.';

      // Check for specific backend error messages
      if (error?.message) {
          if (error.message.includes("email already exists")) {
             errorMessage = 'This email address is already registered. Please log in or use a different email.';
             // Optionally focus the email field and set an error
             form.setError('email', { type: 'manual', message: errorMessage });
          } else if (error.message.includes(':')) {
             // Handle potential validation errors like "password: Password must be..."
             // Split the message to try and get the field and the error
             const parts = error.message.split(':');
             if (parts.length > 1) {
                 const field = parts[0].trim().toLowerCase();
                 const msg = parts.slice(1).join(':').trim();
                 // Set error on the specific form field if it exists
                 if (field === 'email' || field === 'password') {
                    form.setError(field as keyof RegisterFormValues, { type: 'manual', message: msg });
                    errorMessage = `Validation failed: ${msg}`; // More specific toast
                 } else {
                    errorMessage = error.message; // Use the full message if field mapping isn't clear
                 }
             } else {
                 errorMessage = error.message; // Use the raw message if format is unexpected
             }
          }
          else {
            errorMessage = error.message; // Use the message directly if it's not a known specific error
          }
      }

      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: errorMessage,
      });
      setIsSubmitting(false); // Keep form enabled on error
    }
    // No finally needed here as success navigates away or error sets submitting false
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
          <CardTitle className="text-2xl font-bold text-center text-primary">Create Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details below to create your GroceryWise account.
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" {...field} type="password" disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Register'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline text-primary hover:text-primary/80">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
