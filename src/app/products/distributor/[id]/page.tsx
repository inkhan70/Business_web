
"use client"
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

const distributor = { 
  id: 'dist1', 
  name: 'Metro Food Distributors', 
  address: '123 Market St, Metropolis', 
};

const products = [
  { id: 'item1', name: 'Organic Fuji Apples', price: '$2.99/lb', image: 'https://placehold.co/300x300.png', dataAiHint: 'apple fruit' },
  { id: 'item2', name: 'Artisan Sourdough Bread', price: '$5.50/loaf', image: 'https://placehold.co/300x300.png', dataAiHint: 'bread loaf' },
  { id: 'item3', name: 'Cage-Free Brown Eggs', price: '$6.00/dozen', image: 'https://placehold.co/300x300.png', dataAiHint: 'egg carton' },
  { id: 'item4', name: 'Unsweetened Almond Milk', price: '$4.25/half gal', image: 'https://placehold.co/300x300.png', dataAiHint: 'milk carton' },
  { id: 'item5', name: 'Greek Yogurt', price: '$3.75/tub', image: 'https://placehold.co/300x300.png', dataAiHint: 'yogurt container' },
  { id: 'item6', name: 'Hass Avocados', price: '$1.50/each', image: 'https://placehold.co/300x300.png', dataAiHint: 'avocado fruit' },
];

export default function DistributorInventoryPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
          {distributor.name}
        </h1>
        <p className="flex items-center text-lg text-muted-foreground mt-2">
            <MapPin className="h-5 w-5 mr-2" />
            {distributor.address}
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('distributor_inventory.search_placeholder')}
          className="pl-9 w-full md:w-1/2 lg:w-1/3"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col overflow-hidden">
            <CardHeader className="p-0">
               <Image src={product.image} alt={product.name} width={300} height={300} className="object-cover w-full h-48" data-ai-hint={product.dataAiHint} />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <h3 className="font-bold font-headline">{product.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">{product.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full" variant="outline">
                    <Link href={`/products/item/${product.id}`}>
                        {t('distributor_inventory.view_details')}
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
