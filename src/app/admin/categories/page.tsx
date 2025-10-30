
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, UtensilsCrossed, GlassWater, Laptop, Pill, Footprints, Scissors, Gem, Building, MoreHorizontal, Icon, Shirt, Home, Car, Wrench, Bone } from "lucide-react";
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

interface Category {
    id: string;
    name: string;
    icon: string;
    href: string;
    order: number;
}

const iconMap: { [key: string]: React.ElementType } = {
    UtensilsCrossed, GlassWater, Laptop, Pill, Footprints, Scissors, Gem, Building, MoreHorizontal, Shirt, Home, Car, Wrench, Bone
};

const defaultCategories: Category[] = [
    { id: 'cat1', name: 'Food', href:"/roles?category=food", icon: "UtensilsCrossed", order: 1},
    { id: 'cat2', name: 'Drinks', href:"/roles?category=drinks", icon: "GlassWater", order: 2},
    { id: 'cat3', name: 'Electronics', href:"/roles?category=electronics", icon: "Laptop", order: 3},
    { id: 'cat4', name: 'Health', href:"/roles?category=health", icon: "Pill", order: 4},
    { id: 'cat5', name: 'Shoes', href:"/roles?category=shoes", icon: "Footprints", order: 5},
    { id: 'cat6', name: 'Beauty', href:"/roles?category=beauty", icon: "Scissors", order: 6},
    { id: 'cat7', name: 'Jewelry', href:"/roles?category=jewelry", icon: "Gem", order: 7},
    { id: 'cat8', name: 'Real Estate', href:"/roles?category=real-estate", icon: "Building", order: 8},
    { id: 'cat9', name: 'Apparel', href:"/roles?category=apparel", icon: 'Shirt', order: 9 },
    { id: 'cat10', name: 'Home & Garden', href:"/roles?category=home-garden", icon: 'Home', order: 10 },
    { id: 'cat11', name: 'Automotive', href:"/roles?category=automotive", icon: 'Car', order: 11 },
    { id: 'cat12', name: 'Services', href:"/roles?category=services", icon: 'Wrench', order: 12 },
    { id: 'cat13', name: 'Pets', href:"/roles?category=pets", icon: 'Bone', order: 13 },
];

export default function AdminCategoriesPage() {
    const { toast } = useToast();
    const [categoryName, setCategoryName] = useState("");
    const [categoryIcon, setCategoryIcon] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const storedCategoriesRaw = localStorage.getItem('categories');
        if (storedCategoriesRaw) {
            setCategories(JSON.parse(storedCategoriesRaw).sort((a: Category, b: Category) => a.order - b.order));
        } else {
            localStorage.setItem('categories', JSON.stringify(defaultCategories));
            setCategories(defaultCategories);
        }
    }, []);

    const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!categoryName || !categoryIcon) {
            toast({ title: "Missing Fields", description: "Please provide a name and select an icon.", variant: "destructive" });
            return;
        }

        try {
            const newCategory: Category = { 
                id: `cat_${Date.now()}`, 
                name: categoryName, 
                icon: categoryIcon, 
                order: categories.length + 1,
                href: `/roles?category=${categoryName.toLowerCase().replace(/\s+/g, '-')}`
            };

            const updatedCategories = [...categories, newCategory];
            localStorage.setItem("categories", JSON.stringify(updatedCategories));
            setCategories(updatedCategories);

            toast({ title: "Category Added", description: `"${categoryName}" has been created.` });
            setCategoryName("");
            setCategoryIcon("");
            
        } catch (error) {
            toast({ title: "Error Adding Category", description: "Something went wrong.", variant: "destructive" });
        }
    };

    const handleRemoveCategory = (id: string) => {
        const updatedCategories = categories.filter(cat => cat.id !== id);
        localStorage.setItem("categories", JSON.stringify(updatedCategories));
        setCategories(updatedCategories);
        toast({ title: "Category Removed" });
    };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-headline">Manage Categories</h1>
        <p className="text-muted-foreground">
          Add, remove, and manage application categories.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Add New Category</CardTitle>
                <CardDescription>
                    Create a new category for businesses and products.
                </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="cat-name">Category Name</Label>
                    <Input id="cat-name" value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="e.g., Apparel" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="cat-icon">Category Icon</Label>
                    <Select value={categoryIcon} onValueChange={setCategoryIcon}>
                        <SelectTrigger id="cat-icon">
                            <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(iconMap).map(([name, IconComponent]) => (
                                <SelectItem key={name} value={name}>
                                    <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" />
                                        <span>{name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </form>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Existing Categories</CardTitle>
                <CardDescription>List of all current categories.</CardDescription>
            </CardHeader>
            <CardContent>
                {categories.length > 0 ? (
                    <ul className="space-y-2">
                        {categories.map(cat => {
                            const IconComponent = iconMap[cat.icon] || MoreHorizontal;
                            return (
                                <li key={cat.id} className="flex items-center justify-between p-2 rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                                        <p className="font-semibold">{cat.name}</p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the <strong>{cat.name}</strong> category.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRemoveCategory(cat.id)}>
                                                Delete
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No categories found.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
