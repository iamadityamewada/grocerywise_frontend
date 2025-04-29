'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Use AuthContext
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api } from '@/lib/api'; // Import API library
import { Skeleton } from '@/components/ui/skeleton';


// Update Profile Schema (Keep email for now, potentially add name later)
const profileSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  // name: z.string().min(1, {message: 'Name is required.'}).optional(), // Example: Adding name
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// Change Password Schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: z.string().min(8, { message: 'New password must be at least 8 characters.' }),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ['confirmNewPassword'],
});
type PasswordFormValues = z.infer<typeof passwordSchema>;


function SettingsLoadingSkeleton() {
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
          <Skeleton className="h-8 w-1/3" /> {/* Title Skeleton */}

          {/* Profile Card Skeleton */}
          <Card className="shadow-md border-primary/10">
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-24" />
               </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Password Card Skeleton */}
           <Card className="shadow-md border-primary/10">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                    <Skeleton className="h-4 w-1/5" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-1/5" />
                    <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-32" />
               </div>
            </CardContent>
          </Card>

          <Separator />

           {/* Delete Card Skeleton */}
           <Card className="border-destructive shadow-md">
             <CardHeader>
               <Skeleton className="h-6 w-1/4 bg-destructive/50" />
               <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
             </CardHeader>
             <CardFooter>
                <Skeleton className="h-10 w-36 bg-destructive/80" />
             </CardFooter>
           </Card>
        </div>
    );
}


export default function SettingsPage() {
  const { user, logout, isLoading: authLoading, refetchUser } = useAuth(); // Use auth context, add refetchUser
  const router = useRouter();
  const { toast } = useToast();
  // Removed isProfileLoading as it's not used
  const [isPasswordLoading, setIsPasswordLoading] = React.useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);

  // Initialize forms
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    // Default values will be set in useEffect
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

   // Populate profile form once user data is loaded
   React.useEffect(() => {
    if (user) {
      profileForm.reset({
        email: user.email,
        // name: user.name || '', // If you add name field
      });
    }
  }, [user, profileForm]);


  // Profile Submit (currently does nothing as email is read-only)
  const onProfileSubmit = async (data: ProfileFormValues) => {
    // If you implement profile updates (e.g., name), add logic here using api.updateUser
    // Remember to update user state in context if successful, potentially using refetchUser()
     toast({ title: 'Info', description: 'Profile update (e.g., name change) is not implemented yet.' });
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsPasswordLoading(true);
    toast({ title: 'Changing Password...', description: 'Please wait.' });
    try {
      // Use the actual API call
      const response = await api.changePassword({
          current_password: data.currentPassword,
          new_password: data.newPassword
      });
      toast({ title: 'Password Changed', description: response.message || 'Your password has been updated successfully.' });
      passwordForm.reset(); // Clear form
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Change Password Failed', description: error.message || 'Could not change password. Check current password.' });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleteLoading(true);
    toast({ title: 'Deleting Account...', description: 'This is permanent. Please wait.' });
    try {
        await api.deleteAccount(); // Call the actual API endpoint (returns 204)
        toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted. Logging out...' });
        // Delay logout slightly to allow toast to show
        setTimeout(() => {
            logout(); // Log the user out using context function (which redirects)
        }, 1500);
    } catch (error: any) {
         toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message || 'Could not delete account.' });
         setIsDeleteLoading(false); // Only set loading false on error
    }
    // No finally block, as success leads to logout/redirect
  };


  // Use authLoading to show skeleton while user data is being checked/loaded by the layout/context
   if (authLoading || !user) { // Also check if user exists after loading
    return <SettingsLoadingSkeleton />;
  }


  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary">Account Settings</h1>

      {/* Update Profile Section */}
      <Card className="shadow-md border-primary/10">
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            {/* Removed onSubmit from form as it's disabled */}
            <form onSubmit={(e) => {e.preventDefault(); onProfileSubmit(profileForm.getValues());}} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      {/* Email is read-only */}
                      <Input placeholder="you@example.com" {...field} type="email" readOnly disabled />
                    </FormControl>
                     <p className="text-xs text-muted-foreground pt-1">Email cannot be changed currently.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Disable button as profile update is not implemented */}
               <Button type="submit" disabled={true}>
                Save Changes (Disabled)
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Password Section */}
      <Card className="shadow-md border-primary/10">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" {...field} type="password" disabled={isPasswordLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" {...field} type="password" disabled={isPasswordLoading}/>
                    </FormControl>
                     <p className="text-xs text-muted-foreground pt-1">Must be at least 8 characters long.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" {...field} type="password" disabled={isPasswordLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

       <Separator />

      {/* Delete Account Section */}
       <Card className="border-destructive shadow-md">
         <CardHeader>
           <CardTitle className="text-destructive">Delete Account</CardTitle>
           <CardDescription>
             Permanently delete your account and all associated data, including your grocery lists. This action cannot be undone.
           </CardDescription>
         </CardHeader>
         <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleteLoading}>
                  {isDeleteLoading ? 'Deleting...' : 'Delete My Account'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleteLoading}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleteLoading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleteLoading ? 'Deleting...' : 'Yes, delete account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
         </CardFooter>
       </Card>

    </div>
  );
}
