'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
// Removed useToast as notifications are handled by the parent

const addGrocerySchema = z.object({
  name: z.string().min(1, { message: 'Item name is required.' }).trim(), // Trim whitespace
  quantity: z.coerce.number().int().min(1, { message: 'Quantity must be at least 1.' }), // Use coerce for number input, ensure integer
});

type AddGroceryFormValues = z.infer<typeof addGrocerySchema>;

interface AddGroceryItemProps {
  onAdd: (item: { name: string; quantity: number }) => Promise<void>; // Make onAdd async to handle parent's loading state
}

export default function AddGroceryItem({ onAdd }: AddGroceryItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddGroceryFormValues>({
    resolver: zodResolver(addGrocerySchema),
    defaultValues: {
      name: '',
      quantity: 1,
    },
  });

  const onSubmit = async (data: AddGroceryFormValues) => {
    setIsLoading(true);
    console.log('Submitting grocery item:', data);
    try {
      await onAdd(data); // Call the parent component's handler, which now handles API call and toast
      form.reset(); // Reset form fields only on success
    } catch (error) {
      // Error handling (including toast) is now done in the parent component (DashboardPage)
      console.error("Error passed from parent onAdd:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 items-start">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel className="sr-only">Item Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter item name (e.g., Apples)" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem className="w-full sm:w-auto">
              <FormLabel className="sr-only">Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Qty" {...field} min="1" className="w-20 text-center" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {isLoading ? 'Adding...' : 'Add Item'}
        </Button>
      </form>
    </Form>
  );
}
