import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";

const distributors = [
  { id: 'dist1', name: 'Metro Food Distributors', address: '123 Market St, Metropolis', distance: '5.2 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'warehouse interior' },
  { id: 'dist2', name: 'Gourmet Provisions Inc.', address: '456 Grand Ave, Metropolis', distance: '8.1 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'food packaging' },
  { id: 'dist3', name: 'Fresh Farm Logistics', address: '789 Farm Rd, Metropolis Outskirts', distance: '15.7 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'delivery truck' },
  { id: 'dist4', name: 'Citywide Beverage Supply', address: '101 Industrial Park, Metropolis', distance: '12.3 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'beverage bottles' },
  { id: 'dist5', name: 'Organic Roots Co.', address: '22 Green Way, Metropolis', distance: '6.5 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'vegetable crate' },
  { id: 'dist6', name: 'Capital Electronics', address: '555 Tech Blvd, Metropolis', distance: '9.0 km', image: 'https://placehold.co/350x200.png', dataAiHint: 'electronic components' },
];

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-left mb-12">
        <p className="text-lg text-muted-foreground">Showing results for</p>
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-tighter">
          Distributors in Metropolis
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {distributors.map((distributor) => (
          <Card key={distributor.id} className="flex flex-col">
            <CardHeader>
              <Image src={distributor.image} alt={distributor.name} width={350} height={200} className="rounded-t-lg object-cover w-full h-40" data-ai-hint={distributor.dataAiHint} />
              <CardTitle className="pt-4 font-headline text-xl">{distributor.name}</CardTitle>
              <CardDescription className="flex items-center pt-1">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                {distributor.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm font-semibold text-primary">{distributor.distance} away</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/products/distributor/${distributor.id}`}>
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
