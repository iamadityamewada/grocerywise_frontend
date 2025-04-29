'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed Checkbox import as it's not directly used for status toggle anymore
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, CheckSquare, Square, X, Check } from 'lucide-react'; // Added Check, X
import { Badge } from '@/components/ui/badge';
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
} from "@/components/ui/alert-dialog"; // Import ShadCN AlertDialog components

interface GroceryItem {
  id: number;
  name: string;
  quantity: number;
  status: 'pending' | 'purchased';
}

interface GroceryListProps {
  groceries: GroceryItem[];
  onUpdate: (item: GroceryItem) => void;
  onDelete: (id: number) => void;
}

export default function GroceryList({ groceries, onUpdate, onDelete }: GroceryListProps) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'purchased'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState<number | string>(''); // Keep as string for input control


  const handleEditStart = (item: GroceryItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQuantity(item.quantity); // Keep original quantity
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
    setEditQuantity('');
  };

 const handleEditSave = (id: number) => {
    if (editingId === null) return;
    const originalItem = groceries.find(item => item.id === id);
    if (!originalItem) return;

    const updatedQuantity = parseInt(String(editQuantity), 10);
    // Basic validation: ensure name isn't empty and quantity is a positive number
    if (!editName.trim()) {
        // TODO: Add user feedback (e.g., highlight input border)
        console.error("Item name cannot be empty.");
        return;
    }
    if (isNaN(updatedQuantity) || updatedQuantity <= 0) {
        // TODO: Add user feedback
        console.error("Invalid quantity. Must be a positive number.");
        return;
    }


    onUpdate({
        ...originalItem,
        name: editName.trim(), // Trim whitespace
        quantity: updatedQuantity
    });
    handleEditCancel(); // Exit edit mode
  };


  const toggleStatus = (item: GroceryItem) => {
    onUpdate({ ...item, status: item.status === 'pending' ? 'purchased' : 'pending' });
  };

  const filteredAndSortedGroceries = groceries
    .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
    .filter(item => statusFilter === 'all' || item.status === statusFilter)
    .sort((a, b) => {
      let comparison = 0;
      const fieldA = sortBy === 'name' ? a.name.toLowerCase() : sortBy === 'quantity' ? a.quantity : a.status;
      const fieldB = sortBy === 'name' ? b.name.toLowerCase() : sortBy === 'quantity' ? b.quantity : b.status;

      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        comparison = fieldA.localeCompare(fieldB);
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        comparison = fieldA - fieldB;
      } else {
         // Handle status comparison or potential type mismatches
         comparison = String(fieldA).localeCompare(String(fieldB));
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-4">
      {/* Filtering and Sorting Controls */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <Input
          placeholder="Filter items..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm flex-grow" // Allow input to grow
        />
        <div className="flex gap-2 sm:gap-4"> {/* Group selects */}
          <Select value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'purchased') => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="purchased">Purchased</SelectItem>
              </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: 'name' | 'quantity' | 'status') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
              </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="asc">Asc</SelectItem>
                  <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
          </Select>
         </div>
      </div>

      {/* Grocery Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">Status</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead className="w-[80px] text-right">Quantity</TableHead>
              <TableHead className="w-[120px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedGroceries.length > 0 ? (
              filteredAndSortedGroceries.map((item) => (
                <TableRow key={item.id} data-state={editingId === item.id ? "selected" : undefined} className={editingId === item.id ? "bg-muted/50" : ""}>
                  <TableCell className="text-center">
                     {/* Status Toggle Button */}
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => !editingId && toggleStatus(item)} // Disable toggle when editing
                        aria-label={item.status === 'pending' ? 'Mark as purchased' : 'Mark as pending'}
                        disabled={editingId === item.id} // Disable button when editing this row
                        className={`rounded-full ${editingId === item.id ? 'cursor-not-allowed opacity-50' : ''}`}
                     >
                        {item.status === 'purchased' ? <CheckSquare className="h-5 w-5 text-green-600" /> : <Square className="h-5 w-5 text-muted-foreground" />}
                     </Button>
                  </TableCell>
                  <TableCell>
                    {/* Editable Name */}
                    {editingId === item.id ? (
                       <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 text-sm" // Smaller input in table
                            autoFocus // Focus on the input when editing starts
                            onKeyDown={(e) => e.key === 'Enter' && handleEditSave(item.id)} // Save on Enter
                        />
                    ) : (
                      <span className={`text-sm ${item.status === 'purchased' ? 'line-through text-muted-foreground' : ''}`}>
                        {item.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                     {/* Editable Quantity */}
                     {editingId === item.id ? (
                       <Input
                            type="number"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            className="h-8 w-16 text-right text-sm" // Smaller input
                            min="1"
                             onKeyDown={(e) => e.key === 'Enter' && handleEditSave(item.id)} // Save on Enter
                        />
                     ) : (
                         <span className={`text-sm ${item.status === 'purchased' ? 'line-through text-muted-foreground' : ''}`}>
                            {item.quantity}
                        </span>
                     )}
                  </TableCell>
                  <TableCell className="text-center">
                     {/* Action Buttons */}
                     {editingId === item.id ? (
                        <div className="flex justify-center items-center gap-1">
                             <Button variant="ghost" size="icon" onClick={() => handleEditSave(item.id)} className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900 h-7 w-7">
                                <Check className="h-4 w-4"/>
                             </Button>
                             <Button variant="ghost" size="icon" onClick={handleEditCancel} className="text-muted-foreground hover:bg-muted h-7 w-7">
                                <X className="h-4 w-4"/>
                             </Button>
                        </div>
                     ) : (
                        <div className="flex justify-center items-center gap-1">
                             <Button variant="ghost" size="icon" onClick={() => handleEditStart(item)} aria-label="Edit item" className="h-7 w-7 hover:bg-muted">
                                <Edit className="h-4 w-4" />
                            </Button>
                            {/* Delete Confirmation Dialog */}
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 h-7 w-7" aria-label="Delete item">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the item "{item.name}".
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onDelete(item.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                             </AlertDialog>
                        </div>
                     )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {filter || statusFilter !== 'all' ? 'No items match your filters.' : 'Your grocery list is empty. Add some items!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Removed dummy AlertDialog components as they are now imported from ShadCN
