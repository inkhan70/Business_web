
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, GlassWater, Laptop, Pill, Footprints, Scissors, Gem, Building, MoreHorizontal } from 'lucide-react';
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const categoriesCollection = collection(db, 'categories');
            const q = query(categoriesCollection, orderBy('order'));
            const categorySnapshot = await getDocs(q);

            if (categorySnapshot.empty) {
                // If no categories, seed the database with initial data.
                // This is a one-time operation for an empty database.
                // Your security rules should prevent this from being run by non-admins.
                // For now, we assume this is a trusted environment setup.
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
        } catch(error: any) {
            console.error("Error fetching categories:", error);
            let description = t('toast.error_db_connect_desc');
            if (error.code === 'permission-denied') {
                description = "You do not have permission to view categories. Please check your Firestore security rules.";
            }
            toast({
                title: t('toast.error_db_connect'),
                description: description,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    fetchCategories();
  }, [toast, t]);

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
      
        {loading ? (
            <p className="text-center mt-12">{t('categories.loading')}</p>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
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
                        </div>
                    )
                })}
            </div>
        )}
    </div>
    </>
  );
}
