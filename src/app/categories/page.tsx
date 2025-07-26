
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, GlassWater, Laptop, Pill, Footprints, Scissors, Gem, Building, MoreHorizontal, PlusCircle, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const initialCategories = [
  { name: 'Food', icon: UtensilsCrossed, href: '/products?category=food' },
  { name: 'Drinks', icon: GlassWater, href: '/products?category=drinks' },
  { name: 'Electronics', icon: Laptop, href: '/products?category=electronics' },
  { name: 'Medicine', icon: Pill, href: '/products?category=medicine' },
  { name: 'Shoes', icon: Footprints, href: '/products?category=shoes' },
  { name: 'Fabrics', icon: Scissors, href: '/products?category=fabrics' },
  { name: 'Jewelry', icon: Gem, href: '/products?category=jewelry' },
  { name: 'Hardware', icon: Building, href: '/products?category=hardware'},
  { name: 'Other', icon: MoreHorizontal, href: '/products?category=other' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const { toast } = useToast();

  // In a real app, this would be determined by user authentication
  const isAdmin = true;

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      // In a real app, you would also need to select an icon
      const newCategory = {
        name: newCategoryName,
        icon: MoreHorizontal, // Default icon
        href: `/products?category=${newCategoryName.toLowerCase()}`
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      toast({
        title: "Category Added",
        description: `The category "${newCategoryName}" has been created.`,
      });
      // Find the close button and click it to close the dialog
      document.getElementById('close-add-dialog')?.click();
    } else {
        toast({
            title: "Error",
            description: "Category name cannot be empty.",
            variant: "destructive"
        })
    }
  };

  const handleRemoveCategory = (categoryName: string) => {
    setCategories(categories.filter(c => c.name !== categoryName));
     toast({
        title: "Category Removed",
        description: `The category "${categoryName}" has been removed.`,
      });
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
          Browse by Category
        </h1>
        <p className="max-w-xl mx-auto text-lg text-muted-foreground mt-4">
          Find exactly what you're looking for by exploring our business categories.
        </p>
      </div>
      
      {isAdmin && (
        <div className="flex justify-end space-x-2 mb-8">
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                            Enter the name for the new category you want to create.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g., Clothing"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" id="close-add-dialog">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="button" onClick={handleAddCategory}>Add Category</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {categories.map((category) => (
          <div key={category.name} className="relative group">
            <Link href={category.href} >
                <Card className="text-center hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 ease-in-out h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                    <category.icon className="h-12 w-12 mb-4 text-primary group-hover:text-accent transition-colors" />
                    <h3 className="text-lg font-bold font-headline">{category.name}</h3>
                </CardContent>
                </Card>
            </Link>
             {isAdmin && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the 
                            <span className="font-bold"> {category.name} </span> 
                            category.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveCategory(category.name)}>
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
