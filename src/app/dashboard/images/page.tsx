
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Download, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';

interface ImageAsset {
    id: string;
    src: string;
    alt: string;
}

export default function ProductImagesPage() {
    const { toast } = useToast();
    const [imageLibrary, setImageLibrary] = useState<ImageAsset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true);
            try {
                const capturesRef = ref(storage, 'captures');
                const productsRef = ref(storage, 'products');

                const [capturesList, productsList] = await Promise.all([
                    listAll(capturesRef),
                    listAll(productsRef)
                ]);

                const allItems = [...capturesList.items, ...productsList.items];

                const imagePromises = allItems.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    return {
                        id: itemRef.name,
                        src: url,
                        alt: itemRef.name,
                    };
                });
                
                const images = await Promise.all(imagePromises);
                setImageLibrary(images.reverse()); // Show newest first
            } catch (error: any) {
                console.error("Error fetching images: ", error);
                let description = "Could not load images from storage.";
                if (error.code === 'storage/unauthorized') {
                    description = "You do not have permission to view images. Please check your storage security rules.";
                } else if (error.code === 'storage/retry-limit-exceeded') {
                    description = "Connection timed out. Please check your internet connection and try again. This can also be caused by incorrect Storage security rules.";
                }
                toast({
                    title: "Error fetching images",
                    description: description,
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [toast]);


    const handleDelete = async (image: ImageAsset) => {
        const confirmed = window.confirm(`Are you sure you want to delete the image "${image.alt}"?`);
        if (!confirmed) return;

        try {
            // Determine folder by looking at the URL pattern, or add metadata upon upload
            const folder = image.src.includes('captures') ? 'captures' : 'products';
            const imageRef = ref(storage, `${folder}/${image.id}`);
            
            await deleteObject(imageRef);

            setImageLibrary(prev => prev.filter(img => img.id !== image.id));
            toast({
                title: "Image Deleted",
                description: `Successfully removed "${image.alt}" from your library.`,
            });
        } catch (error: any) {
             console.error("Error deleting image: ", error);
             let description = "Could not delete the image from storage.";
             if (error.code === 'storage/unauthorized') {
                description = "You do not have permission to delete this image. Please check your storage security rules.";
             }
             toast({
                title: "Error deleting image",
                description: description,
                variant: "destructive",
            });
        }
    };
    
    const handleDownload = (src: string) => {
        const link = document.createElement('a');
        link.href = src;
        link.download = 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-headline">Product Image Library</h1>
          <p className="text-muted-foreground">Manage images for your products and business listings.</p>
        </div>
        <Button asChild>
            <Link href="/dashboard/products">
              <PlusCircle className="mr-2 h-4 w-4" /> Upload New Image
            </Link>
        </Button>
      </div>
        {loading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
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
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(image)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        </CardFooter>
                    </Card>
                    ))
                ) : (
                    <Card className="col-span-full bg-secondary/50 border-dashed">
                        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4"/>
                            <h3 className="text-xl font-semibold">No Images Available</h3>
                            <p className="text-muted-foreground mt-2">Your image library is empty. Upload images via the product form or camera page.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        )}
    </div>
  );
}
