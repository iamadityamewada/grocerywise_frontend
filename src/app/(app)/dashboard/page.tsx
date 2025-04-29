'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Needed for user ID
import { api } from '@/lib/api'; // Import API functions
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GroceryList from '@/components/grocery/GroceryList';
import AddGroceryItem from '@/components/grocery/AddGroceryItem';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


interface GroceryItem {
  id: number;
  name: string;
  quantity: number;
  status: 'pending' | 'purchased';
  // Fields from backend schema
  created_at: string;
  updated_at: string | null;
  owner_id: number;
}

// Loading state component
function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/3" /> {/* Title Skeleton */}

      {/* Add Item Card Skeleton */}
      <Card className="shadow-md border-primary/10">
        <CardHeader>
           <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent>
           <div className="flex flex-col sm:flex-row gap-4 items-start">
             <Skeleton className="h-10 flex-grow" />
             <Skeleton className="h-10 w-20" />
             <Skeleton className="h-10 w-28" />
           </div>
        </CardContent>
      </Card>

      {/* Grocery List Card Skeleton */}
      <Card className="shadow-md border-primary/10">
        <CardHeader>
           <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
             <div className="flex flex-col sm:flex-row gap-4">
               <Skeleton className="h-10 max-w-sm flex-grow" />
               <Skeleton className="h-10 w-[140px]" /> {/* Adjusted width */}
               <Skeleton className="h-10 w-[120px]" /> {/* Adjusted width */}
               <Skeleton className="h-10 w-[100px]" /> {/* Adjusted width */}
             </div>
             <div className="rounded-md border p-4 space-y-3">
               {[...Array(3)].map((_, i) => ( // Skeleton for 3 list items
                 <div key={i} className="flex items-center space-x-4 p-2"> {/* Added padding */}
                   <Skeleton className="h-6 w-6 rounded-full" /> {/* Status */}
                   <Skeleton className="h-4 flex-grow" /> {/* Name */}
                   <Skeleton className="h-4 w-10" /> {/* Qty */}
                   <Skeleton className="h-8 w-20" /> {/* Actions */}
                 </div>
               ))}
             </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function DashboardPage() {
  const { user, token } = useAuth(); // Get user info and token status
  const { toast } = useToast();
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch groceries function
  const fetchGroceries = useCallback(async () => {
      if (!token) return; // Don't fetch if not logged in

      setIsLoading(true);
      setError(null);
      try {
        const fetchedGroceries = await api.getGroceries();
        setGroceries(fetchedGroceries || []); // Handle potential null/empty response
      } catch (err: any) {
        console.error("Failed to fetch groceries:", err);
        const errorMessage = err.message || 'Failed to load groceries. Please try again.';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error Fetching Groceries',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
  }, [token, toast]); // Add token to dependency array

  // Fetch groceries on component mount or when token changes
  useEffect(() => {
    fetchGroceries();
  }, [fetchGroceries]); // fetchGroceries already includes token dependency

  const handleAddGrocery = async (newItem: { name: string; quantity: number }) => {
    if (!user) return; // Ensure user exists

    // Optimistic UI update (optional but good UX)
    const tempId = Date.now(); // Temporary ID for optimistic update
    const optimisticItem: GroceryItem = {
      id: tempId,
      ...newItem,
      status: 'pending',
      owner_id: user.id, // Use actual user ID
      created_at: new Date().toISOString(),
      updated_at: null
    };
    setGroceries(prev => [optimisticItem, ...prev]); // Add to the beginning

    try {
      // Call actual API - backend assigns final ID and timestamps
      const addedItemFromServer = await api.addGrocery(newItem);

      // Replace optimistic item with server item
      setGroceries(prev => prev.map(item => item.id === tempId ? addedItemFromServer : item));

       toast({
         title: 'Item Added',
         description: `"${newItem.name}" added successfully.`,
       });
    } catch (err: any) {
      console.error("Failed to add grocery:", err);
       toast({
         variant: 'destructive',
         title: 'Error Adding Item',
         description: err.message || 'Could not add the item.',
       });
      // Rollback optimistic update on error
      setGroceries(prev => prev.filter(item => item.id !== tempId));
    }
  };

  const handleUpdateGrocery = async (updatedItem: GroceryItem) => {
     const originalGroceries = [...groceries];
     // Optimistic UI update
     setGroceries(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));

     try {
        // Send only the fields that can be updated by the user/UI
        // Backend handles timestamps and owner_id
        const updatePayload = {
            name: updatedItem.name,
            quantity: updatedItem.quantity,
            status: updatedItem.status
        };
        // Call actual API
        const updatedFromServer = await api.updateGrocery(updatedItem.id, updatePayload);

        // Update state with potentially updated timestamps from server
        setGroceries(prev => prev.map(item => item.id === updatedFromServer.id ? updatedFromServer : item));

        toast({
          title: 'Item Updated',
          description: `"${updatedFromServer.name}" updated successfully.`,
        });
     } catch (err: any) {
        console.error("Failed to update grocery:", err);
        toast({
            variant: 'destructive',
            title: 'Error Updating Item',
            description: err.message || 'Could not update the item.',
        });
        // Rollback on error
        setGroceries(originalGroceries);
     }
  };

  const handleDeleteGrocery = async (id: number) => {
     const itemToDelete = groceries.find(item => item.id === id);
     if (!itemToDelete) return;

     const originalGroceries = [...groceries];
     // Optimistic UI update
     setGroceries(prev => prev.filter(item => item.id !== id));

     try {
        // Call actual API
        await api.deleteGrocery(id); // Returns 204 No Content on success
         toast({
           title: 'Item Deleted',
           description: `"${itemToDelete.name}" deleted successfully.`,
         });
         // No state update needed on success after optimistic removal
     } catch (err: any) {
        console.error("Failed to delete grocery:", err);
         toast({
            variant: 'destructive',
            title: 'Error Deleting Item',
            description: err.message || 'Could not delete the item.',
         });
         // Rollback on error
         setGroceries(originalGroceries);
     }
  };


  // Loading skeleton handled by AppLayout initially,
  // then this component handles loading for grocery list fetch
  if (isLoading) {
     return <DashboardLoadingSkeleton />;
  }

  if (error && !isLoading) { // Show error only if not loading
    return (
       <Alert variant="destructive" className="mt-6">
         <Terminal className="h-4 w-4" />
         <AlertTitle>Loading Error</AlertTitle>
         <AlertDescription>{error}</AlertDescription>
       </Alert>
    );
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Your Grocery List</h1>
      {/* Optionally display welcome message: <p className="text-muted-foreground">Welcome, {user?.email}!</p> */}

      <Card className="shadow-md border-primary/10">
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <AddGroceryItem onAdd={handleAddGrocery} />
        </CardContent>
      </Card>

      <Card className="shadow-md border-primary/10">
         <CardHeader>
           <CardTitle>Current Groceries ({groceries.length})</CardTitle>
         </CardHeader>
        <CardContent>
          <GroceryList
            groceries={groceries}
            onUpdate={handleUpdateGrocery}
            onDelete={handleDeleteGrocery}
           />
        </CardContent>
      </Card>
    </div>
  );
}
