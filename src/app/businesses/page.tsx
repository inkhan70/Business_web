
"use client"

import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MapPin, ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

// Placeholder data - in a real app, this would be fetched from a database
const businessData = {
    producers: [...Array(4)].map((_, i) => ({ id: `prod${i+1}`, name: `Organic Farm ${i+1}`, address: `${10+i} Green Valley, Metropolis`, distance: `${20+i} km`, image: 'https://placehold.co/350x200.png', dataAiHint: 'farm field' })),
    wholesalers: [...Array(3)].map((_, i) => ({ id: `whole${i+1}`, name: `Bulk Goods Co ${i+1}`, address: `${20+i} Warehouse Rd, Metropolis`, distance: `${10+i} km`, image: 'https://placehold.co/350x200.png', dataAiHint: 'warehouse interior' })),
    distributors: [
      { id: 'dist1', name: 'Metro Food Distributors', address: '123 Market St, Metropolis', distance: '5.2 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'warehouse interior' },
      { id: 'dist2', name: 'Gourmet Provisions Inc.', address: '456 Grand Ave, Metropolis', distance: '8.1 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'food packaging' },
      { id: 'dist3', name: 'Fresh Farm Logistics', address: '789 Farm Rd, Metropolis Outskirts', distance: '15.7 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'delivery truck' },
      { id: 'dist4', name: 'Citywide Beverage Supply', address: '101 Industrial Park, Metropolis', distance: '12.3 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'beverage bottles' },
    ],
    shopkeepers: [
      { id: 'shop1', name: 'The Corner Store', address: '1 Main St, Metropolis', distance: '1.2 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'corner store' },
      { id: 'shop2', name: 'Green Grocer', address: '22 Park Ave, Metropolis', distance: '2.5 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'vegetable stand' },
      { id: 'shop3', name: 'Fresh Mart', address: '300 Station Rd, Metropolis', distance: '3.1 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'supermarket aisle' },
      { id: 'shop4', name: 'City Electronics', address: '404 Tech Square, Metropolis', distance: '4.0 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'electronics store' },
      { id: 'shop5', name: 'The Shoe Box', address: '55 Fashion St, Metropolis', distance: '4.2 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'shoe store' },
    ]
};

type BusinessRole = keyof typeof businessData;

function BusinessesContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const role = (searchParams.get('role') || 'shopkeepers') as BusinessRole;

  const businesses = businessData[role] || businessData.shopkeepers;

  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-left mb-8">
        <p className="text-lg text-muted-foreground">Showing {roleTitle} for</p>
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
          {categoryTitle} in Metropolis
        </h1>
         <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
            type="search"
            placeholder="Find your shopkeeper here..."
            className="pl-9 w-full md:w-1/2 lg:w-1/3"
            />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {businesses.map((biz) => (
          <Card key={biz.id} className="flex flex-col">
            <CardHeader className="p-0">
              <Image src={biz.image} alt={biz.name} width={350} height={200} className="rounded-t-lg object-cover w-full h-40" data-ai-hint={biz.dataAiHint} />
            </CardHeader>
             <CardContent className="p-4 flex-grow">
                <CardTitle className="font-headline text-xl">{biz.name}</CardTitle>
                <CardDescription className="flex items-center pt-1">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    {biz.address}
                </CardDescription>
                <p className="text-sm font-semibold text-primary mt-2">{biz.distance} away</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full">
                <Link href={`/products/distributor/${biz.id}`}>
                  View Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Pagination className="mt-12">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default function BusinessesPage() {
    return (
        <Suspense fallback={<div>Loading businesses...</div>}>
            <BusinessesContent />
        </Suspense>
    )
}
