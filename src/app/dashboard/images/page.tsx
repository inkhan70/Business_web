
"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const imageLibrary = [
    { id: 'img1', src: 'https://placehold.co/400x300.png', alt: 'Apples in a crate', dataAiHint: 'apple crate' },
    { id: 'img2', src: 'https://placehold.co/400x300.png', alt: 'Loaves of bread on a shelf', dataAiHint: 'bread shelf' },
    { id: 'img3', src: 'https://placehold.co/400x300.png', alt: 'Carton of eggs', dataAiHint: 'egg carton' },
    { id: 'img4', src: 'https://placehold.co/400x300.png', alt: 'Bottles of milk', dataAiHint: 'milk bottles' },
    { id: 'img5', src: 'https://placehold.co/400x300.png', alt: 'Fresh vegetables', dataAiHint: 'vegetable variety' },
    { id: 'img6', src: 'https://placehold.co/400x300.png', alt: 'Stacked boxes in a warehouse', dataAiHint: 'warehouse boxes' },
    { id: 'img7', src: 'https://placehold.co/400x300.png', alt: 'Delivery truck', dataAiHint: 'delivery truck' },
    { id: 'img8', src: 'https://placehold.co/400x300.png', alt: 'Electronic components', dataAiHint: 'circuit board' },
];

export default function ProductImagesPage() {
    const { toast } = useToast();

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
        {imageLibrary.map((image) => (
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
        ))}
      </div>
    </div>
  );
}
