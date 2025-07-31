
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, GlassWater, Laptop, Pill, Footprints, Scissors, Gem, Building, MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
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
import { Wallpaper } from '@/components/Wallpaper';
import { WallpaperManager } from '@/components/WallpaperManager';

const initialCategories = [
  { name: 'Food', icon: 'UtensilsCrossed', href: '/roles?category=food', order: 1 },
  { name: 'Drinks', icon: 'GlassWater', href: '/roles?category=drinks', order: 2 },
  { name: 'Electronics', icon: 'Laptop', href: '/roles?category=electronics', order: 3 },
  { name: 'Medicine', icon: 'Pill', href: '/roles?category=medicine', order: 4 },
  { name: 'Shoes', icon: 'Footprints', href: '/roles?category=shoes', order: 5 },
  { name: 'Fabrics', icon: 'Scissors', href: '/roles?category=fabrics', order: 6 },
  { name: 'Jewelry', icon: 'Gem', href: '/roles?category=jewelry', order: 7 },
  { name: 'Hardware', icon: 'Building', href: '/roles?category=hardware', order: 8 },
  { name: 'Other', icon: 'MoreHorizontal', href: '/roles?category=other', order: 9 },
];

const iconMap: { [key: string]: React.ElementType } = {
    UtensilsCrossed, GlassWater, Laptop, Pill, Footprints, Scissors, Gem, Building, MoreHorizontal
};

interface Category {
    id: string;
    name: string;
    icon: string;
    href: string;
    order: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const isAdmin = true;

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const categoriesCollection = collection(db, 'categories');
            const q = query(categoriesCollection, orderBy('order'));
            const categorySnapshot = await getDocs(q);

            if (categorySnapshot.empty) {
                // If no categories, seed the database with initial data
                for (const cat of initialCategories) {
                    await addDoc(categoriesCollection, cat);
                }
                // Refetch after seeding
                const newSnapshot = await getDocs(q);
                const categoriesList = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
                setCategories(categoriesList);
            } else {
                const categoriesList = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
                setCategories(categoriesList);
            }
        } catch(error) {
            console.error("Error fetching categories:", error);
            toast({
                title: "Error",
                description: "Could not connect to the database. Please check your Firestore rules and configuration.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    fetchCategories();
  }, [toast]);

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const newCategory = {
          name: newCategoryName,
          icon: "MoreHorizontal", // Default icon
          href: `/roles?category=${newCategoryName.toLowerCase().replace(/\s+/g, '-')}`,
          order: categories.length > 0 ? Math.max(...categories.map(c => c.order)) + 1 : 1,
        };
        const docRef = await addDoc(collection(db, "categories"), newCategory);
        setCategories([...categories, { ...newCategory, id: docRef.id }]);
        setNewCategoryName("");
        toast({
          title: "Category Added",
          description: `The category "${newCategoryName}" has been created.`,
        });
        document.getElementById('close-add-dialog')?.click();
      } catch (error) {
         toast({
            title: "Error Adding Category",
            description: "Could not save the new category to the database.",
            variant: "destructive"
        })
        console.error("Error adding document: ", error);
      }
    } else {
        toast({
            title: "Error",
            description: "Category name cannot be empty.",
            variant: "destructive"
        })
    }
  };

  const handleRemoveCategory = async (categoryId: string, categoryName: string) => {
    try {
        await deleteDoc(doc(db, "categories", categoryId));
        setCategories(categories.filter(c => c.id !== categoryId));
        toast({
            title: "Category Removed",
            description: `The category "${categoryName}" has been removed.`,
        });
    } catch (error) {
        toast({
            title: "Error Removing Category",
            description: "Could not remove the category from the database.",
            variant: "destructive"
        })
        console.error("Error removing document: ", error);
    }
  }

  return (
    <>
    <Wallpaper />
    <div className="container mx-auto px-4 py-12 relative">
      <WallpaperManager />
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

        {loading ? (
            <p className="text-center">Loading categories from database...</p>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {categories.map((category) => {
                    const IconComponent = iconMap[category.icon] || MoreHorizontal;
                    return (
                        <div key={category.id} className="relative group">
                            <Link href={category.href} >
                                <Card className="text-center hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 ease-in-out h-full">
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <IconComponent className="h-12 w-12 mb-4 text-primary group-hover:text-accent transition-colors" />
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
                                            category from the database.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRemoveCategory(category.id, category.name)}>
                                            Continue
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    )
                })}
            </div>
        )}
    </div>
    </>
  );
}
