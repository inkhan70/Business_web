
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
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductSearch } from '@/components/ProductSearch';

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
  const { t } = useLanguage();

  // In a real app, this would be derived from the user's auth state/role
  const isAdmin = true; 

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const categoriesCollection = collection(db, 'categories');
            const q = query(categoriesCollection, orderBy('order'));
            const categorySnapshot = await getDocs(q);

            if (categorySnapshot.empty && isAdmin) {
                // If no categories, seed the database with initial data ONLY if user is admin
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
                title: t('toast.error_db_connect'),
                description: t('toast.error_db_connect_desc'),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    fetchCategories();
  }, [toast, t, isAdmin]);

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
          title: t('toast.category_added'),
          description: `${t('toast.category_added_desc')} "${newCategoryName}"`,
        });
        document.getElementById('close-add-dialog')?.click();
      } catch (error) {
         toast({
            title: t('toast.error_adding_category'),
            description: t('toast.error_adding_category_desc'),
            variant: "destructive"
        })
        console.error("Error adding document: ", error);
      }
    } else {
        toast({
            title: t('toast.error_empty_name'),
            description: t('toast.error_empty_name_desc'),
            variant: "destructive"
        })
    }
  };

  const handleRemoveCategory = async (categoryId: string, categoryName: string) => {
    try {
        await deleteDoc(doc(db, "categories", categoryId));
        setCategories(categories.filter(c => c.id !== categoryId));
        toast({
            title: t('toast.category_removed'),
            description: `${t('toast.category_removed_desc')} "${categoryName}"`,
        });
    } catch (error) {
        toast({
            title: t('toast.error_removing_category'),
            description: t('toast.error_removing_category_desc'),
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
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
          {t('categories.title')}
        </h1>
        <p className="max-w-xl mx-auto text-lg text-muted-foreground mt-4">
          {t('categories.description')}
        </p>
      </div>

      <ProductSearch />
      
      {isAdmin && (
        <div className="flex justify-end space-x-2 mb-8 mt-8">
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('categories.add_category')}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('categories.add_new_category')}</DialogTitle>
                        <DialogDescription>
                            {t('categories.new_category_description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                {t('categories.name_label')}
                            </Label>
                            <Input
                                id="name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="col-span-3"
                                placeholder={t('categories.name_placeholder')}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" id="close-add-dialog">
                                {t('categories.cancel')}
                            </Button>
                        </DialogClose>
                        <Button type="button" onClick={handleAddCategory}>{t('categories.add_button')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      )}
      

        {loading ? (
            <p className="text-center">{t('categories.loading')}</p>
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
                                        <AlertDialogTitle>{t('categories.are_you_sure')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('categories.delete_description')}
                                            <span className="font-bold"> {category.name} </span> 
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>{t('categories.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRemoveCategory(category.id, category.name)}>
                                            {t('categories.continue')}
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

    