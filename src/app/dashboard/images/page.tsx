
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Download, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useAuth } from "@/contexts/AuthContext";

interface ImageAsset {
    id: string; // Using data URL as ID for simplicity
    src: string;
    alt: string;
    category?: string;
}

interface Product {
    id: string;
    name: string;
    category: string;
    varieties: {
        image?: string;
        name: string;
    }[];
}

export default function ProductImagesPage() {
    const { toast } = useToast();
    const { userProfile } = useAuth();
    const [imageLibrary, setImageLibrary] = useState<ImageAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [userCategory, setUserCategory] = useState<string | null>(null);

    useEffect(() => {
        if (!userProfile) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setUserCategory(userProfile.category);

        if (!userProfile.category) {
            setLoading(false);
            return;
        }

        try {
            const storedProductsRaw = localStorage.getItem('products');
            const allProducts: Product[] = storedProductsRaw ? JSON.parse(storedProductsRaw) : [];

            // Filter products that match the current user's category
            const categoryProducts = allProducts.filter(p => p.category === userProfile.category);
            
            const uniqueImages = new Map<string, ImageAsset>();

            categoryProducts.forEach(product => {
                product.varieties?.forEach(variety => {
                    if (variety.image && !uniqueImages.has(variety.image)) {
                        uniqueImages.set(variety.image, {
                            id: variety.image, // Use the data URL itself as a unique ID
                            src: variety.image,
                            alt: variety.name || product.name,
                            category: product.category,
                        });
                    }
                });
            });

            setImageLibrary(Array.from(uniqueImages.values()).reverse()); // Newest likely to be last, so reverse

        } catch (error) {
            console.error("Error fetching images from localStorage:", error);
            toast({
                title: "Error loading images",
                description: "Could not load images from local storage.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast, userProfile]);

    
    const handleDownload = (src: string) => {
        const link = document.createElement('a');
        link.href = src;
        link.download = 'image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-headline">Image Library</h1>
          {userCategory ? (
             <p className="text-muted-foreground">Showing shared images for the <span className="font-semibold text-primary">{userCategory}</span> category.</p>
          ) : (
            <p className="text-muted-foreground">Manage images for your products and business listings.</p>
          )}
        </div>
        <Button asChild>
            <Link href="/dashboard/products">
              <PlusCircle className="mr-2 h-4 w-4" /> Add a Product
            </Link>
        </Button>
      </div>
        {loading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
        ) : !userCategory ? (
             <Card className="col-span-full bg-secondary/50 border-dashed">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4"/>
                    <h3 className="text-xl font-semibold">No Category Set for Your Profile</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        To view or contribute to a shared image library, your account needs a primary business category. You can set a category for new products by editing or creating one.
                    </p>
                    <div className="flex gap-4 mt-6">
                         <Button asChild>
                            <Link href="/dashboard/products">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add a Product
                            </Link>
                        </Button>
                         <Button asChild variant="secondary">
                            <Link href="/dashboard/settings">
                                Go to Settings
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {imageLibrary.length > 0 ? (
                    imageLibrary.map((image) => (
                    <Card key={image.id} className="overflow-hidden group">
                        <CardContent className="p-0">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            width={400}
                            height={300}
                            className="object-cover w-full h-48"
                        />
                        </CardContent>
                        <CardFooter className="p-2 bg-secondary/50">
                        <div className="flex w-full justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleDownload(image.src)}>
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </div>
                        </CardFooter>
                    </Card>
                    ))
                ) : (
                    <Card className="col-span-full bg-secondary/50 border-dashed">
                        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4"/>
                            <h3 className="text-xl font-semibold">No Images Available for Your Category</h3>
                            <p className="text-muted-foreground mt-2">Your shared image library is empty. Upload images via the product form to share them with others in your category.</p>
                             <Button asChild className="mt-4">
                                <Link href="/dashboard/products">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add a Product
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        )}
    </div>
  );
}

    