
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Download, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- Placeholder Data ---
// In a real app, this would come from a database or a CMS.
const allImages = [
    // Food & Groceries
    { id: 'img1', src: 'https://placehold.co/400x300.png', alt: 'Apples in a crate', dataAiHint: 'apple crate', targetBusinessTypes: ['grocer', 'distributor_food'] },
    { id: 'img2', src: 'https://placehold.co/400x300.png', alt: 'Loaves of bread on a shelf', dataAiHint: 'bread shelf', targetBusinessTypes: ['grocer', 'distributor_food'] },
    { id: 'img3', src: 'https://placehold.co/400x300.png', alt: 'Carton of eggs', dataAiHint: 'egg carton', targetBusinessTypes: ['grocer'] },
    
    // Shoes
    { id: 'img4', src: 'https://placehold.co/400x300.png', alt: 'Running shoes on display', dataAiHint: 'running shoes', targetBusinessTypes: ['shopkeeper_shoes', 'distributor_shoes'] },
    { id: 'img5', src: 'https://placehold.co/400x300.png', alt: 'Leather boots', dataAiHint: 'leather boots', targetBusinessTypes: ['shopkeeper_shoes'] },
    { id: 'img6', src: 'https://placehold.co/400x300.png', alt: 'Sandals on a beach', dataAiHint: 'sandals summer', targetBusinessTypes: ['shopkeeper_shoes'] },
    
    // Clothing
    { id: 'img7', src: 'https://placehold.co/400x300.png', alt: 'T-shirts hanging on a rack', dataAiHint: 't-shirts clothing', targetBusinessTypes: ['shopkeeper_clothing', 'distributor_clothing'] },
    { id: 'img8', src: 'https://placehold.co/400x300.png', alt: 'Folded jeans', dataAiHint: 'jeans denim', targetBusinessTypes: ['shopkeeper_clothing'] },
    { id: 'img9', src: 'https://placehold.co/400x300.png', alt: 'Elegant dresses', dataAiHint: 'dresses fashion', targetBusinessTypes: ['shopkeeper_clothing'] },

    // General / Fallback
    { id: 'img10', src: 'https://placehold.co/400x300.png', alt: 'Stacked boxes in a warehouse', dataAiHint: 'warehouse boxes', targetBusinessTypes: ['distributor_food', 'distributor_shoes', 'distributor_clothing'] },
    { id: 'img11', src: 'https://placehold.co/400x300.png', alt: 'Delivery truck', dataAiHint: 'delivery truck', targetBusinessTypes: ['distributor_food', 'distributor_shoes', 'distributor_clothing'] },
    { id: 'img12', src: 'https://placehold.co/400x300.png', alt: 'A generic storefront', dataAiHint: 'store front', targetBusinessTypes: ['grocer', 'shopkeeper_shoes', 'shopkeeper_clothing', 'guest'] },
];
// --- End Placeholder Data ---


export default function ProductImagesPage() {
    const { toast } = useToast();
    const [imageLibrary, setImageLibrary] = useState<typeof allImages>([]);

    // This is a placeholder. In a real app, this would be determined by the authenticated user's profile.
    // Try changing to 'shopkeeper_clothing', 'grocer', or 'guest' to see the image library change.
    const currentUserBusinessType = 'shopkeeper_shoes'; 
    
    useEffect(() => {
        const relevantImages = allImages.filter(image => 
            image.targetBusinessTypes.includes(currentUserBusinessType) || image.targetBusinessTypes.includes('guest')
        );
        setImageLibrary(relevantImages);
    }, [currentUserBusinessType]);


    const handleAction = (action: string) => {
        toast({
            title: "Feature Coming Soon",
            description: `The "${action}" functionality will be implemented with backend storage.`,
        });
    }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-headline">Product Image Library</h1>
          <p className="text-muted-foreground">Manage images for your products and business listings.</p>
        </div>
        <Button onClick={() => handleAction('Upload')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Upload New Image
        </Button>
      </div>

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
                    data-ai-hint={image.dataAiHint}
                />
                </CardContent>
                <CardFooter className="p-2 bg-secondary/50">
                <div className="flex w-full justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleAction('Use Image')}>
                        <Download className="mr-2 h-4 w-4" /> Use
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleAction('Delete')}>
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
                    <p className="text-muted-foreground mt-2">There are no specific images available for your business type right now.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
