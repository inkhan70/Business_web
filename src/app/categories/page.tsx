
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, GlassWater, Laptop, Pill, Footprints, Scissors, Gem, Building, MoreHorizontal, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Wallpaper } from '@/components/Wallpaper';
import { WallpaperManager } from '@/components/WallpaperManager';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

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

const defaultCategories: Category[] = [
    { id: 'cat1', name: 'Food', href:"/roles?category=food", icon: "UtensilsCrossed", order: 1},
    { id: 'cat2', name: 'Drinks', href:"/roles?category=drinks", icon: "GlassWater", order: 2},
    { id: 'cat3', name: 'Electronics', href:"/roles?category=electronics", icon: "Laptop", order: 3},
    { id: 'cat4', name: 'Health', href:"/roles?category=health", icon: "Pill", order: 4},
    { id: 'cat5', name: 'Shoes', href:"/roles?category=shoes", icon: "Footprints", order: 5},
    { id: 'cat6', name: 'Beauty', href:"/roles?category=beauty", icon: "Scissors", order: 6},
    { id: 'cat7', name: 'Jewelry', href:"/roles?category=jewelry", icon: "Gem", order: 7},
    { id: 'cat8', name: 'Real Estate', href:"/roles?category=real-estate", icon: "Building", order: 8},
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchCategories = () => {
        setLoading(true);
        try {
            const storedCategoriesRaw = localStorage.getItem('categories');
            if (storedCategoriesRaw) {
                const storedCategories = JSON.parse(storedCategoriesRaw);
                setCategories(storedCategories.sort((a:Category, b:Category) => a.order - b.order));
            } else {
                // If nothing in localStorage, seed it with default data
                localStorage.setItem('categories', JSON.stringify(defaultCategories));
                setCategories(defaultCategories.sort((a,b) => a.order - b.order));
            }
        } catch(error: any) {
            console.error("Error loading categories from localStorage:", error);
            toast({
                title: "Error Loading Data",
                description: "Could not load category data from your browser's storage.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    fetchCategories();
  }, [toast]);

  const getCategoryLink = (category: Category) => {
    if (category.href) return category.href;
    return `/roles?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`;
  }

  return (
    <>
    <Wallpaper />
    <div className="container mx-auto px-4 py-12 relative">
      <WallpaperManager />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
          {t('categories.title')}
        </h1>
        <p className="max-w-xl mx-auto text-lg text-muted-foreground mt-4">
          {t('categories.description')}
        </p>
        {userProfile?.isAdmin && (
            <div className="mt-6">
                <Button asChild>
                    <Link href="/admin/categories">
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Categories
                    </Link>
                </Button>
            </div>
        )}
      </div>

        {loading ? (
            <p className="text-center mt-12">{t('categories.loading')}</p>
        ) : categories.length === 0 ? (
             <div className="text-center text-muted-foreground py-12">
                <p className="font-semibold">No categories found.</p>
                <p>It looks like the category list is empty. An administrator needs to add categories.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
                {categories.map((category) => {
                    const IconComponent = iconMap[category.icon] || MoreHorizontal;
                    return (
                        <div key={category.id} className="relative group">
                            <Link href={getCategoryLink(category)} >
                                <Card className="text-center hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 ease-in-out h-full">
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <IconComponent className="h-12 w-12 mb-4 text-primary group-hover:text-accent transition-colors" />
                                    <h3 className="text-lg font-bold font-headline">{t(category.name)}</h3>
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
